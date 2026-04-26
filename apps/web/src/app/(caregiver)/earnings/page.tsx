"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, Wallet, Receipt } from "lucide-react";

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
      bg: "bg-blue-50"
    },
    { 
      label: "Platform Fee", 
      value: `-$${platformFee.toFixed(2)}`, 
      icon: TrendingDown, 
      color: "from-red-500 to-red-600",
      bg: "bg-red-50"
    },
    { 
      label: "Net Earnings", 
      value: `$${netEarnings.toFixed(2)}`, 
      icon: TrendingUp, 
      color: "from-green-500 to-green-600",
      bg: "bg-green-50"
    },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 mt-1">Track your income from completed gigs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} text-white rounded-lg p-1`} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.label === 'Platform Fee' ? 'text-red-600' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Earnings History</h2>
                <p className="text-gray-500 text-sm">{completedBookings.length} completed gigs</p>
              </div>
            </div>
          </div>

          {completedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No earnings yet</h3>
              <p className="text-gray-500">Complete gigs to start earning</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {completedBookings.map((booking) => {
                const cost = booking.totalCost || 100;
                const fee = cost * 0.10;
                const net = cost - fee;
                
                return (
                  <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
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

        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
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
    </div>
  );
}