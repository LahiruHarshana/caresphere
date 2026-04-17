"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

type Booking = {
  id: string;
  serviceType: string;
  scheduledAt: string;
  endAt: string;
  status: string;
  notes?: string;
  customer?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
};

export default function GigsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [authLoading, fetchBookings]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:4000/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchBookings();
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center text-teal-700">Loading gigs...</div>;
  }

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-teal-700 mb-8">Available Gigs</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4 border-b pb-2 border-teal-100">
          Pending Requests
        </h2>
        {pendingBookings.length === 0 ? (
          <p className="text-gray-500">No pending requests at the moment.</p>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {booking.serviceType}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.scheduledAt).toLocaleString()} - {new Date(booking.endAt).toLocaleTimeString()}
                  </p>
                  {booking.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">&quot;{booking.notes}&quot;</p>
                  )}
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                  <Button 
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleUpdateStatus(booking.id, "CANCELLED")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-teal-700 mb-4 border-b pb-2 border-teal-100">
          Confirmed Gigs
        </h2>
        {confirmedBookings.length === 0 ? (
          <p className="text-gray-500">No confirmed gigs yet.</p>
        ) : (
          <div className="space-y-4">
            {confirmedBookings.map((booking) => (
              <div key={booking.id} className="bg-teal-50 p-6 rounded-lg shadow-sm border border-teal-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="font-bold text-lg text-teal-900">
                    {booking.serviceType}
                  </h3>
                  <p className="text-sm text-teal-700">
                    {new Date(booking.scheduledAt).toLocaleString()} - {new Date(booking.endAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
