"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") router.push("/admin/analytics");
      else if (user.role === "CAREGIVER") router.push("/caregiver/dashboard");
      else router.push("/customer/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-20 relative z-10">{children}</main>

      <Footer />
    </div>
  );
}