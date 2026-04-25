import { Controller, Post, Body, UseGuards, Req, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import { InvoicesService } from './invoices.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  async generateInvoice(@Body() dto: GenerateInvoiceDto, @Req() req: any) {
    return this.invoicesService.generateInvoice(dto, req.user.userId, req.user.role);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoicesService.getInvoice(id);

    if (!invoice || !invoice.pdfUrl) {
      throw new NotFoundException('Invoice PDF not found');
    }

    const filePath = invoice.pdfUrl;
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Invoice file not found on disk');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.id}.pdf`);
    fs.createReadStream(filePath).pipe(res);
  }
}
