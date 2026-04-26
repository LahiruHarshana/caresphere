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
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  const stats = [
    { label: "Today's Gigs", value: data.stats.todaysGigs, icon: Calendar, color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { label: "Weekly Earnings", value: `$${data.stats.weeklyEarnings}`, icon: DollarSign, color: "from-green-500 to-green-600", bg: "bg-green-50" },
    { label: "Total Earned", value: `$${data.stats.totalEarnings}`, icon: TrendingUp, color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
    { label: "Rating", value: `★ ${data.stats.averageRating}`, icon: Star, color: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
  ];

  const quickActions = [
    { label: "View All Gigs", href: "/gigs", icon: Calendar, color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Update Availability", href: "/availability", icon: Clock, color: "bg-teal-600 hover:bg-teal-700" },
    { label: "View Earnings", href: "/earnings", icon: DollarSign, color: "bg-green-600 hover:bg-green-700" },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: "bg-blue-100 text-blue-700",
      PENDING: "bg-amber-100 text-amber-700",
      IN_PROGRESS: "bg-green-100 text-green-700",
      COMPLETED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {data.user?.firstName || 'Caregiver'}! 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your gigs today.</p>
          </div>
          <button className="relative p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Gigs</h2>
                <Link href="/gigs" className="text-teal-600 font-medium text-sm hover:text-teal-700 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {data.upcomingGigs.length > 0 ? (
                  data.upcomingGigs.slice(0, 4).map((gig) => (
                    <div key={gig.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                          {gig.customer.profile?.firstName?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {gig.customer.profile?.firstName} {gig.customer.profile?.lastName}
                          </p>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(gig.scheduledAt).toLocaleString('en-US', { 
                              weekday: 'short', month: 'short', day: 'numeric', 
                              hour: 'numeric', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(gig.status)}`}>
                        {gig.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No upcoming gigs</p>
                    <Link href="/gigs" className="text-teal-600 font-medium text-sm mt-2 inline-block">
                      Find new gigs →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-teal-200">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link 
                    key={action.label} 
                    href={action.href}
                    className={`flex items-center justify-between p-4 rounded-xl text-white transition-all hover:scale-[1.02]`}
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <span className="font-medium">{action.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Profile</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                  {data.user?.firstName?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{data.user?.firstName} {data.user?.lastName}</p>
                  <p className="text-gray-500 text-sm">Caregiver</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/caregiver/profile/edit" className="flex-1 text-center py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  Edit Profile
                </Link>
                <Link href="/chat" className="flex-1 text-center py-2.5 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium text-white transition-colors">
                  Messages
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Need help?</h3>
              <p className="text-gray-600 text-sm">Check our caregiver guides and tips to maximize your earnings.</p>
            </div>
            <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors">
              View Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}