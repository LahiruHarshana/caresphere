"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export default function AvailabilityPage() {
  const { token } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      const newStatus = !isAvailable;
      await api.post("/caregivers/profile", { isAvailable: newStatus }, token);
      setIsAvailable(newStatus);
    } catch (err) {
      console.error("Failed to update availability", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Availability Settings</h1>
          <p className="text-gray-500 mt-1">Manage your availability for bookings</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${isAvailable ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-gray-300 to-gray-500'}`}>
                  {isAvailable ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isAvailable ? "Available for Bookings" : "Not Available"}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {isAvailable
                      ? "Customers can find and book you right now"
                      : "You won't appear in search results"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleAvailability}
                disabled={saving}
                className={`relative px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  isAvailable 
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                    : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-teal-200"
                }`}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                ) : isAvailable ? "Go Unavailable" : "Go Available"}
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-8 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <p className="text-sm text-teal-700 font-medium">
                {isAvailable ? "Your profile is visible to customers searching for caregivers" : "Update your availability to start receiving bookings"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Weekly Schedule</h2>
              <p className="text-gray-500 text-sm">Customize your weekly availability</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Coming Soon</p>
                <p className="text-gray-500 text-sm">Weekly schedule management will be available soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <h3 className="font-bold text-lg mb-2">Increase Your Visibility</h3>
            <p className="text-blue-100 text-sm">Keep your availability updated to appear in more customer searches</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
            <h3 className="font-bold text-lg mb-2">Quick Tips</h3>
            <p className="text-purple-100 text-sm">Set your availability at least 24 hours in advance for better booking rates</p>
          </div>
        </div>
      </div>
    </div>
  );
}