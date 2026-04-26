"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";
import { Calendar, DollarSign, Star, TrendingUp, Clock, ChevronRight, ArrowRight, Bell } from "lucide-react";

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const stats = [
    { label: "Today's Gigs", value: data.stats.todaysGigs, icon: Calendar, bgColor: "bg-primary/10", textColor: "text-primary" },
    { label: "Weekly Earnings", value: `$${data.stats.weeklyEarnings}`, icon: DollarSign, bgColor: "bg-green-50", textColor: "text-green-600" },
    { label: "Total Earned", value: `$${data.stats.totalEarnings}`, icon: TrendingUp, bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { label: "Rating", value: `${data.stats.averageRating} ★`, icon: Star, bgColor: "bg-amber-50", textColor: "text-amber-500" },
  ];

  const quickActions = [
    { label: "View All Gigs", href: "/gigs", icon: Calendar },
    { label: "Update Availability", href: "/availability", icon: Clock },
    { label: "View Earnings", href: "/earnings", icon: DollarSign },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: "bg-blue-50 text-blue-600",
      PENDING: "bg-amber-50 text-amber-600",
      IN_PROGRESS: "bg-green-50 text-green-600",
      COMPLETED: "bg-neutral-100 text-neutral-600",
    };
    return colors[status] || "bg-neutral-100 text-neutral-600";
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-neutral tracking-tight">
              Welcome back, {data.user?.firstName || 'Caregiver'}
            </h1>
            <p className="text-neutral-500 mt-1 font-body">Here's what's happening with your gigs today.</p>
          </div>
          <button className="relative p-3 bg-white rounded-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <Bell className="w-5 h-5 text-neutral-600" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-sm ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-sm font-body text-neutral-500">{stat.label}</p>
              <p className="font-heading text-3xl text-neutral mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-heading text-lg text-neutral tracking-tight">Upcoming Gigs</h2>
                <Link href="/gigs" className="text-primary font-body text-sm flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {data.upcomingGigs.length > 0 ? (
                  data.upcomingGigs.slice(0, 4).map((gig) => (
                    <div key={gig.id} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center text-white font-heading text-lg">
                          {gig.customer.profile?.firstName?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-body text-neutral">
                            {gig.customer.profile?.firstName} {gig.customer.profile?.lastName}
                          </p>
                          <p className="text-sm font-body text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(gig.scheduledAt).toLocaleString('en-US', { 
                              weekday: 'short', month: 'short', day: 'numeric', 
                              hour: 'numeric', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-body uppercase tracking-wider ${getStatusColor(gig.status)}`}>
                        {gig.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-neutral-300" />
                    </div>
                    <p className="text-neutral-400 font-body">No upcoming gigs</p>
                    <Link href="/gigs" className="text-primary font-body text-sm mt-2 inline-block hover:underline">
                      Find new gigs →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-neutral-900 rounded-sm p-6 text-white">
              <h3 className="font-heading text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link 
                    key={action.label} 
                    href={action.href}
                    className="flex items-center justify-between p-4 rounded-sm text-white transition-all duration-300 hover:bg-white/10"
                  >
                    <span className="font-body text-sm">{action.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-sm border border-gray-100 p-6">
              <h3 className="font-heading text-lg text-neutral tracking-tight mb-4">Your Profile</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-sm bg-primary flex items-center justify-center text-white font-heading text-xl">
                  {data.user?.firstName?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-body text-neutral">{data.user?.firstName} {data.user?.lastName}</p>
                  <p className="text-sm font-body text-neutral-400">Caregiver</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/caregiver/profile/edit" className="flex-1 text-center py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-sm text-sm font-body text-neutral-600 transition-colors duration-300">
                  Edit Profile
                </Link>
                <Link href="/chat" className="flex-1 text-center py-2.5 bg-primary hover:bg-primary-700 rounded-sm text-sm font-body text-white transition-colors duration-300">
                  Messages
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 rounded-sm p-6 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg text-neutral mb-1">Need help?</h3>
              <p className="text-neutral-500 text-sm font-body">Check our caregiver guides and tips to maximize your earnings.</p>
            </div>
            <button className="px-5 py-2.5 bg-primary hover:bg-primary-700 text-white font-body text-sm rounded-sm transition-colors duration-300">
              View Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}