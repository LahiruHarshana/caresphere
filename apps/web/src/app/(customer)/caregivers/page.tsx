"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Find a Caregiver</h1>
      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Filter by specialty (e.g. Senior Care)" 
          value={specialty} 
          onChange={e => setSpecialty(e.target.value)}
          className="border p-2 rounded w-64 text-black"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caregivers.map(cg => (
          <div key={cg.id} className="bg-white border rounded p-4 shadow">
            <h2 className="text-xl font-bold">{cg.profile?.firstName} {cg.profile?.lastName}</h2>
            <p className="text-gray-600 mb-2">${cg.caregiverProfile?.hourlyRate}/hr</p>
            <p className="mb-4 line-clamp-2 text-black">{cg.profile?.bio}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-600 font-bold">★ {cg.averageRating || 'New'}</span>
              <Link href={`/caregivers/${cg.id}`} className="text-blue-600 hover:underline">View Profile</Link>
            </div>
          </div>
        ))}
        {caregivers.length === 0 && <p>No caregivers found.</p>}
      </div>
    </div>
  );
}