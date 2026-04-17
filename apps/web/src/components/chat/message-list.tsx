'use client';

import React, { useEffect, useRef } from 'react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    profile?: {
      firstName: string;
    };
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => {
        const isMe = message.senderId === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                isMe
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'
              }`}
            >
              {!isMe && message.sender?.profile && (
                <div className="text-xs font-bold mb-1 text-teal-700">
                  {message.sender.profile.firstName}
                </div>
              )}
              <div className="text-sm">{message.content}</div>
              <div
                className={`text-[10px] mt-1 ${
                  isMe ? 'text-teal-100' : 'text-gray-400'
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
