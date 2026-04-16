import { Controller, Post, Body, Req, UseGuards, RawBodyRequest, Headers, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createIntent(@Body() dto: CreatePaymentIntentDto, @Req() req: any) {
    return this.paymentsService.createIntent(dto, req.user.userId);
  }

  @Post('webhook')
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: any) {
    if (!signature || !req.rawBody) {
      return { received: false, error: 'Missing signature or raw body' };
    }
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.paymentsService.getHistory(req.user.userId, req.user.role, pageNum, limitNum);
  }
}
