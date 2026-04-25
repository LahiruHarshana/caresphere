"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Search, Star, Video } from "lucide-react";

const CARE_MEDIA = {
  heroImage: "/media/images/caregivers-hero.jpg",
  heroVideoEmbed: "https://www.youtube-nocookie.com/embed/cR8JVwNa3bI?rel=0&modestbranding=1",
  cardImages: [
    "/media/images/caregiver-card-1.jpg",
    "/media/images/caregiver-card-2.jpg",
    "/media/images/caregiver-card-3.jpg",
  ],
};

export default function BrowseCaregiversPage() {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [specialty, setSpecialty] = useState("");

  const fetchCaregivers = () => {
    let url = "/caregivers/browse";
    if (specialty) url += `?specialty=${specialty}`;
    api.get(url).then(res => setCaregivers(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchCaregivers();
  }, [specialty]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft-xl">
        <img
          src={CARE_MEDIA.heroImage}
          alt="Professional caregiver helping an elderly client at home"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/65 to-slate-900/30" />
        <div className="relative z-10 grid lg:grid-cols-5 gap-6 p-7 md:p-10 items-center">
          <div className="lg:col-span-3">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-200 mb-4">
              <Video className="w-4 h-4" />
              CareSphere Connect
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Find a caregiver who fits your family, schedule, and care goals.
            </h1>
            <p className="text-slate-200 md:text-lg max-w-2xl">
              Browse verified professionals with transparent rates, specialties, and reviews.
            </p>
          </div>
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-black/20 backdrop-blur-sm">
            <iframe
              src={CARE_MEDIA.heroVideoEmbed}
              title="CareSphere Caregiver Video"
              className="w-full h-56"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <label htmlFor="specialty-filter" className="text-sm font-semibold text-slate-700">
          Search by specialty
        </label>
        <div className="mt-2 relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="specialty-filter"
            type="text"
            placeholder="Try: Senior Care, Dementia Care, Child Care"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {caregivers.map((cg, index) => (
          <div
            key={cg.id}
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-40">
              <img
                src={CARE_MEDIA.cardImages[index % CARE_MEDIA.cardImages.length]}
                alt="Caregiver helping client"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <img
                  src={cg.profile?.avatarUrl || `https://i.pravatar.cc/100?u=${cg.id}`}
                  alt={`${cg.profile?.firstName || "Caregiver"} avatar`}
                  className="w-11 h-11 rounded-full border-2 border-white object-cover"
                />
                <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  Verified
                </span>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold text-slate-900">
                {cg.profile?.firstName} {cg.profile?.lastName}
              </h2>
              <p className="text-slate-600 mb-2">${cg.caregiverProfile?.hourlyRate}/hr</p>
              <p className="mb-4 line-clamp-2 text-slate-700 min-h-[40px]">{cg.profile?.bio || "Compassionate caregiver ready to support your family."}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-600 font-bold inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {cg.averageRating || "New"}
                </span>
                <Link
                  href={`/caregivers/${cg.id}`}
                  className="inline-flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {caregivers.length === 0 && (
          <p className="text-slate-600">No caregivers found. Try another specialty keyword.</p>
        )}
      </div>
    </div>
  );
}