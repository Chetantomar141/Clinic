import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Mail, User, Lock, Phone, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      await api.post('/auth/register', formData);
      setSuccess('Your clinic and admin account have been successfully registered! You can now log in.');
      setFormData({
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
      // Redirect after 3s
      setTimeout(() => navigate('/login'), 3500);
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Registration failed. Please check the fields and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-medical-bg min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md">
              HV
            </div>
            <span className="font-extrabold text-2xl text-slate-900 font-sans">Health<span className="text-primary">Verify</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-700">Register Your Medical Center</h2>
          <p className="text-slate-400 text-xs">Set up a multi-tenant workspace for your doctors, staff, and patients</p>
        </div>

        {/* Register Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-4 rounded-xl mb-6 flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>{success}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Redirecting you to the sign-in page...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Clinic Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase text-primary border-b border-slate-100 pb-2">1. Clinic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinic Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      name="clinicName"
                      required
                      value={formData.clinicName}
                      onChange={handleChange}
                      placeholder="Mount Elizabeth Clinic"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinic Contact Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="email"
                      name="clinicEmail"
                      required
                      value={formData.clinicEmail}
                      onChange={handleChange}
                      placeholder="info@clinic.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinic Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      name="clinicPhone"
                      required
                      value={formData.clinicPhone}
                      onChange={handleChange}
                      placeholder="+65 6789 0123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinic Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                    <textarea 
                      name="clinicAddress"
                      required
                      rows={2}
                      value={formData.clinicAddress}
                      onChange={handleChange}
                      placeholder="3 Mount Elizabeth, Singapore"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Admin Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase text-primary border-b border-slate-100 pb-2">2. Administrator Credentials</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Sarah"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Lim"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Account Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="email"
                      name="adminEmail"
                      required
                      value={formData.adminEmail}
                      onChange={handleChange}
                      placeholder="sarah.lim@clinic.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="password"
                      name="adminPassword"
                      required
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      name="adminPhone"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      placeholder="+65 9111 2222"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary text-xs font-semibold transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition shadow-md shadow-primary/20 cursor-pointer"
            >
              {loading ? 'Creating workspace...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have a clinic registered? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
