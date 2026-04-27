"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";
import { Calendar, DollarSign, Star, TrendingUp, Clock, ChevronRight, ArrowRight, Bell } from "lucide-react";
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
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
    </div>
  );

  const stats = [
    { label: "Today's Gigs", value: data.stats.todaysGigs, icon: Calendar, bgColor: "bg-[#0d9488]/10", textColor: "text-[#0d9488]" },
    { label: "Weekly Earnings", value: `$${data.stats.weeklyEarnings}`, icon: DollarSign, bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
    { label: "Total Earned", value: `$${data.stats.totalEarnings}`, icon: TrendingUp, bgColor: "bg-purple-500/10", textColor: "text-purple-500" },
    { label: "Rating", value: `${data.stats.averageRating} ★`, icon: Star, bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-white tracking-tight">
            Welcome back, {data.user?.firstName || 'Caregiver'}
          </h1>
          <p className="text-white/40 mt-1 font-body">Here&apos;s what&apos;s happening with your gigs today.</p>
        </div>
        <button className="relative p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-all duration-300">
          <Bell className="w-5 h-5 text-white/60" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 inner-card overflow-hidden">
          <div className="inner-card-header flex items-center justify-between">
            <h2 className="inner-card-title">Upcoming Gigs</h2>
            <Link href="/gigs" className="text-[#5eead4] font-body text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {data.upcomingGigs.length > 0 ? (
              data.upcomingGigs.slice(0, 4).map((gig) => (
                <div key={gig.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-sm bg-[#0d9488] flex items-center justify-center text-white font-heading text-lg">
                      {gig.customer.profile?.firstName?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="font-body text-white">
                        {gig.customer.profile?.firstName} {gig.customer.profile?.lastName}
                      </p>
                      <p className="text-sm font-body text-white/40 flex items-center gap-1">
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
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/30 font-body">No upcoming gigs</p>
                <Link href="/gigs" className="text-[#5eead4] font-body text-sm mt-2 inline-block hover:underline">
                  Find new gigs →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="quick-actions-panel">
            <h3 className="quick-actions-panel-title">Quick Actions</h3>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link 
                  key={action.label} 
                  href={action.href}
                  className="quick-action-item"
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

          <div className="inner-card p-5">
            <h3 className="inner-card-title mb-4">Your Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-sm bg-[#0d9488] flex items-center justify-center text-white font-heading text-xl">
                {data.user?.firstName?.[0] ?? '?'}
              </div>
              <div>
                <p className="font-body text-white">{data.user?.firstName} {data.user?.lastName}</p>
                <p className="text-sm font-body text-white/40">Caregiver</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/caregiver/profile/edit" className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/10 rounded-sm text-sm font-body text-white/60 transition-colors duration-300">
                Edit Profile
              </Link>
              <Link href="/chat" className="flex-1 text-center py-2.5 bg-[#0d9488] hover:bg-[#0f766e] rounded-sm text-sm font-body text-white transition-colors duration-300">
                Messages
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="tip-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="tip-card-title">Need help?</h3>
            <p className="text-white/50 text-sm font-body">Check our caregiver guides and tips to maximize your earnings.</p>
          </div>
          <button className="px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-body text-sm rounded-sm transition-colors duration-300">
            View Guides
          </button>
        </div>
      </section>
    </div>
  );
}