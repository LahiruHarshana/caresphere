# Guide 06 — Caregiver Experience Completion

> **Priority**: P0  
> **Estimated Time**: 4–5 hours  
> **Depends on**: Guides 01–04

---

## 1. Caregiver Dashboard

### File: `apps/web/src/app/(caregiver)/caregiver/dashboard/page.tsx` (NEW)

Should display:
- Welcome greeting
- Stats: Today's Gigs, This Week's Earnings, Total Earned, Average Rating
- Next upcoming gig card with countdown
- Quick actions: View All Gigs, Update Availability, View Earnings
- Recent reviews received

#### Backend — Dashboard Endpoint

```typescript
// In caregivers.controller.ts:

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CAREGIVER')
@Get('dashboard')
async getDashboard(@Req() req: any) {
  return this.caregiversService.getDashboard(req.user.userId);
}
```

```typescript
// In caregivers.service.ts:

async getDashboard(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const [
    todaysGigs,
    upcomingGigs,
    totalEarnings,
    weeklyEarnings,
    reviews,
    profile,
    caregiverProfile,
  ] = await Promise.all([
    this.prisma.booking.count({
      where: {
        caregiverId: userId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        scheduledAt: { gte: today, lte: endOfDay },
      },
    }),
    this.prisma.booking.findMany({
      where: {
        caregiverId: userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: {
        customer: { include: { profile: true } },
      },
    }),
    this.prisma.earning.aggregate({
      where: { booking: { caregiverId: userId }, status: 'PAID' },
      _sum: { amount: true },
    }),
    this.prisma.earning.aggregate({
      where: {
        booking: { caregiverId: userId },
        status: 'PAID',
        createdAt: { gte: startOfWeek },
      },
      _sum: { amount: true },
    }),
    this.prisma.review.findMany({
      where: { targetId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: { include: { profile: true } },
      },
    }),
    this.prisma.profile.findUnique({ where: { userId } }),
    this.prisma.caregiverProfile.findUnique({ where: { userId } }),
  ]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    user: { firstName: profile?.firstName },
    stats: {
      todaysGigs,
      weeklyEarnings: weeklyEarnings._sum.amount || 0,
      totalEarnings: totalEarnings._sum.amount || 0,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: reviews.length,
      isAvailable: caregiverProfile?.isAvailable ?? true,
      verificationStatus: caregiverProfile?.verificationStatus || 'PENDING',
    },
    upcomingGigs,
    recentReviews: reviews,
  };
}
```

---

## 2. Full Booking Lifecycle on Gigs Page

### Current State
The gigs page only shows PENDING (accept/reject) and CONFIRMED. Missing:
- **Start Gig** button for CONFIRMED → IN_PROGRESS
- **Complete Gig** button for IN_PROGRESS → COMPLETED
- Section for IN_PROGRESS gigs
- Section for COMPLETED gigs (recent)

### Update: `apps/web/src/app/(caregiver)/gigs/page.tsx`

Add additional sections:

```tsx
// Add these filtered arrays:
const inProgressBookings = bookings.filter((b) => b.status === "IN_PROGRESS");
const completedBookings = bookings.filter((b) => b.status === "COMPLETED").slice(0, 5);

// Add an IN_PROGRESS section with a "Mark Complete" button:
// handleUpdateStatus(booking.id, "COMPLETED")

// Add a COMPLETED section showing recent completed gigs
```

Also update the backend to include customer details in the bookings response. The current `getUserBookings` doesn't include related data.

---

## 3. Availability Management

### File: `apps/web/src/app/(caregiver)/availability/page.tsx`

This should include:
- Toggle: Available / Unavailable (calls `POST /caregivers/profile` to update `isAvailable`)
- Weekly schedule grid (future enhancement)
- Blocked dates (future enhancement)

#### Basic Implementation

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Calendar, ToggleLeft, ToggleRight } from "lucide-react";

