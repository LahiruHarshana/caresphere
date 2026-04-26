"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { User, Briefcase, Save, ArrowLeft, CheckCircle, AlertCircle, Camera, Upload, Image as ImageIcon } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="relative h-48 bg-gradient-to-r from-teal-200 to-cyan-200">
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
              className="hidden"
            />
            
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
              <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg overflow-hidden">
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
                className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
              <p className="text-gray-500">Caregiver</p>
            </div>
          </div>
        </div>

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