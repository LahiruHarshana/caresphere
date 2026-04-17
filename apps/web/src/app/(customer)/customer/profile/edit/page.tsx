"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerProfileEditPage() {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const userRes = await fetch("http://localhost:4000/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = userRes.ok ? await userRes.json() : {};

        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("http://localhost:4000/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Customer Profile</h1>
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes("error") || message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
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
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
