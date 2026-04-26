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
      <div className="flex items-center justify-center h-screen bg-neutral-50">
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
    <div className="flex min-h-screen bg-neutral-50">
      <div className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link href="/caregiver/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="CareSphere" className="h-10 w-auto" />
            <div>
              <h1 className="font-heading text-lg text-neutral">CareSphere</h1>
              <p className="text-xs font-body text-neutral-400">Caregiver Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-neutral-300"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center text-primary font-heading text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body text-neutral truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs font-body text-neutral-400 truncate">{user.email}</p>
            </div>
            <NotificationBell />
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-sm font-body text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/caregiver/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="CareSphere" className="h-8 w-auto" />
          </Link>
          <button onClick={logout} className="text-neutral-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-auto md:p-8 p-4 pt-20 md:pt-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}