import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Layers,
  Plus,
  Search,
  Building2,
  Clock,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type {
  CreateServicePayload,
  UpdateServicePayload,
  CenterManagementItem,
} from '../../types/admin';
import type { ServiceItem } from '../../types/service';
import { useAuth } from '../../context/AuthContext';

export const AdminServicesPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const adminCenterId = user?.centerId;

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [centers, setCenters] = useState<CenterManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState<number | 'all'>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);

  const [createForm, setCreateForm] = useState<CreateServicePayload>({
    name: '',
    description: '',
    price: 999,
    durationMinutes: 60,
    centerId: adminCenterId || 1,
  });

  const [updateForm, setUpdateForm] = useState<UpdateServicePayload>({
    name: '',
    description: '',
    price: 999,
    durationMinutes: 60,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [servicesData, centersData] = await Promise.all([
        adminApi.getAllServices(),
        adminApi.getAllCenters().catch(() => []),
      ]);
      setServices(servicesData || []);
      setCenters(centersData || []);
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to load service packages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetCenterId = !isSuperAdmin && adminCenterId ? adminCenterId : createForm.centerId;
      await adminApi.createService({
        ...createForm,
        centerId: targetCenterId,
      });

      setSuccessMessage(`Service "${createForm.name}" created successfully.`);
      setIsAddModalOpen(false);
      setCreateForm({
        name: '',
        description: '',
        price: 999,
        durationMinutes: 60,
        centerId: adminCenterId || centers[0]?.id || 1,
      });
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to create service package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setIsSubmitting(true);
    try {
      await adminApi.updateService(editingService.id, updateForm);
      setSuccessMessage(`Service "${updateForm.name}" updated successfully.`);
      setIsEditModalOpen(false);
      setEditingService(null);
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to update service package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;

    setIsSubmitting(true);
    try {
      await adminApi.deleteService(deletingService.id);
      setSuccessMessage(`Service "${deletingService.name}" removed.`);
      setDeletingService(null);
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to delete service package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setUpdateForm({
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
    });
    setIsEditModalOpen(true);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.centerName && s.centerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCenter =
      !isSuperAdmin && adminCenterId
        ? s.centerId === adminCenterId
        : selectedCenterFilter === 'all' || s.centerId === selectedCenterFilter;

    return matchesSearch && matchesCenter;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-2">
              <Layers className="h-3.5 w-3.5" />
              <span>Catalog & Pricing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Workshop Services
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure available maintenance packages, repair services, pricing, and estimated durations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
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

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services by name, description, or workshop center..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {isSuperAdmin && (
            <div className="w-full sm:w-64">
              <select
                value={selectedCenterFilter}
                onChange={(e) =>
                  setSelectedCenterFilter(
                    e.target.value === 'all' ? 'all' : Number(e.target.value)
                  )
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="all">All Service Centers</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-slate-200 rounded-3xl"></div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No service packages found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add your workshop's first service package to make it available for customer bookings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{service.centerName || 'Central Workshop'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Price</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        ₹{Number(service.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Est. Time</div>
                      <div className="text-sm font-black text-slate-700 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <span>{service.durationMinutes} mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingService(service)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Plus className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Add New Service Package</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Comprehensive Periodic Service"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe included checks, replacements, and warranties..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.price}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, price: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="1440"
                      value={createForm.durationMinutes}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Workshop Center</label>
                  <select
                    disabled={!isSuperAdmin}
                    value={createForm.centerId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, centerId: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Edit2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Service Package</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateService} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={updateForm.description}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={updateForm.price}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, price: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="1440"
                      value={updateForm.durationMinutes}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingService && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Delete Service Package?</h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to remove{' '}
                <span className="font-bold text-slate-800">{deletingService.name}</span>? Existing
                confirmed bookings will remain intact.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingService(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteService}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer"
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

export default AdminServicesPage;
