"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { User, Briefcase, Save, ArrowLeft, CheckCircle, AlertCircle, Camera, Image as ImageIcon, BadgeCheck } from "lucide-react";
import Link from "next/link";

export default function CaregiverProfileEdit() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [caregiverProfile, setCaregiverProfile] = useState<any>({ specialties: [], certifications: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/caregivers/upload-avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setProfile({ ...profile, avatarUrl: data.avatarUrl });
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/caregivers/upload-cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setCaregiverProfile({ ...caregiverProfile, coverPhotoUrl: data.coverPhotoUrl });
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-700"></div>
    </div>
  );

  const inputClass = "caregiver-field";
  const labelClass = "caregiver-label";

  return (
    <div className="caregiver-page space-y-8">
      <section className="caregiver-hero">
        <Link href="/caregiver/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
              <BadgeCheck className="h-3.5 w-3.5" />
              Professional profile
            </div>
            <h1 className="font-heading text-3xl text-white md:text-4xl">Edit Profile</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75 md:text-base">Update the details customers see before they book your care services.</p>
          </div>
        </div>
      </section>

        {caregiverProfile.verificationStatus === 'PENDING' && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Verification Pending</p>
              <p className="text-amber-700 text-sm">Your profile verification is pending approval.</p>
            </div>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-800">Profile saved successfully!</p>
          </div>
        )}

        <div className="caregiver-panel overflow-hidden">
          <div className="relative h-52 bg-gradient-to-r from-teal-200 to-cyan-200">
            {caregiverProfile.coverPhotoUrl ? (
              <img src={caregiverProfile.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-teal-300" />
              </div>
            )}
            
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-950 disabled:opacity-50"
            >
              {uploadingCover ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {uploadingCover ? 'Uploading...' : 'Change Cover'}
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              <div className="h-32 w-32 overflow-hidden rounded-lg border-4 border-white bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {profile.firstName?.[0] || '?'}
                  </div>
                )}
              </div>
              
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white shadow-lg transition-colors hover:bg-teal-800"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div>
              <h2 className="font-heading text-2xl text-slate-950">{profile.firstName} {profile.lastName}</h2>
              <p className="text-gray-500">Caregiver</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="caregiver-panel p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="caregiver-icon-box bg-blue-50">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-heading text-xl text-slate-950">Personal Information</h2>
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

          <div className="caregiver-panel p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="caregiver-icon-box bg-teal-50">
                <Briefcase className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="font-heading text-xl text-slate-950">Professional Information</h2>
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button 
              type="submit" 
              disabled={saving}
              className="caregiver-primary-button px-8 py-3 disabled:bg-teal-300"
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
              className="caregiver-secondary-button px-8 py-3"
            >
              Cancel
            </Link>
          </div>
        </form>
    </div>
  );
}
