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

  if (pathname === "/login") {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50/30 flex flex-col">
      <header className="w-full py-6 px-8">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <img src="/logo.png" alt="CareSphere" className="h-12 w-auto" />
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