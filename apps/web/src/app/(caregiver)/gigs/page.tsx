"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";

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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">My Gigs</h1>
      
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${modal.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
                {modal.type === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {inProgressBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              In Progress
            </h2>
            <div className="space-y-3">
              {inProgressBookings.map(b => {
                const canComplete = canCompleteNow(b);
                return (
                  <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
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
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                        canComplete 
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200' 
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
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Confirmed (Upcoming)
            </h2>
            <div className="space-y-3">
              {confirmedBookings.map(b => {
                const canStart = canStartNow(b);
                return (
                  <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
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
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                        canStart 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200' 
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
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Pending Requests
            </h2>
            <div className="space-y-3">
              {pendingBookings.map(b => (
                <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
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
                    <button onClick={() => handleUpdateStatus(b.id, "CONFIRMED")} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-md shadow-green-200">Accept</button>
                    <button onClick={() => handleUpdateStatus(b.id, "CANCELLED")} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Recent Completed
          </h2>
          {completedBookings.length === 0 ? (
            <p className="text-gray-500 py-4">No completed gigs yet</p>
          ) : (
            <div className="space-y-3">
              {completedBookings.map(b => (
                <div key={b.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">{b.customer.profile?.firstName} {b.customer.profile?.lastName}</h3>
                      <p className="text-gray-500 text-sm">{new Date(b.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Completed</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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