"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Heart, Clock, CheckCircle } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Gigs</h1>
          <p className="text-gray-500 mt-1">Manage your booking requests</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            {pendingBookings.length} Pending
          </span>
          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
            {confirmedBookings.length} Confirmed
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Requests
          </h2>
        </div>
        {pendingBookings.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">No pending requests at the moment.</p>
            <p className="text-sm text-gray-400 mt-1">New requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {booking.serviceType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.scheduledAt).toLocaleString()} - {new Date(booking.endAt).toLocaleTimeString()}
                    </p>
                    {booking.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">&quot;{booking.notes}&quot;</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                  <Button
                    className="bg-teal-700 hover:bg-teal-800 text-white"
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Confirmed Gigs
          </h2>
        </div>
        {confirmedBookings.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">No confirmed gigs yet.</p>
            <p className="text-sm text-gray-400 mt-1">Accept pending requests to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {confirmedBookings.map((booking) => (
              <div key={booking.id} className="bg-gradient-to-r from-teal-50 to-white p-6 rounded-2xl shadow-sm border border-teal-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-teal-900">
                      {booking.serviceType}
                    </h3>
                    <p className="text-sm text-teal-700">
                      {new Date(booking.scheduledAt).toLocaleString()} - {new Date(booking.endAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
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
