import { Controller, Post, Body, Req, UseGuards, Param, Patch, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBooking(@Req() req: any, @Body() data: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyBookings(@Req() req: any) {
    return this.bookingsService.getUserBookings(req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getBooking(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.getBooking(id, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() data: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(id, req.user.userId, req.user.role, data.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelBooking(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancelBooking(id, req.user.userId, req.user.role);
  }
}
