import { Controller, Get, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Query, Param } from '@nestjs/common';
import { CaregiversService } from './caregivers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateCaregiverProfileDto } from './dto/caregiver-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const uploadDir = './apps/api/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('caregivers')
export class CaregiversController {
  constructor(private readonly caregiversService: CaregiversService) {}

  @Get('browse')
  async browseCaregivers(
    @Query('specialty') specialty?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.caregiversService.browseCaregivers(
      specialty,
      parseInt(page || '1'),
      parseInt(limit || '12'),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAREGIVER')
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.caregiversService.getDashboard(req.user.userId);
  }

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
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadVerificationDocument(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.caregiversService.uploadVerification(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAREGIVER')
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.caregiversService.uploadProfilePicture(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAREGIVER')
  @Post('upload-cover')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadCover(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.caregiversService.uploadCoverPhoto(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    return this.caregiversService.getPublicProfile(id);
  }
}
