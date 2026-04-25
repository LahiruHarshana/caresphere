"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function CustomerProfileEdit() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [customerProfile, setCustomerProfile] = useState<any>({});

  useEffect(() => {
    if (token) {
      api.get("/users/profile", token).then(setProfile).catch(console.error);
      api.get("/users/customer-profile", token).then((data) => {
        if(data) setCustomerProfile(data);
      }).catch(console.error);
    }
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users/profile", profile, token);
      await api.post("/users/customer-profile", customerProfile, token);
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSave} className="space-y-4 bg-white p-6 border rounded shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input type="text" value={profile.firstName || ''} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full border p-2 rounded text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input type="text" value={profile.lastName || ''} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full border p-2 rounded text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Care Type Needed</label>
          <input type="text" value={customerProfile.careType || ''} onChange={e => setCustomerProfile({...customerProfile, careType: e.target.value})} className="w-full border p-2 rounded text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Special Requirements</label>
          <textarea value={customerProfile.specialRequirements || ''} onChange={e => setCustomerProfile({...customerProfile, specialRequirements: e.target.value})} className="w-full border p-2 rounded text-black"></textarea>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
      </form>
    </div>
  );
}