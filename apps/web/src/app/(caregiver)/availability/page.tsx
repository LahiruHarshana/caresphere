"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Calendar, Clock, CheckCircle, XCircle, Radio, ShieldCheck } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-700"></div>
    </div>
  );

  return (
    <div className="caregiver-page space-y-8">
      <section className="caregiver-hero">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
              <Radio className="h-3.5 w-3.5" />
              Live booking status
            </div>
            <h1 className="font-heading text-3xl text-white md:text-4xl">Availability Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75 md:text-base">Control when customers can discover and book your caregiver profile.</p>
          </div>
          <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${isAvailable ? "bg-green-400/18 text-green-50" : "bg-white/12 text-white/70"}`}>
            {isAvailable ? "Visible to customers" : "Hidden from search"}
          </div>
        </div>
      </section>

      <div className="caregiver-panel overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5 md:gap-6">
                <div className={`flex h-20 w-20 items-center justify-center rounded-lg shadow-lg ${isAvailable ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-gray-300 to-gray-500'}`}>
                  {isAvailable ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-heading text-2xl text-slate-950">
                    {isAvailable ? "Available for Bookings" : "Not Available"}
                  </h2>
                  <p className="mt-1 text-slate-500">
                    {isAvailable
                      ? "Customers can find and book you right now"
                      : "You won't appear in search results"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleAvailability}
                disabled={saving}
                className={`relative rounded-lg px-8 py-4 text-base font-bold shadow-lg transition-all ${
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
          
          <div className="border-t border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <p className="text-sm font-semibold text-teal-800">
                {isAvailable ? "Your profile is visible to customers searching for caregivers" : "Update your availability to start receiving bookings"}
              </p>
            </div>
          </div>
        </div>

        <div className="caregiver-panel p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="caregiver-icon-box bg-indigo-50">
              <Calendar className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h2 className="font-heading text-xl text-slate-950">Weekly Schedule</h2>
              <p className="text-sm text-slate-500">Customize your weekly availability</p>
            </div>
          </div>
          
          <div className="caregiver-panel-soft p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-semibold text-slate-900">Coming Soon</p>
                <p className="text-sm text-slate-500">Weekly schedule management will be available soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-lg bg-gradient-to-br from-teal-700 to-cyan-700 p-6 text-white shadow-lg shadow-teal-200">
            <h3 className="mb-2 font-heading text-xl">Increase Your Visibility</h3>
            <p className="text-blue-100 text-sm">Keep your availability updated to appear in more customer searches</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg shadow-slate-200">
            <h3 className="mb-2 font-heading text-xl">Quick Tips</h3>
            <p className="text-slate-200 text-sm">Set your availability at least 24 hours in advance for better booking rates</p>
          </div>
        </div>
    </div>
  );
}