export default function AvailabilityPage() {
  const { token } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get("/caregivers/profile", token)
      .then((data) => {
        setIsAvailable(data.isAvailable);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      await api.post("/caregivers/profile", { isAvailable: newStatus }, token);
      setIsAvailable(newStatus);
    } catch (err) {
      console.error("Failed to update availability", err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Availability</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isAvailable ? "You're Available" : "You're Unavailable"}
            </h2>
            <p className="text-gray-500 mt-1">
              {isAvailable
                ? "Customers can find and book you"
                : "You won't appear in search results"}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`p-2 rounded-full transition-colors ${
              isAvailable ? "text-primary" : "text-gray-400"
            }`}
          >
            {isAvailable ? (
              <ToggleRight className="w-12 h-12" />
            ) : (
              <ToggleLeft className="w-12 h-12" />
            )}
          </button>
        </div>
      </div>

      {/* Future: Weekly schedule grid */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Weekly schedule management coming soon. For now, use the toggle above to control your availability.
        </p>
      </div>
    </div>
  );
}
```

---

## 4. Earnings Page Enhancement

### File: `apps/web/src/app/(caregiver)/earnings/page.tsx`

Current issues:
- Shows raw booking cost, not earnings (after platform fee)
- No platform fee deduction display
- No payout tracking

#### Enhancements

1. Show **platform fee** (10%) and **net earnings** per gig
2. Add a **total summary** section showing: Gross, Platform Fee, Net
3. Add date range filtering (this week, this month, all time)
4. Add a **Pending Payouts** section showing earnings with status PENDING

```tsx
// Updated calculation:
const grossEarned = completedBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
const platformFee = grossEarned * 0.10;
const netEarnings = grossEarned - platformFee;
```

---

## 5. Caregiver Profile Edit

### File: `apps/web/src/app/(caregiver)/caregiver/profile/edit/page.tsx`

Should include:
- Personal info section (name, phone, address, bio)
- Professional section (specialties toggle buttons, experience years, hourly rate)
- Certifications management
- Background check document upload status
- Verification status display (Pending / Approved / Rejected)
- Save button

```tsx
// Structure:
export default function CaregiverProfileEdit() {
  // Fetch from GET /caregivers/profile AND GET /users/profile
  // Display both personal and professional sections
  // Save to POST /caregivers/profile AND POST /users/profile

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

      {/* Verification Status Banner */}
      {/* Show warning if PENDING, success if APPROVED, error if REJECTED */}

      {/* Personal Information Form */}
      {/* First Name, Last Name, Phone, Address, Bio */}

      {/* Professional Information Form */}
      {/* Specialties (toggle buttons), Experience, Hourly Rate */}

      {/* Certifications */}
      {/* List with add/remove */}

      {/* Background Check Section */}
      {/* Upload document / show current status */}
    </div>
  );
}
```

---

## 6. Booking Notifications on Status Change

### Backend — Trigger notifications when booking status changes

In `apps/api/src/bookings/bookings.service.ts`, inject `NotificationsService` and send notifications:

```typescript
// In the constructor:
constructor(
  private prisma: PrismaService,
  private notificationsService: NotificationsService,
) {}

// In updateBookingStatus, after the DB update:
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
```

> **Note**: You'll need to update `bookings.module.ts` to import `NotificationsModule`.

---

## 7. Verification Checklist

- [ ] Caregiver dashboard shows accurate stats
- [ ] Upcoming gigs are sorted by date
- [ ] Gigs page shows IN_PROGRESS and COMPLETED sections
- [ ] "Start Gig" (CONFIRMED → IN_PROGRESS) works
- [ ] "Complete Gig" (IN_PROGRESS → COMPLETED) works
- [ ] Completing a gig triggers a notification to the customer
- [ ] Availability toggle works and affects search results
- [ ] Caregiver profile edit saves all fields
- [ ] Earnings page shows correct calculations with fee deduction
- [ ] Verification status is prominently displayed on profile
