# Guide 09 — Notifications & Email

> **Priority**: P1  
> **Estimated Time**: 3–4 hours  
> **Depends on**: Guides 01–06

---

## 1. Current State

- Backend `NotificationsService` exists with DB, WebSocket, and email delivery
- Email uses nodemailer with basic HTML template
- Frontend notifications page displays DB notifications
- WebSocket gateway exists but frontend doesn't actively listen for real-time updates

---

## 2. Notification Trigger Points

Ensure notifications are sent at every important event. Add triggers in these services:

| Event | Who Gets Notified | Type |
|---|---|---|
| New booking created | Caregiver | `BOOKING_REQUEST` |
| Booking confirmed | Customer | `BOOKING_CONFIRMED` |
| Booking started (IN_PROGRESS) | Customer | `BOOKING_STARTED` |
| Booking completed | Customer | `BOOKING_COMPLETED` |
| Booking cancelled | Both parties | `BOOKING_CANCELLED` |
| Caregiver verification approved | Caregiver | `VERIFICATION_APPROVED` |
| Caregiver verification rejected | Caregiver | `VERIFICATION_REJECTED` |
| New review received | Target user | `NEW_REVIEW` |
| New message received | Receiver | `NEW_MESSAGE` |
| Payment received | Customer + Caregiver | `PAYMENT_RECEIVED` |

### Implementation Pattern

In each service where an event occurs:

```typescript
// Inject NotificationsService in the constructor
constructor(
  private prisma: PrismaService,
  private notificationsService: NotificationsService,
) {}

// After the action, send notification:
await this.notificationsService.sendNotification(
  userId,
  'EVENT_TYPE',
  'Notification Title',
  'Notification body text.',
);
```

---

## 3. Email Templates

Create proper HTML email templates instead of inline HTML.

### File: `apps/api/src/notifications/templates/` (NEW directory)

#### `apps/api/src/notifications/templates/base.template.ts`

```typescript
export function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0fdfa; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💚 CareSphere</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
              © ${new Date().getFullYear()} CareSphere. All rights reserved.<br>
              This is an automated message. Please do not reply directly.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
```

#### `apps/api/src/notifications/templates/booking-confirmed.template.ts`

```typescript
import { baseTemplate } from './base.template';

export function bookingConfirmedTemplate(data: {
  customerName: string;
  caregiverName: string;
  serviceType: string;
  date: string;
  time: string;
}): string {
  return baseTemplate(`
    <h2 style="color: #0f766e; margin-top: 0;">Booking Confirmed! ✅</h2>
    <p style="color: #475569; font-size: 16px;">
      Hi ${data.customerName},
    </p>
    <p style="color: #475569; font-size: 16px;">
      Great news! Your booking has been confirmed.
    </p>
    <div style="background-color: #f0fdfa; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr>
          <td style="color: #64748b; font-size: 14px;">Caregiver:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.caregiverName}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 14px;">Service:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.serviceType}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 14px;">Date:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.date}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 14px;">Time:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.time}</td>
        </tr>
      </table>
    </div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/bookings"
       style="display: inline-block; background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      View Booking Details
    </a>
  `);
}
```

Create similar templates for other events: `booking-request.template.ts`, `booking-completed.template.ts`, `verification-update.template.ts`, `welcome.template.ts`.

---

## 4. Real-Time Notification Bell (Frontend)

### File: `apps/web/src/components/ui/notification-bell.tsx`

Update this component to:
1. Show unread count badge
2. Connect to WebSocket for real-time updates
3. Show dropdown with recent notifications on click

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/hooks/use-socket";
import { api } from "@/lib/api";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const socket = useSocket("notifications", token);

  // Fetch initial unread count
  useEffect(() => {
    if (!token) return;
    api.get("/notifications/unread-count", token)
      .then((data) => setUnreadCount(data))
      .catch(console.error);
  }, [token]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (notification: any) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No recent notifications
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                  <p className="font-medium text-sm text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                </div>
              ))}
            </div>
          )}
          <div className="p-3 border-t border-gray-100 text-center">
            <Link
              href="/notifications"
              className="text-sm text-primary font-medium hover:text-primary/80"
              onClick={() => setShowDropdown(false)}
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Add `NotificationBell` to all layouts

In the Customer layout navbar and Caregiver layout sidebar, add:
```tsx
import { NotificationBell } from "@/components/ui/notification-bell";
// Then in the header:
<NotificationBell />
```

---

## 5. Backend — Unread Count Endpoint

Add to `apps/api/src/notifications/notifications.controller.ts`:

```typescript
@UseGuards(JwtAuthGuard)
@Get('unread-count')
async getUnreadCount(@Req() req: any) {
  return this.notificationsService.getUnreadCount(req.user.userId);
}
```

---

## 6. Verification Checklist

- [ ] All trigger points from the table send notifications
- [ ] Email templates render correctly
- [ ] Real-time notification bell updates without page refresh
- [ ] Unread badge count is accurate
- [ ] Clicking a notification marks it as read
- [ ] "Mark all as read" works
- [ ] Email delivery works (test with console.log fallback)
