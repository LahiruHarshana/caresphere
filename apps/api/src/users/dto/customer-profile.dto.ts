import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional() @IsString() careType?: string;
  @IsOptional() @IsString() careFrequency?: string;
  @IsOptional() @IsString() specialRequirements?: string;
  @IsOptional() @IsString() preferredSchedule?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() emergencyPhone?: string;
}
