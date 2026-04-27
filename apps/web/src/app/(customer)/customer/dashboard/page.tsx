"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  UserRound,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (token) {
      api.get("/users/dashboard", token).then(setData).catch(console.error);
    }
  }, [token]);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-sm bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 rounded-sm bg-white/5 animate-pulse" />
          <div className="h-28 rounded-sm bg-white/5 animate-pulse" />
          <div className="h-28 rounded-sm bg-white/5 animate-pulse" />
        </div>
        <div className="h-52 rounded-sm bg-white/5 animate-pulse" />
      </div>
    );
  }

  const firstName = data.user?.firstName || "User";
  const stats = data.stats || {};
  const upcoming = data.upcomingBookings || [];
  const nextBooking = upcoming[0] || null;
  const nextDate = nextBooking?.scheduledAt
    ? new Date(nextBooking.scheduledAt).toLocaleString()
    : null;

  const statsData = [
    { label: "Upcoming Bookings", value: stats.upcomingCount || 0, icon: CalendarClock, bgColor: "bg-[#0d9488]/10", textColor: "text-[#0d9488]" },
    { label: "Completed Sessions", value: stats.completedCount || 0, icon: CheckCircle2, bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
    { label: "Care Status", value: nextBooking ? "Active" : "None", icon: HeartHandshake, bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
  ];

  return (
    <div className="space-y-8">
      <section className="page-hero rounded-sm overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url(/media/images/landing-family.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-[#0f172a]/70 to-[#0f172a]/40" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.3) 0%, transparent 70%)",
            filter: "blur(60px)"
          }}
        />
        <div className="page-hero-content p-8 md:p-12 grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3">
            <span className="page-hero-label mb-4">
              Customer Dashboard
            </span>
            <h1 className="font-heading text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
              Welcome back, {firstName}
            </h1>
            <p className="text-white/60 mt-4 max-w-2xl font-body leading-relaxed">
              Track appointments, manage bookings, and keep care plans organized in one place.
            </p>
          </div>
          <div className="lg:col-span-2 rounded-sm overflow-hidden border border-white/10 bg-black/30">
            <iframe
              src="https://www.youtube-nocookie.com/embed/cR8JVwNa3bI?rel=0&modestbranding=1"
              title="CareSphere customer dashboard video"
              className="w-full h-48 md:h-56"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsData.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-tile"
          >
            <div className={`stat-tile-icon ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <p className="text-sm font-body text-white/50">{stat.label}</p>
            <p className="font-heading text-3xl text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 inner-card p-6">
          <h2 className="inner-card-title mb-4">Next Appointment</h2>
          {nextBooking ? (
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-wider text-[#5eead4] bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
                <Clock3 className="w-3.5 h-3.5" />
                Upcoming Care Session
              </span>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-sm border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-body text-white/40 uppercase tracking-wide mb-2">Caregiver</p>
                  <p className="font-body text-white flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-[#0d9488]" />
                    {nextBooking.caregiver?.profile?.firstName || "Assigned caregiver"}
                  </p>
                </div>
                <div className="rounded-sm border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-body text-white/40 uppercase tracking-wide mb-2">Date and Time</p>
                  <p className="font-body text-white flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-[#0d9488]" />
                    {nextDate}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-white/10 bg-white/5 p-6 text-white/40 font-body">
              No upcoming appointments yet. Find a caregiver to schedule your first visit.
            </div>
          )}
        </div>

        <div className="lg:col-span-2 inner-card p-6">
          <h3 className="inner-card-title mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/caregivers"
              className="app-action-row"
            >
              <span className="app-action-row-label">
                <MapPin className="w-4 h-4 text-[#0d9488]" />
                Find Caregiver
              </span>
              <ArrowRight className="w-4 h-4 app-action-row-arrow" />
            </Link>

            <Link
              href="/customer/bookings"
              className="app-action-row"
            >
              <span className="app-action-row-label">
                <CalendarClock className="w-4 h-4 text-[#0d9488]" />
                My Bookings
              </span>
              <ArrowRight className="w-4 h-4 app-action-row-arrow" />
            </Link>

            <Link
              href="/video"
              className="app-action-row"
            >
              <span className="app-action-row-label">
                <Video className="w-4 h-4 text-[#0d9488]" />
                Video Care Features
              </span>
              <ArrowRight className="w-4 h-4 app-action-row-arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="tip-card">
        <p className="text-sm font-body text-[#5eead4] mb-2">Care Tip of the Day</p>
        <p className="tip-card-body">
          Keep a shared checklist for medication, hydration, and mood updates to make every visit
          more consistent and reassuring.
        </p>
      </section>
    </div>
  );
}