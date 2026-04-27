'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChatWindow } from '@/components/chat/chat-window';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface OtherUser {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export default function ChatDirectPage() {
  const { user, token } = useAuth();
  const params = useParams();
  const otherUserId = params.id as string;
  
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !otherUserId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/users/${otherUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then((data) => {
        setOtherUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch user', err);
        setError(err.message);
        setLoading(false);
      });
  }, [token, otherUserId]);

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to view your messages.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (error || !otherUser) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'User not found'}</p>
          <Link href="/chat" className="text-teal-700 hover:underline">
            Go to Conversations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-100px)]">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/chat" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Chat with {otherUser.profile.firstName} {otherUser.profile.lastName}
        </h1>
      </div>

      <div className="flex justify-center">
        <ChatWindow
          currentUser={user}
          otherUser={{
            id: otherUser.id,
            firstName: otherUser.profile.firstName,
            lastName: otherUser.profile.lastName,
          }}
          token={token}
        />
      </div>
    </div>
  );
}