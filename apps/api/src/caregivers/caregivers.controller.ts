import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CaregiversService } from './caregivers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateCaregiverProfileDto } from './dto/caregiver-profile.dto';

@Controller('caregivers')
export class CaregiversController {
  constructor(private readonly caregiversService: CaregiversService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAREGIVER')
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.caregiversService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAREGIVER')
  @Post('profile')
  async upsertProfile(@Req() req: any, @Body() data: UpdateCaregiverProfileDto) {
    return this.caregiversService.upsertProfile(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAREGIVER')
  @Post('verify')
  async uploadVerificationDocument(@Req() req: any) {
    return this.caregiversService.uploadVerification(req.user.userId);
  }
}
