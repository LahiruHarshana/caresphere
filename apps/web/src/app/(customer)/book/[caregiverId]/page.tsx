"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/payments/checkout-form";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

type Caregiver = {
  id: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  caregiverProfile?: {
    hourlyRate?: number;
    specialties?: string[];
  };
};

export default function BookCaregiverPage() {
  const params = useParams();
  const caregiverId = params.caregiverId as string;
  const { token, isLoading } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("2");
  const [serviceType, setServiceType] = useState("");
  const [notes, setNotes] = useState("");

  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Fetch caregiver basic info for display
    const fetchCaregiver = async () => {
      if (!token) return;
      try {
        const data = await api.get("/matching/caregivers", token);
        const match = data.find((m: { caregiver: { id: string } }) => m.caregiver.id === caregiverId);
        if (match) {
          setCaregiver(match.caregiver);
          if (match.caregiver.caregiverProfile?.specialties?.length > 0) {
            setServiceType(match.caregiver.caregiverProfile.specialties[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch caregiver details", err);
      }
    };
    if (!isLoading && token) {
      fetchCaregiver();
    }
  }, [caregiverId, isLoading, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!serviceType) {
      setError("Please select a service type");
      return;
    }
    if (!date || !startTime) {
      setError("Please select date and time");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Calculate end time
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + Number(duration) * 60 * 60 * 1000);

      const payload: Record<string, string> = {
        caregiverId,
        serviceType,
        scheduledAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
      };

      if (notes) {
        payload.notes = notes;
      }

      const booking = await api.post("/bookings", payload, token);

      // Create Payment Intent
      const { clientSecret } = await api.post("/payments/create-intent", { bookingId: booking.id }, token);
      setClientSecret(clientSecret);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  if (!stripePromise) {
    return (
      <div className="p-8 text-center text-red-600">
        Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in apps/web/.env.local.
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-20">
        <div className="bg-green-100 text-green-800 p-8 rounded-xl shadow-lg border border-green-200">
          <svg className="w-16 h-16 mx-auto mb-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1 className="text-3xl font-bold mb-2">Booking & Payment Confirmed!</h1>
          <p className="text-lg">Your care request has been submitted and paid successfully.</p>
          <p className="text-sm mt-4 text-green-700">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const hourlyRate = caregiver?.caregiverProfile?.hourlyRate || 0;
  const totalCost = hourlyRate * Number(duration);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/caregivers/${caregiverId}`} className="text-teal-700 hover:text-teal-800 font-medium">
          &larr; Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Request Booking</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {clientSecret ? (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100 space-y-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
                <p className="text-gray-600 text-sm">Please provide your payment details to finalize the booking.</p>
              </div>
              
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  amount={totalCost} 
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setClientSecret(null)}
                />
              </Elements>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100 space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Hours)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="8">8 Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Service Type</label>
                  <select
                    required
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="" disabled>Select a service</option>
                    {caregiver?.caregiverProfile?.specialties?.map((spec: string) => (
                      <option key={spec} value={spec}>{spec}</option>
                    )) || (
                      <>
                        <option value="Elderly Care">Elderly Care</option>
                        <option value="Child Care">Child Care</option>
                        <option value="Special Needs">Special Needs</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Special Requirements / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requirements?"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2 text-gray-700">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    <span className="font-bold">Secure Payment via Stripe</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    You will be redirected to complete the payment after confirming the booking details.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-md disabled:bg-teal-400 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? "Creating Booking..." : "Confirm & Proceed to Payment"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-8">
            <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Booking Summary</h3>
            
            {caregiver ? (
              <div className="flex items-center gap-3 mb-6">
                {caregiver.profile?.avatarUrl ? (
                  <img src={caregiver.profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                    {caregiver.profile?.firstName?.[0] ?? caregiver.profile?.displayName?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{caregiver.profile?.firstName} {caregiver.profile?.lastName}</div>
                  <div className="text-sm text-gray-500">${hourlyRate}/hr</div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Date</span>
                <span className="font-medium text-gray-900">{date || "Not selected"}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Time</span>
                <span className="font-medium text-gray-900">{startTime}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Duration</span>
                <span className="font-medium text-gray-900">{duration} hour{Number(duration) > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service</span>
                <span className="font-medium text-gray-900 truncate max-w-[120px]">{serviceType || "Not selected"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span className="text-teal-700">${totalCost.toFixed(2)}</span>
              </div>
            </div>
            
            {clientSecret && (
              <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                  Payment Pending
                </div>
                Your booking is created but will only be confirmed once payment is completed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
