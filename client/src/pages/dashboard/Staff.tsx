import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';

interface Staff {
  id: string;
  position: string;
  isSuspended: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
}

export default function Staff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/staff');
      setStaff(data);
    } catch (err: any) {
      setError('Failed to fetch clinic staff roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitLoading(true);

    try {
      await api.post('/staff', formData);
      setModalOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        position: '',
      });
      fetchStaff();
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to create staff member.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentlySuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlySuspended ? 'reactivate' : 'suspend'} this staff member?`)) {
      return;
    }
    try {
      await api.post(`/staff/${id}/toggle-status`, { suspend: !currentlySuspended });
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update staff status');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete staff member');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2">Syncing staff records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Clinic Staff Directory
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage receptionist and clinic team workspaces</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((st) => (
          <div key={st.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-md">{st.user.firstName} {st.user.lastName}</h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{st.position}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                st.isSuspended 
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/30' 
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30'
              }`}>
                {st.isSuspended ? 'Suspended' : 'Active'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs border-y border-slate-100 dark:border-slate-800 py-3 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Email Address:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{st.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact Phone:</span>
                <span className="font-semibold">{st.user.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleToggleStatus(st.id, st.isSuspended)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  st.isSuspended 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {st.isSuspended ? 'Activate' : 'Suspend'}
              </button>
              <button 
                onClick={() => handleDeleteStaff(st.id)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition cursor-pointer"
                title="Delete Staff"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="col-span-3 bg-white dark:bg-slate-950 p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 rounded-3xl">
            No staff members registered in the clinic directory.
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-md">Register New Staff</h3>
              <p className="text-[10px] text-slate-400">Add administrative or support accounts to the clinic workspace</p>
            </div>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Position / Role</label>
                <input type="text" name="position" required value={formData.position} onChange={handleInputChange} placeholder="e.g. Clinic Receptionist" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                {submitLoading ? 'Registering Staff...' : 'Register Staff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
