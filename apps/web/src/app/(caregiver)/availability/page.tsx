"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

type CaregiverProfile = {
  id: string;
  hourlyRate: number;
  experienceYears: number;
  certifications: string[];
  specialties: string[];
  isAvailable: boolean;
};

export default function AvailabilityPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/caregivers/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [token, authLoading]);

  const toggleAvailability = async () => {
    if (!token || !profile) return;
    try {
      setSaving(true);
      const res = await fetch("http://localhost:4000/caregivers/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hourlyRate: profile.hourlyRate,
          experienceYears: profile.experienceYears,
          certifications: profile.certifications,
          specialties: profile.specialties,
          isAvailable: !profile.isAvailable,
        }),
      });

      if (res.ok) {
        setProfile((prev) => prev ? { ...prev, isAvailable: !prev.isAvailable } : null);
      } else {
        console.error("Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability", error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center text-teal-700">Loading availability...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500">Failed to load profile. Please complete your profile first.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-teal-700 mb-8">Manage Availability</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Current Status:{" "}
          <span className={profile.isAvailable ? "text-teal-600" : "text-gray-500"}>
            {profile.isAvailable ? "Available" : "Unavailable"}
          </span>
        </h2>
        
        <p className="text-gray-600 mb-8">
          {profile.isAvailable 
            ? "You are currently visible to customers and can receive new gig requests."
            : "You are currently hidden from search and will not receive new gig requests."}
        </p>

        <Button 
          className={`w-full md:w-auto px-8 py-3 text-lg ${
            profile.isAvailable 
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
              : "bg-teal-700 text-white hover:bg-teal-800"
          }`}
          onClick={toggleAvailability}
          disabled={saving}
        >
          {saving ? "Updating..." : (profile.isAvailable ? "Set as Unavailable" : "Set as Available")}
        </Button>
      </div>
    </div>
  );
}
