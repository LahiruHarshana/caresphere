# Guide 08 — Reviews & Ratings System

> **Priority**: P0  
> **Estimated Time**: 3–4 hours  
> **Depends on**: Guides 01–05

---

## Overview

The schema has a `Review` model but there is **no frontend** to create or view reviews, and the backend has **no review controller/service**.

---

## 1. Backend — Reviews Module

### Create: `apps/api/src/reviews/reviews.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
```

### Create: `apps/api/src/reviews/reviews.service.ts`

```typescript
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
```

### Create: `apps/api/src/reviews/reviews.controller.ts`

```typescript
import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.userId, dto);
  }

  @Get('user/:userId')
  getForUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.getReviewsForUser(
      userId,
      parseInt(page || '1'),
      parseInt(limit || '10'),
    );
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  getForBooking(@Param('bookingId') bookingId: string) {
    return this.reviewsService.getReviewsForBooking(bookingId);
  }
}
```

### Create: `apps/api/src/reviews/dto/create-review.dto.ts`

```typescript
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  bookingId!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
```

### Register in AppModule

Add `ReviewsModule` to the `imports` array in `apps/api/src/app.module.ts`.

---

## 2. Frontend — Review Form Component

### File: `apps/web/src/components/ui/review-form.tsx` (NEW)

```tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewFormProps {
  bookingId: string;
  token: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ bookingId, token, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/reviews", {
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      }, token);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment (Optional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

---

## 3. Frontend — Review Display Component

### File: `apps/web/src/components/ui/review-card.tsx` (NEW)

```tsx
import { Star } from "lucide-react";

interface ReviewCardProps {
  review: {
    rating: number;
    comment?: string;
    createdAt: string;
    author: {
      profile?: {
        firstName: string;
        lastName: string;
        avatarUrl?: string | null;
      };
    };
    booking?: {
      serviceType?: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {review.author.profile?.firstName?.[0] || "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {review.author.profile?.firstName} {review.author.profile?.lastName}
            </p>
            {review.booking?.serviceType && (
              <p className="text-xs text-gray-500">{review.booking.serviceType}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
            }`}
          />
        ))}
      </div>
      {review.comment && (
        <p className="text-gray-600 text-sm">{review.comment}</p>
      )}
    </div>
  );
}
```

---

## 4. Integration Points

### A. Booking Detail Page — Add Review Section
On the customer's booking detail page, if the booking is COMPLETED and no review exists, show the `ReviewForm`.

### B. Caregiver Profile Page — Show Reviews
On the caregiver public profile page (`/caregivers/[id]`), fetch and display reviews using `ReviewCard`.

### C. My Bookings — Review Button
In the customer's booking list, add a "Leave Review" button for COMPLETED bookings that haven't been reviewed yet.

---

## 5. Verification Checklist

- [ ] Review can be created for completed bookings only
- [ ] Duplicate reviews are prevented
- [ ] Star rating interactive component works
- [ ] Reviews display on caregiver profile page
- [ ] Average rating updates correctly
- [ ] Review form shows on booking detail page
- [ ] "Leave Review" button appears in booking list for eligible bookings
