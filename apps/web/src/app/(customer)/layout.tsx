"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CalendarCheck,
  MessageCircle,
  Bell,
  Shield,
  User,
  LogOut,
  Home,
} from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
      <div className="flex items-center justify-center h-screen bg-neutral-50">
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
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="CareSphere" className="h-10 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-body transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-6">
              <span className="text-sm font-body text-neutral-600 hidden sm:block">
                Hi, {user.firstName}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-body text-neutral-400 hover:text-red-500 transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="md:hidden border-t border-gray-100 overflow-x-auto">
          <div className="flex px-4 py-2 gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-sm text-xs font-body whitespace-nowrap ${
                    isActive ? "bg-primary/10 text-primary" : "text-neutral-500"
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

      <main className="max-w-7xl mx-auto px-8 py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}