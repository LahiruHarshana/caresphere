"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, Wallet, Receipt, Landmark } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  scheduledAt: string;
  totalCost: number;
  customer: {
    profile?: { firstName: string; lastName: string };
  };
}

export default function EarningsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get("/bookings", token)
        .then(setBookings)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const completedBookings = bookings.filter(b => b.status === "COMPLETED");
  const grossEarned = completedBookings.reduce((sum, b) => sum + (b.totalCost || 100), 0);
  const platformFee = grossEarned * 0.10;
  const netEarnings = grossEarned - platformFee;

  const stats = [
    { 
      label: "Gross Earnings", 
      value: `$${grossEarned.toFixed(2)}`, 
      icon: DollarSign, 
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    { 
      label: "Platform Fee", 
      value: `-$${platformFee.toFixed(2)}`, 
      icon: TrendingDown, 
      color: "from-red-500 to-red-600",
      bg: "bg-red-50",
      text: "text-red-700",
    },
    { 
      label: "Net Earnings", 
      value: `$${netEarnings.toFixed(2)}`, 
      icon: TrendingUp, 
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      text: "text-green-700",
    },
  ];

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-700"></div>
    </div>
  );

  return (
    <div className="caregiver-page space-y-8">
      <section className="caregiver-hero">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
              <Landmark className="h-3.5 w-3.5" />
              Earnings overview
            </div>
            <h1 className="font-heading text-3xl text-white md:text-4xl">Earnings</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75 md:text-base">Track gross pay, platform fees, and the net income from completed gigs.</p>
          </div>
          <div className="rounded-lg bg-white/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Net Earnings</p>
            <p className="mt-1 font-heading text-3xl text-white">${netEarnings.toFixed(2)}</p>
          </div>
        </div>
      </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="caregiver-stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`caregiver-icon-box ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.text}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`mt-1 font-heading text-3xl ${stat.label === 'Platform Fee' ? 'text-red-600' : 'text-slate-950'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="caregiver-panel overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="caregiver-icon-box bg-teal-50">
                <Receipt className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="font-heading text-xl text-slate-950">Earnings History</h2>
                <p className="text-sm text-slate-500">{completedBookings.length} completed gigs</p>
              </div>
            </div>
          </div>

          {completedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-teal-50">
                <Wallet className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="mb-2 font-heading text-xl text-slate-950">No earnings yet</h3>
              <p className="text-slate-500">Complete gigs to start earning</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completedBookings.map((booking) => {
                const cost = booking.totalCost || 100;
                const fee = cost * 0.10;
                const net = cost - fee;
                
                return (
                  <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 font-bold text-white">
                        {booking.customer.profile?.firstName?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.customer.profile?.firstName} {booking.customer.profile?.lastName}
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.scheduledAt).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">+${net.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">
                        Gross: ${cost.toFixed(2)} • Fee: ${fee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="caregiver-panel p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="caregiver-icon-box bg-teal-100">
                <ArrowUpRight className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Payout Schedule</h3>
                <p className="text-gray-500 text-sm">Earnings are processed every Friday</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
    </div>
  );
}
