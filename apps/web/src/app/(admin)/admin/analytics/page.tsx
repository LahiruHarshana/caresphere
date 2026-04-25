"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Users, CheckCircle, Clock, DollarSign, TrendingUp, Activity } from "lucide-react";

type AnalyticsData = {
  activeUsers: number;
  completedBookings: number;
  pendingVerifications: number;
  totalRevenue: number;
};

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:4000/admin/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAnalytics();
  }, [token]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  if (!data) return <div className="text-center p-8 text-gray-500">Error loading data.</div>;

  const cards = [
    { label: "Active Users", value: data.activeUsers.toLocaleString(), icon: Users, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { label: "Completed Gigs", value: data.completedBookings.toLocaleString(), icon: CheckCircle, color: "from-green-500 to-green-600", bgColor: "bg-green-50", textColor: "text-green-600" },
    { label: "Pending Verifications", value: data.pendingVerifications.toLocaleString(), icon: Clock, color: "from-amber-500 to-amber-600", bgColor: "bg-amber-50", textColor: "text-amber-600" },
    { label: "Total Revenue", value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "from-teal-500 to-teal-600", bgColor: "bg-teal-50", textColor: "text-teal-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your platform performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-4 py-2 rounded-full">
          <Activity className="w-4 h-4" />
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-sm font-medium text-gray-500">{card.label}</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Platform Growth</h2>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
        <div className="h-72 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-xl flex items-center justify-center relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop" 
            alt="Analytics chart" 
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="relative z-10 text-center">
            <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 font-medium">Interactive charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
