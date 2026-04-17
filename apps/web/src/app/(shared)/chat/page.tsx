'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChatWindow } from '@/components/chat/chat-window';

interface UserProfile {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

interface Conversation {
  otherUser: UserProfile;
  lastMessage: {
    content: string;
    createdAt: string;
  };
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch conversations', err);
        setLoading(false);
      });
  }, [token]);

  if (!user || !token) {
    return <div className="p-8 text-center">Please log in to view your messages.</div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-6 text-teal-700">Your Conversations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-1 border rounded-lg bg-white overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet.</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.otherUser.id}
                onClick={() => setSelectedUser(conv.otherUser)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                  selectedUser?.id === conv.otherUser.id ? 'bg-teal-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                    {conv.otherUser.profile.firstName[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-gray-900">
                      {conv.otherUser.profile.firstName} {conv.otherUser.profile.lastName}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="md:col-span-2 h-full">
          {selectedUser ? (
            <ChatWindow
              currentUser={user}
              otherUser={{
                id: selectedUser.id,
                firstName: selectedUser.profile.firstName,
                lastName: selectedUser.profile.lastName,
              }}
              token={token}
            />
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg bg-gray-50 text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
