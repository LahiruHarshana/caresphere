"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/hooks/use-socket";
import { api } from "@/lib/api";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { socket } = useSocket("notifications", token);

  // Fetch initial unread count
  useEffect(() => {
    if (!token) return;
    api.get("/notifications/unread-count", token)
      .then((data) => setUnreadCount(Number(data)))
      .catch(console.error);
  }, [token]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (notification: any) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-neutral transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-neutral">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No recent notifications
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                  <p className="font-medium text-sm text-neutral">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                </div>
              ))}
            </div>
          )}
          <div className="p-3 border-t border-gray-100 text-center">
            <Link
              href="/notifications"
              className="text-sm text-primary font-medium hover:text-primary/80"
              onClick={() => setShowDropdown(false)}
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
