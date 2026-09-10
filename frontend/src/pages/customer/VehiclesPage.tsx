import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  Plus, 
  Trash2, 
  Wrench, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getMyVehicles, createVehicle, deleteVehicle } from '../../api/vehicleApi';
import type { Vehicle } from '../../types/vehicle';

export const VehiclesPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [make, setMake] = useState<string>('Maruti Suzuki');
  const [customMake, setCustomMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [color, setColor] = useState<string>('White');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const carMakes = [
    'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 
    'Honda', 'Toyota', 'Kia', 'Volkswagen', 'Skoda', 'MG Motors', 
    'Renault', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Other'
  ];

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError('Failed to fetch your registered vehicles. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/vehicles');
      return;
    }
    fetchVehicles();
  }, [isAuthenticated, isLoading, navigate]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMake = make === 'Other' ? customMake.trim() : make.trim();
    if (!finalMake || !model.trim() || !licensePlate.trim()) {
      setError('Please provide all vehicle details.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createVehicle({
        make: finalMake,
        model: model.trim(),
        year,
        licensePlate: licensePlate.trim().toUpperCase(),
        color,
      });
      setShowModal(false);
      setModel('');
      setLicensePlate('');
      setCustomMake('');
      setMake('Maruti Suzuki');
      await fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicle. Check license plate format.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteVehicleId) return;

    setIsDeleting(true);
    try {
      await deleteVehicle(deleteVehicleId);
      setDeleteVehicleId(null);
      await fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cannot delete vehicle with active service requests.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              <Car className="h-3.5 w-3.5" />
              <span>Digital Garage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              My Registered Cars
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your personal cars for quick 1-click service scheduling.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Car</span>
            </button>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              <Wrench className="h-4 w-4 text-blue-400" />
              <span>Book Service</span>
            </Link>
          </div>
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
            <p className="text-xs font-semibold text-slate-600">Loading your garage...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Car className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Garage is Empty</h3>
              <p className="text-xs text-slate-500 mt-1">
                Add your car to start scheduling certified service packages across Indian hubs.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              + Register New Car
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-5 hover:border-blue-300 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
                      <Car className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs font-extrabold bg-slate-900 text-amber-400 px-3 py-1 rounded-lg border border-slate-700 uppercase tracking-wider">
                      {v.licensePlate}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {v.make} {v.model}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Model Year: <strong className="text-slate-700">{v.year}</strong></span>
                      {v.color && <span>• Color: {v.color}</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setDeleteVehicleId(v.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Remove Vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to="/book"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Add Car to Garage</h3>
                <p className="text-xs text-slate-500">
                  Register your car details to enable certified multi-point servicing.
                </p>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Car Manufacturer / Brand
                  </label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {carMakes.map((m) => (
                      <option key={m} value={m}>{m === 'Other' ? 'Other / Company Not Listed' : m}</option>
                    ))}
                  </select>
                </div>

                {make === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                      Enter Car Company / Manufacturer
                    </label>
                    <input
                      type="text"
                      required
                      value={customMake}
                      onChange={(e) => setCustomMake(e.target.value)}
                      placeholder="e.g. BYD, Jeep, Volvo, Lexus, Force"
                      className="w-full bg-white border border-blue-400 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Model Name
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Swift, Nexon, Creta, City, XUV700"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Year of Mfg
                    </label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2027}
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Exterior Color
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. White, Black, Red"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    License Plate Number (RTO)
                  </label>
                  <input
                    type="text"
                    required
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="e.g. KA-01-AB-1234 or MH-02-CD-5678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Stored securely for digital service record keeping.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Car'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteVehicleId !== null && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Remove Car from Garage?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to remove this car? You will no longer be able to schedule new appointments for it.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteVehicleId(null)}
                  disabled={isDeleting}
                  className="w-1/2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Keep Car
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-1/2 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isDeleting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Yes, Remove</span>
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
