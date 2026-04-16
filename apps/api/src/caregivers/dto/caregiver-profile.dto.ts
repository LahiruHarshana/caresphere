import { IsNumber, IsArray, IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCaregiverProfileDto {
  @IsNumber()
  hourlyRate: number;

  @IsNumber()
  experienceYears: number;

  @IsArray()
  @IsString({ each: true })
  certifications: string[];

  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
