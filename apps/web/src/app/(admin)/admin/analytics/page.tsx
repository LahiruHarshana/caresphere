"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

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

  if (isLoading) return <div>Loading analytics...</div>;
  if (!data) return <div>Error loading data.</div>;

  const cards = [
    { label: "Active Users", value: data.activeUsers, color: "bg-blue-500" },
    { label: "Completed Gigs", value: data.completedBookings, color: "bg-green-500" },
    { label: "Pending Verifications", value: data.pendingVerifications, color: "bg-amber-500" },
    { label: "Total Revenue", value: `$${data.totalRevenue.toLocaleString()}`, color: "bg-teal-600" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-teal-700">
            <div className="text-sm font-medium text-gray-500 uppercase">{card.label}</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Platform Growth</h2>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
          [ Chart Placeholder - Monthly Growth ]
        </div>
      </div>
    </div>
  );
}
