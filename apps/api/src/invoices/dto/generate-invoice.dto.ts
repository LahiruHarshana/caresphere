import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}
