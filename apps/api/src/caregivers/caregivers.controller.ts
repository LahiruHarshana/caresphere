import { Controller, Get, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { CaregiversService } from './caregivers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateCaregiverProfileDto } from './dto/caregiver-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const uploadDir = './apps/api/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadVerificationDocument(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const fileUrl = `/uploads/${file.filename}`;
    return this.caregiversService.uploadVerification(req.user.userId, fileUrl);
  }
}
