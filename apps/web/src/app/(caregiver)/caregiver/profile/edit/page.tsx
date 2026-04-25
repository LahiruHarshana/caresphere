"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function CaregiverProfileEdit() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [caregiverProfile, setCaregiverProfile] = useState<any>({ specialties: [], certifications: [] });

  useEffect(() => {
    if (token) {
      api.get("/users/profile", token).then(setProfile).catch(console.error);
      api.get("/caregivers/profile", token).then(data => {
        if(data) setCaregiverProfile(data);
      }).catch(console.error);
    }
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users/profile", profile, token);
      await api.post("/caregivers/profile", {
        ...caregiverProfile,
        hourlyRate: Number(caregiverProfile.hourlyRate),
        experienceYears: Number(caregiverProfile.experienceYears)
      }, token);
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Caregiver Profile</h1>
      
      {caregiverProfile.verificationStatus === 'PENDING' && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6">
          Your profile verification is pending approval.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 border rounded shadow-sm">
        <div>
          <h2 className="text-xl font-bold border-b pb-2 mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" value={profile.firstName || ''} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full border p-2 rounded text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" value={profile.lastName || ''} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full border p-2 rounded text-black" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full border p-2 rounded h-24 text-black"></textarea>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b pb-2 mb-4">Professional Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
              <input type="number" value={caregiverProfile.hourlyRate || ''} onChange={e => setCaregiverProfile({...caregiverProfile, hourlyRate: e.target.value})} className="w-full border p-2 rounded text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience (Years)</label>
              <input type="number" value={caregiverProfile.experienceYears || ''} onChange={e => setCaregiverProfile({...caregiverProfile, experienceYears: e.target.value})} className="w-full border p-2 rounded text-black" />
            </div>
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Save Changes</button>
      </form>
    </div>
  );
}