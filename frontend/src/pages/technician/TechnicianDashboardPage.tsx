import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PlayCircle,
  Check,
  ArrowRight,
  TrendingUp,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { technicianApi } from '../../api/technicianApi';
import type { TechnicianDashboardStats, TechnicianJob } from '../../types/technician';

export const TechnicianDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<TechnicianDashboardStats | null>(null);
  const [todayJobs, setTodayJobs] = useState<TechnicianJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [completingJobId, setCompletingJobId] = useState<number | null>(null);
  const [workNotes, setWorkNotes] = useState<string>('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, scheduleData] = await Promise.all([
        technicianApi.getDashboardStats(),
        technicianApi.getDailySchedule(),
      ]);
      setStats(statsData);
      setTodayJobs(scheduleData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load technician dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStartJob = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await technicianApi.updateJobStatus(jobId, {
        status: 'InProgress',
        notes: 'Technician started service inspection',
      });
      await loadDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update job status to In Progress.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingJobId) return;

    setActionLoading(completingJobId);
    try {
      await technicianApi.updateJobStatus(completingJobId, {
        status: 'Completed',
        notes: workNotes.trim() || 'Service completed successfully according to checklist.',
      });
      setCompletingJobId(null);
      setWorkNotes('');
      await loadDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete job.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'InProgress':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              <Wrench className="h-3.5 w-3.5" />
              <span>Technician Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Technician Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your assigned service jobs, update bay progress, and manage shifts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/technician/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>View All Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadDashboardData}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 font-semibold rounded-lg text-xs transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active In-Progress</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '-' : stats?.inProgressBookings ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready / Confirmed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '-' : stats?.confirmedBookings ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <PlayCircle className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Jobs</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '-' : stats?.completedBookings ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assigned</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loading ? '-' : stats?.totalBookings ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Today's Work Schedule</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Assigned service requests scheduled for today</p>
              </div>
              <Link
                to="/technician/schedule"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : todayJobs.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h3 className="text-sm font-bold text-slate-800">No Jobs Scheduled for Today</h3>
                <p className="text-xs text-slate-500 mt-1">You have no active vehicle service bookings on today's calendar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{job.serviceName}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{job.vehicleName} ({job.licensePlate})</span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                          {job.customerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {job.notes && (
                        <p className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200/60 inline-block mt-1">
                          <span className="font-medium text-slate-700">Notes:</span> {job.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {job.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStartJob(job.id)}
                          disabled={actionLoading === job.id}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span>Start Job</span>
                        </button>
                      )}

                      {job.status === 'InProgress' && (
                        <button
                          onClick={() => {
                            setCompletingJobId(job.id);
                            setWorkNotes('');
                          }}
                          disabled={actionLoading === job.id}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-md space-y-4">
              <div className="inline-flex p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Shift & Weekly Availability</h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  Configure your working hours for each day of the week to ensure the automated booking engine only allocates slots during your active shifts.
                </p>
              </div>
              <Link
                to="/technician/schedule"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-blue-50 text-blue-800 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>Manage Shift Hours</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-600" />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-2">
                <Link
                  to="/technician/jobs"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 hover:text-blue-700 text-slate-700 text-xs font-semibold border border-slate-200/70 transition-all"
                >
                  <span>Open Full Job Queue</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  to="/technician/schedule"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 hover:text-blue-700 text-slate-700 text-xs font-semibold border border-slate-200/70 transition-all"
                >
                  <span>View Appointment Calendar</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {completingJobId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Mark Service as Completed</h3>
                  <p className="text-xs text-slate-500">Service Request #{completingJobId}</p>
                </div>
              </div>

              <form onSubmit={handleCompleteJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Completion Notes / Work Summary
                  </label>
                  <textarea
                    rows={3}
                    value={workNotes}
                    onChange={(e) => setWorkNotes(e.target.value)}
                    placeholder="e.g. Completed 40-point inspection, oil & filter replaced, brake pads checked."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompletingJobId(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === completingJobId}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading === completingJobId && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>Confirm Completion</span>
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

export default TechnicianDashboardPage;

