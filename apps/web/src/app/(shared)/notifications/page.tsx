"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:4000/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('http://localhost:4000/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="caregiver-page space-y-8">
      <section className="caregiver-hero">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
              <Bell className="h-3.5 w-3.5" />
              Alerts
            </div>
            <h1 className="font-heading text-3xl text-white md:text-4xl">Notifications</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75 md:text-base">Stay updated with bookings, account changes, and care activity.</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="caregiver-primary-button bg-white text-teal-800 hover:bg-teal-50"
            >
              Mark all as read
            </button>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white/70" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="caregiver-panel border-dashed py-20 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-heading text-xl text-slate-950">No notifications</h3>
          <p className="text-gray-500 mt-1">We&apos;ll notify you when something important happens.</p>
        </div>
      ) : (
        <div className="caregiver-panel overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`p-6 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 ${
                !n.isRead ? 'bg-teal-50/10' : ''
              }`}
            >
              <div className="mt-1">{getIcon(n.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                    {n.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{n.body}</p>
              </div>
              {!n.isRead && (
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2" title="Unread" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
