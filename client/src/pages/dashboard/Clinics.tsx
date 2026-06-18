import React, { useState, useEffect } from 'react';
import { Building, ShieldCheck, User, ShieldAlert, CheckCircle2, AlertCircle, Plus, X, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { api } from '../../api/axios';

interface Clinic {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  logoUrl?: string | null;
  users: { id: string; email: string; firstName: string; lastName: string }[];
  subscriptions: { planName: string; status: string; endDate: string }[];
}

export default function Clinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Register Clinic Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    clinicName: '',
    clinicEmail: '',
    clinicPhone: '',
    clinicAddress: '',
    firstName: '',
    lastName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleRegisterClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      await api.post('/auth/register', registerForm);
      setRegisterModalOpen(false);
      setRegisterForm({
        clinicName: '',
        clinicEmail: '',
        clinicPhone: '',
        clinicAddress: '',
        firstName: '',
        lastName: '',
        adminEmail: '',
        adminPassword: '',
        adminPhone: '',
      });
      fetchClinics();
    } catch (err: any) {
      setRegisterError(err.response?.data?.error || 'Failed to register clinic.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/clinics');
      setClinics(response.data);
    } catch (err: any) {
      setError('Failed to fetch clinics. Make sure you are logged in as a Super Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentlySuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlySuspended ? 'activate' : 'suspend'} this clinic workspace?`)) {
      return;
    }
    try {
      await api.post(`/clinics/${id}/toggle-status`, { suspend: !currentlySuspended });
      fetchClinics();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update clinic status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2">Loading clinics workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" /> Registered Medical Clinics
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage SaaS tenants, plan billing, and clinic suspensions</p>
        </div>
        <button 
          onClick={() => setRegisterModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer animate-in fade-in duration-300"
        >
          <Plus className="w-4 h-4" /> Register Clinic
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {(clinics || []).map((clinic) => {
          const sub = clinic?.subscriptions?.[0];
          const clinicUsers = clinic?.users || [];
          const isSuspended = clinicUsers.length > 0 && (clinicUsers[0] as any).isSuspended;
          
          return (
            <div key={clinic?.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {clinic?.logoUrl ? (
                    <img src={clinic.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain border border-slate-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg uppercase">
                      {clinic?.name?.[0] || 'C'}
                    </div>
                  )}
                  <div className="leading-tight">
                    <h3 className="font-extrabold text-slate-950 dark:text-white text-md">{clinic?.name}</h3>
                    <p className="text-[10px] text-slate-400">{clinic?.email} | {clinic?.contactNumber}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                  isSuspended 
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 dark:border-red-800/30' 
                    : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800/30'
                }`}>
                  {isSuspended ? 'Suspended' : 'Active'}
                </span>
              </div>

              <div className="space-y-2 text-xs border-y border-slate-100 dark:border-slate-800 py-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Clinic Admin:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {clinicUsers.length > 0 ? `${clinicUsers[0].firstName} ${clinicUsers[0].lastName} (${clinicUsers[0].email})` : 'No Admin'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Subscription:</span>
                  <span className="font-bold text-primary">
                    {sub ? `${sub.planName} (${sub.status})` : 'No Active Plan'}
                  </span>
                </div>
                {sub && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Plan End Date:</span>
                    <span className="font-semibold text-slate-500">
                      {new Date(sub.endDate).toLocaleDateString('en-SG')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleToggleStatus(clinic.id, isSuspended)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    isSuspended 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                      : 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20'
                  }`}
                >
                  {isSuspended ? 'Activate Workspace' : 'Suspend Workspace'}
                </button>
              </div>
            </div>
          );
        })}

        {(clinics || []).length === 0 && (
          <div className="col-span-2 bg-white dark:bg-slate-950 p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 rounded-3xl">
            No clinics registered in the network database.
          </div>
        )}
      </div>

      {/* Register Clinic Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setRegisterModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-md">Register New Medical Clinic</h3>
              <p className="text-[10px] text-slate-400">Initialize a new SaaS clinic workspace and admin account</p>
            </div>

            {registerError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterClinic} className="space-y-6">
              {/* Section 1: Clinic Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase text-primary border-b border-slate-100 dark:border-slate-800 pb-2">1. Clinic Information</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text"
                        name="clinicName"
                        required
                        value={registerForm.clinicName}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. Mount Elizabeth Clinic"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="email"
                        name="clinicEmail"
                        required
                        value={registerForm.clinicEmail}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. info@clinic.com"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text"
                        name="clinicPhone"
                        required
                        value={registerForm.clinicPhone}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. +65 6789 0123"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                      <textarea 
                        name="clinicAddress"
                        required
                        rows={2}
                        value={registerForm.clinicAddress}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. 3 Mount Elizabeth, Singapore"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Admin Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase text-primary border-b border-slate-100 dark:border-slate-800 pb-2">2. Administrator Credentials</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text"
                        name="firstName"
                        required
                        value={registerForm.firstName}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. Sarah"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text"
                        name="lastName"
                        required
                        value={registerForm.lastName}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. Lim"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Admin Account Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="email"
                        name="adminEmail"
                        required
                        value={registerForm.adminEmail}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. sarah.lim@clinic.com"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Admin Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="password"
                        name="adminPassword"
                        required
                        value={registerForm.adminPassword}
                        onChange={handleRegisterInputChange}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Admin Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text"
                        name="adminPhone"
                        value={registerForm.adminPhone}
                        onChange={handleRegisterInputChange}
                        placeholder="e.g. +65 9111 2222"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={registerLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md shadow-primary/20 cursor-pointer"
              >
                {registerLoading ? 'Creating workspace...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
