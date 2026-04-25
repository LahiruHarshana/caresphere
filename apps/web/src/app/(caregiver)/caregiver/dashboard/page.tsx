"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";

export default function CaregiverDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (token) {
      api.get("/caregivers/dashboard", token).then(setData).catch(console.error);
    }
  }, [token]);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {data.user?.firstName || 'Caregiver'}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide">Today's Gigs</h2>
          <p className="text-2xl font-bold">{data.stats.todaysGigs}</p>
        </div>
        <div className="bg-white p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide">Weekly Earnings</h2>
          <p className="text-2xl font-bold">${data.stats.weeklyEarnings}</p>
        </div>
        <div className="bg-white p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide">Total Earned</h2>
          <p className="text-2xl font-bold">${data.stats.totalEarnings}</p>
        </div>
        <div className="bg-white p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide">Rating</h2>
          <p className="text-2xl font-bold">★ {data.stats.averageRating}</p>
        </div>
      </div>
      
      <div className="flex gap-4 mb-8">
        <Link href="/gigs" className="bg-blue-600 text-white px-4 py-2 rounded">View All Gigs</Link>
        <Link href="/availability" className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Update Availability</Link>
        <Link href="/earnings" className="bg-gray-200 text-gray-800 px-4 py-2 rounded">View Earnings</Link>
      </div>

      <div className="bg-blue-50 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Upcoming Gigs</h2>
        {data.upcomingGigs.length > 0 ? (
          <div className="space-y-4">
            {data.upcomingGigs.map((gig: any) => (
              <div key={gig.id} className="flex justify-between items-center bg-white p-4 rounded shadow-sm border">
                <div>
                  <p className="font-bold">{gig.customer.profile?.firstName} {gig.customer.profile?.lastName}</p>
                  <p className="text-gray-600 text-sm">{new Date(gig.scheduledAt).toLocaleString()}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">{gig.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No upcoming gigs.</p>
        )}
      </div>
    </div>
  );
}