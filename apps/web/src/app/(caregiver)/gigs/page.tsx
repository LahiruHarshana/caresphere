"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Calendar, Clock, AlertCircle, CheckCircle, ClipboardList } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  scheduledAt: string;
  endAt?: string;
  customer: {
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export default function GigsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modal, setModal] = useState<{ show: boolean; type: string; message: string; action: (() => void) | null }>({
    show: false,
    type: '',
    message: '',
    action: null,
  });

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = () => {
    api.get("/bookings", token).then(setBookings).catch(console.error);
  };

  const canCompleteNow = (booking: Booking): boolean => {
    const now = new Date();
    const scheduled = new Date(booking.scheduledAt);
    const endAt = booking.endAt ? new Date(booking.endAt) : new Date(scheduled.getTime() + 2 * 60 * 60 * 1000);

    const scheduledDate = new Date(scheduled.toDateString());
    const today = new Date(now.toDateString());

    if (scheduledDate.getTime() !== today.getTime()) {
      return false;
    }

    return now >= scheduled && now <= endAt;
  };

  const canStartNow = (booking: Booking): boolean => {
    const now = new Date();
    const scheduled = new Date(booking.scheduledAt);
    const scheduledDate = new Date(scheduled.toDateString());
    const today = new Date(now.toDateString());

    if (scheduledDate.getTime() !== today.getTime()) {
      return false;
    }

    const minutesBefore = (scheduled.getTime() - now.getTime()) / (1000 * 60);
    return minutesBefore <= 30;
  };

  const handleMarkComplete = (booking: Booking) => {
    if (!canCompleteNow(booking)) {
      const scheduled = new Date(booking.scheduledAt);
      setModal({
        show: true,
        type: 'error',
        message: `This gig can only be marked as complete on ${scheduled.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} between ${scheduled.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} and the end time.`,
        action: null,
      });
      return;
    }
    handleUpdateStatus(booking.id, "COMPLETED");
  };

  const handleStartGig = (booking: Booking) => {
    if (!canStartNow(booking)) {
      const scheduled = new Date(booking.scheduledAt);
      setModal({
        show: true,
        type: 'error',
        message: `You can only start this gig on ${scheduled.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} from 30 minutes before the scheduled time (${scheduled.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}).`,
        action: null,
      });
      return;
    }
    handleUpdateStatus(booking.id, "IN_PROGRESS");
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status }, token);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setModal({
        show: true,
        type: 'error',
        message: "Failed to update status. Please try again.",
        action: null,
      });
    }
  };

  const now = new Date();
  const pendingBookings = bookings.filter(b => b.status === "PENDING");
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.scheduledAt) > now);
  const inProgressBookings = bookings.filter(b => b.status === "IN_PROGRESS");
  const completedBookings = bookings
    .filter(b => b.status === "COMPLETED" && new Date(b.scheduledAt) < now)
    .slice(0, 5);

  return (
    <div className="caregiver-page space-y-8">
      <section className="caregiver-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
              <ClipboardList className="h-3.5 w-3.5" />
              Booking workflow
            </div>
            <h1 className="font-heading text-3xl text-white md:text-4xl">My Gigs</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75 md:text-base">Review requests, start confirmed visits, and close completed care sessions from one place.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="font-heading text-2xl text-white">{pendingBookings.length}</p>
              <p className="text-xs text-white/60">Pending</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="font-heading text-2xl text-white">{confirmedBookings.length}</p>
              <p className="text-xs text-white/60">Upcoming</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="font-heading text-2xl text-white">{inProgressBookings.length}</p>
              <p className="text-xs text-white/60">Active</p>
            </div>
          </div>
        </div>
      </section>
      
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="caregiver-panel w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${modal.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
                {modal.type === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {modal.type === 'error' ? 'Cannot Proceed' : 'Success'}
                </h3>
                <p className="text-gray-600">{modal.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModal({ ...modal, show: false })}
                className="caregiver-primary-button"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {inProgressBookings.length > 0 && (
          <section className="caregiver-panel p-5 md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl text-slate-950">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
              In Progress
            </h2>
            <div className="space-y-3">
              {inProgressBookings.map(b => {
                const canComplete = canCompleteNow(b);
                return (
                  <div key={b.id} className="caregiver-panel-soft flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{b.customer.profile?.firstName} {b.customer.profile?.lastName}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(b.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMarkComplete(b)}
                      className={`rounded-lg px-5 py-2.5 font-semibold transition-all ${
                        canComplete 
                          ? 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canComplete ? 'Mark Complete' : 'Complete on scheduled time'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {confirmedBookings.length > 0 && (
          <section className="caregiver-panel p-5 md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl text-slate-950">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              Confirmed (Upcoming)
            </h2>
            <div className="space-y-3">
              {confirmedBookings.map(b => {
                const canStart = canStartNow(b);
                return (
                  <div key={b.id} className="caregiver-panel-soft flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{b.customer.profile?.firstName} {b.customer.profile?.lastName}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(b.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleStartGig(b)}
                      className={`rounded-lg px-5 py-2.5 font-semibold transition-all ${
                        canStart 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canStart ? 'Start Gig' : 'Start on scheduled day'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {pendingBookings.length > 0 && (
          <section className="caregiver-panel p-5 md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl text-slate-950">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
              Pending Requests
            </h2>
            <div className="space-y-3">
              {pendingBookings.map(b => (
                <div key={b.id} className="caregiver-panel-soft flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.customer.profile?.firstName} {b.customer.profile?.lastName}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(b.id, "CONFIRMED")} className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-green-200 transition-colors hover:bg-green-700">Accept</button>
                    <button onClick={() => handleUpdateStatus(b.id, "CANCELLED")} className="caregiver-secondary-button px-5 py-2.5">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="caregiver-panel p-5 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-xl text-slate-950">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
            Recent Completed
          </h2>
          {completedBookings.length === 0 ? (
            <p className="py-4 text-slate-500">No completed gigs yet</p>
          ) : (
            <div className="space-y-3">
              {completedBookings.map(b => (
                <div key={b.id} className="caregiver-panel-soft flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">{b.customer.profile?.firstName} {b.customer.profile?.lastName}</h3>
                      <p className="text-gray-500 text-sm">{new Date(b.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">Completed</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {bookings.length === 0 && (
          <div className="caregiver-panel py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-teal-50">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No gigs yet</h3>
            <p className="text-gray-500">Your upcoming gigs will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
