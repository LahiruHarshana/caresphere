import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CaregiverProfile, VerificationStatus } from '@prisma/client';
import { UpdateCaregiverProfileDto } from './dto/caregiver-profile.dto';

@Injectable()
export class CaregiversService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

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

  async uploadVerification(userId: string, file: Express.Multer.File): Promise<CaregiverProfile> {
    const result = await this.uploadsService.uploadDocument(file, 'caresphere/verification');
    return this.prisma.caregiverProfile.update({
      where: { userId },
      data: {
        backgroundCheckUrl: result.url,
        verificationStatus: VerificationStatus.PENDING,
      },
    });
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const result = await this.uploadsService.uploadImage(file, 'caresphere/profiles');
    await this.prisma.profile.upsert({
      where: { userId },
      update: { avatarUrl: result.url },
      create: {
        userId,
        firstName: (await this.prisma.user.findUnique({ where: { id: userId } }))?.email.split('@')[0] || 'User',
        lastName: '',
        avatarUrl: result.url,
      },
    });
    return { avatarUrl: result.url };
  }

  async uploadCoverPhoto(userId: string, file: Express.Multer.File): Promise<{ coverPhotoUrl: string }> {
    const result = await this.uploadsService.uploadImage(file, 'caresphere/covers');
    await this.prisma.caregiverProfile.upsert({
      where: { userId },
      update: { coverPhotoUrl: result.url },
      create: {
        userId,
        coverPhotoUrl: result.url,
        hourlyRate: 0,
        experienceYears: 0,
        certifications: [],
        specialties: [],
      },
    });
    return { coverPhotoUrl: result.url };
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: 'CAREGIVER' },
      include: {
        profile: true,
        caregiverProfile: true,
        reviewsReceived: {
          include: {
            author: { include: { profile: true } },
            booking: { select: { serviceType: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Caregiver not found');
    }

    // Don't expose sensitive data
    const { passwordHash, ...publicData } = user;

    // Calculate average rating
    const avgRating = user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / user.reviewsReceived.length
      : 0;

    return {
      ...publicData,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: user.reviewsReceived.length,
    };
  }

  async browseCaregivers(specialty?: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const where: any = {
      role: 'CAREGIVER',
      caregiverProfile: {
        verificationStatus: 'APPROVED',
        isAvailable: true,
        ...(specialty ? { specialties: { has: specialty } } : {}),
      },
    };

    const [caregivers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: { select: { firstName: true, lastName: true, avatarUrl: true, bio: true } },
          caregiverProfile: { select: { hourlyRate: true, specialties: true, experienceYears: true } },
          reviewsReceived: { select: { rating: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: caregivers.map(({ passwordHash, ...cg }) => ({
        ...cg,
        averageRating: cg.reviewsReceived.length > 0
          ? (cg.reviewsReceived.reduce((s, r) => s + r.rating, 0) / cg.reviewsReceived.length).toFixed(1)
          : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [
      todaysGigs,
      upcomingGigs,
      totalEarnings,
      weeklyEarnings,
      reviews,
      profile,
      caregiverProfile,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: {
          caregiverId: userId,
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
          scheduledAt: { gte: today, lte: endOfDay },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          caregiverId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        include: {
          customer: { include: { profile: true } },
        },
      }),
      this.prisma.earning.aggregate({
        where: { booking: { caregiverId: userId }, status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.earning.aggregate({
        where: {
          booking: { caregiverId: userId },
          status: 'PAID',
          createdAt: { gte: startOfWeek },
        },
        _sum: { amount: true },
      }),
      this.prisma.review.findMany({
        where: { targetId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          author: { include: { profile: true } },
        },
      }),
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.caregiverProfile.findUnique({ where: { userId } }),
    ]);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      user: { firstName: profile?.firstName },
      stats: {
        todaysGigs,
        weeklyEarnings: weeklyEarnings._sum.amount || 0,
        totalEarnings: totalEarnings._sum.amount || 0,
        averageRating: Number(avgRating.toFixed(1)),
        totalReviews: reviews.length,
        isAvailable: caregiverProfile?.isAvailable ?? true,
        verificationStatus: caregiverProfile?.verificationStatus || 'PENDING',
      },
      upcomingGigs,
      recentReviews: reviews,
    };
  }
}
