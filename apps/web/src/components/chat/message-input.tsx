'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, onTyping }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSend(content);
      setContent('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    onTyping();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex items-center space-x-2">
      <input
        type="text"
        value={content}
        onChange={handleChange}
        placeholder="Type a message..."
        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <button
        type="submit"
        disabled={!content.trim()}
        className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send size={20} />
      </button>
    </form>
  );
};
