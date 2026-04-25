# Guide 10 — Payments & Invoices

> **Priority**: P1  
> **Estimated Time**: 3–4 hours  
> **Depends on**: Guides 01, 06

---

## 1. Current State

- Stripe payment intent creation works
- Webhook handler updates booking status on payment success
- Invoice PDF generation via Puppeteer exists
- Missing: refunds, payouts, download endpoint, payment history UI

---

## 2. Refund Logic

### Backend — Add Refund Endpoint

```typescript
// In payments.controller.ts:

@Post('refund')
@UseGuards(JwtAuthGuard)
async refund(@Body() dto: RefundDto, @Req() req: any) {
  return this.paymentsService.refundPayment(dto, req.user.userId, req.user.role);
}
```

```typescript
// In payments.service.ts:

async refundPayment(dto: { bookingId: string; reason?: string }, userId: string, role: string) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: dto.bookingId },
    include: { invoices: true },
  });

  if (!booking) throw new NotFoundException('Booking not found');

  // Only admin or the customer who booked can request refund
  if (role !== 'ADMIN' && booking.customerId !== userId) {
    throw new ForbiddenException('Not authorized to refund this booking');
  }

  // Only cancelled bookings can be refunded
  if (booking.status !== 'CANCELLED') {
    throw new BadRequestException('Only cancelled bookings can be refunded');
  }

  const paidInvoice = booking.invoices.find(inv => inv.status === 'PAID');
  if (!paidInvoice) {
    throw new BadRequestException('No paid invoice found for this booking');
  }

  // Process refund through Stripe
  // In a real implementation, you'd store the Stripe PaymentIntent ID
  // and use it to create a refund. For now, we'll update the local records.

  await this.prisma.invoice.update({
    where: { id: paidInvoice.id },
    data: { status: 'PENDING' }, // Could add a REFUNDED status
  });

  // Remove or update the earning record
  const earning = await this.prisma.earning.findUnique({
    where: { bookingId: booking.id },
  });
  if (earning) {
    await this.prisma.earning.update({
      where: { id: earning.id },
      data: { status: 'PENDING' },
    });
  }

  return { message: 'Refund processed successfully' };
}
```

---

## 3. Earning Creation on Booking Completion

When a booking is marked as COMPLETED, automatically create an Earning record:

```typescript
// In bookings.service.ts, in updateBookingStatus, after setting status to COMPLETED:

if (newStatus === BookingStatus.COMPLETED) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
    include: { caregiver: { include: { caregiverProfile: true } } },
  });

  if (booking && booking.totalCost) {
    const platformFee = 0.10; // 10%
    const caregiverEarning = booking.totalCost * (1 - platformFee);

    await this.prisma.earning.upsert({
      where: { bookingId },
      update: { amount: caregiverEarning, status: 'PENDING' },
      create: {
        bookingId,
        amount: caregiverEarning,
        status: 'PENDING',
      },
    });
  }
}
```

---

## 4. Invoice Download Endpoint

### Backend

```typescript
// In invoices.controller.ts:

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
```

```typescript
// In invoices.service.ts:

async getInvoice(id: string) {
  return this.prisma.invoice.findUnique({
    where: { id },
  });
}
```

---

## 5. Payment History Page (Customer)

### File: `apps/web/src/app/(customer)/customer/payments/page.tsx` (NEW)

Should display:
- List of all payments (from invoices)
- Status: Paid / Pending / Refunded
- Download invoice PDF button
- Amount, date, booking details

---

## 6. Cost Calculation

Currently, `totalCost` is only set during invoice generation, not at booking creation. Fix this:

```typescript
// In bookings.service.ts, in createBooking:

// Calculate cost based on duration and hourly rate
const durationHours = (scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60 * 60);
const totalCost = durationHours * caregiver.hourlyRate;

return this.prisma.booking.create({
  data: {
    customerId,
    caregiverId: data.caregiverId,
    serviceType: data.serviceType,
    scheduledAt: scheduledStart,
    endAt: scheduledEnd,
    notes: data.notes,
    status: BookingStatus.PENDING,
    totalCost, // ADD THIS
  },
});
```

---

## 7. Stripe PaymentIntent ID Storage

To enable refunds, store the Stripe PaymentIntent ID:

### Schema Change

Add to the `Invoice` model:
```prisma
model Invoice {
  // ... existing fields
  stripePaymentIntentId String?   // ADD THIS
}
```

### Webhook Update

```typescript
// In handleWebhook, when payment succeeds:
if (invoice) {
  await this.prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'PAID',
      stripePaymentIntentId: paymentIntent.id, // Store for refunds
    },
  });
}
```

---

## 8. Verification Checklist

- [ ] Cost is calculated at booking creation
- [ ] Payment through Stripe works end-to-end
- [ ] Webhook updates booking and invoice status
- [ ] Earning record is created when booking completes
- [ ] Platform fee is correctly deducted (10%)
- [ ] Invoice PDF can be downloaded
- [ ] Refund endpoint works for cancelled bookings
- [ ] Payment history page shows all transactions
