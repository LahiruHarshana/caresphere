"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";

export default function MyBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (token) {
      api.get("/bookings", token).then(setBookings).catch(console.error);
    }
  }, [token]);

  const filtered = bookings.filter((b) => {
    if (tab === "upcoming") return ["PENDING", "CONFIRMED"].includes(b.status);
    if (tab === "completed") return b.status === "COMPLETED";
    if (tab === "cancelled") return b.status === "CANCELLED";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      <div className="flex gap-4 mb-6">
        {["all", "upcoming", "completed", "cancelled"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((b) => (
          <div key={b.id} className="border p-4 rounded shadow bg-white flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{b.caregiver.profile?.firstName} {b.caregiver.profile?.lastName}</h3>
              <p className="text-sm text-gray-600">{b.serviceType}</p>
              <p className="text-sm text-gray-600">{new Date(b.scheduledAt).toLocaleString()}</p>
              <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-gray-100">{b.status}</span>
            </div>
            <div>
              <Link href={`/customer/bookings/${b.id}`} className="text-blue-600 hover:underline">View Details</Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p>No bookings found.</p>}
      </div>
    </div>
  );
}