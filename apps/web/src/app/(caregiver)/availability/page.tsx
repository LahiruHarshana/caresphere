"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function AvailabilityPage() {
  const { token } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get("/caregivers/profile", token)
      .then((data) => {
        setIsAvailable(data.isAvailable);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      await api.post("/caregivers/profile", { isAvailable: newStatus }, token);
      setIsAvailable(newStatus);
    } catch (err) {
      console.error("Failed to update availability", err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Availability</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isAvailable ? "You're Available" : "You're Unavailable"}
            </h2>
            <p className="text-gray-500 mt-1">
              {isAvailable
                ? "Customers can find and book you"
                : "You won't appear in search results"}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`p-2 rounded-full transition-colors font-bold px-4 py-2 ${
              isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            {isAvailable ? "Set Unavailable" : "Set Available"}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Weekly schedule management coming soon. For now, use the toggle above to control your availability.
        </p>
      </div>
    </div>
  );
}