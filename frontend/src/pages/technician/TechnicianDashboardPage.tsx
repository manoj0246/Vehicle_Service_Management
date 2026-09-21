import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  const [partsUsed, setPartsUsed] = useState<string>('');

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsData, scheduleData] = await Promise.all([
        technicianApi.getDashboardStats(),
        technicianApi.getDailySchedule(),
      ]);
      setStats(statsData);
      setTodayJobs(scheduleData);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message ?? 'Failed to load technician dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartJob = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await technicianApi.updateJobStatus(jobId, {
        status: 'InProgress',
        notes: undefined,
      });
      await loadDashboardData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message ?? 'Failed to update job status to In Progress.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingJobId) return;

    setActionLoading(completingJobId);
    try {
      const combinedNotes = [
        workNotes.trim(),
        partsUsed.trim() ? `Parts: ${partsUsed.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      await technicianApi.updateJobStatus(completingJobId, {
        status: 'Completed',
        notes: combinedNotes ? combinedNotes : undefined,
      });
      setCompletingJobId(null);
      setWorkNotes('');
      setPartsUsed('');
      await loadDashboardData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message ?? 'Failed to complete job.');
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60">
              <Wrench className="h-3.5 w-3.5" />
              <span>Workshop Center</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Technician Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Overview of your daily job schedule, active service bay tasks, and quick workflow controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/technician/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>View Job Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadDashboardData}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">In Progress</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats?.inProgressBookings ?? 0}</span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                Active Bays
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ready / Confirmed</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats?.confirmedBookings ?? 0}</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Next in Queue
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Completed Jobs</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats?.completedBookings ?? 0}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Delivered
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Assigned</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats?.totalBookings ?? 0}</span>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                All Time
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Today's Assigned Schedule</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vehicles currently booked or scheduled for inspection today.
                  </p>
                </div>
                <Link
                  to="/technician/schedule"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Full Schedule</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-xs text-slate-500 font-medium">Loading schedule...</span>
                </div>
              ) : todayJobs.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No Jobs Scheduled for Today</p>
                  <p className="text-xs text-slate-400 mt-0.5">Check the full queue or relax until new bookings arrive.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {todayJobs.map((job) => (
                    <div key={job.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{job.serviceName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-medium text-slate-800">{job.vehicleName}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600 font-semibold">{job.licensePlate}</span>
                          <span>•</span>
                          <span>{job.customerName}</span>
                        </div>
                        <div className="text-[11px] font-medium text-blue-600">
                          Scheduled: {new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {job.status === 'Confirmed' && (
                          <button
                            onClick={() => handleStartJob(job.id)}
                            disabled={actionLoading === job.id}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {actionLoading === job.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <PlayCircle className="h-3.5 w-3.5" />
                            )}
                            <span>Start Inspection</span>
                          </button>
                        )}

                        {job.status === 'InProgress' && (
                          <button
                            onClick={() => {
                              setCompletingJobId(job.id);
                              setWorkNotes('');
                              setPartsUsed('');
                            }}
                            disabled={actionLoading === job.id}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Complete Job</span>
                          </button>
                        )}

                        <Link
                          to="/technician/jobs"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Quick Shortcuts
              </h2>
              <div className="space-y-2.5">
                <Link
                  to="/technician/jobs"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100/60 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Job Queue</div>
                      <div className="text-[11px] text-slate-500">View all assigned requests</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <Link
                  to="/technician/schedule"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100/60 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">My Shift & Schedule</div>
                      <div className="text-[11px] text-slate-500">Update working hours</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Wrench className="h-4 w-4" />
                <span>Service Quality Standard</span>
              </div>
              <h3 className="text-sm font-bold leading-snug">
                Remember to verify all 40 checklist points before completing jobs.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log any parts replaced and test fluid levels to ensure customer warranty eligibility.
              </p>
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
                  <h3 className="text-base font-bold text-slate-900">Complete Service Job #{completingJobId}</h3>
                  <p className="text-xs text-slate-500">Enter work notes and parts summary</p>
                </div>
              </div>

              <form onSubmit={handleCompleteJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Technician Work Notes
                  </label>
                  <textarea
                    rows={3}
                    value={workNotes}
                    onChange={(e) => setWorkNotes(e.target.value)}
                    placeholder="Summarize work completed, diagnostics performed, fluid levels..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Parts Replaced / Used (Optional)
                  </label>
                  <input
                    type="text"
                    value={partsUsed}
                    onChange={(e) => setPartsUsed(e.target.value)}
                    placeholder="e.g. Front brake pads, Synthetic 5W-30 Oil (4L)"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompletingJobId(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === completingJobId}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {actionLoading === completingJobId && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>Confirm Job Completion</span>
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
