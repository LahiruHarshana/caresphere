"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { exportToCSV } from "@/lib/export-csv";
import { Search, Filter, Download, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      let url = `/admin/bookings?page=${page}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${search}`;

      const res = await api.get(url, token!);
      setBookings(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token, page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to forcefully cancel this booking?")) return;
    
    setActionLoading(id);
    try {
      await api.post(`/admin/bookings/${id}/cancel`, {}, token!);
      fetchBookings();
    } catch (error) {
      console.error("Failed to cancel booking", error);
      alert("Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    const exportData = bookings.map(b => ({
      ID: b.id,
      CreatedAt: new Date(b.createdAt).toISOString(),
      Customer: `${b.customer.profile?.firstName} ${b.customer.profile?.lastName}`,
      Caregiver: `${b.caregiver.profile?.firstName} ${b.caregiver.profile?.lastName}`,
      ServiceType: b.serviceType,
      Status: b.status,
      TotalCost: b.totalCost,
      ScheduledAt: new Date(b.scheduledAt).toISOString(),
    }));
    exportToCSV(exportData, 'bookings');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-500 text-sm">View and manage all system bookings.</p>
        </div>
        
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium">ID / Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Caregiver</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No bookings found.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900" title={booking.id}>
                        ...{booking.id.slice(-6)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(booking.scheduledAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {booking.customer.profile?.firstName} {booking.customer.profile?.lastName}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {booking.caregiver.profile?.firstName} {booking.caregiver.profile?.lastName}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{booking.serviceType.replace(/_/g, ' ')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900">${booking.totalCost}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={actionLoading === booking.id}
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Force Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                            {actionLoading === booking.id ? "Canceling..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && total > 20 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} bookings
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}