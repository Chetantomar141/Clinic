import React, { useState, useEffect } from 'react';
import { Settings, Upload, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';

export default function ClinicSettings() {
  const { user } = useAuthStore();
  
  // Clinic Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    themeConfig: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/clinics/profile');
      setProfileData({
        name: data?.name || '',
        email: data?.email || '',
        contactNumber: data?.contactNumber || '',
        address: data?.address || '',
        themeConfig: data?.themeConfig || '',
      });
    } catch (err: unknown) {
      console.error('Failed to fetch clinic settings', err);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      const data = new FormData();
      Object.entries(profileData).forEach(([key, val]) => {
        data.append(key, val);
      });
      if (logoFile) {
        data.append('logo', logoFile);
      }

      await api.put('/clinics/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfileSuccess('Clinic profile configuration saved successfully.');
      setLogoFile(null);
      fetchProfile();
    } catch (err: unknown) {
      console.error(err);
      setProfileError(getApiErrorMessage(err, 'Failed to save clinic configurations.'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);
    setPasswordLoading(true);

    try {
      await api.post('/users/change-password', passwordData);
      setPasswordSuccess('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err: unknown) {
      console.error(err);
      setPasswordError(getApiErrorMessage(err, 'Failed to update password.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Clinic Branding & Account Settings
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Customize clinic identity details, dashboard options, and update credentials</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Clinic Branding Settings Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Clinic Profile Settings</h3>
          
          {profileSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Brand Name</label>
              <input type="text" name="name" required value={profileData.name} onChange={handleProfileChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branding Email</label>
                <input type="email" name="email" required value={profileData.email} onChange={handleProfileChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
                <input type="text" name="contactNumber" required value={profileData.contactNumber} onChange={handleProfileChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mailing Address</label>
              <textarea name="address" required rows={2} value={profileData.address} onChange={handleProfileChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition resize-none"></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload New Logo</label>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer relative">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                {logoFile ? (
                  <span className="text-[10px] font-bold text-primary">{logoFile.name}</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Drag or click to upload logo file</span>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={profileLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
            >
              {profileLoading ? 'Saving changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Settings Card */}
        <div className="md:col-span-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 self-start">
          <h3 className="font-extrabold text-sm text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Update Password</h3>
          
          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Current Password</label>
              <input type="password" name="currentPassword" required value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Secure Password</label>
              <input type="password" name="newPassword" required value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
            </div>

            <button 
              type="submit" 
              disabled={passwordLoading}
              className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
            >
              {passwordLoading ? 'Updating credentials...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
