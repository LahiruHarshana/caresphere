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
      <div className="caregiver-page flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (error || !otherUser) {
    return (
      <div className="caregiver-page flex h-[calc(100vh-100px)] items-center justify-center">
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
    <div className="caregiver-page flex h-[calc(100vh-120px)] min-h-[720px] flex-col gap-6">
      <section className="caregiver-hero">
        <Link href="/chat" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to conversations
        </Link>
        <h1 className="font-heading text-3xl text-white md:text-4xl">
          Chat with {otherUser.profile.firstName} {otherUser.profile.lastName}
        </h1>
      </section>

      <div className="flex min-h-0 flex-1 justify-center">
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
