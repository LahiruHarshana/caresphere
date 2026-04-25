"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function BookingDetailPage() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (token && id) {
      api.get(`/bookings/${id}`, token).then(setBooking).catch(console.error);
    }
  }, [token, id]);

  const handleCancel = async () => {
    if (confirm("Are you sure?")) {
      await api.post(`/bookings/${id}/cancel`, {}, token);
      router.push("/customer/bookings");
    }
  };

  if (!booking) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Booking Details</h1>
      <div className="bg-white border rounded p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-xl">Caregiver</h2>
          <p>{booking.caregiver.profile?.firstName} {booking.caregiver.profile?.lastName}</p>
        </div>
        <div>
          <h2 className="font-bold text-xl">Service</h2>
          <p>{booking.serviceType}</p>
          <p>{new Date(booking.scheduledAt).toLocaleString()} - {new Date(booking.endAt).toLocaleString()}</p>
        </div>
        <div>
          <h2 className="font-bold text-xl">Status</h2>
          <span className="px-2 py-1 bg-gray-200 rounded">{booking.status}</span>
        </div>
        {booking.status === "PENDING" && (
          <button onClick={handleCancel} className="bg-red-600 text-white px-4 py-2 rounded">Cancel Booking</button>
        )}
      </div>
    </div>
  );
}