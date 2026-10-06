import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { getServices } from '../../api/servicesApi';
import { getCenters } from '../../api/centersApi';
import { getMyVehicles, createVehicle } from '../../api/vehicleApi';
import { bookService } from '../../api/bookingApi';
import type { ServiceItem } from '../../types/service';
import type { ServiceCenterItem } from '../../types/center';
import type { Vehicle } from '../../types/vehicle';

export const BookServicePage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [centers, setCenters] = useState<ServiceCenterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
  const [selectedCenterId, setSelectedCenterId] = useState<number | ''>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');

  const [showAddVehicle, setShowAddVehicle] = useState<boolean>(false);
  const [newMake, setNewMake] = useState<string>('Maruti Suzuki');
  const [customMake, setCustomMake] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newYear, setNewYear] = useState<number>(2023);
  const [newPlate, setNewPlate] = useState<string>('');

  const carMakes = [
    'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 
    'Honda', 'Toyota', 'Kia', 'Volkswagen', 'Skoda', 'MG Motors', 
    'Renault', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Other'
  ];

  const timeSlots = [
    '08:30', '09:30', '10:30', '11:30', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/book');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [vehiclesData, servicesData, centersData] = await Promise.all([
          getMyVehicles(),
          getServices(),
          getCenters(),
        ]);
        setVehicles(vehiclesData);
        setServices(servicesData);
        setCenters(centersData);

        if (vehiclesData.length > 0) {
          setSelectedVehicleId(vehiclesData[0].id);
        } else {
          setShowAddVehicle(true);
        }

        if (centersData.length > 0) {
          const initialCenterId = centersData[0].id;
          setSelectedCenterId(initialCenterId);
          const matchingServices = servicesData.filter((s) => s.centerId === initialCenterId);
          if (matchingServices.length > 0) {
            setSelectedServiceId(matchingServices[0].id);
          } else if (servicesData.length > 0) {
            setSelectedServiceId(servicesData[0].id);
          }
        } else if (servicesData.length > 0) {
          setSelectedServiceId(servicesData[0].id);
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduledDate(tomorrow.toISOString().split('T')[0]);
      } catch (err: unknown) {
        console.error('Error loading booking data:', err);
        setError('Failed to load centers or vehicles. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, isLoading, navigate]);

  const handleQuickAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMake = newMake === 'Other' ? customMake.trim() : newMake.trim();
    if (!finalMake || !newModel.trim() || !newPlate.trim()) {
      setError('Please provide all car details.');
      return;
    }

    try {
      const added = await createVehicle({
        make: finalMake,
        model: newModel.trim(),
        year: newYear,
        licensePlate: newPlate.trim().toUpperCase(),
      });
      setVehicles([...vehicles, added]);
      setSelectedVehicleId(added.id);
      setShowAddVehicle(false);
      setNewModel('');
      setNewPlate('');
      setCustomMake('');
      setNewMake('Maruti Suzuki');
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to add car');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedServiceId || !scheduledDate || !scheduledTime) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateTimeString = `${scheduledDate}T${scheduledTime}:00Z`;
      await bookService({
        vehicleId: Number(selectedVehicleId),
        serviceId: Number(selectedServiceId),
        scheduledDate: dateTimeString,
        notes: notes.trim(),
      });
      navigate('/appointments');
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMsg ?? 'Failed to schedule booking. Please try another time slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectCenter = (centerId: number) => {
    setSelectedCenterId(centerId);
    const matching = services.filter((s) => s.centerId === centerId);
    if (matching.length > 0) {
      if (!matching.some((s) => s.id === Number(selectedServiceId))) {
        setSelectedServiceId(matching[0].id);
      }
    } else {
      setSelectedServiceId('');
    }
  };

  const availableServices = selectedCenterId
    ? services.filter((s) => s.centerId === Number(selectedCenterId))
    : services;

  const selectedService = services.find((s) => s.id === Number(selectedServiceId));

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading service centers and packages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            <Wrench className="h-3.5 w-3.5" />
            <span>Customer Booking Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Schedule a Car Service Appointment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select your car, certified workshop hub, and preferred time slot with collision-free scheduling.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <div className="font-bold text-rose-800">Booking Notice</div>
              <div className="text-rose-600 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="font-bold text-slate-900 text-base">Select Your Car</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddVehicle ? 'Select Existing' : '+ Add New Car'}</span>
              </button>
            </div>

            {showAddVehicle ? (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Add Car to Garage</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Car Company / Make</label>
                    <select
                      value={newMake}
                      onChange={(e) => {
                        setNewMake(e.target.value);
                        if (e.target.value !== 'Other') setCustomMake('');
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {carMakes.map((m) => (
                        <option key={m} value={m}>{m === 'Other' ? 'Other / Company Not Listed' : m}</option>
                      ))}
                    </select>
                  </div>

                  {newMake === 'Other' && (
                    <div>
                      <label className="block text-[11px] font-bold text-blue-600 mb-1">Enter Car Company / Manufacturer</label>
                      <input
                        type="text"
                        required
                        value={customMake}
                        onChange={(e) => setCustomMake(e.target.value)}
                        placeholder="e.g. BYD, Jeep, Volvo, Citroen"
                        className="w-full bg-white border border-blue-400 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Model</label>
                    <input
                      type="text"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      placeholder="e.g. Swift, Creta, Nexon, City"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Manufacturing Year</label>
                    <input
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">License Plate (RTO)</label>
                    <input
                      type="text"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                      placeholder="e.g. KA-01-AB-1234"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono uppercase"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAddVehicle}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Save Car to Garage
                </button>
              </div>
            ) : vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedVehicleId === v.id
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{v.make} {v.model} ({v.year})</div>
                        <div className="text-xs font-mono text-slate-500 uppercase">{v.licensePlate}</div>
                      </div>
                    </div>
                    {selectedVehicleId === v.id && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs">
                No cars registered. Please click "+ Add New Car" above to register your car.
              </div>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="font-bold text-slate-900 text-base">Choose Service Center</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {centers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCenter(c.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between ${
                    selectedCenterId === c.id
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-blue-600 shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.address}</div>
                      <div className="text-[11px] font-semibold text-blue-600 mt-1">{c.phone}</div>
                    </div>
                  </div>
                  {selectedCenterId === c.id && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
              <h3 className="font-bold text-slate-900 text-base">Select Service Package</h3>
            </div>

            {availableServices.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <p className="text-xs font-semibold text-slate-600">
                  No service packages currently configured for this workshop center. Please select another workshop center or check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      selectedServiceId === s.id
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{s.name}</h4>
                        {selectedServiceId === s.id && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <span>{s.durationMinutes} mins</span>
                      </div>
                      <div className="text-base font-black text-slate-900">
                        ₹{Number(s.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</div>
              <h3 className="font-bold text-slate-900 text-base">Select Date & Time</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Time Slot
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setScheduledTime(slot)}
                      className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                        scheduledTime === slot
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Instructions / Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Squeaking noise when braking from front wheels, check tyre pressure"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Estimated Total Amount:</div>
              <div className="text-2xl font-black text-slate-900">
                ₹{selectedService ? Number(selectedService.price).toLocaleString('en-IN') : '0'}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedVehicleId || !selectedServiceId}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Confirm & Book Appointment</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
