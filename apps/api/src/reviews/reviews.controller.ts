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