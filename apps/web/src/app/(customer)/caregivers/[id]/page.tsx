"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CaregiverProfilePage() {
  const { id } = useParams() as { id: string };
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/caregivers/${id}`).then(setProfile).catch(console.error);
    }
  }, [id]);

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white p-8 rounded shadow border mb-6 flex gap-8">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-grow">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold">{profile.profile?.firstName} {profile.profile?.lastName}</h1>
            <p className="text-2xl font-bold">${profile.caregiverProfile?.hourlyRate}/hr</p>
          </div>
          <p className="text-gray-600 mt-2">{profile.profile?.bio}</p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {profile.averageRating} Stars ({profile.totalReviews} reviews)
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {profile.caregiverProfile?.experienceYears} Years Exp
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Link href={`/book/${id}`} className="bg-blue-600 text-white px-6 py-3 rounded font-bold">Book This Caregiver</Link>
        <Link href={`/chat/${id}`} className="bg-gray-200 text-gray-800 px-6 py-3 rounded font-bold">Send Message</Link>
      </div>
      <div className="mt-8 bg-white p-6 border rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {profile.reviewsReceived?.length === 0 ? <p>No reviews yet.</p> : (
          <div className="space-y-4">
            {profile.reviewsReceived?.map((r: any) => (
              <div key={r.id} className="border-b pb-4">
                <p className="font-bold">{r.rating} / 5</p>
                <p className="text-gray-700">{r.comment}</p>
                <p className="text-sm text-gray-500 mt-2">- {r.author?.profile?.firstName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}