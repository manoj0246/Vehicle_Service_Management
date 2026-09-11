import React from 'react';
import { 
  Wrench, 
  Phone, 
  MapPin, 
  Mail 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Auto<span className="text-blue-500">Care</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              India's multi-brand car service network providing certified vehicle maintenance, genuine OEM spares, and transparent pricing.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><a href="/#services" className="hover:text-white transition">Service Catalog</a></li>
              <li><a href="/#centers" className="hover:text-white transition">Workshop Centers</a></li>
              <li><Link to="/book" className="text-blue-400 hover:text-blue-300 transition font-semibold">Book Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Customer Portal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/vehicles" className="hover:text-white transition">My Garage</Link></li>
              <li><Link to="/appointments" className="hover:text-white transition">My Appointments</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Support & Helpline</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-bold text-white">1800-200-8899</div>
                  <div className="text-[10px] text-slate-500">24x7 India Toll-Free Support</div>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 shrink-0">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span>support@autocareindia.in</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>Central Operations: Koramangala 5th Block, Bengaluru, Karnataka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AutoCare India. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>Accepted Payments:</span>
            <span className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">UPI</span>
            <span className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">RuPay</span>
            <span className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">Debit / Credit card</span>
            <span className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
