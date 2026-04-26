"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function GigsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = () => {
    api.get("/bookings", token).then(setBookings).catch(console.error);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status }, token);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const pendingBookings = bookings.filter(b => b.status === "PENDING");
const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.scheduledAt) > now);
  const inProgressBookings = bookings.filter(b => b.status === "IN_PROGRESS");
  const completedBookings = bookings
    .filter(b => b.status === "COMPLETED" && new Date(b.scheduledAt) < now)
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Gigs</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">In Progress</h2>
          {inProgressBookings.length === 0 ? <p className="text-gray-500">None</p> : (
            <div className="space-y-4">
              {inProgressBookings.map(b => (
                <div key={b.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{b.customer.profile?.firstName}</h3>
                    <p>{new Date(b.scheduledAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleUpdateStatus(b.id, "COMPLETED")} className="bg-green-600 text-white px-4 py-2 rounded">Mark Complete</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Confirmed (Upcoming)</h2>
          {confirmedBookings.length === 0 ? <p className="text-gray-500">None</p> : (
            <div className="space-y-4">
              {confirmedBookings.map(b => (
                <div key={b.id} className="bg-white border p-4 rounded flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold">{b.customer.profile?.firstName}</h3>
                    <p>{new Date(b.scheduledAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleUpdateStatus(b.id, "IN_PROGRESS")} className="bg-blue-600 text-white px-4 py-2 rounded">Start Gig</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
          {pendingBookings.length === 0 ? <p className="text-gray-500">None</p> : (
            <div className="space-y-4">
              {pendingBookings.map(b => (
                <div key={b.id} className="bg-white border p-4 rounded flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold">{b.customer.profile?.firstName}</h3>
                    <p>{new Date(b.scheduledAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(b.id, "CONFIRMED")} className="bg-green-600 text-white px-4 py-2 rounded">Accept</button>
                    <button onClick={() => handleUpdateStatus(b.id, "CANCELLED")} className="bg-red-600 text-white px-4 py-2 rounded">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Recent Completed</h2>
          {completedBookings.length === 0 ? <p className="text-gray-500">None</p> : (
            <div className="space-y-4">
              {completedBookings.map(b => (
                <div key={b.id} className="bg-gray-50 border p-4 rounded flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-700">{b.customer.profile?.firstName}</h3>
                    <p className="text-gray-500">{new Date(b.scheduledAt).toLocaleString()}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">COMPLETED</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}