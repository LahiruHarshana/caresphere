"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CaregiverProfileEditPage() {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    hourlyRate: 0,
    experienceYears: 0,
    specialties: "",
    certifications: "",
    phone: "",
    address: ""
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        // Fetch User Profile
        const userRes = await fetch("http://localhost:4000/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = userRes.ok ? await userRes.json() : {};

        // Fetch Caregiver Profile
        const careRes = await fetch("http://localhost:4000/caregivers/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const careData = careRes.ok ? await careRes.json() : {};

        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          bio: userData.bio || "",
          phone: userData.phone || "",
          address: userData.address || "",
          hourlyRate: careData.hourlyRate || 0,
          experienceYears: careData.experienceYears || 0,
          specialties: careData.specialties ? careData.specialties.join(", ") : "",
          certifications: careData.certifications ? careData.certifications.join(", ") : "",
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setMessage("");
    
    try {
      // Update User Profile
      await fetch("http://localhost:4000/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          phone: formData.phone,
          address: formData.address,
        })
      });

      // Update Caregiver Profile
      await fetch("http://localhost:4000/caregivers/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          hourlyRate: Number(formData.hourlyRate),
          experienceYears: Number(formData.experienceYears),
          specialties: formData.specialties.split(",").map(s => s.trim()).filter(Boolean),
          certifications: formData.certifications.split(",").map(s => s.trim()).filter(Boolean),
          isAvailable: true,
        })
      });

      // Upload Verification Document if selected
      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        await fetch("http://localhost:4000/caregivers/verify", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formDataUpload
        });
      }

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Caregiver Profile</h1>
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes("error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell us about yourself" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input id="hourlyRate" name="hourlyRate" type="number" min="0" step="0.01" value={formData.hourlyRate} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceYears">Experience (Years)</Label>
            <Input id="experienceYears" name="experienceYears" type="number" min="0" value={formData.experienceYears} onChange={handleChange} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">Specialties (comma separated)</Label>
          <Input id="specialties" name="specialties" value={formData.specialties} onChange={handleChange} placeholder="e.g. Senior Care, Physical Therapy" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certifications">Certifications (comma separated)</Label>
          <Input id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} placeholder="e.g. CPR, First Aid" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <div className="space-y-2 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
          <Label htmlFor="file" className="block text-gray-700 font-semibold mb-2">Upload Background Check/Certification</Label>
          <Input id="file" type="file" onChange={handleFileChange} className="bg-white" />
          <p className="text-xs text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG.</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
