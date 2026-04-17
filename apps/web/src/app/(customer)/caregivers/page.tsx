"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface CaregiverMatch {
  caregiver: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: {
      bio: string;
      avatarUrl: string;
    };
    caregiverProfile?: {
      specialties: string[];
      hourlyRate: number;
    };
  };
  matchBreakdown: {
    distanceKm?: number;
    ratingScore: number;
    totalScore: number;
  };
}

export default function CaregiversPage() {
  const { token, isLoading } = useAuth();
  const [matches, setMatches] = useState<CaregiverMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [serviceType, setServiceType] = useState("");
  const [maxDistance, setMaxDistance] = useState("50");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  useEffect(() => {
    // Attempt to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    }
  }, []);

  const fetchMatches = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (serviceType) params.append("serviceType", serviceType);
      if (maxDistance) params.append("maxDistanceKm", maxDistance);
      if (lat !== undefined) params.append("lat", lat.toString());
      if (lng !== undefined) params.append("lng", lng.toString());

      const res = await fetch(`http://localhost:4000/matching/caregivers?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await res.json();
      setMatches(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && token) {
      fetchMatches();
    }
  }, [isLoading, token, lat, lng]);

  if (isLoading) return <div className="p-8">Loading auth...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-teal-700 mb-8">Find a Caregiver</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Any Service</option>
            <option value="Elderly Care">Elderly Care</option>
            <option value="Child Care">Child Care</option>
            <option value="Special Needs">Special Needs</option>
            <option value="Post-Surgery Recovery">Post-Surgery Recovery</option>
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (km)</label>
          <input
            type="number"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g. 50"
          />
        </div>
        <button
          onClick={fetchMatches}
          className="bg-teal-700 text-white px-6 py-2 rounded-md hover:bg-teal-800 transition-colors w-full md:w-auto"
        >
          Search
        </button>
      </div>

      {error && <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-md border border-red-200">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg border border-gray-200">
          No caregivers found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.caregiver.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {match.caregiver.firstName} {match.caregiver.lastName}
                    </h2>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span className="text-amber-500 font-medium mr-1">★ {((match.matchBreakdown.ratingScore / 20) * 5).toFixed(1)}</span>
                      {match.matchBreakdown.distanceKm !== undefined && (
                        <span>• {match.matchBreakdown.distanceKm.toFixed(1)} km away</span>
                      )}
                    </div>
                  </div>
                  {match.caregiver.profile?.avatarUrl ? (
                    <img src={match.caregiver.profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                      {match.caregiver.firstName[0]}
                    </div>
                  )}
                </div>

                <div className="mb-4 text-sm text-gray-600 line-clamp-3">
                  {match.caregiver.profile?.bio || "No bio provided."}
                </div>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialties</div>
                  <div className="flex flex-wrap gap-2">
                    {match.caregiver.caregiverProfile?.specialties.length ? (
                      match.caregiver.caregiverProfile.specialties.slice(0, 3).map((spec, i) => (
                        <span key={i} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full border border-teal-100">
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Not specified</span>
                    )}
                    {(match.caregiver.caregiverProfile?.specialties.length || 0) > 3 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200">
                        +{(match.caregiver.caregiverProfile?.specialties.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-lg font-bold text-gray-900">
                  ${match.caregiver.caregiverProfile?.hourlyRate || 0}<span className="text-sm text-gray-500 font-normal">/hr</span>
                </div>
                <Link
                  href={`/caregivers/${match.caregiver.id}`}
                  className="bg-amber-500 text-white px-4 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
