"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Heart, FileText, LogOut, Shield, CalendarCheck } from "lucide-react";
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
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
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
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-72 bg-gradient-to-b from-teal-800 to-teal-900 text-white flex flex-col shadow-xl">
        <div className="p-8 border-b border-teal-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Center</h1>
              <p className="text-xs text-teal-300">CareSphere Platform</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? "bg-white/20 border-l-4 border-amber-400" 
                      : "hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-teal-200'}`} />
                  <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-4 border-t border-teal-700/50">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-teal-200 hover:text-white"
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
