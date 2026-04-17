"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/hooks/use-socket';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socket = useSocket('notifications', token);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4000/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4000/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Socket listener
    if (socket) {
      socket.on('notification', (newNotification: Notification) => {
        setNotifications((prev) => [newNotification, ...prev].slice(0, 5));
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [token, socket, fetchNotifications, fetchUnreadCount]);

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
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-teal-50/30">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <Link 
              href="/notifications" 
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              onClick={() => setIsOpen(false)}
            >
              View All
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-teal-50/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !n.isRead ? 'bg-amber-500' : 'bg-transparent'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 text-center bg-gray-50">
               <button 
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={async () => {
                  await fetch('http://localhost:4000/notifications/read-all', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  fetchNotifications();
                  setUnreadCount(0);
                }}
               >
                 Mark all as read
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
