'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

interface ChatWindowProps {
  currentUser: { id: string; role: string };
  otherUser: { id: string; firstName: string; lastName: string };
  token: string;
  bookingId?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, otherUser, token, bookingId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocket('chat', token);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-chat', { userId: currentUser.id, otherId: otherUser.id });

    socket.on('receive-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === otherUser.id) {
        setIsTyping(data.isTyping);
      }
    });

    // Fetch initial history (I should probably have an API endpoint for this)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/chat/history/${otherUser.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error('Failed to fetch chat history', err));

    return () => {
      socket.off('receive-message');
      socket.off('typing');
    };
  }, [socket, currentUser.id, otherUser.id, token]);

  const handleSendMessage = (content: string) => {
    if (!socket || !content.trim()) return;

    socket.emit('send-message', {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      content,
      bookingId,
    });
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing', { senderId: currentUser.id, receiverId: otherUser.id, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { senderId: currentUser.id, receiverId: otherUser.id, isTyping: false });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl border rounded-lg overflow-hidden bg-white shadow-lg">
      <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
        <h3 className="font-semibold">{otherUser.firstName} {otherUser.lastName}</h3>
        {isTyping && <span className="text-xs italic">typing...</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <MessageList messages={messages} currentUserId={currentUser.id} />
      </div>

      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};
