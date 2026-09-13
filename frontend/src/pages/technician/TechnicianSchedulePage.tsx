import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Sliders,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { technicianApi } from '../../api/technicianApi';
import type { TechnicianJob, TechnicianAvailability } from '../../types/technician';

const DAYS_OF_WEEK = [
  { day: 0, name: 'Sunday' },
  { day: 1, name: 'Monday' },
  { day: 2, name: 'Tuesday' },
  { day: 3, name: 'Wednesday' },
  { day: 4, name: 'Thursday' },
  { day: 5, name: 'Friday' },
  { day: 6, name: 'Saturday' },
];

export const TechnicianSchedulePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'availability'>('timeline');

  // Timeline state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduleJobs, setScheduleJobs] = useState<TechnicianJob[]>([]);
  const [timelineLoading, setTimelineLoading] = useState<boolean>(true);

  // Availability state
  const [availabilities, setAvailabilities] = useState<{
    [day: number]: { enabled: boolean; startTime: string; endTime: string };
  }>({
    0: { enabled: false, startTime: '09:00', endTime: '17:00' },
    1: { enabled: true, startTime: '09:00', endTime: '17:00' },
    2: { enabled: true, startTime: '09:00', endTime: '17:00' },
    3: { enabled: true, startTime: '09:00', endTime: '17:00' },
    4: { enabled: true, startTime: '09:00', endTime: '17:00' },
    5: { enabled: true, startTime: '09:00', endTime: '17:00' },
    6: { enabled: true, startTime: '09:00', endTime: '14:00' },
  });
  const [availabilityLoading, setAvailabilityLoading] = useState<boolean>(true);
  const [savingAvailability, setSavingAvailability] = useState<boolean>(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDailySchedule = async (dateStr: string) => {
    setTimelineLoading(true);
    setMessage(null);
    try {
      const data = await technicianApi.getDailySchedule(dateStr);
      setScheduleJobs(data);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load daily schedule.',
      });
    } finally {
      setTimelineLoading(false);
    }
  };

  const fetchAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const data = await technicianApi.getAvailability();
      const updated = { ...availabilities };

      // Initialize all to disabled first
      DAYS_OF_WEEK.forEach(({ day }) => {
        updated[day] = { enabled: false, startTime: '09:00', endTime: '17:00' };
      });

      // Populate from API
      data.forEach((item: TechnicianAvailability) => {
        const start = item.startTime.substring(0, 5);
        const end = item.endTime.substring(0, 5);
        updated[item.dayOfWeek] = {
          enabled: true,
          startTime: start,
          endTime: end,
        };
      });

      setAvailabilities(updated);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load shift availability.',
      });
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    fetchDailySchedule(selectedDate);
    fetchAvailability();
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchDailySchedule(newDate);
  };

  const handleStepDay = (delta: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + delta);
    const newDateStr = current.toISOString().split('T')[0];
    handleDateChange(newDateStr);
  };

  const handleToggleDay = (day: number) => {
    setAvailabilities((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleTimeChange = (day: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailabilities((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAvailability(true);
    setMessage(null);

    const payload: TechnicianAvailability[] = [];

    for (const { day } of DAYS_OF_WEEK) {
      const item = availabilities[day];
      if (item.enabled) {
        if (item.startTime >= item.endTime) {
          setMessage({
            type: 'error',
            text: `Shift end time must be after start time for ${DAYS_OF_WEEK.find((d) => d.day === day)?.name}.`,
          });
          setSavingAvailability(false);
          return;
        }

        payload.push({
          dayOfWeek: day,
          startTime: item.startTime.length === 5 ? `${item.startTime}:00` : item.startTime,
          endTime: item.endTime.length === 5 ? `${item.endTime}:00` : item.endTime,
        });
      }
    }

    try {
      await technicianApi.updateAvailability(payload);
      setMessage({
        type: 'success',
        text: 'Weekly shift availability updated successfully!',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save shift availability.',
      });
    } finally {
      setSavingAvailability(false);
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
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              <Calendar className="h-3.5 w-3.5" />
              <span>Shift Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Schedule & Shift Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              View your day-to-day service bookings and manage recurring weekly workshop hours.
            </p>
          </div>

          <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Timeline
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'availability'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Shifts
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 border rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStepDay(-1)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  title="Previous Day"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-slate-800 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                />
                <button
                  onClick={() => handleStepDay(1)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  title="Next Day"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
              >
                Jump to Today
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>
                  Schedule for{' '}
                  {new Date(selectedDate).toLocaleDateString([], {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </h2>

              {timelineLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-xs text-slate-500">Loading daily schedule...</span>
                </div>
              ) : scheduleJobs.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-sm font-bold text-slate-800">No Appointments Scheduled</h3>
                  <p className="text-xs text-slate-500 mt-1">There are no vehicle bookings assigned for this day.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduleJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{job.serviceName}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadge(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {job.vehicleName} ({job.licensePlate})
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                            {job.customerName}
                          </span>
                          <span className="flex items-center gap-1 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <Clock className="h-3 w-3" />
                            {new Date(job.scheduledDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {job.notes && (
                          <p className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200/60 inline-block mt-1">
                            <span className="font-medium text-slate-700">Notes:</span> {job.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Weekly Shift Availability</h2>
                <p className="text-xs text-slate-500">
                  Select which days you work and configure your workshop start & end hours.
                </p>
              </div>
            </div>

            {availabilityLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-xs text-slate-500">Loading shift settings...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveAvailability} className="space-y-4">
                <div className="divide-y divide-slate-100">
                  {DAYS_OF_WEEK.map(({ day, name }) => {
                    const current = availabilities[day];
                    return (
                      <div
                        key={day}
                        className={`py-3.5 px-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          current.enabled ? 'bg-slate-50/60' : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`day-${day}`}
                            checked={current.enabled}
                            onChange={() => handleToggleDay(day)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`day-${day}`}
                            className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer select-none"
                          >
                            {name}
                          </label>
                        </div>

                        {current.enabled ? (
                          <div className="flex items-center gap-2 pl-7 sm:pl-0">
                            <input
                              type="time"
                              value={current.startTime}
                              onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                              className="text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            />
                            <span className="text-xs text-slate-400 font-semibold">to</span>
                            <input
                              type="time"
                              value={current.endTime}
                              onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                              className="text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium pl-7 sm:pl-0">Off Duty</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingAvailability}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingAvailability ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Save Shift Availability</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianSchedulePage;

