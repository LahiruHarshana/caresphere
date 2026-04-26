"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { User, Briefcase, Save, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CaregiverProfileEdit() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [caregiverProfile, setCaregiverProfile] = useState<any>({ specialties: [], certifications: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.get("/users/profile", token),
      api.get("/caregivers/profile", token).catch(() => ({}))
    ]).then(([profileData, caregiverData]) => {
      setProfile(profileData);
      if (caregiverData) setCaregiverProfile(caregiverData);
      setLoading(false);
    }).catch(console.error);
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.post("/users/profile", profile, token);
      await api.post("/caregivers/profile", {
        ...caregiverProfile,
        hourlyRate: Number(caregiverProfile.hourlyRate),
        experienceYears: Number(caregiverProfile.experienceYears)
      }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/caregiver/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-1">Update your personal and professional information</p>
        </div>

        {caregiverProfile.verificationStatus === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Verification Pending</p>
              <p className="text-amber-700 text-sm">Your profile verification is pending approval.</p>
            </div>
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-800">Profile saved successfully!</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>First Name</label>
                <input 
                  type="text" 
                  value={profile.firstName || ''} 
                  onChange={e => setProfile({...profile, firstName: e.target.value})} 
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input 
                  type="text" 
                  value={profile.lastName || ''} 
                  onChange={e => setProfile({...profile, lastName: e.target.value})} 
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Bio</label>
                <textarea 
                  value={profile.bio || ''} 
                  onChange={e => setProfile({...profile, bio: e.target.value})} 
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Tell customers about yourself..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Hourly Rate ($)</label>
                <input 
                  type="number" 
                  value={caregiverProfile.hourlyRate || ''} 
                  onChange={e => setCaregiverProfile({...caregiverProfile, hourlyRate: e.target.value})} 
                  className={inputClass}
                  placeholder="25"
                />
              </div>
              <div>
                <label className={labelClass}>Experience (Years)</label>
                <input 
                  type="number" 
                  value={caregiverProfile.experienceYears || ''} 
                  onChange={e => setCaregiverProfile({...caregiverProfile, experienceYears: e.target.value})} 
                  className={inputClass}
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-200 hover:shadow-xl disabled:bg-teal-300"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link 
              href="/caregiver/dashboard" 
              className="px-8 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}