"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";

export default function CustomerDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (token) {
      api.get("/users/dashboard", token).then(setData).catch(console.error);
    }
  }, [token]);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {data.user?.firstName || 'User'}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="text-gray-500">Upcoming Bookings</h2>
          <p className="text-2xl font-semibold">{data.stats.upcomingCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="text-gray-500">Completed</h2>
          <p className="text-2xl font-semibold">{data.stats.completedCount}</p>
        </div>
      </div>
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-2">Next Appointment</h2>
        {data.upcomingBookings.length > 0 ? (
          <div>
            <p>Caregiver: {data.upcomingBookings[0].caregiver.profile?.firstName}</p>
            <p>Date: {new Date(data.upcomingBookings[0].scheduledAt).toLocaleString()}</p>
          </div>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </div>
      <div className="flex gap-4">
        <Link href="/caregivers" className="bg-blue-600 text-white px-4 py-2 rounded">Find Caregiver</Link>
        <Link href="/customer/bookings" className="bg-gray-200 text-gray-800 px-4 py-2 rounded">My Bookings</Link>
      </div>
    </div>
  );
}