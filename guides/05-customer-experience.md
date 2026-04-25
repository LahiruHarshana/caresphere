# Guide 05 — Customer Experience Completion

> **Priority**: P0  
> **Estimated Time**: 5–6 hours  
> **Depends on**: Guides 01–04

---

## Overview

This guide covers building the complete customer-facing experience:

1. Customer Dashboard (new)
2. My Bookings page (new)
3. Booking detail view (new)
4. Profile management improvements
5. Caregiver public profile improvements
6. Public caregiver browsing (no auth required)

---

## 1. Customer Dashboard

### File: `apps/web/src/app/(customer)/customer/dashboard/page.tsx` (NEW)

This page should display:
- Welcome message with user's name
- Quick stats cards: Upcoming Bookings, Completed, Active Caregiver
- Next upcoming booking (prominent card)
- Recent notifications (last 3)
- Quick action buttons: Find Caregiver, View Messages, View Vault

#### Backend Requirements
Create a new endpoint `GET /users/dashboard` that returns aggregated data:

```typescript
// In users.controller.ts or a new dashboard.controller.ts:

@UseGuards(JwtAuthGuard)
@Get('dashboard')
async getDashboard(@Req() req: any) {
  return this.usersService.getCustomerDashboard(req.user.userId);
}
```

```typescript
// In users.service.ts:

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
```

#### Frontend Component Structure

```tsx
// Pseudo-structure for the dashboard page:

export default function CustomerDashboard() {
  // Fetch dashboard data from /users/dashboard
  // Display:
  // 1. Welcome header with greeting based on time of day
  // 2. Stats cards in a 3-column grid
  // 3. "Next Appointment" prominent card
  // 4. Quick Actions row (Find Caregiver, Messages, Vault)
  // 5. Recent Activity / Notifications list
}
```

---

## 2. My Bookings Page

### File: `apps/web/src/app/(customer)/customer/bookings/page.tsx` (NEW)

This page should have:
- Tabs: All | Upcoming | Completed | Cancelled
- Each booking card shows: caregiver name, service type, date/time, status badge, cost
- Click to expand or navigate to detail
- Cancel button for PENDING bookings
- Review button for COMPLETED bookings (links to review form)

#### Backend — Update Bookings Controller

Add includes to the existing `getUserBookings`:

```typescript
// In bookings.service.ts, update getUserBookings:

async getUserBookings(userId: string, role: string) {
  const where = role === 'CAREGIVER'
    ? { caregiverId: userId }
    : { customerId: userId };

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
```

#### Frontend Structure

```tsx
export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState([]);

  // Fetch from GET /bookings
  // Filter by activeTab
  // Render booking cards with:
  //   - Caregiver avatar + name
  //   - Service type
  //   - Date & time
  //   - Status badge (color-coded)
  //   - Cost
  //   - Action buttons (Cancel / Review / Rebook)
}
```

---

## 3. Booking Detail Page

### File: `apps/web/src/app/(customer)/customer/bookings/[id]/page.tsx` (NEW)

#### Backend — Add Get Single Booking Endpoint

```typescript
// In bookings.controller.ts:

@UseGuards(JwtAuthGuard)
@Get(':id')
async getBooking(@Param('id') id: string, @Req() req: any) {
  return this.bookingsService.getBooking(id, req.user.userId, req.user.role);
}
```

```typescript
// In bookings.service.ts:

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
```

The detail page should show:
- Full booking information
- Caregiver details
- Booking timeline (status history)
- Invoice / payment status
- Reviews left for this booking
- Action buttons: Cancel, Contact Caregiver (go to chat), Leave Review
- Payment receipt download (if paid)

---

## 4. Customer Profile Edit Improvements

### File: `apps/web/src/app/(customer)/customer/profile/edit/page.tsx`

The current page likely needs enhancement. It should include:

- Profile photo upload area (placeholder for now, implement in Guide 11)
- First name, Last name, Email (readonly)
- Phone, Address, Date of Birth
- Care preferences section:
  - Care type needed
  - Care frequency
  - Preferred schedule
  - Special requirements
- Save button with loading state
- Success/error toast notifications

#### Backend — Update Profile Endpoints

Add a customer profile update endpoint:

```typescript
// In users.controller.ts:

@UseGuards(JwtAuthGuard)
@Post('customer-profile')
async upsertCustomerProfile(@Req() req: any, @Body() data: UpdateCustomerProfileDto) {
  return this.usersService.upsertCustomerProfile(req.user.userId, data);
}

@UseGuards(JwtAuthGuard)
@Get('customer-profile')
async getCustomerProfile(@Req() req: any) {
  return this.usersService.getCustomerProfile(req.user.userId);
}
```

Create the DTO: `apps/api/src/users/dto/customer-profile.dto.ts`:

```typescript
import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional() @IsString() careType?: string;
  @IsOptional() @IsString() careFrequency?: string;
  @IsOptional() @IsString() specialRequirements?: string;
  @IsOptional() @IsString() preferredSchedule?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() emergencyPhone?: string;
}
```

---

## 5. Caregiver Public Profile Page

### File: `apps/web/src/app/(customer)/caregivers/[id]/page.tsx`

This page currently exists but needs to be feature-complete. It should display:

- Caregiver photo / avatar
- Full name, bio
- Specialties as badges
- Hourly rate prominently displayed
- Years of experience
- Certifications list
- Verification status badge (Approved/Pending)
- Average rating with star display
- Reviews list (paginated)
- Location map (if coordinates available)
- Languages spoken
- Availability status
- **"Book This Caregiver"** CTA button → navigates to `/book/[caregiverId]`
- **"Send Message"** button → navigates to chat

#### Backend — Add Public Caregiver Profile Endpoint

```typescript
// In caregivers.controller.ts:

@UseGuards(JwtAuthGuard)
@Get(':id')
async getPublicProfile(@Param('id') id: string) {
  return this.caregiversService.getPublicProfile(id);
}
```

```typescript
// In caregivers.service.ts:

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
```

---

## 6. Public Caregiver Browsing (No Auth)

Currently, the caregiver search requires authentication. For better UX, allow unauthenticated browsing with basic info, requiring login only to book.

### Backend — Add Public Browse Endpoint

```typescript
// In caregivers.controller.ts (no auth guard):

@Get('browse')
async browseCaregivers(
  @Query('specialty') specialty?: string,
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  return this.caregiversService.browseCaregivers(
    specialty,
    parseInt(page || '1'),
    parseInt(limit || '12'),
  );
}
```

```typescript
// In caregivers.service.ts:

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
```

---

## 7. Verification Checklist

- [ ] Customer dashboard loads with stats and upcoming bookings
- [ ] My Bookings page shows all bookings with correct status badges
- [ ] Booking detail page shows full information
- [ ] Cancel booking works from the bookings list
- [ ] Customer profile edit saves all fields including care preferences
- [ ] Caregiver public profile shows all details, reviews, and rating
- [ ] "Book This Caregiver" navigates to booking page
- [ ] Public browse endpoint returns caregivers without auth
- [ ] Pagination works on bookings list and caregiver browse
