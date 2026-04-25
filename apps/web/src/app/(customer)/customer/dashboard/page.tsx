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
        <div className="h-44 rounded-3xl bg-slate-200 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="h-28 rounded-2xl bg-slate-200" />
        </div>
        <div className="h-52 rounded-2xl bg-slate-200" />
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-soft-xl">
        <img
          src="/media/images/landing-family.jpg"
          alt="Family care overview"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/60 to-slate-900/35" />
        <div className="relative z-10 p-6 md:p-10 grid lg:grid-cols-5 gap-6 items-center">
          <div className="lg:col-span-3">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-200 mb-4">
              <Sparkles className="w-4 h-4" />
              Customer Dashboard
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-200 mt-4 max-w-2xl text-base md:text-lg">
              Track appointments, manage bookings, and keep care plans organized in one place.
            </p>
          </div>
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/20 bg-black/20 shadow-xl">
            <iframe
              src="https://www.youtube-nocookie.com/embed/cR8JVwNa3bI?rel=0&modestbranding=1"
              title="CareSphere customer dashboard video"
              className="w-full h-52 md:h-60"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center mb-3">
            <CalendarClock className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500">Upcoming Bookings</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.upcomingCount || 0}</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500">Completed Sessions</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.completedCount || 0}</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500">Care Status</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {nextBooking ? "Next Visit Scheduled" : "No Active Booking"}
          </p>
        </div>
      </section>

      <section className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Next Appointment</h2>
          {nextBooking ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary bg-primary-50 border border-primary-100 rounded-full px-3 py-1">
                <Clock3 className="w-3.5 h-3.5" />
                Upcoming Care Session
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Caregiver</p>
                  <p className="text-slate-900 font-semibold inline-flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-primary" />
                    {nextBooking.caregiver?.profile?.firstName || "Assigned caregiver"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Date and Time</p>
                  <p className="text-slate-900 font-semibold inline-flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-primary" />
                    {nextDate}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
              No upcoming appointments yet. Find a caregiver to schedule your first visit.
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/caregivers"
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 p-4 transition-colors"
            >
              <span className="text-slate-800 font-semibold inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Find Caregiver
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary" />
            </Link>

            <Link
              href="/customer/bookings"
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 p-4 transition-colors"
            >
              <span className="text-slate-800 font-semibold inline-flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                My Bookings
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary" />
            </Link>

            <Link
              href="/video"
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 p-4 transition-colors"
            >
              <span className="text-slate-800 font-semibold inline-flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Video Care Features
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-primary-50 via-cyan-50 to-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Care Tip of the Day</p>
        <p className="text-slate-900 font-semibold mt-1">
          Keep a shared checklist for medication, hydration, and mood updates to make every visit
          more consistent and reassuring.
        </p>
      </section>
    </div>
  );
}
