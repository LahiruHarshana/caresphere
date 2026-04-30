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
import { motion, AnimatePresence } from "framer-motion";

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
      </div>
    );
  }

  if (!user) return null;

  const isCustomer = user.role === "CUSTOMER";
  const isCaregiver = user.role === "CAREGIVER";
  const isAdmin = user.role === "ADMIN";

  let navItems: Array<{ label: string; href: string; icon: any }> = [];
  
  if (isCustomer) {
    navItems = [
      { label: "Dashboard", href: "/customer/dashboard", icon: Home },
      { label: "Find Caregivers", href: "/caregivers", icon: Search },
      { label: "My Bookings", href: "/customer/bookings", icon: CalendarCheck },
      { label: "Messages", href: "/chat", icon: MessageCircle },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Family Vault", href: "/vault", icon: Shield },
      { label: "My Profile", href: "/customer/profile/edit", icon: User },
    ];
  } else if (isCaregiver) {
    navItems = [
      { label: "Dashboard", href: "/caregiver/dashboard", icon: Home },
      { label: "My Gigs", href: "/gigs", icon: CalendarCheck },
      { label: "Messages", href: "/chat", icon: MessageCircle },
      { label: "Availability", href: "/availability", icon: Bell },
      { label: "Earnings", href: "/earnings", icon: Shield },
      { label: "Profile", href: "/caregiver/profile/edit", icon: User },
    ];
  } else if (isAdmin) {
    navItems = [
      { label: "Analytics", href: "/admin/analytics", icon: Home },
      { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { label: "Caregivers", href: "/admin/caregivers", icon: User },
      { label: "Users", href: "/admin/users", icon: Search },
      { label: "Logs", href: "/admin/logs", icon: Bell },
    ];
  }

  const shellClass = isCaregiver ? "caregiver-shell min-h-screen" : "min-h-screen bg-[#0f172a]";
  const headerClass = isCaregiver
    ? "sticky top-0 z-50 border-b border-slate-100 bg-white/92 backdrop-blur"
    : "app-nav sticky top-0 z-50";
  const navLinkClass = (active: boolean) =>
    isCaregiver
      ? `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
          active ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-teal-50 hover:text-teal-800"
        }`
      : `app-nav-link ${active ? "active" : ""}`;

  return (
    <div className={shellClass}>
      <header className={headerClass}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <img src="/logo.png" alt="CareSphere" className="app-nav-logo" />
              {isCaregiver && (
                <div className="hidden sm:block">
                  <p className="font-heading text-lg leading-none text-slate-950">CareSphere</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Caregiver Portal</p>
                </div>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(isActive)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <span className={`hidden sm:block text-sm ${isCaregiver ? "text-slate-500" : "app-nav-user"}`}>
                Hi, {user.firstName}
              </span>
              <button
                onClick={logout}
                className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                  isCaregiver ? "text-slate-500 hover:text-red-600" : "text-white/40 hover:text-red-400"
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <nav className={`lg:hidden overflow-x-auto ${isCaregiver ? "border-t border-slate-100" : "border-t border-white/5"}`}>
          <div className="flex px-4 py-2 gap-1">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-sm text-xs font-body whitespace-nowrap transition-all duration-300 ${
                    isCaregiver
                      ? isActive ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"
                      : isActive ? "bg-white/10 text-white" : "text-white/50"
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

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
