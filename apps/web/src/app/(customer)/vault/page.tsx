'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Lock, Unlock, Plus, UserPlus, UserMinus } from 'lucide-react';

interface VaultEntry {
  id: string;
  encryptedData: string;
  allowedCaregiverIds: string[];
  createdAt: string;
}

export default function VaultPage() {
  const { user, token } = useAuth();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [grantCaregiverId, setGrantCaregiverId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error('Failed to fetch vault entries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [token]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: newNote }),
      });
      if (res.ok) {
        setNewNote('');
        // Refresh entries
        const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res2.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantAccess = async (entryId: string) => {
    if (!grantCaregiverId.trim() || !token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault/${entryId}/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caregiverId: grantCaregiverId }),
      });
      if (res.ok) {
        setGrantCaregiverId('');
        // Refresh entries
        const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res2.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to grant access', err);
    }
  };

  const handleRevokeAccess = async (entryId: string, caregiverId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault/${entryId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caregiverId }),
      });
      if (res.ok) {
        // Refresh entries
        const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vault`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res2.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to revoke access', err);
    }
  };

  if (user?.role !== 'CUSTOMER') {
    return <div className="p-8 text-center">Access denied. Only customers can access the Family Vault.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="w-10 h-10 text-teal-700" />
        <h1 className="text-3xl font-bold text-gray-900">Family Medical Vault</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-teal-700" />
          Add New Secure Note
        </h2>
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <Label htmlFor="note">Secure Content</Label>
            <Textarea
              id="note"
              placeholder="Enter sensitive medical information, medications, or allergies..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="mt-1 h-32"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !newNote.trim()}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            {isSubmitting ? 'Encrypting...' : 'Encrypt & Save to Vault'}
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Lock className="w-5 h-5 mr-2 text-amber-500" />
          Stored Encrypted Entries
        </h2>
        
        {loading ? (
          <p>Loading vault entries...</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-500 italic">No entries in your vault yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-gray-50 rounded-lg border p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono text-gray-500">ID: {entry.id}</span>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  AES-256 Encrypted
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
<p className="text-sm text-gray-600 italic mb-2">Encrypted Data (Base64/Hex):</p>
                  <div className="bg-white p-3 rounded border font-mono text-xs break-all text-gray-600">
                  {entry.encryptedData.substring(0, 100)}...
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center">
                  <Unlock className="w-4 h-4 mr-2 text-amber-500" />
                  Access Control
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {entry.allowedCaregiverIds.length === 0 ? (
                    <span className="text-sm text-gray-500">Private (Only you)</span>
                  ) : (
                    entry.allowedCaregiverIds.map((cgId) => (
                      <div key={cgId} className="flex items-center bg-white border rounded-lg px-3 py-1 text-sm">
                        <span className="mr-2">Caregiver: {cgId.substring(0, 8)}...</span>
                        <button
                          onClick={() => handleRevokeAccess(entry.id, cgId)}
                          className="text-red-500 hover:text-red-700"
                          title="Revoke Access"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-end space-x-2 pt-2">
                  <div className="flex-1">
                    <Label htmlFor={`grant-${entry.id}`} className="text-xs">Grant Access to Caregiver ID</Label>
                    <Input
                      id={`grant-${entry.id}`}
                      placeholder="Enter Caregiver UUID"
                      value={grantCaregiverId}
                      onChange={(e) => setGrantCaregiverId(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => handleGrantAccess(entry.id)}
                    variant="outline"
                    className="h-8 border-teal-700 text-teal-700 hover:bg-teal-50"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Grant
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
