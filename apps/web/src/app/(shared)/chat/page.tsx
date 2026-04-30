'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChatWindow } from '@/components/chat/chat-window';
import { MessageCircle, ChevronLeft } from 'lucide-react';

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
  const [showList, setShowList] = useState(true);

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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to view your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="caregiver-page flex h-[calc(100vh-120px)] min-h-[720px] flex-col gap-6">
      <section className="caregiver-hero">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
              <MessageCircle className="h-3.5 w-3.5" />
              Care conversations
            </div>
            <h1 className="font-heading text-3xl text-white md:text-4xl">Your Conversations</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75 md:text-base">Keep booking details and care updates in one calm, organized workspace.</p>
          </div>
          <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white">
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </span>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-3">
        <div className={`caregiver-panel overflow-y-auto ${selectedUser && !showList ? 'hidden md:block' : ''}`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet.</p>
              <p className="text-sm text-gray-400 mt-1">Start a chat with a caregiver</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.otherUser.id}
                onClick={() => {
                  setSelectedUser(conv.otherUser);
                  setShowList(false);
                }}
                className={`w-full border-b border-slate-100 p-4 text-left transition-colors hover:bg-teal-50/50 ${
                  selectedUser?.id === conv.otherUser.id ? 'bg-teal-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {conv.otherUser.profile.avatarUrl ? (
                    <img 
                      src={conv.otherUser.profile.avatarUrl} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 font-bold text-teal-700">
                      {conv.otherUser.profile.firstName[0]}
                    </div>
                  )}
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

        <div className={`flex h-full flex-col md:col-span-2 ${!selectedUser || showList ? 'hidden md:flex' : ''}`}>
          {selectedUser ? (
            <>
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setShowList(true)}
                  className="flex items-center text-sm font-medium text-teal-700 bg-teal-50 px-3 py-2 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to conversations
                </button>
              </div>
              <ChatWindow
                currentUser={user}
                otherUser={{
                  id: selectedUser.id,
                  firstName: selectedUser.profile.firstName,
                  lastName: selectedUser.profile.lastName,
                }}
                token={token}
              />
            </>
          ) : (
            <div className="caregiver-panel flex h-full items-center justify-center bg-gradient-to-br from-white to-teal-50/40">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
