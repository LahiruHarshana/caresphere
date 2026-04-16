import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
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
}
