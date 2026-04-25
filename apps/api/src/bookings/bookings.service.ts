import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/booking.dto';
import { BookingStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createBooking(customerId: string, data: CreateBookingDto) {
    // Check if caregiver exists and has a caregiver profile
    const caregiver = await this.prisma.caregiverProfile.findUnique({
      where: { userId: data.caregiverId },
      include: { user: true },
    });

    if (!caregiver) {
      throw new NotFoundException('Caregiver not found');
    }

    if (!caregiver.isAvailable) {
      throw new BadRequestException('Caregiver is currently unavailable');
    }

    // Logic to prevent double booking
    const scheduledStart = new Date(data.scheduledAt);
    const scheduledEnd = new Date(data.endAt);

    if (scheduledEnd <= scheduledStart) {
      throw new BadRequestException('End time must be after start time');
    }

    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        caregiverId: data.caregiverId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        OR: [
          {
            scheduledAt: { lt: scheduledEnd },
            endAt: { gt: scheduledStart },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('Caregiver is already booked for this time slot');
    }

    // Calculate cost based on duration and hourly rate
    const durationHours = (scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60 * 60);
    const totalCost = durationHours * caregiver.hourlyRate;

    return this.prisma.booking.create({
      data: {
        customerId,
        caregiverId: data.caregiverId,
        serviceType: data.serviceType,
        scheduledAt: scheduledStart,
        endAt: scheduledEnd,
        notes: data.notes,
        status: BookingStatus.PENDING,
        totalCost,
      },
    });
  }

  async getBooking(bookingId: string, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { include: { profile: true } },
        caregiver: { include: { profile: true, caregiverProfile: true } },
        reviews: { include: { author: { include: { profile: true } } } },
        invoices: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Authorization check
    if (role === 'CUSTOMER' && booking.customerId !== userId) {
      throw new ForbiddenException('Not authorized');
    }
    if (role === 'CAREGIVER' && booking.caregiverId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return booking;
  }

  async getUserBookings(userId: string, role: string) {
    const where = role === 'CAREGIVER' ? { caregiverId: userId } : { customerId: userId };

    return this.prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        customer: {
          include: { profile: true },
        },
        caregiver: {
          include: { profile: true, caregiverProfile: true },
        },
        reviews: true,
      },
    });
  }

  async updateBookingStatus(bookingId: string, userId: string, role: string, newStatus: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Authorization
    if (role === 'CUSTOMER' && booking.customerId !== userId) {
      throw new ForbiddenException('Not authorized');
    }
    if (role === 'CAREGIVER' && booking.caregiverId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Status state machine: PENDING -> CONFIRMED -> IN_PROGRESS -> COMPLETED, or CANCELLED
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      CONFIRMED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      IN_PROGRESS: [BookingStatus.COMPLETED],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[booking.status].includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${newStatus}`);
    }

    // Only caregivers can confirm or start or complete (or customers can cancel)
    if (role === 'CUSTOMER' && newStatus !== BookingStatus.CANCELLED) {
      throw new ForbiddenException('Customers can only cancel bookings');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
      include: {
        customer: { include: { profile: true } },
        caregiver: { include: { profile: true } },
      },
    });

    // Send notification to the other party
    const notifyUserId = role === 'CAREGIVER' ? updatedBooking.customerId : updatedBooking.caregiverId;
    const statusMessages: Record<string, { title: string; body: string }> = {
      CONFIRMED: {
        title: 'Booking Confirmed',
        body: `Your booking for ${updatedBooking.serviceType} has been confirmed.`,
      },
      IN_PROGRESS: {
        title: 'Caregiver Has Arrived',
        body: `Your ${updatedBooking.serviceType} session is now in progress.`,
      },
      COMPLETED: {
        title: 'Booking Completed',
        body: `Your ${updatedBooking.serviceType} session has been completed. Please leave a review!`,
      },
      CANCELLED: {
        title: 'Booking Cancelled',
        body: `A booking for ${updatedBooking.serviceType} has been cancelled.`,
      },
    };

    const notification = statusMessages[newStatus];
    if (notification) {
      await this.notificationsService.sendNotification(
        notifyUserId,
        'BOOKING_UPDATE',
        notification.title,
        notification.body,
      );
    }

    return updatedBooking;
  }

  async cancelBooking(bookingId: string, userId: string, role: string) {
    return this.updateBookingStatus(bookingId, userId, role, BookingStatus.CANCELLED);
  }
}
