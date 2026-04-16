import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.booking.create({
      data: {
        customerId,
        caregiverId: data.caregiverId,
        serviceType: data.serviceType,
        scheduledAt: scheduledStart,
        endAt: scheduledEnd,
        notes: data.notes,
        status: BookingStatus.PENDING,
      },
    });
  }

  async getUserBookings(userId: string, role: string) {
    if (role === 'CAREGIVER') {
      return this.prisma.booking.findMany({ where: { caregiverId: userId }, orderBy: { scheduledAt: 'desc' } });
    }
    return this.prisma.booking.findMany({ where: { customerId: userId }, orderBy: { scheduledAt: 'desc' } });
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

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });
  }

  async cancelBooking(bookingId: string, userId: string, role: string) {
    return this.updateBookingStatus(bookingId, userId, role, BookingStatus.CANCELLED);
  }
}
