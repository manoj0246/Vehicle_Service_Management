import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  Menu, 
  X, 
  ArrowRight, 
  LogOut, 
  Car, 
  Calendar, 
  PhoneCall,
  LayoutDashboard,
  ClipboardList,
  Clock,
  Building2,
  Users,
  ShieldAlert,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.substring(1);
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getNavLinkClass = (path: string, theme: 'blue' | 'amber' | 'purple' = 'blue') => {
    const active = isLinkActive(path);
    if (!active) {
      return 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 font-semibold text-xs sm:text-sm';
    }

    if (theme === 'amber') {
      return 'bg-amber-50 text-amber-800 font-bold px-2.5 py-1.5 rounded-xl shadow-xs border border-amber-200/80 transition flex items-center gap-1.5 text-xs sm:text-sm';
    }

    if (theme === 'purple') {
      return 'bg-purple-50 text-purple-800 font-bold px-2.5 py-1.5 rounded-xl shadow-xs border border-purple-200/80 transition flex items-center gap-1.5 text-xs sm:text-sm';
    }

    return 'bg-blue-50 text-blue-700 font-bold px-2.5 py-1.5 rounded-xl shadow-xs border border-blue-200/80 transition flex items-center gap-1.5 text-xs sm:text-sm';
  };

  const getIconClass = (path: string, theme: 'blue' | 'amber' | 'purple' = 'blue') => {
    const active = isLinkActive(path);
    if (!active) {
      return 'h-4 w-4 text-slate-400 group-hover:text-slate-600';
    }
    if (theme === 'amber') return 'h-4 w-4 text-amber-600';
    if (theme === 'purple') return 'h-4 w-4 text-purple-600';
    return 'h-4 w-4 text-blue-600';
  };

  const getMobileLinkClass = (path: string, theme: 'blue' | 'amber' | 'purple' = 'blue') => {
    const active = isLinkActive(path);
    if (!active) {
      return 'block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50';
    }
    if (theme === 'amber') {
      return 'block px-3 py-2 rounded-lg text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200/70 shadow-xs';
    }
    if (theme === 'purple') {
      return 'block px-3 py-2 rounded-lg text-sm font-bold text-purple-800 bg-purple-50 border border-purple-200/70 shadow-xs';
    }
    return 'block px-3 py-2 rounded-lg text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200/70 shadow-xs';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Technician':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Customer':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const isTechnician = user?.role === 'Technician';
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const brandLink = isAdmin
    ? '/admin/dashboard'
    : isTechnician
    ? '/technician/dashboard'
    : isAuthenticated
    ? '/vehicles'
    : '/';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-3 w-3 text-emerald-400" />
            <span>24x7 India Support & RSA: <strong className="text-white">1800-200-8899</strong></span>
          </div>
          <div className="text-slate-400 text-[11px]">
            100% Genuine OEM Spares • Multi-Brand Certified Workshops
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={brandLink} className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Wrench className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Auto<span className="text-blue-600">Care</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-black uppercase bg-slate-100 text-slate-700 rounded border border-slate-300">
                India
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-700">
            {isAuthenticated && isAdmin ? (
              <>
                <Link to="/admin/dashboard" className={getNavLinkClass('/admin/dashboard')}>
                  <LayoutDashboard className={getIconClass('/admin/dashboard')} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/bookings" className={getNavLinkClass('/admin/bookings')}>
                  <Calendar className={getIconClass('/admin/bookings')} />
                  <span>Bookings</span>
                </Link>
                <Link to="/admin/technicians" className={getNavLinkClass('/admin/technicians')}>
                  <Wrench className={getIconClass('/admin/technicians')} />
                  <span>Technicians</span>
                </Link>
                <Link to="/admin/centers" className={getNavLinkClass('/admin/centers')}>
                  <Building2 className={getIconClass('/admin/centers')} />
                  <span>Centers</span>
                </Link>
                <Link to="/admin/services" className={getNavLinkClass('/admin/services')}>
                  <Layers className={getIconClass('/admin/services')} />
                  <span>Services</span>
                </Link>
                <Link to="/admin/users" className={getNavLinkClass('/admin/users')}>
                  <Users className={getIconClass('/admin/users')} />
                  <span>Users</span>
                </Link>
                {isSuperAdmin && (
                  <Link to="/admin/audit-logs" className={getNavLinkClass('/admin/audit-logs', 'purple')}>
                    <ShieldAlert className={getIconClass('/admin/audit-logs', 'purple')} />
                    <span>Audit Logs</span>
                  </Link>
                )}
              </>
            ) : isAuthenticated && isTechnician ? (
              <>
                <Link to="/technician/dashboard" className={getNavLinkClass('/technician/dashboard', 'amber')}>
                  <LayoutDashboard className={getIconClass('/technician/dashboard', 'amber')} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/technician/jobs" className={getNavLinkClass('/technician/jobs', 'amber')}>
                  <ClipboardList className={getIconClass('/technician/jobs', 'amber')} />
                  <span>Job Queue</span>
                </Link>
                <Link to="/technician/schedule" className={getNavLinkClass('/technician/schedule', 'amber')}>
                  <Clock className={getIconClass('/technician/schedule', 'amber')} />
                  <span>My Schedule</span>
                </Link>
              </>
            ) : isAuthenticated && !isTechnician && !isAdmin ? (
              <>
                <Link to="/vehicles" className={getNavLinkClass('/vehicles')}>
                  <Car className={getIconClass('/vehicles')} />
                  <span>My Garage</span>
                </Link>
                <Link to="/book" className={getNavLinkClass('/book')}>
                  <Wrench className={getIconClass('/book')} />
                  <span>Book Service</span>
                </Link>
                <Link to="/appointments" className={getNavLinkClass('/appointments')}>
                  <Calendar className={getIconClass('/appointments')} />
                  <span>My Bookings</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={getNavLinkClass('/')}>
                  Home
                </Link>
                <a href="/#services" className={getNavLinkClass('/#services')}>
                  Services
                </a>
                <a href="/#centers" className={getNavLinkClass('/#centers')}>
                  Workshops
                </a>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                    {user.role !== 'Customer' && (
                      <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <span>Book Service</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/admin/dashboard')}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/admin/bookings')}
                  >
                    Bookings Queue
                  </Link>
                  <Link
                    to="/admin/technicians"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/admin/technicians')}
                  >
                    Technicians
                  </Link>
                  <Link
                    to="/admin/centers"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/admin/centers')}
                  >
                    Workshop Centers
                  </Link>
                  <Link
                    to="/admin/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/admin/services')}
                  >
                    Workshop Services
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/admin/users')}
                  >
                    User Accounts
                  </Link>
                  {isSuperAdmin && (
                    <Link
                      to="/admin/audit-logs"
                      onClick={() => setMobileMenuOpen(false)}
                      className={getMobileLinkClass('/admin/audit-logs', 'purple')}
                    >
                      System Audit Logs
                    </Link>
                  )}
                </>
              ) : isTechnician ? (
                <>
                  <Link
                    to="/technician/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/technician/dashboard', 'amber')}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/technician/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/technician/jobs', 'amber')}
                  >
                    Job Queue
                  </Link>
                  <Link
                    to="/technician/schedule"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/technician/schedule', 'amber')}
                  >
                    My Schedule
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/vehicles"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/vehicles')}
                  >
                    My Garage
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/book')}
                  >
                    Book Service
                  </Link>
                  <Link
                    to="/appointments"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/appointments')}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-rose-600 bg-rose-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout ({user?.name})</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkClass('/')}
              >
                Home
              </Link>
              <a
                href="/#services"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkClass('/#services')}
              >
                Services
              </a>
              <a
                href="/#centers"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkClass('/#centers')}
              >
                Workshops
              </a>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Book Service
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
