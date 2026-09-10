import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Wrench,
  CheckCircle2,
  Gift,
  PhoneCall
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: 'bg-slate-200' };
    if (password.length < 6) return { level: 1, text: 'Weak', color: 'bg-rose-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, text: 'Strong', color: 'bg-emerald-500' };
    }
    return { level: 2, text: 'Moderate', color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate(redirectUrl);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstField = Object.keys(errors)[0];
        setError(errors[firstField]?.[0] || 'Validation error.');
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to backend server. Please ensure the .NET API is running on http://localhost:5052.');
      } else {
        setError('Registration failed. Please check your information and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-100/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-7 p-8 sm:p-12 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Registration</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Register to manage your vehicles and book certified services in your city.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <div className="font-bold text-rose-800">Registration Error</div>
                  <div className="text-rose-600 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm transition bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    placeholder="rahul.sharma@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm transition bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {password && (
                    <span className="text-[10px] font-bold text-slate-500">
                      Strength: <strong className="text-slate-900">{strength.text}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm transition bg-slate-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {password && (
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strength.level / 3) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm transition bg-slate-50/50 focus:bg-white"
                  />
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
                    <span>Create your Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to={redirectUrl !== '/' ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                className="font-bold text-blue-600 hover:text-blue-500"
              >
                Sign in
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <Gift className="h-3.5 w-3.5" />
                <span>New Member Welcome Perks</span>
              </div>
              <h3 className="text-xl font-bold leading-snug">
                Join 50,000+ Verified Indian Vehicle Owners
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enjoy complete peace of mind with standardized automotive maintenance and factory OEM parts across all Indian hubs.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Free 25-Point Digital Inspection Report</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>6 Months / 5,000 KM Nationwide Warranty</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Contactless Doorstep Pickup & Delivery</span>
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
