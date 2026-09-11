import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Wrench, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';
import { getUpcomingBookings, getBookingHistory, cancelBooking } from '../../api/bookingApi';
import type { BookingResponse } from '../../types/booking';

export const AppointmentsPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [upcoming, setUpcoming] = useState<BookingResponse[]>([]);
  const [history, setHistory] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [upcomingData, historyData] = await Promise.all([
        getUpcomingBookings(),
        getBookingHistory(),
      ]);
      setUpcoming(upcomingData);
      setHistory(historyData);
    } catch (err: any) {
      setError('Failed to fetch your appointments. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/appointments');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, isLoading, navigate]);

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;

    setCancelling(true);
    try {
      await cancelBooking(cancelBookingId);
      setCancelBookingId(null);
      await fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
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
      case 'Pending':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const currentList = activeTab === 'upcoming' ? upcoming : history;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              <Calendar className="h-3.5 w-3.5" />
              <span>Service Bookings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              My Appointments & History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track live workshop bay progress, download invoices, and review past service logs.
            </p>
          </div>

          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <Wrench className="h-4 w-4" />
            <span>Book New Service</span>
          </Link>
        </div>

        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Upcoming Services ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Service History ({history.length})
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <div className="font-bold text-rose-800">Notice</div>
              <div className="text-rose-600 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading your service appointments...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Service Records'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'upcoming'
                  ? 'You currently have no pending or active service requests scheduled.'
                  : 'Your completed and past service records will be logged here.'}
              </p>
            </div>
            <Link
              to="/book"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
            >
              Book a Service Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((item) => {
              const scheduled = new Date(item.scheduledDate);
              const formattedDate = scheduled.toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = scheduled.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-mono text-slate-500">Booking #{item.id}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
                        {item.licensePlate}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.serviceName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Vehicle: <strong className="text-slate-700">{item.vehicleName}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <span>{formattedTime}</span>
                      </div>
                      {item.technicianName && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Assigned Tech: {item.technicianName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Amount</div>
                      <div className="text-xl font-black text-slate-900">
                        ₹{Number(item.servicePrice).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {item.status === 'Pending' && (
                      <button
                        onClick={() => setCancelBookingId(item.id)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cancelBookingId !== null && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Cancel Service Appointment?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to cancel booking #{cancelBookingId}? This scheduled slot will be released back to the workshop bay.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelBookingId(null)}
                  disabled={cancelling}
                  className="w-1/2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="w-1/2 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {cancelling ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Yes, Cancel Booking</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
