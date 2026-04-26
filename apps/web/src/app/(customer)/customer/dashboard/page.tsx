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
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";

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
      <div className="max-w-7xl mx-auto p-4 md:p-6 animate-pulse">
        <div className="h-44 rounded-sm bg-neutral-200 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="h-28 rounded-sm bg-neutral-200" />
          <div className="h-28 rounded-sm bg-neutral-200" />
          <div className="h-28 rounded-sm bg-neutral-200" />
        </div>
        <div className="h-52 rounded-sm bg-neutral-200" />
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
      <section className="relative overflow-hidden rounded-sm border border-gray-100 shadow-soft-md">
        <img
          src="/media/images/landing-family.jpg"
          alt="Family care overview"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-neutral-900/60 to-neutral-900/40" />
        <div className="relative z-10 p-8 md:p-12 grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3">
            <span className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-widest text-primary-200 mb-4">
              <Sparkles className="w-4 h-4" />
              Customer Dashboard
            </span>
            <h1 className="font-heading text-3xl md:text-5xl text-white tracking-tight leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-white/70 mt-4 max-w-2xl font-body leading-relaxed">
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

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-sm border border-primary-100 bg-primary-tint p-6">
          <div className="w-11 h-11 rounded-sm bg-primary text-white flex items-center justify-center mb-4">
            <CalendarClock className="w-5 h-5" />
          </div>
          <p className="text-sm font-body text-neutral-500">Upcoming Bookings</p>
          <p className="font-heading text-4xl text-neutral mt-1">{stats.upcomingCount || 0}</p>
        </div>

        <div className="rounded-sm border border-emerald-100 bg-emerald-50 p-6">
          <div className="w-11 h-11 rounded-sm bg-emerald-500 text-white flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-body text-neutral-500">Completed Sessions</p>
          <p className="font-heading text-4xl text-neutral mt-1">{stats.completedCount || 0}</p>
        </div>

        <div className="rounded-sm border border-amber-100 bg-amber-50 p-6">
          <div className="w-11 h-11 rounded-sm bg-amber-500 text-white flex items-center justify-center mb-4">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <p className="text-sm font-body text-neutral-500">Care Status</p>
          <p className="font-heading text-xl text-neutral mt-1">
            {nextBooking ? "Next Visit Scheduled" : "No Active Booking"}
          </p>
        </div>
      </section>

      <section className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 rounded-sm border border-gray-100 bg-white p-6">
          <h2 className="font-heading text-xl text-neutral tracking-tight mb-4">Next Appointment</h2>
          {nextBooking ? (
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                <Clock3 className="w-3.5 h-3.5" />
                Upcoming Care Session
              </span>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-sm border border-gray-100 bg-neutral-50 p-4">
                  <p className="text-xs font-body text-neutral-400 uppercase tracking-wide mb-2">Caregiver</p>
                  <p className="font-body text-neutral flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-primary" />
                    {nextBooking.caregiver?.profile?.firstName || "Assigned caregiver"}
                  </p>
                </div>
                <div className="rounded-sm border border-gray-100 bg-neutral-50 p-4">
                  <p className="text-xs font-body text-neutral-400 uppercase tracking-wide mb-2">Date and Time</p>
                  <p className="font-body text-neutral flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-primary" />
                    {nextDate}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-gray-200 bg-neutral-50 p-6 text-neutral-500 font-body">
              No upcoming appointments yet. Find a caregiver to schedule your first visit.
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-sm border border-gray-100 bg-white p-6">
          <h3 className="font-heading text-lg text-neutral tracking-tight mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/caregivers"
              className="group flex items-center justify-between rounded-sm border border-gray-100 bg-neutral-50 hover:bg-primary/5 hover:border-primary/20 p-4 transition-all duration-300"
            >
              <span className="font-body text-neutral flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Find Caregiver
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </Link>

            <Link
              href="/customer/bookings"
              className="group flex items-center justify-between rounded-sm border border-gray-100 bg-neutral-50 hover:bg-primary/5 hover:border-primary/20 p-4 transition-all duration-300"
            >
              <span className="font-body text-neutral flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                My Bookings
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </Link>

            <Link
              href="/video"
              className="group flex items-center justify-between rounded-sm border border-gray-100 bg-neutral-50 hover:bg-primary/5 hover:border-primary/20 p-4 transition-all duration-300"
            >
              <span className="font-body text-neutral flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Video Care Features
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-primary/10 bg-primary/5 p-6">
        <p className="text-sm font-body text-neutral-600">Care Tip of the Day</p>
        <p className="font-body text-neutral mt-1 leading-relaxed">
          Keep a shared checklist for medication, hydration, and mood updates to make every visit
          more consistent and reassuring.
        </p>
      </section>
    </div>
  );
}