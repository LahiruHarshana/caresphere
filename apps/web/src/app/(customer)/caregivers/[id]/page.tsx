"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CaregiverDetails {
  id: string;
  firstName: string;
  lastName: string;
  profile?: {
    bio: string;
    avatarUrl: string;
    languages: string[];
  };
  caregiverProfile?: {
    specialties: string[];
    hourlyRate: number;
    experienceYears: number;
  };
  reviewsReceived?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      firstName: string;
      lastName: string;
    };
  }[];
}

export default function CaregiverProfilePage() {
  const params = useParams();
  const caregiverId = params.id as string;
  const { token, isLoading } = useAuth();
  const router = useRouter();
  
  const [caregiver, setCaregiver] = useState<CaregiverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaregiver = async () => {
      if (!token) return;
      try {
        // Since there isn't a dedicated endpoint for fetching a single caregiver by ID,
        // we'll fetch the matching list and find the specific caregiver.
        // In a real production app, a GET /caregivers/:id endpoint would be used.
        const res = await fetch(`http://localhost:4000/matching/caregivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch caregiver details");
        }

        const data = await res.json();
        const match = data.find((m: { caregiver: { id: string } }) => m.caregiver.id === caregiverId);
        
        if (match) {
          setCaregiver(match.caregiver);
        } else {
          setError("Caregiver not found or no longer available.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && token) {
      fetchCaregiver();
    }
  }, [caregiverId, isLoading, token]);

  if (isLoading || loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (error || !caregiver) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          {error || "Caregiver not found."}
        </div>
        <button onClick={() => router.back()} className="mt-4 text-teal-700 hover:underline">
          &larr; Back to search
        </button>
      </div>
    );
  }

  const averageRating = caregiver.reviewsReceived && caregiver.reviewsReceived.length > 0
    ? caregiver.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / caregiver.reviewsReceived.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link href="/caregivers" className="inline-block mb-6 text-teal-700 hover:text-teal-800 font-medium">
        &larr; Back to Caregivers
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-teal-700 p-8 text-white flex flex-col md:flex-row gap-6 items-center md:items-start">
          {caregiver.profile?.avatarUrl ? (
            <img src={caregiver.profile.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
          ) : (
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-5xl border-4 border-white shadow-md">
              {caregiver.firstName[0]}
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">
              {caregiver.firstName} {caregiver.lastName}
            </h1>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-teal-100 mb-4">
              {averageRating > 0 ? (
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 text-xl">★</span>
                  <span className="font-semibold text-white">{averageRating.toFixed(1)}</span>
                  <span>({caregiver.reviewsReceived?.length || 0} reviews)</span>
                </div>
              ) : (
                <span className="text-teal-200">New Caregiver</span>
              )}
              {caregiver.caregiverProfile?.experienceYears !== undefined && (
                <>
                  <span className="hidden md:inline">•</span>
                  <span>{caregiver.caregiverProfile.experienceYears} Years Experience</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {caregiver.caregiverProfile?.specialties.map((spec, i) => (
                <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white text-teal-900 p-6 rounded-lg shadow-lg text-center min-w-[200px]">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Hourly Rate</div>
            <div className="text-4xl font-bold mb-4">${caregiver.caregiverProfile?.hourlyRate || 0}</div>
            <Link
              href={`/book/${caregiver.id}`}
              className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {caregiver.profile?.bio || "This caregiver hasn't added a bio yet."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              {caregiver.reviewsReceived && caregiver.reviewsReceived.length > 0 ? (
                <div className="space-y-6">
                  {caregiver.reviewsReceived.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">
                          {review.reviewer?.firstName} {review.reviewer?.lastName}
                        </div>
                        <div className="text-amber-500">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                      <div className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 bg-gray-50 p-6 rounded-lg border border-gray-100 text-center">
                  No reviews yet. Be the first to book and review!
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Languages Spoken</h3>
              {caregiver.profile?.languages && caregiver.profile.languages.length > 0 ? (
                <ul className="space-y-2">
                  {caregiver.profile.languages.map((lang, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                      {lang}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Not specified</p>
              )}
            </section>
            
            <section className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="font-bold text-amber-900 mb-2">Need Help?</h3>
              <p className="text-amber-800 text-sm mb-4">
                Our support team is available 24/7 to help you with your booking.
              </p>
              <button className="text-amber-700 font-semibold text-sm hover:underline">
                Contact Support &rarr;
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
