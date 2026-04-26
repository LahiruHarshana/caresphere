"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/payments/checkout-form";
import { Calendar, Clock, Heart, MessageSquare, CreditCard, CheckCircle2, ArrowLeft } from "lucide-react";

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
      router.push("/customer/dashboard");
    }, 3000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  if (!stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl">
          Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in apps/web/.env.local.
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-4">Your care request has been submitted and paid successfully.</p>
          <p className="text-sm text-teal-600 font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const hourlyRate = caregiver?.caregiverProfile?.hourlyRate || 0;
  const totalCost = hourlyRate * Number(duration);
  const selectedDateTime = date && startTime ? new Date(`${date}T${startTime}:00`) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link 
          href={`/caregivers/${caregiverId}`} 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {clientSecret ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                    <p className="text-gray-500 text-sm">Secure payment via Stripe</p>
                  </div>
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
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs">!</span>
                    </div>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Schedule Your Care</h2>
                  <p className="text-gray-500 text-sm mb-6">Choose a date and time that works for you</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="w-4 h-4 text-teal-600" />
                        Start Time
                      </label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Clock className="w-4 h-4 text-teal-600" />
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours</option>
                      <option value="3">3 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="6">6 Hours</option>
                      <option value="8">8 Hours</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Heart className="w-4 h-4 text-teal-600" />
                      Service Type
                    </label>
                    <select
                      required
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="" disabled>Select service</option>
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

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    Special Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions or requirements for the caregiver..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-teal-200 hover:shadow-xl disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 text-lg mb-6">Booking Summary</h3>
              
              {caregiver && (
                <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
                  {caregiver.profile?.avatarUrl ? (
                    <img src={caregiver.profile.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {caregiver.profile?.firstName?.[0] ?? '?'}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{caregiver.profile?.firstName} {caregiver.profile?.lastName}</div>
                    <div className="text-teal-600 font-medium">${hourlyRate}/hour</div>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedDateTime ? selectedDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedDateTime ? selectedDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration
                  </span>
                  <span className="font-medium text-gray-900">{Number(duration)} hour{Number(duration) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Service
                  </span>
                  <span className="font-medium text-gray-900">{serviceType || '—'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${(hourlyRate * Number(duration)).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Service Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-teal-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                <div className="flex items-center gap-2 text-teal-700 font-medium text-sm mb-1">
                  <CreditCard className="w-4 h-4" />
                  Secure Payment
                </div>
                <p className="text-xs text-teal-600">Your payment is secured by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}