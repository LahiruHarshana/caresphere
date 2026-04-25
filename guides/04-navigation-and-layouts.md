# Guide 04 — Navigation & Layouts

> **Priority**: P0  
> **Estimated Time**: 3–4 hours  
> **Depends on**: Guide 01

---

## Problem

After login, users have **no way to navigate** between pages. There are no navbars or sidebars for Customer or Caregiver views. The Admin layout exists but Customer and Caregiver do not. Users must type URLs manually.

---

## 1. Customer Layout with Sidebar/Navbar

### File: `apps/web/src/app/(customer)/layout.tsx` (NEW FILE)

```tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Search,
  CalendarCheck,
  MessageCircle,
  Bell,
  Shield,
  User,
  LogOut,
  Home,
} from "lucide-react";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "CUSTOMER")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "CUSTOMER") return null;

  const navItems = [
    { label: "Dashboard", href: "/customer/dashboard", icon: Home },
    { label: "Find Caregivers", href: "/caregivers", icon: Search },
    { label: "My Bookings", href: "/customer/bookings", icon: CalendarCheck },
    { label: "Messages", href: "/chat", icon: MessageCircle },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Family Vault", href: "/vault", icon: Shield },
    { label: "My Profile", href: "/customer/profile/edit", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/customer/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-teal-400 rounded-lg flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">CareSphere</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Hi, {user.firstName}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-gray-100 overflow-x-auto">
          <div className="flex px-4 py-2 gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                    isActive ? "bg-primary/10 text-primary" : "text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 2. Caregiver Layout with Sidebar

### File: `apps/web/src/app/(caregiver)/layout.tsx` (NEW FILE)

```tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Briefcase,
  DollarSign,
  Calendar,
  MessageCircle,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "CAREGIVER")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "CAREGIVER") return null;

  const navItems = [
    { label: "Dashboard", href: "/caregiver/dashboard", icon: LayoutDashboard },
    { label: "Gigs", href: "/gigs", icon: Briefcase },
    { label: "Availability", href: "/availability", icon: Calendar },
    { label: "Earnings", href: "/earnings", icon: DollarSign },
    { label: "Messages", href: "/chat", icon: MessageCircle },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "My Profile", href: "/caregiver/profile/edit", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/caregiver/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-teal-400 rounded-xl flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CareSphere</h1>
              <p className="text-xs text-gray-500">Caregiver Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/caregiver/dashboard" className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-primary" />
            <span className="font-bold text-gray-900">CareSphere</span>
          </Link>
          <button onClick={logout} className="text-gray-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        {/* Mobile Bottom Nav */}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:p-8 p-4 pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 3. Auth Layout (Already Exists — Verify)

Check `apps/web/src/app/(auth)/layout.tsx` — it should NOT wrap pages with the main nav (auth pages are standalone).

---

## 4. Shared Layout for Chat/Notifications

The `(shared)` group pages (chat, notifications) are accessed by **both** customers and caregivers. The layout needs to detect the user's role and show the appropriate navigation.

### File: `apps/web/src/app/(shared)/layout.tsx` (NEW FILE)

```tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // For shared pages, render just the children.
  // The actual nav will come from the parent layout
  // OR: duplicate a minimal nav here with role-aware links.
  return <>{children}</>;
}
```

> **Important Note about Next.js Route Groups**: Since `(customer)`, `(caregiver)`, and `(shared)` are separate route groups, a user visiting `/chat` won't automatically get the Customer or Caregiver layout. You have two options:
> 
> **Option A (Recommended)**: Move chat and notifications pages UNDER both `(customer)` and `(caregiver)` as duplicates or use a shared component.
> 
> **Option B**: Create a standalone layout for `(shared)` that dynamically renders the correct nav based on `user.role`.

---

## 5. Update Page Routes

Some current routes need to be added or adjusted:

| Current Route | New Route | Notes |
|---|---|---|
| `/customer` (redirect to profile) | `/customer/dashboard` | New dashboard page needed |
| No customer bookings page | `/customer/bookings` | New page needed (Guide 05) |
| `/caregiver` (no dashboard) | `/caregiver/dashboard` | New dashboard page needed (Guide 06) |

---

## 6. Protect the Landing Page

The landing page (`/`) should redirect authenticated users to their dashboard:

### File: `apps/web/src/app/page.tsx`

At the top of the component, add:

```tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") router.push("/admin/analytics");
      else if (user.role === "CAREGIVER") router.push("/caregiver/dashboard");
      else router.push("/customer/dashboard");
    }
  }, [user, isLoading, router]);

  // ... rest of landing page JSX (keep the existing 39KB content)
}
```

---

## 7. 404 Page

### File: `apps/web/src/app/not-found.tsx` (NEW FILE)

```tsx
import Link from "next/link";
import { HeartPulse, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <HeartPulse className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-7xl font-extrabold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
```

---

## 8. Verification Checklist

- [ ] Customer layout renders with navbar after login
- [ ] Caregiver layout renders with sidebar after login
- [ ] Admin layout still works (unchanged)
- [ ] Navigation links highlight the current active page
- [ ] Logout button works from all layouts
- [ ] Non-authenticated users get redirected to `/login`
- [ ] Customer trying to access `/gigs` gets redirected
- [ ] Caregiver trying to access `/vault` gets redirected
- [ ] 404 page renders for unknown routes
- [ ] Landing page redirects authenticated users to their dashboard
- [ ] Mobile navigation is usable
