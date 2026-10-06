import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  Wrench,
  Layers,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { CenterManagementItem, CreateCenterPayload } from '../../types/admin';
import { useAuth } from '../../context/AuthContext';

export const AdminCentersPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const [centers, setCenters] = useState<CenterManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<CenterManagementItem | null>(null);
  const [deletingCenter, setDeletingCenter] = useState<CenterManagementItem | null>(null);

  const [form, setForm] = useState<CreateCenterPayload>({
    name: '',
    address: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllCenters();
      setCenters(data);
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to load workshop centers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.createCenter(form);
      setSuccessMessage(`Workshop center "${form.name}" created successfully.`);
      setIsAddModalOpen(false);
      setForm({ name: '', address: '', phone: '' });
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to create workshop center');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCenter) return;

    setIsSubmitting(true);
    try {
      await adminApi.updateCenter(editingCenter.id, form);
      setSuccessMessage(`Workshop center "${form.name}" updated successfully.`);
      setIsEditModalOpen(false);
      setEditingCenter(null);
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to update workshop center');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCenter = async () => {
    if (!deletingCenter) return;

    setIsSubmitting(true);
    try {
      await adminApi.deleteCenter(deletingCenter.id);
      setSuccessMessage(`Workshop center "${deletingCenter.name}" removed.`);
      setDeletingCenter(null);
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to delete center. Ensure no active services/technicians are assigned.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (center: CenterManagementItem) => {
    setEditingCenter(center);
    setForm({
      name: center.name,
      address: center.address,
      phone: center.phone,
    });
    setIsEditModalOpen(true);
  };

  const filteredCenters = centers.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(searchLower) ||
      c.address?.toLowerCase().includes(searchLower) ||
      c.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60 mb-2">
              <Building2 className="h-3.5 w-3.5" />
              <span>Network Infrastructure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Workshop Service Centers
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage nationwide service centers, regional hubs, local technician pools, and catalogs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setForm({ name: '', address: '', phone: '' });
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Service Center</span>
              </button>
            )}
          </div>
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
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search workshop centers by city, branch name, address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-3xl"></div>
            ))}
          </div>
        ) : filteredCenters.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No workshop centers found</h3>
            <p className="text-xs text-slate-500 mt-1">Add your first regional AutoCare service center branch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                      Branch #{center.id}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">{center.name}</h3>

                  <div className="space-y-2 text-xs text-slate-600 mb-5">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{center.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{center.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl mb-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Layers className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-bold text-slate-900">{center.serviceCount}</div>
                        <div className="text-[10px] text-slate-500">Services</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Wrench className="h-4 w-4 text-amber-600" />
                      <div>
                        <div className="font-bold text-slate-900">{center.technicianCount}</div>
                        <div className="text-[10px] text-slate-500">Technicians</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  {isSuperAdmin ? (
                    <>
                      <button
                        onClick={() => openEditModal(center)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingCenter(center)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      SuperAdmin Managed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isAddModalOpen ? 'Add Workshop Center' : 'Edit Workshop Center'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={isAddModalOpen ? handleCreateCenter : handleUpdateCenter} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Center / Branch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AutoCare Electronic City"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Workshop Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. 102 Hosur Main Rd, Electronic City Phase 1, Bengaluru"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Helpline Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 80 2852 9000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : isAddModalOpen ? 'Create Center' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingCenter && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Delete Service Center?</h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-bold text-slate-800">{deletingCenter.name}</span>?
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingCenter(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCenter}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCentersPage;

