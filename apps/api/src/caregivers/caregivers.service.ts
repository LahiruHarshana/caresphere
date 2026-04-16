import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaregiverProfile, VerificationStatus } from '@prisma/client';
import { UpdateCaregiverProfileDto } from './dto/caregiver-profile.dto';

@Injectable()
export class CaregiversService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<CaregiverProfile | null> {
    return this.prisma.caregiverProfile.findUnique({
      where: { userId },
    });
  }

  async upsertProfile(userId: string, data: UpdateCaregiverProfileDto): Promise<CaregiverProfile> {
    return this.prisma.caregiverProfile.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        userId,
      },
    });
  }

  async uploadVerification(userId: string): Promise<CaregiverProfile> {
    // Dummy document upload endpoint that returns a mock URL and sets verificationStatus to PENDING
    const dummyUrl = 'https://mock-url.com/verification-document.pdf';
    return this.prisma.caregiverProfile.update({
      where: { userId },
      data: {
        backgroundCheckUrl: dummyUrl,
        verificationStatus: VerificationStatus.PENDING,
      },
    });
  }
}
