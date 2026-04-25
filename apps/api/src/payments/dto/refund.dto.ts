import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RefundDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
