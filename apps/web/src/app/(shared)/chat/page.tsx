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
    <div className="container mx-auto p-4 h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Conversations</h1>
        <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
          {conversations.length} conversations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-80px)]">
        <div className={`md:col-span-1 border rounded-2xl bg-white overflow-y-auto shadow-sm ${selectedUser && !showList ? 'hidden md:block' : ''}`}>
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
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold">
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

        <div className={`md:col-span-2 h-full flex flex-col ${!selectedUser || showList ? 'hidden md:flex' : ''}`}>
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
            <div className="h-full flex items-center justify-center border rounded-2xl bg-gradient-to-br from-gray-50 to-teal-50/30 shadow-sm">
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
