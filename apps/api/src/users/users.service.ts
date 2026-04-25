import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { Prisma, User, Profile, CustomerProfile } from '@prisma/client';
import { UpdateProfileDto } from './dto/profile.dto';
import { UpdateCustomerProfileDto } from './dto/customer-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const result = await this.uploadsService.uploadImage(file, 'caresphere/avatars');

    await this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl: result.url },
    });

    return { avatarUrl: result.url };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  async upsertProfile(userId: string, data: UpdateProfileDto): Promise<Profile> {
    return this.prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        userId,
      },
    });
  }

  async getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
    return this.prisma.customerProfile.findUnique({
      where: { userId },
    });
  }

  async upsertCustomerProfile(userId: string, data: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    return this.prisma.customerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        userId,
      },
    });
  }

  async getCustomerDashboard(userId: string) {
    const [upcomingBookings, completedCount, recentNotifications, profile] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          customerId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        include: {
          caregiver: {
            include: { profile: true, caregiverProfile: true },
          },
        },
      }),
      this.prisma.booking.count({
        where: { customerId: userId, status: 'COMPLETED' },
      }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.profile.findUnique({ where: { userId } }),
    ]);

    return {
      user: { firstName: profile?.firstName, lastName: profile?.lastName },
      stats: {
        upcomingCount: upcomingBookings.length,
        completedCount,
      },
      upcomingBookings,
      recentNotifications,
    };
  }
}
