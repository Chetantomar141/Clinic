import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building, 
  UserCheck, 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  ChevronDown,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Force Light Theme on mount
  useEffect(() => {
    setDarkMode(false);
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Sidebar Links based on Role
  const links = [
    {
      to: '/dashboard/overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'STAFF'],
    },
    {
      to: '/dashboard/clinics',
      label: 'Clinics',
      icon: <Building className="w-5 h-5" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      to: '/dashboard/doctors',
      label: 'Doctors',
      icon: <UserCheck className="w-5 h-5" />,
      roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'],
    },
    {
      to: '/dashboard/staff',
      label: 'Clinic Staff',
      icon: <Users className="w-5 h-5" />,
      roles: ['CLINIC_ADMIN'],
    },
    {
      to: '/dashboard/patients',
      label: 'Patients Directory',
      icon: <Users className="w-5 h-5" />,
      roles: ['CLINIC_ADMIN', 'DOCTOR', 'STAFF'],
    },
    {
      to: '/dashboard/certificates',
      label: 'Certificates',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      roles: ['CLINIC_ADMIN', 'DOCTOR', 'STAFF'],
    },
    {
      to: '/dashboard/verification-logs',
      label: 'Verification Logs',
      icon: <ShieldCheck className="w-5 h-5" />,
      roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'],
    },
    {
      to: '/dashboard/audit-logs',
      label: 'System Audit Trail',
      icon: <History className="w-5 h-5" />,
      roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'],
    },
    {
      to: '/dashboard/settings',
      label: 'Clinic Settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['CLINIC_ADMIN'],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-medical-bg dark:bg-slate-900 transition-colors duration-200">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-md">
        {/* Brand */}
        <div className="h-20 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
              HV
            </div>
            <div>
              <span className="font-extrabold text-md text-slate-900 dark:text-white">Health<span className="text-primary">Verify</span></span>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider -mt-1">{user.role.replace('_', ' ')}</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 flex justify-between items-center relative z-25">
          {/* Left: Mobile hamburger */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Clinic details if multi-tenant */}
            {user.clinic ? (
              <div className="flex items-center gap-2">
                {user.clinic.logoUrl ? (
                  <img src={user.clinic.logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                    {user.clinic.name[0]}
                  </div>
                )}
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 hidden sm:block">
                  {user.clinic.name}
                </span>
              </div>
            ) : (
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest text-primary">
                GLOBAL ADMIN REGISTRY
              </span>
            )}
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-sm">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.firstName} {user.lastName}</div>
                  <div className="text-[9px] text-slate-400 font-semibold">{user.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdown && (
                <>
                  <div onClick={() => setProfileDropdown(false)} className="fixed inset-0 z-10"></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400">Signed in as</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{user.email}</div>
                    </div>
                    
                    <Link 
                      to="/dashboard/overview" 
                      onClick={() => setProfileDropdown(false)}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </Link>

                    <button 
                      onClick={() => {
                        setProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {(() => {
            const currentLink = links.find((link) => location.pathname === link.to);
            const isAuthorized = !currentLink || currentLink.roles.includes(user.role);

            if (isAuthorized) {
              return <Outlet />;
            }

            return (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 mb-4 shadow-sm">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-sans">Access Denied</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1.5 max-w-sm leading-relaxed">
                  Your account role (<span className="text-primary font-bold">{user.role.replace('_', ' ')}</span>) is not authorized to access the panel at <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-red-500">{location.pathname}</code>.
                </p>
                <button 
                  onClick={() => navigate('/dashboard/overview')} 
                  className="mt-6 bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-primary/20 cursor-pointer"
                >
                  Return to Dashboard Overview
                </button>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm"></div>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40 lg:hidden flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="h-20 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                  HV
                </div>
                <div>
                  <span className="font-extrabold text-md text-slate-900 dark:text-white">HealthVerify</span>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </>
      )}

    </div>
  );
}
