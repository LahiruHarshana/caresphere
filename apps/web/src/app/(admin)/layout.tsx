"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user || user.role !== "ADMIN") return null;

  const navItems = [
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Users", href: "/admin/users" },
    { label: "Caregivers", href: "/admin/caregivers" },
    { label: "Audit Logs", href: "/admin/logs" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-teal-700 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-teal-600">
          Admin Center
        </div>
        <nav className="flex-1 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-3 transition-colors ${
                pathname === item.href ? "bg-teal-800 border-l-4 border-amber-500" : "hover:bg-teal-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-teal-600">
          <button
            onClick={logout}
            className="w-full text-left hover:text-amber-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
