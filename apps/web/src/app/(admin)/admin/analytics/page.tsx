"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Users, CheckCircle, Clock, DollarSign, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

type AnalyticsData = {
  stats: {
    totalUsers: number;
    totalCaregivers: number;
    totalCustomers: number;
    totalBookings: number;
    pendingVerifications: number;
    totalRevenue: number;
  };
  bookingsByStatus: { status: string; _count: { status: number } }[];
  monthlyRevenue: { month: string; revenue: number; count: number }[];
  monthlyUsers: { month: string; count: number }[];
  recentLogs: any[];
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
    </div>
  );
  if (!data) return <div className="text-center p-8 text-white/40 font-body">Error loading data.</div>;

  const cards = [
    { label: "Total Users", value: data.stats.totalUsers.toLocaleString(), icon: Users, bgColor: "bg-[#0d9488]/10", textColor: "text-[#0d9488]" },
    { label: "Total Bookings", value: data.stats.totalBookings.toLocaleString(), icon: CheckCircle, bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
    { label: "Pending Verifications", value: data.stats.pendingVerifications.toLocaleString(), icon: Clock, bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
    { label: "Total Revenue", value: `$${data.stats.totalRevenue.toLocaleString()}`, icon: DollarSign, bgColor: "bg-[#0d9488]/10", textColor: "text-[#0d9488]" },
  ];

  const COLORS = ['#0d9488', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
  const pieData = data.bookingsByStatus.map((item) => ({
    name: item.status,
    value: item._count.status,
  }));

  const revenueData = data.monthlyRevenue.map((item) => ({
    name: new Date(item.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    revenue: Number(item.revenue),
  }));

  const usersData = data.monthlyUsers.map((item) => ({
    name: new Date(item.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    count: Number(item.count),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-white/40 mt-1 font-body">Overview of your platform performance</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-body text-[#5eead4] bg-[#0d9488]/10 px-4 py-2 rounded-full uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-tile"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`stat-tile-icon ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-sm font-body text-white/50">{card.label}</div>
              <div className="font-heading text-3xl text-white mt-1">{card.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="inner-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="inner-card-title">Monthly Revenue</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', background: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="inner-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="inner-card-title">New Users</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', background: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="inner-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="inner-card-title">Booking Status</h2>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#64748b' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', background: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="inner-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="inner-card-title">Recent Activity</h2>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-72">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-sm hover:bg-white/5 transition-colors duration-300">
                <div className="w-8 h-8 rounded-sm bg-[#0d9488]/10 flex items-center justify-center text-[#0d9488] flex-shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-body text-white">
                    {log.admin.profile?.firstName} {log.action}
                  </p>
                  <p className="text-xs text-white/30 mt-1 font-body">
                    {new Date(log.createdAt).toLocaleString()} • Target: {log.targetType} {log.targetId.substring(0, 8)}
                  </p>
                </div>
              </div>
            ))}
            {data.recentLogs.length === 0 && (
              <p className="text-white/30 text-center py-4 font-body">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}