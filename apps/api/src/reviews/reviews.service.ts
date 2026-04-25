import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(authorId: string, dto: CreateReviewDto) {
    // Verify the booking exists and is completed
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Can only review completed bookings');
    }

    // Determine who is being reviewed
    let targetId: string;
    if (booking.customerId === authorId) {
      targetId = booking.caregiverId; // Customer reviewing caregiver
    } else if (booking.caregiverId === authorId) {
      targetId = booking.customerId; // Caregiver reviewing customer
    } else {
      throw new ForbiddenException('You are not part of this booking');
    }

    // Check if already reviewed
    const existing = await this.prisma.review.findFirst({
      where: { bookingId: dto.bookingId, authorId },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    return this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        authorId,
        targetId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        author: { include: { profile: true } },
      },
    });
  }

  async getReviewsForUser(targetId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { targetId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { include: { profile: true } },
          booking: { select: { serviceType: true } },
        },
      }),
      this.prisma.review.count({ where: { targetId } }),
    ]);

    // Calculate average
    const avgResult = await this.prisma.review.aggregate({
      where: { targetId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      reviews,
      total,
      page,
      averageRating: Number((avgResult._avg.rating || 0).toFixed(1)),
      totalReviews: avgResult._count.rating,
    };
  }

  async getReviewsForBooking(bookingId: string) {
    return this.prisma.review.findMany({
      where: { bookingId },
      include: {
        author: { include: { profile: true } },
      },
    });
  }
}