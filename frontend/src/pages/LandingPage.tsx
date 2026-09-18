import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';
import { getServices } from '../api/servicesApi';
import { getCenters } from '../api/centersApi';
import type { ServiceItem } from '../types/service';
import type { ServiceCenterItem } from '../types/center';

export const LandingPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [centers, setCenters] = useState<ServiceCenterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const fetchLiveData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesData, centersData] = await Promise.all([
        getServices(),
        getCenters(),
      ]);
      setServices(servicesData);
      setCenters(centersData);
    } catch (err: any) {
      console.error('Failed to load services or centers:', err);
      setError('Unable to load live catalog from backend. Please verify the .NET backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const faqs = [
    {
      q: "Does servicing my vehicle at AutoCare void my manufacturer warranty?",
      a: "No. Under Indian consumer protection guidelines and the automotive Right to Repair framework, vehicle owners have the liberty to choose certified multi-brand service centers. We utilize 100% genuine OEM/OES components and strictly adhere to factory maintenance schedules.",
    },
    {
      q: "Are the spare parts and lubricants 100% genuine OEM?",
      a: "Yes. Every component fitted—from Bosch filters, Mobil 1 and Castrol lubricants to Valeo brake pads—is sourced directly from verified OEM tier-1 distributors and comes with a verifiable manufacturer invoice and warranty.",
    },
    {
      q: "How does the doorstep pickup and drop service work?",
      a: "A verified AutoCare driver conducts an initial 15-point digital vehicle handover scan at your residence or office, delivers the vehicle to your chosen hub, and returns it sanitized with a digital job audit once completed.",
    },
    {
      q: "What warranty do you offer on labor and repairs?",
      a: "All services and mechanical repairs carry a standard 6-Month or 5,000 KM nationwide warranty card redeemable across all AutoCare hubs in India.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <section className="relative bg-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-bold tracking-wide">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Multi-Brand Car Service Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Reliable Car Care, Scheduled in <span className="text-blue-500">60 Seconds</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Book certified mechanics across major Indian metropolitan hubs. Enjoy 100% genuine OEM parts, collision-free slot booking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 transition"
            >
              <span>Explore Packages</span>
            </a>
          </div>

          <div className="pt-10 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-lg font-black text-white">100% OEM</div>
              <div className="text-[11px] text-slate-400">Genuine Factory Spares</div>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-lg font-black text-white">6 Months</div>
              <div className="text-[11px] text-slate-400">Nationwide Warranty</div>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-lg font-black text-white">Doorstep</div>
              <div className="text-[11px] text-slate-400">Free Pick & Drop</div>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-lg font-black text-white">₹ Fixed INR</div>
              <div className="text-[11px] text-slate-400">Zero Hidden Charges</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Live Service Catalog</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular Service Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Standardized turnaround times and genuine OEM spares for all car models.
          </p>
        </div>

        {loading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Fetching live services from database...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs max-w-lg mx-auto text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-slate-600" />
                      <span>{service.durationMinutes} mins</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Inclusive Rate</div>
                    <div className="text-xl font-black text-slate-900">
                      ₹{Number(service.price).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="centers" className="py-20 bg-slate-100/60 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Active Hubs</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Our Certified Service Centers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Locate fully equipped diagnostic bays and certified mechanics across major Indian cities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {centers.map((center) => (
              <div
                key={center.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{center.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{center.address}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{center.phone}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active Hub</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Hassle-Free Maintenance</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h4 className="font-bold text-base text-slate-900">Choose Service & Vehicle</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select your vehicle make/model and desired package with transparent ₹ INR pricing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h4 className="font-bold text-base text-slate-900">Select Workshop & Slot</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pick a collision-free time slot at your nearest workshop center.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h4 className="font-bold text-base text-slate-900">Service & Warranty</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track live service progress and receive a 6-month nationwide warranty card.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="text-center mb-10 space-y-2">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Common Inquiries</div>
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50 transition"
              >
                <span className="font-bold text-xs sm:text-sm text-slate-900">{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </button>

              {openFaqIndex === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Ready to service your vehicle?</h3>
            <p className="text-xs text-slate-400">
              Book certified mechanics with 100% genuine OEM spares in your city.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

