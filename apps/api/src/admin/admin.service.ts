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
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const [
      totalUsers,
      totalCaregivers,
      totalCustomers,
      totalBookings,
      bookingsByStatus,
      pendingVerifications,
      revenueTotal,
      monthlyRevenue,
      monthlyUsers,
      recentLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'CAREGIVER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.booking.count(),
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.caregiverProfile.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalCost: true },
      }),
      this.prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "scheduledAt") as month,
               SUM("totalCost") as revenue,
               COUNT(*) as count
        FROM "Booking"
        WHERE status = 'COMPLETED'
          AND "scheduledAt" >= ${twelveMonthsAgo}
        GROUP BY month
        ORDER BY month ASC
      `,
      this.prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") as month,
               COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${twelveMonthsAgo}
        GROUP BY month
        ORDER BY month ASC
      `,
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { admin: { include: { profile: true } } },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalCaregivers,
        totalCustomers,
        totalBookings,
        pendingVerifications,
        totalRevenue: revenueTotal._sum.totalCost || 0,
      },
      bookingsByStatus,
      monthlyRevenue,
      monthlyUsers,
      recentLogs,
    };
  }

  async getBookings(status?: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customer: { profile: { firstName: { contains: search, mode: 'insensitive' } } } },
        { caregiver: { profile: { firstName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { include: { profile: true } },
          caregiver: { include: { profile: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: bookings, total, page, totalPages: Math.ceil(total / limit) };
  }

  async adminCancelBooking(bookingId: string, adminId: string) {
    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CANCEL_BOOKING',
        targetId: bookingId,
        targetType: 'BOOKING',
      },
    });

    return booking;
  }
}
