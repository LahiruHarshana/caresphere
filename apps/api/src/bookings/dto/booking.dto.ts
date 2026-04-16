import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  caregiverId: string;

  @IsString()
  serviceType: string;

  @IsDateString()
  scheduledAt: string;

  @IsDateString()
  endAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
