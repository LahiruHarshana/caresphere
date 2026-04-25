# Guide 07 — Admin Dashboard Completion

> **Priority**: P1  
> **Estimated Time**: 4–5 hours  
> **Depends on**: Guides 01–04

---

## 1. Current Admin State

The admin panel has:
- ✅ User management (list, search, ban/unban)
- ✅ Caregiver verification (pending list, approve/reject)
- ✅ Audit logs
- ✅ Basic analytics (4 numbers)
- ❌ Booking management
- ❌ Revenue charts / time-series analytics
- ❌ System settings
- ❌ Report export
- ❌ Dashboard overview with charts

---

## 2. Enhanced Analytics Dashboard

### File: `apps/web/src/app/(admin)/admin/analytics/page.tsx`

Install a charting library:
```bash
pnpm --filter web add recharts
```

Add to the analytics page:
- **Stats Cards**: Total Users, Active Caregivers, Total Bookings, Revenue, Pending Verifications
- **Revenue Chart**: Line chart showing monthly revenue (last 12 months)
- **Booking Status Pie Chart**: Distribution of booking statuses
- **User Growth Chart**: Bar chart of new registrations per month
- **Recent Activity Feed**: Last 10 audit log entries

#### Backend — Enhanced Analytics Endpoint

```typescript
// In admin.service.ts — update getAnalytics():

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
    // Monthly revenue — use raw query or Prisma groupBy with date functions
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
    // Monthly user registrations
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
```

---

## 3. Booking Management

### New Page: `apps/web/src/app/(admin)/admin/bookings/page.tsx`

Features:
- Table of all bookings with sortable columns
- Filter by: status, date range, caregiver, customer
- Search by booking ID
- Click to view booking details in a modal
- Admin can force-cancel bookings
- Admin can add notes to bookings

#### Backend — Admin Bookings Endpoint

```typescript
// In admin.controller.ts:

@Get('bookings')
getBookings(
  @Query('status') status?: string,
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string,
) {
  return this.adminService.getBookings(
    status,
    parseInt(page || '1'),
    parseInt(limit || '20'),
    search,
  );
}

@Post('bookings/:id/cancel')
cancelBooking(@Param('id') id: string, @Req() req: any) {
  return this.adminService.adminCancelBooking(id, req.user.userId);
}
```

```typescript
// In admin.service.ts:

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
```

---

## 4. Update Admin Sidebar

### File: `apps/web/src/app/(admin)/layout.tsx`

Add the new Bookings nav item:

```typescript
const navItems = [
  { label: "Analytics", href: "/admin/analytics", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Caregivers", href: "/admin/caregivers", icon: Heart },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck }, // ADD THIS
  { label: "Audit Logs", href: "/admin/logs", icon: FileText },
];
```

---

## 5. User Detail Modal (Admin)

Enhance the admin users page so clicking a user row opens a detail modal showing:
- Full profile information
- Role and verification status
- Account creation date
- Ban status with toggle
- List of their bookings
- List of their reviews

---

## 6. Export Functionality

Add CSV export for:
- Users list
- Bookings list
- Revenue data

#### Frontend utility:

```typescript
// apps/web/src/lib/export-csv.ts
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}
```

---

## 7. Verification Checklist

- [ ] Analytics dashboard shows charts with real data
- [ ] Revenue chart displays monthly trends
- [ ] Booking management page lists all bookings
- [ ] Admin can filter bookings by status
- [ ] Admin can force-cancel a booking
- [ ] Booking cancellation creates an audit log entry
- [ ] CSV export works for users and bookings
- [ ] New Bookings link appears in admin sidebar
