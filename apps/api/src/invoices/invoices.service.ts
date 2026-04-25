import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async generateInvoice(dto: GenerateInvoiceDto, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        customer: { include: { profile: true } },
        caregiver: { include: { profile: true, caregiverProfile: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only allow Admin or the specific Customer to generate invoice
    if (role !== 'ADMIN' && booking.customerId !== userId) {
      throw new BadRequestException('You do not have permission to generate this invoice');
    }

    // Check if invoice already exists
    let invoice = await this.prisma.invoice.findFirst({
      where: { bookingId: booking.id },
    });

    if (invoice && invoice.pdfUrl) {
      return invoice;
    }

    // Assuming we have totalCost from booking, otherwise calculate it
    let totalCost = booking.totalCost;
    if (!totalCost) {
      const durationHours = (booking.endAt.getTime() - booking.scheduledAt.getTime()) / (1000 * 60 * 60);
      const rate = booking.caregiver.caregiverProfile?.hourlyRate || 0;
      totalCost = durationHours * rate;

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { totalCost },
      });
    }

    // Create Invoice record if not exists
    if (!invoice) {
      invoice = await this.prisma.invoice.create({
        data: {
          bookingId: booking.id,
          amount: totalCost,
          currency: 'USD',
          status: 'PENDING',
        },
      });
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const customerName = `${booking.customer.profile?.firstName} ${booking.customer.profile?.lastName}`;
    const caregiverName = `${booking.caregiver.profile?.firstName} ${booking.caregiver.profile?.lastName}`;
    
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; padding: 30px; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; color: #555; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(2) { text-align: right; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.details td { padding-bottom: 20px; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.item.last td { border-bottom: none; }
            .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table>
              <tr class="top">
                <td colspan="2">
                  <table>
                    <tr>
                      <td class="title">CareSphere</td>
                      <td>Invoice #: ${invoice.id}<br>Created: ${new Date().toLocaleDateString()}<br>Due: Upon receipt</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="information">
                <td colspan="2">
                  <table>
                    <tr>
                      <td>Caregiver:<br>${caregiverName}</td>
                      <td>Customer:<br>${customerName}<br>${booking.customer.email}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="heading">
                <td>Service</td>
                <td>Price</td>
              </tr>
              <tr class="item">
                <td>${booking.serviceType} (${booking.scheduledAt.toLocaleString()} - ${booking.endAt.toLocaleString()})</td>
                <td>$${totalCost.toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td></td>
                <td>Total: $${totalCost.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const fileName = `invoice_${invoice.id}.pdf`;
    const filePath = path.join(tmpDir, fileName);

    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();

    // The URL could be a local static path, or S3 URL. Using local path for this prototype.
    const pdfUrl = `/tmp/${fileName}`;
    
    // Update invoice with PDF path
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl: filePath }, // Saving the absolute path or a reachable URL
    });

    return updatedInvoice;
  }

  async getInvoice(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
    });
  }
}
