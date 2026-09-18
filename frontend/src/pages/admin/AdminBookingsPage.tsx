import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Calendar,
  Search,
  Wrench,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Edit3,
  X,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { AdminBookingItem, TechnicianManagementItem } from '../../types/admin';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedBookingForAssign, setSelectedBookingForAssign] = useState<AdminBookingItem | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState<AdminBookingItem | null>(null);
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingsData, techData] = await Promise.all([
        adminApi.getAllBookings(),
        adminApi.getAllTechnicians().catch(() => []),
      ]);
      setBookings(bookingsData);
      setTechnicians(techData);
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForAssign || !selectedTechnicianId) return;

    setIsAssigning(true);
    try {
      await adminApi.assignTechnician(selectedBookingForAssign.id, Number(selectedTechnicianId));
      setSuccessMessage(`Technician assigned to Booking #${selectedBookingForAssign.id} successfully.`);
      setSelectedBookingForAssign(null);
      setSelectedTechnicianId('');
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to assign technician');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForStatus) return;

    setIsUpdatingStatus(true);
    try {
      await adminApi.updateBookingStatus(selectedBookingForStatus.id, newStatus, statusNotes);
      setSuccessMessage(`Booking #${selectedBookingForStatus.id} status updated to ${newStatus}.`);
      setSelectedBookingForStatus(null);
      setStatusNotes('');
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to update booking status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'InProgress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      b.customerName?.toLowerCase().includes(searchLower) ||
      b.vehicleName?.toLowerCase().includes(searchLower) ||
      b.licensePlate?.toLowerCase().includes(searchLower) ||
      b.serviceName?.toLowerCase().includes(searchLower) ||
      b.technicianName?.toLowerCase().includes(searchLower) ||
      b.id.toString().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Operations Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Service Bookings Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dispatch appointments, assign workshop technicians, and update service lifecycle statuses.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition self-start md:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, customer, vehicle, license plate, or technician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['All', 'Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No bookings match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or searching with different keywords.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Vehicle</th>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Scheduled Date</th>
                    <th className="py-3.5 px-4">Technician</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{b.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.customerName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.vehicleName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{b.licensePlate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{b.serviceName}</div>
                        <div className="font-bold text-blue-600">₹{b.servicePrice.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(b.scheduledDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {b.technicianName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                            <Wrench className="h-3 w-3 text-slate-500" />
                            <span>{b.technicianName}</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold text-[11px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-bold border text-[10px] ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedBookingForAssign(b);
                              setSelectedTechnicianId(b.technicianId || '');
                            }}
                            title="Assign Technician"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition border border-slate-200"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBookingForStatus(b);
                              setNewStatus(b.status);
                              setStatusNotes(b.notes || '');
                            }}
                            title="Update Status"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition border border-slate-200"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedBookingForAssign && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Assign Technician (Booking #{selectedBookingForAssign.id})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBookingForAssign(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 text-xs bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Customer:</span> {selectedBookingForAssign.customerName}
                </div>
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Vehicle:</span> {selectedBookingForAssign.vehicleName} ({selectedBookingForAssign.licensePlate})
                </div>
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Service:</span> {selectedBookingForAssign.serviceName}
                </div>
              </div>

              <form onSubmit={handleAssignTechnician} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Qualified Technician
                  </label>
                  <select
                    value={selectedTechnicianId}
                    onChange={(e) => setSelectedTechnicianId(e.target.value ? Number(e.target.value) : '')}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">-- Choose Workshop Technician --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization} - {t.centerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForAssign(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning || !selectedTechnicianId}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedBookingForStatus && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Update Status (Booking #{selectedBookingForStatus.id})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBookingForStatus(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Lifecycle Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Admin Notes / Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter notes or updates for this service request..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForStatus(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;

