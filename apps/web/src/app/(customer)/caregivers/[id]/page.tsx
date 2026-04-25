"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Star, Video } from "lucide-react";

const PROFILE_MEDIA = {
  cover: "/media/images/caregiver-profile-cover.jpg",
  videoEmbed: "https://www.youtube-nocookie.com/embed/cR8JVwNa3bI?rel=0&modestbranding=1",
};

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <section className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-soft-xl">
        <img
          src={PROFILE_MEDIA.cover}
          alt="Caregiver consultation in a home setting"
          className="w-full h-56 md:h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/35 to-transparent" />
        <div className="absolute left-6 right-6 bottom-5 flex items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            <img
              src={profile.profile?.avatarUrl || `https://i.pravatar.cc/160?u=${profile.id}`}
              alt={`${profile.profile?.firstName || "Caregiver"} avatar`}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-white object-cover"
            />
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                {profile.profile?.firstName} {profile.profile?.lastName}
              </h1>
              <p className="text-slate-200">Trusted caregiver profile</p>
            </div>
          </div>
          <p className="hidden md:block text-3xl font-extrabold text-white">${profile.caregiverProfile?.hourlyRate}/hr</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-900">About this caregiver</h2>
              <p className="text-2xl font-bold text-primary md:hidden">${profile.caregiverProfile?.hourlyRate}/hr</p>
            </div>
            <p className="text-slate-700 mt-3 leading-relaxed">{profile.profile?.bio || "Experienced and compassionate caregiver focused on safety, dignity, and comfort."}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                {profile.averageRating} Stars ({profile.totalReviews} reviews)
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {profile.caregiverProfile?.experienceYears} Years Experience
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/book/${id}`} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors">Book This Caregiver</Link>
            <Link href={`/chat/${id}`} className="bg-slate-100 text-slate-800 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" />Send Message</Link>
          </div>

          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Reviews</h2>
            {profile.reviewsReceived?.length === 0 ? <p className="text-slate-600">No reviews yet.</p> : (
              <div className="space-y-4">
                {profile.reviewsReceived?.map((r: any) => (
                  <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                    <p className="font-bold text-slate-900">{r.rating} / 5</p>
                    <p className="text-slate-700">{r.comment}</p>
                    <p className="text-sm text-slate-500 mt-2">- {r.author?.profile?.firstName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">Intro Video</p>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <iframe
                src={PROFILE_MEDIA.videoEmbed}
                title="Caregiver Intro Video"
                className="w-full h-56"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <p className="text-sm text-slate-600 mt-3 inline-flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              Preview how consultations feel before booking.
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-cyan-50 border border-primary-100 p-5 rounded-2xl">
            <p className="text-sm text-slate-700">
              Need help deciding? Start with a short chat and ask about routines, medication support,
              and availability.
            </p>
            <Link href={`/chat/${id}`} className="inline-block mt-4 text-primary font-semibold">
              Ask a quick question
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}