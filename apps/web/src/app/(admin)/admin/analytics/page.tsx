"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Users, CheckCircle, Clock, DollarSign, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  if (!data) return <div className="text-center p-8 text-gray-500 font-body">Error loading data.</div>;

  const cards = [
    { label: "Total Users", value: data.stats.totalUsers.toLocaleString(), icon: Users, bgColor: "bg-primary/10", textColor: "text-primary" },
    { label: "Total Bookings", value: data.stats.totalBookings.toLocaleString(), icon: CheckCircle, bgColor: "bg-green-50", textColor: "text-green-600" },
    { label: "Pending Verifications", value: data.stats.pendingVerifications.toLocaleString(), icon: Clock, bgColor: "bg-amber-50", textColor: "text-amber-600" },
    { label: "Total Revenue", value: `$${data.stats.totalRevenue.toLocaleString()}`, icon: DollarSign, bgColor: "bg-primary/10", textColor: "text-primary" },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a288ff'];
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
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-neutral tracking-tight">Analytics Dashboard</h1>
          <p className="text-neutral-500 mt-1 font-body">Overview of your platform performance</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-body text-primary bg-primary/10 px-4 py-2 rounded-full uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-6 rounded-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-sm ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="stat-admin-label">{card.label}</div>
              <div className="stat-admin-number">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading text-neutral tracking-tight">Monthly Revenue</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading text-neutral tracking-tight">New Users</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading text-neutral tracking-tight">Booking Status</h2>
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
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading text-neutral tracking-tight">Recent Activity</h2>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-72">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-sm hover:bg-neutral-50 transition-colors duration-300">
                <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-body text-neutral">
                    {log.admin.profile?.firstName} {log.action}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 font-body">
                    {new Date(log.createdAt).toLocaleString()} • Target: {log.targetType} {log.targetId.substring(0, 8)}
                  </p>
                </div>
              </div>
            ))}
            {data.recentLogs.length === 0 && (
              <p className="text-neutral-400 text-center py-4 font-body">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}