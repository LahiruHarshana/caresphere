"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function EarningsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      api.get("/bookings", token).then(setBookings).catch(console.error);
    }
  }, [token]);

  const completedBookings = bookings.filter(b => b.status === "COMPLETED");
  const grossEarned = completedBookings.reduce((sum, b) => sum + (b.totalCost || 100), 0); // Mock 100 if null
  const platformFee = grossEarned * 0.10;
  const netEarnings = grossEarned - platformFee;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Earnings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow border text-center">
          <h2 className="text-gray-500 mb-2">Gross Earnings</h2>
          <p className="text-3xl font-bold text-gray-900">${grossEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border text-center">
          <h2 className="text-gray-500 mb-2">Platform Fee (10%)</h2>
          <p className="text-3xl font-bold text-red-600">-${platformFee.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border text-center">
          <h2 className="text-gray-500 mb-2">Net Earnings</h2>
          <p className="text-3xl font-bold text-green-600">${netEarnings.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow border p-6">
        <h2 className="text-xl font-bold mb-4">Completed Gigs History</h2>
        {completedBookings.length === 0 ? <p>No completed gigs yet.</p> : (
          <div className="space-y-4">
            {completedBookings.map(b => {
              const cost = b.totalCost || 100;
              const fee = cost * 0.10;
              const net = cost - fee;
              return (
                <div key={b.id} className="border-b pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{b.customer.profile?.firstName}</h3>
                    <p className="text-sm text-gray-500">{new Date(b.scheduledAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${net.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Gross: ${cost.toFixed(2)} | Fee: ${fee.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}