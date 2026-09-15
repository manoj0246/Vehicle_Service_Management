import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Check,
  Search,
  UserCheck,
  XCircle,
  RefreshCw,
  FileText,
  Car,
  Tag,
} from 'lucide-react';
import { technicianApi } from '../../api/technicianApi';
import type { TechnicianJob } from '../../types/technician';

export const TechnicianJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<TechnicianJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [completingJobId, setCompletingJobId] = useState<number | null>(null);
  const [workNotes, setWorkNotes] = useState<string>('');

  const [cancellingJobId, setCancellingJobId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await technicianApi.getAssignedJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assigned service jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStartJob = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await technicianApi.updateJobStatus(jobId, {
        status: 'InProgress',
        notes: 'Technician started service inspection',
      });
      await fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start service job.');
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
      await fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete job.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingJobId) return;

    setActionLoading(cancellingJobId);
    try {
      await technicianApi.updateJobStatus(cancellingJobId, {
        status: 'Cancelled',
        notes: cancelReason.trim() || 'Technician reported an issue with the service booking.',
      });
      setCancellingJobId(null);
      setCancelReason('');
      await fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel job.');
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

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeFilter === 'all' || job.status === activeFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      job.customerName?.toLowerCase().includes(term) ||
      job.vehicleName?.toLowerCase().includes(term) ||
      job.licensePlate?.toLowerCase().includes(term) ||
      job.serviceName?.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60">
              <Wrench className="h-3.5 w-3.5" />
              <span>Workshop Service Bay</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Assigned Service Jobs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Inspect, manage and transition active service requests in your workshop.
            </p>
          </div>

          <button
            onClick={fetchJobs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchJobs}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {(['all', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {filter === 'all' ? 'All Jobs' : filter === 'InProgress' ? 'In Progress' : filter}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vehicle, plate, or customer..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="text-xs font-semibold text-slate-500">Loading workshop jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white py-16 text-center border border-slate-200 rounded-2xl shadow-xs">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <Wrench className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Service Jobs Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No service requests matched "${searchTerm}".`
                : activeFilter !== 'all'
                ? `No jobs found with status "${activeFilter}".`
                : 'You currently have no service jobs assigned in this queue.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{job.serviceName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">Job ID #{job.id}</span>
                    </div>

                    <div className="flex items-center gap-1 font-extrabold text-slate-900 text-xs sm:text-sm bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-100">
                      <span>₹{job.servicePrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-slate-400" />
                        <span>Vehicle:</span>
                      </span>
                      <span className="font-bold text-slate-900">{job.vehicleName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-slate-400" />
                        <span>Plate No:</span>
                      </span>
                      <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        {job.licensePlate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                        <span>Customer:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{job.customerName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Scheduled:</span>
                      </span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/60">
                        {new Date(job.scheduledDate).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  {job.notes && (
                    <div className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 flex items-start gap-2">
                      <FileText className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 block mb-0.5">Customer / Bay Notes:</span>
                        <p className="text-slate-700 leading-relaxed">{job.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  {job.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => {
                          setCancellingJobId(job.id);
                          setCancelReason('');
                        }}
                        disabled={actionLoading === job.id}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Report Issue</span>
                      </button>

                      <button
                        onClick={() => handleStartJob(job.id)}
                        disabled={actionLoading === job.id}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        {actionLoading === job.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PlayCircle className="h-3.5 w-3.5" />
                        )}
                        <span>Start Inspection</span>
                      </button>
                    </>
                  )}

                  {job.status === 'InProgress' && (
                    <button
                      onClick={() => {
                        setCompletingJobId(job.id);
                        setWorkNotes('');
                      }}
                      disabled={actionLoading === job.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Complete Service</span>
                    </button>
                  )}

                  {(job.status === 'Completed' || job.status === 'Cancelled') && (
                    <span className="text-xs font-semibold text-slate-400 py-1">Workflow closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
                    Completion Checklist / Work Notes
                  </label>
                  <textarea
                    rows={3}
                    value={workNotes}
                    onChange={(e) => setWorkNotes(e.target.value)}
                    placeholder="Enter replaced parts, fluids topped, technician inspection notes..."
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
                    <span>Confirm Completion</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {cancellingJobId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Report Issue / Cancel Job</h3>
                  <p className="text-xs text-slate-500">Service Request #{cancellingJobId}</p>
                </div>
              </div>

              <form onSubmit={handleCancelJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reason for Cancellation / Issue
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Parts unavailable, customer requested rescheduling, bay unavailable..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingJobId(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === cancellingJobId}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {actionLoading === cancellingJobId && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>Confirm Cancellation</span>
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

export default TechnicianJobsPage;
