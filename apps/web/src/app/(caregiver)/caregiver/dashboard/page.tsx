"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";
import { Calendar, DollarSign, Star, TrendingUp, Clock, ChevronRight, ArrowRight, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardData {
  user?: { firstName: string; lastName: string };
  stats: {
    todaysGigs: number;
    weeklyEarnings: number;
    totalEarnings: number;
    averageRating: number;
  };
  upcomingGigs: Array<{
    id: string;
    status: string;
    scheduledAt: string;
    endAt?: string;
    customer: {
      profile?: { firstName: string; lastName: string; avatarUrl?: string };
    };
    serviceType: string;
  }>;
}

export default function CaregiverDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (token) {
      api.get("/caregivers/dashboard", token).then(setData).catch(console.error);
    }
  }, [token]);

  if (!data) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-700"></div>
    </div>
  );

  const stats = [
    { label: "Today's Gigs", value: data.stats.todaysGigs, icon: Calendar, bgColor: "bg-teal-50", textColor: "text-teal-700" },
    { label: "Weekly Earnings", value: `$${data.stats.weeklyEarnings}`, icon: DollarSign, bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
    { label: "Total Earned", value: `$${data.stats.totalEarnings}`, icon: TrendingUp, bgColor: "bg-indigo-50", textColor: "text-indigo-700" },
    { label: "Rating", value: `${data.stats.averageRating} ★`, icon: Star, bgColor: "bg-amber-50", textColor: "text-amber-700" },
  ];

  const quickActions = [
    { label: "View All Gigs", href: "/gigs", icon: Calendar },
    { label: "Update Availability", href: "/availability", icon: Clock },
    { label: "View Earnings", href: "/earnings", icon: DollarSign },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: "status-badge-primary",
      PENDING: "status-badge-warning",
      IN_PROGRESS: "status-badge-success",
      COMPLETED: "status-badge-neutral",
    };
    return colors[status] || "status-badge-neutral";
  };

  return (
    <div className="caregiver-page space-y-8">
      <section className="caregiver-hero flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
            <Sparkles className="h-3.5 w-3.5" />
            Care work command center
          </div>
          <h1 className="font-heading text-3xl tracking-tight text-white md:text-4xl">
            Welcome back, {data.user?.firstName || 'Caregiver'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75 md:text-base">Here&apos;s what&apos;s happening with your bookings, earnings, and client requests today.</p>
        </div>
        <button className="relative h-12 w-12 rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/15" aria-label="Notifications">
          <Bell className="mx-auto h-5 w-5" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-400"></span>
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="caregiver-stat-card"
          >
            <div className={`caregiver-icon-box ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 font-heading text-3xl text-slate-950">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="caregiver-panel overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
            <h2 className="font-heading text-xl text-slate-950">Upcoming Gigs</h2>
            <Link href="/gigs" className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.upcomingGigs.length > 0 ? (
              data.upcomingGigs.slice(0, 4).map((gig) => (
                <div key={gig.id} className="flex items-center justify-between gap-4 p-5 transition-colors duration-200 hover:bg-teal-50/45">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 font-heading text-lg text-white">
                      {gig.customer.profile?.firstName?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {gig.customer.profile?.firstName} {gig.customer.profile?.lastName}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(gig.scheduledAt).toLocaleString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric', 
                          hour: 'numeric', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(gig.status)}`}>
                    {gig.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-teal-50">
                  <Calendar className="h-8 w-8 text-teal-700" />
                </div>
                <p className="font-medium text-slate-600">No upcoming gigs</p>
                <Link href="/gigs" className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:text-teal-900">
                  Find new gigs →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="caregiver-panel-dark p-5 text-white">
            <h3 className="mb-4 font-heading text-xl">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link 
                  key={action.label} 
                  href={action.href}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="caregiver-panel p-5">
            <h3 className="mb-4 font-heading text-xl text-slate-950">Your Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-teal-700 font-heading text-xl text-white">
                {data.user?.firstName?.[0] ?? '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{data.user?.firstName} {data.user?.lastName}</p>
                <p className="text-sm text-slate-500">Caregiver</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/caregiver/profile/edit" className="caregiver-secondary-button flex-1 text-sm">
                Edit Profile
              </Link>
              <Link href="/chat" className="caregiver-primary-button flex-1 text-sm">
                Messages
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="caregiver-panel-dark p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-xl">Need help?</h3>
            <p className="mt-1 text-sm text-white/60">Check caregiver guides and practical tips to improve bookings.</p>
          </div>
          <button className="caregiver-primary-button text-sm">
            View Guides
          </button>
        </div>
      </section>
    </div>
  );
}
