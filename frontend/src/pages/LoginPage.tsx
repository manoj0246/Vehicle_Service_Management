import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  PhoneCall
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login({ email, password });
      if (searchParams.get('redirect')) {
        navigate(searchParams.get('redirect')!);
      } else if (loggedInUser.role === 'Technician') {
        navigate('/technician/dashboard');
      } else if (loggedInUser.role === 'Admin' || loggedInUser.role === 'SuperAdmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/vehicles');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.code === 'ERR_NETWORK' || !err.response) {
          setError('Cannot connect to backend server. Please ensure the .NET API is running on http://localhost:5052.');
        } else {
          setError('Invalid email or password. Please check your credentials.');
        }
      } else {
        setError('Invalid email or password. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-100/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-7 p-8 sm:p-12 space-y-7 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                <Wrench className="h-3.5 w-3.5" />
                <span>AutoCare Portal Access</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Enter your credentials to manage your vehicles, bookings, and invoices.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <div className="font-bold text-rose-800">Authentication Failed</div>
                  <div className="text-rose-600 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm transition bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm transition bg-slate-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link
                to={redirectUrl !== '/' ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
                className="font-bold text-blue-600 hover:text-blue-500"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex md:col-span-5 bg-slate-950 text-white p-10 flex-col justify-between border-l border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-white">
                Auto<span className="text-blue-500">Care</span>
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold leading-snug">
                Smart Digital Garage for Indian Vehicle Owners
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in to book collision-free appointments, track ongoing bay services, and access verified digital service certificates.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Genuine OEM Spares & Warranty</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero-Overlap Collision-Free Scheduling</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>GST Compliant Invoicing & UPI Support</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 flex items-center gap-2">
            <PhoneCall className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>Support Helpline: 1800-200-8899</span>
          </div>
        </div>
      </div>
    </div>
  );
};
