"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Heart, FileText, LogOut, CalendarCheck } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-neutral-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  if (!user || user.role !== "ADMIN") return null;

  const navItems = [
    { label: "Analytics", href: "/admin/analytics", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Caregivers", href: "/admin/caregivers", icon: Heart },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Audit Logs", href: "/admin/logs", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="w-64 bg-neutral-900 text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CareSphere" className="h-8 w-auto brightness-0 invert" />
            <div>
              <h1 className="font-heading text-lg text-white">Admin Center</h1>
              <p className="text-xs text-white/50 font-body">CareSphere Platform</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-dark nav-item flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body transition-all duration-300 ${
                    isActive 
                      ? "bg-white/10 text-white border-l-2 border-primary" 
                      : ""
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-sm hover:bg-white/10 transition-colors duration-300 text-white/70 hover:text-white font-body text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-auto">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}