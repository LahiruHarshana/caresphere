"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  DollarSign,
  Calendar,
  MessageCircle,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
    <div className="caregiver-shell flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-700"></div>
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
    <div className="caregiver-shell flex min-h-screen">
      <aside className="caregiver-sidebar hidden w-72 flex-col md:flex">
        <div className="border-b border-slate-100 p-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="CareSphere" className="h-11 w-auto" />
            <div>
              <h1 className="font-heading text-xl text-slate-950">CareSphere</h1>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-700">Caregiver Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`caregiver-nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="caregiver-panel-soft mb-4 flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 font-heading text-sm text-white">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <NotificationBell />
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CareSphere" className="h-8 w-auto" />
            <span className="font-heading text-lg text-slate-950">CareSphere</span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={logout} className="text-slate-500" aria-label="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                  isActive ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-auto px-4 pb-8 pt-32 md:px-8 md:py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
