'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, UserPlus } from 'lucide-react';

export default function VaultPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's vault entries
    // For now, let's assume there's an endpoint to list them
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault/list`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ data: newNote }),
      });
      const data = await res.json();
      setEntries([...entries, data]);
      setNewNote('');
    } catch (err) {
      console.error('Failed to add vault entry', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-teal-100 p-3 rounded-full">
          <Lock className="text-teal-700" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Vault</h1>
          <p className="text-gray-600">Securely store and share medical notes with your caregivers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Medical Note</h2>
            <form onSubmit={handleAddNote}>
              <textarea
                className="w-full border rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Allergies, emergency contacts, medications..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button
                type="submit"
                className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Encrypt & Save</span>
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Secured Entries</h2>
            {entries.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
                <p className="text-gray-500">No entries yet. Start by adding a medical note.</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="bg-white border rounded-xl p-6 shadow-sm flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 text-teal-700 mb-2">
                      <Lock size={16} />
                      <span className="text-sm font-medium uppercase tracking-wider">Encrypted Entry</span>
                    </div>
                    <p className="text-gray-400 italic text-sm">Created on {new Date(entry.createdAt).toLocaleDateString()}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.allowedCaregiverIds.map((cid: string) => (
                        <span key={cid} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <span>Caregiver {cid.slice(0, 4)}</span>
                          <Trash2 size={12} className="cursor-pointer hover:text-red-500" />
                        </span>
                      ))}
                      <button className="text-teal-600 flex items-center space-x-1 text-xs font-bold hover:underline">
                        <UserPlus size={14} />
                        <span>Grant Access</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 h-fit">
          <h3 className="text-amber-800 font-bold mb-3">Privacy & Security</h3>
          <ul className="text-amber-700 text-sm space-y-3">
            <li>• Data is encrypted with AES-256-GCM before being stored.</li>
            <li>• Only authorized caregivers with an active booking can decrypt your data.</li>
            <li>• Access is automatically revoked when a booking ends.</li>
            <li>• We never store your decryption keys in plain text.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
