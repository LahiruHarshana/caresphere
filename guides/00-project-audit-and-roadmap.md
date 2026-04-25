# CareSphere — Project Audit & Complete Roadmap

> **Purpose**: This document is the master audit of the current project state and the recommended implementation order. Read this FIRST before any other guide.

---

## 1. Current Project State Summary

### Architecture
- **Monorepo**: pnpm workspaces with `apps/api` (NestJS), `apps/web` (Next.js 14), `packages/shared`
- **Database**: PostgreSQL 16 via Docker, Prisma ORM (with PrismaPg adapter)
- **Cache**: Redis 7 (declared in docker-compose but not used anywhere)
- **Real-time**: Socket.IO (Chat, Notifications, Video signaling gateways exist)
- **Payments**: Stripe (basic integration exists)
- **Auth**: JWT (access + refresh tokens), Passport.js, Argon2 password hashing

### What Exists (Backend — `apps/api`)
| Module | Status | Notes |
|---|---|---|
| Auth | 🟡 Partial | Register/login work. No email verification, no password reset, no logout endpoint (frontend calls it but 404s), no ValidationPipe enabled globally. |
| Users | 🟡 Partial | Basic profile CRUD only. No avatar upload, no account deletion. |
| Caregivers | 🟡 Partial | Profile upsert + verification doc upload. No public listing endpoint (customer pages rely on `/matching/caregivers`). |
| Bookings | 🟡 Partial | Create, list, status transitions work. No notification dispatch on status change. No cost calculation on create. Missing relations include in queries. |
| Matching | ✅ Functional | Weighted scoring algorithm works. Missing pagination, caching. |
| Chat | 🟡 Partial | Gateway + service exist. REST endpoint for conversations/history exists. Missing file/image attachments. |
| Video | 🔴 Skeleton | WebRTC signaling gateway exists but no TURN/STUN config, no frontend page, no booking validation. |
| Payments | 🟡 Partial | Stripe payment intent + webhook. No refund logic, no payout to caregivers. |
| Invoices | 🟡 Partial | PDF generation via Puppeteer. Heavy dependency, no download endpoint. |
| Vault | ✅ Functional | AES-256-GCM encryption works. Grant/revoke access works. |
| Notifications | 🟡 Partial | DB + WebSocket + Email delivery. Email will fail without SMTP config. No push notifications. |
| Admin | 🟡 Partial | User list, ban/unban, caregiver verification, audit logs, basic analytics. Missing booking management, report generation, system settings. |
| Prisma | 🟡 Partial | Schema is solid but missing: `dateOfBirth` field on Profile, customer care preferences (careType, careFrequency, etc. are accepted in DTO but NOT stored). |

### What Exists (Frontend — `apps/web`)
| Page / Feature | Status | Notes |
|---|---|---|
| Landing Page (`page.tsx`) | ✅ Good | 39KB, fully built with animations. No header/footer navigation to logged-in pages. |
| Login | ✅ Works | Has demo quick-fill. Hardcoded `localhost:4000`. |
| Register | ✅ Works | Multi-step form for both roles. Well-designed. |
| Caregivers Browse | 🟡 Partial | Uses matching API. No dedicated "Browse All" public endpoint. Auth required to browse (bad UX). |
| Caregiver Detail Page | 🟡 Partial | Exists but content not reviewed. Likely minimal. |
| Booking Page | ✅ Works | Full booking flow with Stripe integration. |
| Customer Dashboard | 🔴 Missing | Redirects to `/customer/profile` which doesn't exist as a proper dashboard. No booking history page. |
| Customer Profile Edit | 🟡 Partial | Exists but likely minimal. |
| Caregiver Dashboard | 🔴 Missing | No proper dashboard page for caregivers. |
| Gigs Management | ✅ Works | Shows pending/confirmed bookings with accept/reject. Missing IN_PROGRESS/COMPLETED flow. |
| Earnings | 🟡 Partial | Shows completed bookings as earnings. No platform fee deduction shown. |
| Availability | 🔴 Skeleton | Page exists but content unknown. |
| Chat | ✅ Works | Conversation list + chat window. |
| Notifications | ✅ Works | List with read/unread, mark all read. |
| Vault | ✅ Works | Full CRUD with access control UI. |
| Admin Analytics | 🟡 Partial | Exists but likely basic stats only. |
| Admin Users | 🟡 Partial | User listing with ban toggle. |
| Admin Caregivers | 🟡 Partial | Pending verification list. |
| Admin Logs | 🟡 Partial | Audit log display. |
| Shared Navigation | 🔴 Missing | No persistent navbar/sidebar for customer/caregiver views. Pages have no consistent nav. |
| Reviews System | 🔴 Missing | Schema exists but no frontend page to write/view reviews. |
| Video Call | 🔴 Missing | Component exists but no page route. |
| Responsive Design | 🟡 Partial | Some pages responsive, many are not. |
| Error/Loading States | 🟡 Partial | Inconsistent across pages. |
| 404 Page | 🔴 Missing | No custom 404. |
| API URL Config | 🔴 Broken | Most pages hardcode `http://localhost:4000`. Should use env variable. |
| Protected Routes | 🟡 Partial | Admin layout checks role. Customer/caregiver layouts don't guard routes. |
| Refresh Token Usage | 🔴 Not Implemented | Refresh token endpoint exists in API but frontend never uses it. Token expires → user gets kicked. |

---

## 2. Critical Bugs & Issues

