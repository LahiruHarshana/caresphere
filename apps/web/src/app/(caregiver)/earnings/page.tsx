"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Booking = {
  id: string;
  serviceType: string;
  scheduledAt: string;
  endAt: string;
  status: string;
  totalCost?: number | null;
  customer?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
};

export default function EarningsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [token, authLoading]);

  if (authLoading || loading) {
    return <div className="p-8 text-center text-teal-700">Loading earnings...</div>;
  }

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const pendingOrConfirmedBookings = bookings.filter((b) => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status));

  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  const totalPending = pendingOrConfirmedBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-teal-700 mb-8">Earnings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-teal-700 text-white p-6 rounded-lg shadow-sm">
          <h3 className="text-teal-100 text-sm font-medium mb-1">Total Earned</h3>
          <p className="text-4xl font-bold">${totalEarned.toFixed(2)}</p>
        </div>
        
        <div className="bg-amber-500 text-white p-6 rounded-lg shadow-sm">
          <h3 className="text-amber-100 text-sm font-medium mb-1">Pending Balance</h3>
          <p className="text-4xl font-bold">${totalPending.toFixed(2)}</p>
        </div>
        
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Completed Gigs</h3>
          <p className="text-4xl font-bold text-gray-800">{completedBookings.length}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-teal-700 mb-6 border-b pb-2 border-teal-100">
          Earning History
        </h2>
        
        {completedBookings.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-200 text-center">
            No completed gigs yet. Your earnings will appear here once you finish a booking.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {booking.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                      ${(booking.totalCost || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
