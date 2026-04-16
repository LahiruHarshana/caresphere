import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}