1. **No Global ValidationPipe**: The NestJS API never enables `ValidationPipe` in `main.ts`, so ALL DTOs with class-validator decorators are ignored — any garbage data goes straight to the DB.
2. **Auth Context Logout Bug**: Frontend calls `POST /auth/logout` which doesn't exist in the backend → 404 error on every logout.
3. **Missing Customer Dashboard**: `/customer` redirects to `/customer/profile` but the profile page doesn't function as a dashboard.
4. **Hardcoded API URLs**: 90% of frontend files use `"http://localhost:4000"` instead of `process.env.NEXT_PUBLIC_API_URL`.
5. **Schema-DTO Mismatch**: Register DTO accepts `dateOfBirth`, `careType`, `careFrequency`, `specialRequirements`, `preferredSchedule` but the `auth.service.ts` destructures them and then **never stores them** (Profile model has no such fields).
6. **No ConfigModule**: The NestJS app doesn't import `ConfigModule.forRoot()` globally — env variables work by accident via `process.env`.
7. **CORS Wide Open**: `app.enableCors()` with no origin restriction.
8. **Broken `auth/me`**: Returns the raw JWT payload (`{ sub, email, role }`) not a full user object — frontend expects `{ id, email, role, firstName, lastName }`.
9. **No Caregiver/Customer Layouts with Navigation**: Users have no way to navigate between pages after login without manually typing URLs.

---

## 3. Missing Features for Launch

### Must-Have (P0)
1. ✅ Global ValidationPipe + ConfigModule
2. ✅ Fix auth/me to return full user object
3. ✅ Add logout endpoint (or remove frontend call)
4. ✅ Fix hardcoded API URLs → environment variables
5. ✅ Add navigation layouts for Customer and Caregiver
6. ✅ Customer Dashboard (my bookings, upcoming, history)
7. ✅ Caregiver Dashboard (stats, upcoming gigs)
8. ✅ Schema migration: add missing fields (dateOfBirth, careType, etc.)
9. ✅ Reviews — write and display reviews
10. ✅ Protected route guards for customer/caregiver layouts
11. ✅ Proper error handling and loading states
12. ✅ Booking status lifecycle: IN_PROGRESS → COMPLETED with notifications
13. ✅ Caregiver public profile page (viewable without auth)
14. ✅ Password Reset flow (forgot password email)
15. ✅ Email Verification on registration
16. ✅ 404 and error pages

### Should-Have (P1)
1. Admin Dashboard — booking management, revenue charts, user stats over time
2. Caregiver Availability Calendar (schedule management)
3. Token refresh interceptor (auto-refresh before expiry)
4. Avatar/profile photo upload (Cloudinary integration)
5. Caregiver payout tracking (Stripe Connect or manual)
6. Refund logic for cancelled bookings
7. Rate limiting and request throttling
8. Input sanitization and XSS protection
9. Pagination for all list endpoints
10. Search and advanced filtering
11. Responsive mobile design audit

### Nice-to-Have (P2)
1. Video call page (WebRTC frontend)
2. Push notifications (service worker)
3. Multi-language / i18n support
4. Dark mode toggle
5. Analytics dashboard with charts (recharts/chart.js)
6. SMS notifications (Twilio)
7. Report generation / export (CSV/PDF)
8. Terms of Service and Privacy Policy pages
9. Blog/FAQ/Help Center
10. SEO optimization for public pages

---

## 4. Recommended Implementation Order

The guides in this folder should be followed in this exact sequence:

| # | Guide File | Priority | Description |
|---|---|---|---|
| 01 | `01-critical-backend-fixes.md` | P0 | Fix ValidationPipe, ConfigModule, auth/me, logout, CORS, env vars |
| 02 | `02-schema-migration.md` | P0 | Add missing fields, update Prisma schema, create migration |
| 03 | `03-auth-hardening.md` | P0 | Email verification, password reset, token refresh, banned user check |
| 04 | `04-navigation-and-layouts.md` | P0 | Add navbars/sidebars for Customer and Caregiver, protect routes |
| 05 | `05-customer-experience.md` | P0 | Customer dashboard, booking history, profile management, reviews |
| 06 | `06-caregiver-experience.md` | P0 | Caregiver dashboard, availability, earnings, full booking lifecycle |
| 07 | `07-admin-dashboard-completion.md` | P1 | Complete admin panel with booking mgmt, charts, reports |
| 08 | `08-reviews-and-ratings.md` | P0 | Full review system (API + frontend) |
| 09 | `09-notifications-and-email.md` | P1 | Proper notification triggers, email templates, push notifications |
| 10 | `10-payments-and-invoices.md` | P1 | Refunds, payouts, invoice downloads, payment history |
| 11 | `11-file-uploads-and-media.md` | P1 | Avatar uploads, Cloudinary, document management |
| 12 | `12-api-hardening.md` | P1 | Rate limiting, pagination, error handling, logging |
| 13 | `13-frontend-polish.md` | P1 | Responsive design, loading skeletons, error boundaries, 404 page |
| 14 | `14-realtime-features.md` | P2 | Video calls, live location tracking, real-time notifications |
| 15 | `15-testing-and-deployment.md` | P2 | Unit tests, E2E tests, Docker production build, CI/CD |

---

## 5. Technology Decisions

| Concern | Current | Recommendation |
|---|---|---|
| State Management | React Context only | Add Zustand for complex client state |
| API Client | Raw fetch everywhere | Create a centralized `api.ts` utility with auth interceptor |
| Form Handling | Manual state | Consider react-hook-form for complex forms |
| Charts | None | recharts or Chart.js for admin analytics |
| File Storage | Local disk (`/tmp/uploads`) | Cloudinary or S3 |
| Email | Nodemailer (raw SMTP) | Keep, but add proper HTML templates |
| PDF Generation | Puppeteer | Keep for now, consider lighter alternatives later |
| Caching | Redis declared, unused | Use for session management, rate limiting |
| Monitoring | None | Add Sentry for error tracking |

---

> **Next Step**: Start with Guide `01-critical-backend-fixes.md`
