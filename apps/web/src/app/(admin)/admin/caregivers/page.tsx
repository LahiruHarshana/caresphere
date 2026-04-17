"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type CaregiverProfile = {
  id: string;
  experienceYears: number;
  specialties: string[];
  user: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
};

export default function CaregiversPage() {
  const { token } = useAuth();
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await fetch("http://localhost:4000/admin/caregivers/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCaregivers(data);
      }
    } catch (error) {
      console.error("Failed to fetch pending caregivers", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const verify = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`http://localhost:4000/admin/caregivers/${id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setCaregivers(caregivers.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to verify caregiver", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Verification Queue</h1>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div>Loading queue...</div>
        ) : caregivers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
            No pending verifications at the moment.
          </div>
        ) : caregivers.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-teal-800">
                {c.user.profile.firstName} {c.user.profile.lastName}
              </h2>
              <p className="text-gray-600 mb-2">{c.user.email}</p>
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span><strong>Experience:</strong> {c.experienceYears} years</span>
                <span><strong>Specialties:</strong> {c.specialties.join(", ")}</span>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                Application received recently
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => verify(c.id, "REJECTED")}
              >
                Reject
              </Button>
              <Button
                className="bg-teal-700 hover:bg-teal-800 text-white"
                onClick={() => verify(c.id, "APPROVED")}
              >
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
