import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  Wrench,
  Users,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  Plus,
  UserPlus,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type {
  AdminDashboardStats,
  MonthlyBooking,
  CenterManagementItem,
  CreateAdminPayload,
} from '../../types/admin';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [revenueHistory, setRevenueHistory] = useState<MonthlyBooking[]>([]);
  const [centers, setCenters] = useState<CenterManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState<CreateAdminPayload>({
    name: '',
    email: '',
    password: '',
    centerId: 1,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, revenueData, centersData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRevenueReport().catch(() => []),
        user?.role === 'SuperAdmin' ? adminApi.getAllCenters().catch(() => []) : Promise.resolve([]),
      ]);
      setStats(statsData);
      setRevenueHistory(revenueData);
      setCenters(centersData);
      if (centersData.length > 0) {
        setAdminForm((prev) => ({ ...prev, centerId: prev.centerId || centersData[0].id }));
      }
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdmin(true);
    try {
      await adminApi.createAdmin(adminForm);
      setSuccessMessage(`Branch Admin "${adminForm.name}" created and assigned successfully.`);
      setIsAddAdminModalOpen(false);
      setAdminForm({
        name: '',
        email: '',
        password: '',
        centerId: centers[0]?.id || 1,
      });
      fetchData();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(errorMsg ?? 'Failed to create branch admin');
    } finally {
      setIsSubmittingAdmin(false);
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
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/60 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                {user?.role === 'SuperAdmin'
                  ? 'SuperAdmin Control Room • Nationwide Network'
                  : `Branch Admin Portal • Center #${user?.centerId || 1}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {user?.role === 'SuperAdmin'
                ? 'Real-time multi-branch operations, bookings queue, technician fleet & revenue metrics.'
                : 'Real-time branch operations, service queue dispatch, assigned technicians & revenue metrics.'}
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
            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Manage Bookings</span>
            </Link>
            {user?.role === 'SuperAdmin' && (
              <>
                <button
                  onClick={() => setIsAddAdminModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create Branch Admin</span>
                </button>
                <Link
                  to="/admin/technicians"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-600" />
                  <span>Add Technician</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-10">
              <TrendingUp className="h-28 w-28" />
            </div>
            <div className="flex items-center justify-between text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Gross Revenue</span>
              <span className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight text-white mb-1">
              ₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-blue-200/80">Completed services across workshops</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Bookings</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Calendar className="h-4 w-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {stats?.totalBookings ?? 0}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-emerald-600 font-bold">{stats?.completedBookings ?? 0} Completed</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{stats?.pendingBookings ?? 0} Pending</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Technicians</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Wrench className="h-4 w-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {stats?.totalTechnicians ?? 0}
            </div>
            <p className="text-xs text-slate-500">Qualified workshop specialists</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Customer Fleet</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Car className="h-4 w-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {stats?.totalVehicles ?? 0}
            </div>
            <p className="text-xs text-slate-500">
              Across <span className="font-bold text-slate-800">{stats?.totalUsers ?? 0}</span> registered users
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Pending Queue</div>
              <div className="text-lg font-black text-slate-900">{stats?.pendingBookings ?? 0}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">In-Progress Bays</div>
              <div className="text-lg font-black text-slate-900">{stats?.inProgressBookings ?? 0}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Completed Jobs</div>
              <div className="text-lg font-black text-slate-900">{stats?.completedBookings ?? 0}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Cancelled</div>
              <div className="text-lg font-black text-slate-900">{stats?.cancelledBookings ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Service Activity</h2>
                <p className="text-xs text-slate-500">Latest service bookings across workshops</p>
              </div>
              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {(!stats?.recentBookings || stats.recentBookings.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No recent booking activities found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Service</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 font-bold text-slate-900">{b.customerName}</td>
                        <td className="py-3.5 text-slate-600">{b.vehicleName}</td>
                        <td className="py-3.5 text-slate-600">{b.serviceName}</td>
                        <td className="py-3.5 text-slate-500">
                          {new Date(b.scheduledDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-bold border text-[10px] ${getStatusBadge(
                              b.status
                            )}`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">Quick Management</h2>
              <div className="space-y-2.5">
                <Link
                  to="/admin/bookings"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/60 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Service Requests</div>
                      <div className="text-[11px] text-slate-500">Dispatch & assign technicians</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                </Link>

                <Link
                  to="/admin/technicians"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/60 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100/70 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Technician Staff</div>
                      <div className="text-[11px] text-slate-500">Onboard & manage schedules</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition" />
                </Link>

                <Link
                  to="/admin/centers"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200/60 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100/70 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Workshop Centers</div>
                      <div className="text-[11px] text-slate-500">Add & edit network branches</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition" />
                </Link>

                <Link
                  to="/admin/users"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/60 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">User Access</div>
                      <div className="text-[11px] text-slate-500">Assign roles & access levels</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                </Link>
              </div>
            </div>

            {revenueHistory.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-3">Recent Monthly Trends</h2>
                <div className="space-y-3">
                  {revenueHistory.slice(0, 4).map((m) => (
                    <div key={m.month} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">{m.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{m.count} services</span>
                        <span className="font-bold text-slate-900">₹{m.revenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {isAddAdminModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Create Branch Admin</h3>
                </div>
                <button
                  onClick={() => setIsAddAdminModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.admin@autocare.in"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Workshop Service Center</label>
                  <select
                    required
                    value={adminForm.centerId}
                    onChange={(e) => setAdminForm({ ...adminForm, centerId: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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
                    onClick={() => setIsAddAdminModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdmin}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingAdmin ? 'Creating...' : 'Create Branch Admin'}
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

export default AdminDashboardPage;

