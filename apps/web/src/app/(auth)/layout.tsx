"use client";

import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The login page defines its own full-screen split layout.
  if (pathname === "/login") {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50/30 flex flex-col">
      <header className="w-full py-6 px-8">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-glow-primary">
            <HeartPulse className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight font-heading">
            CareSphere
          </span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} CareSphere Inc. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-primary transition-colors">
            Help
          </Link>
        </div>
      </footer>
    </div>
  );
}