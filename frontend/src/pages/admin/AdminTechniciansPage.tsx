import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Wrench,
  Plus,
  Search,
  Building2,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type {
  TechnicianManagementItem,
  CenterManagementItem,
  CreateTechnicianPayload,
  UpdateTechnicianPayload,
} from '../../types/admin';
import { useAuth } from '../../context/AuthContext';

export const AdminTechniciansPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const [technicians, setTechnicians] = useState<TechnicianManagementItem[]>([]);
  const [centers, setCenters] = useState<CenterManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TechnicianManagementItem | null>(null);
  const [deletingTech, setDeletingTech] = useState<TechnicianManagementItem | null>(null);

  const [createForm, setCreateForm] = useState<CreateTechnicianPayload>({
    name: '',
    email: '',
    password: '',
    centerId: 1,
    specialization: 'General Mechanical & Diagnostics',
  });

  const [updateForm, setUpdateForm] = useState<UpdateTechnicianPayload>({
    name: '',
    email: '',
    centerId: 1,
    specialization: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [techData, centerData] = await Promise.all([
        adminApi.getAllTechnicians(),
        adminApi.getAllCenters().catch(() => []),
      ]);
      setTechnicians(techData);
      setCenters(centerData);
      if (centerData.length > 0 && !createForm.centerId) {
        setCreateForm((prev) => ({ ...prev, centerId: centerData[0].id }));
      }
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to load technician roster');
    } finally {
      setIsLoading(false);
    }
  }, [createForm.centerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const defaultAvailabilities = [1, 2, 3, 4, 5, 6].map((day) => ({
        dayOfWeek: day,
        startTime: '09:00:00',
        endTime: '18:00:00',
      }));

      await adminApi.createTechnician({
        ...createForm,
        availabilities: defaultAvailabilities,
      });

      setSuccessMessage(`Technician ${createForm.name} onboarded successfully.`);
      setIsAddModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        centerId: centers[0]?.id || 1,
        specialization: 'General Mechanical & Diagnostics',
      });
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to onboard technician');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech) return;

    setIsSubmitting(true);
    try {
      await adminApi.updateTechnician(editingTech.id, updateForm);
      setSuccessMessage(`Technician ${updateForm.name} profile updated.`);
      setIsEditModalOpen(false);
      setEditingTech(null);
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to update technician');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTechnician = async () => {
    if (!deletingTech) return;

    setIsSubmitting(true);
    try {
      await adminApi.deleteTechnician(deletingTech.id);
      setSuccessMessage(`Technician ${deletingTech.name} deactivated.`);
      setDeletingTech(null);
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to deactivate technician');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (tech: TechnicianManagementItem) => {
    setEditingTech(tech);
    setUpdateForm({
      name: tech.name,
      email: tech.email,
      centerId: tech.centerId,
      specialization: tech.specialization,
      availabilities: tech.availabilities,
    });
    setIsEditModalOpen(true);
  };

  const filteredTechnicians = technicians.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(searchLower) ||
      t.email?.toLowerCase().includes(searchLower) ||
      t.specialization?.toLowerCase().includes(searchLower) ||
      t.centerName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60 mb-2">
              <Wrench className="h-3.5 w-3.5" />
              <span>Staff Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Workshop Technicians
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Onboard qualified mechanics, assign service center branches, and configure working shifts.
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
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Onboard Technician</span>
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
              placeholder="Search technicians by name, email, specialization, or workshop center..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-3xl"></div>
            ))}
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No technicians found</h3>
            <p className="text-xs text-slate-500 mt-1">Get started by onboarding your first workshop technician.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechnicians.map((tech) => (
              <div
                key={tech.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
                        {tech.name ? tech.name.substring(0, 2).toUpperCase() : 'TC'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{tech.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{tech.email}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium truncate">{tech.centerName || 'Central Workshop'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <Shield className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span className="font-medium truncate">{tech.specialization || 'Multi-Brand Specialist'}</span>
                    </div>
                  </div>

                  {tech.availabilities && tech.availabilities.length > 0 && (
                    <div className="text-[11px] text-slate-500 bg-slate-50/70 p-2.5 rounded-xl flex items-center gap-2 mb-4">
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>
                        {tech.availabilities.length} working days scheduled (09:00 - 18:00)
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(tech)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setDeletingTech(tech)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Deactivate</span>
                    </button>
                  )}
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
                  <h3 className="font-bold text-slate-900 text-sm">Onboard New Technician</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTechnician} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@autocare.in"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Workshop Center</label>
                  <select
                    value={createForm.centerId}
                    onChange={(e) => setCreateForm({ ...createForm, centerId: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization / Expertise</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engine & Transmission, Brake Specialist"
                    value={createForm.specialization}
                    onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Onboarding...' : 'Onboard Technician'}
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
                  <h3 className="font-bold text-slate-900 text-sm">Edit Technician Details</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTechnician} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Workshop Center</label>
                  <select
                    disabled={!isSuperAdmin}
                    value={updateForm.centerId}
                    onChange={(e) => setUpdateForm({ ...updateForm, centerId: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization / Expertise</label>
                  <input
                    type="text"
                    required
                    value={updateForm.specialization}
                    onChange={(e) => setUpdateForm({ ...updateForm, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingTech && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Deactivate Technician?</h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to deactivate <span className="font-bold text-slate-800">{deletingTech.name}</span>? They will no longer be assigned new jobs.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingTech(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTechnician}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Deactivating...' : 'Confirm Deactivation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTechniciansPage;

