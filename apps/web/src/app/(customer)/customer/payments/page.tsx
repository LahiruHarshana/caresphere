'use client';

import { useEffect, useState } from 'react';
import { api, API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function CustomerPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      if (!user) return;
      try {
        const res = await api.get('/payments/history?page=1&limit=50');
        setPayments(res.data.data);
      } catch (err) {
        console.error('Failed to fetch payments', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [user]);

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download invoice', err);
      alert('Failed to download invoice');
    }
  };

  if (loading) return <div className="p-8">Loading payments...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Payment History</h1>
      {payments.length === 0 ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {payments.map((booking: any) => {
              const invoice = booking.invoices?.[0];
              return (
                <li key={booking.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.scheduledAt).toLocaleDateString()} - {booking.serviceType}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Amount: ${booking.totalCost} | Status: {invoice ? invoice.status : 'No Invoice'}
                      </p>
                    </div>
                    {invoice && invoice.pdfUrl && (
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        Download Invoice
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
