import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(search?: string, role?: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { email: { contains: search, mode: 'insensitive' } },
                  {
                    profile: {
                      OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                      ],
                    },
                  },
                ],
              }
            : {},
          role ? { role: role as any } : {},
        ],
      },
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleBan(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: updatedUser.isBanned ? 'BAN_USER' : 'UNBAN_USER',
        targetId: userId,
        targetType: 'USER',
        metadata: { prevStatus: user.isBanned, newStatus: updatedUser.isBanned },
      },
    });

    return updatedUser;
  }

  async getPendingCaregivers() {
    return this.prisma.caregiverProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
  }

  async verifyCaregiver(userId: string, status: VerificationStatus, adminId: string) {
    const profile = await this.prisma.caregiverProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Caregiver profile not found');

    const updatedProfile = await this.prisma.caregiverProfile.update({
      where: { userId },
      data: { verificationStatus: status },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: profile.userId,
        type: 'VERIFICATION_UPDATE',
        title: `Verification ${status.toLowerCase()}`,
        body: status === VerificationStatus.APPROVED 
          ? 'Congratulations! Your caregiver profile has been approved.'
          : 'Your caregiver profile verification was rejected. Please contact support.',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'VERIFY_CAREGIVER',
        targetId: profile.userId,
        targetType: 'CAREGIVER',
        metadata: { status },
      },
    });

    return updatedProfile;
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      include: {
        admin: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAnalytics() {
    const [totalUsers, totalBookings, pendingVerifications, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.caregiverProfile.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalCost: true },
      }),
    ]);

    return {
      activeUsers: totalUsers, // For simplicity using total users as active
      completedBookings: totalBookings,
      pendingVerifications,
      totalRevenue: totalRevenue._sum.totalCost || 0,
    };
  }
}
