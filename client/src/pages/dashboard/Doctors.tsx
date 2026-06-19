import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Upload, Trash2, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';

interface Doctor {
  id: string;
  licenseNumber: string;
  specialization: string;
  signatureUrl?: string | null;
  isSuspended: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  clinic?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    certificates: number;
  };
}

export default function Doctors() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
    licenseNumber: '',
    specialization: '',
  });
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/doctors');
      setDoctors(response?.data || []);
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Failed to fetch doctor roster.'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSignatureFile(e.target.files[0]);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val);
      });
      if (signatureFile) {
        data.append('signature', signatureFile);
      }

      await api.post('/doctors', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset
      setModalOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        licenseNumber: '',
        specialization: '',
      });
      setSignatureFile(null);
      fetchDoctors();
    } catch (err: unknown) {
      console.error(err);
      setModalError(getApiErrorMessage(err, 'Failed to create doctor record.'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentlySuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlySuspended ? 'reactivate' : 'suspend'} this doctor?`)) {
      return;
    }
    try {
      await api.post(`/doctors/${id}/toggle-status`, { suspend: !currentlySuspended });
      fetchDoctors();
    } catch (err: unknown) {
      console.error(err);
      alert(getApiErrorMessage(err, 'Failed to update doctor status'));
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err: unknown) {
      console.error(err);
      alert(getApiErrorMessage(err, 'Failed to delete doctor'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2">Syncing doctor records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" /> Attending Doctors Directory
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage licenses, specialties, and digital signatures</p>
        </div>
        {!isSuperAdmin && (
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(doctors || []).map((doc) => (
          <div key={doc?.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-md">Dr. {doc?.user?.firstName} {doc?.user?.lastName}</h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{doc?.specialization}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                doc?.isSuspended 
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/30' 
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30'
              }`}>
                {doc?.isSuspended ? 'Suspended' : 'Active'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs border-y border-slate-100 dark:border-slate-800 py-3 text-slate-600 dark:text-slate-400">
              {doc?.clinic?.name && (
                <div className="flex justify-between">
                  <span>Clinic:</span>
                  <span className="font-bold text-primary">{doc.clinic.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>License Number:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{doc?.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Email Address:</span>
                <span className="font-semibold">{doc?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact Phone:</span>
                <span className="font-semibold">{doc?.user?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>MCs Issued:</span>
                <span className="font-bold text-primary">{doc?._count?.certificates || 0}</span>
              </div>
            </div>

            {!isSuperAdmin && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleStatus(doc.id, doc.isSuspended)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                    doc.isSuspended 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {doc.isSuspended ? 'Activate' : 'Suspend'}
                </button>
                <button 
                  onClick={() => handleDeleteDoctor(doc.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition cursor-pointer"
                  title="Delete Doctor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {(doctors || []).length === 0 && (
          <div className="col-span-3 bg-white dark:bg-slate-950 p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 rounded-3xl">
            No doctors registered in the clinic roster.
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-md">Register New Doctor</h3>
              <p className="text-[10px] text-slate-400">Fill in details and upload signature to add a doctor</p>
            </div>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">License Number</label>
                  <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleInputChange} placeholder="e.g. MCR-12345" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Specialization</label>
                  <input type="text" name="specialization" required value={formData.specialization} onChange={handleInputChange} placeholder="e.g. Cardiology" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Digital Signature Image</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer relative">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  {signatureFile ? (
                    <span className="text-xs font-bold text-primary">{signatureFile.name}</span>
                  ) : (
                    <span className="text-xs text-slate-400">Click to upload signature (PNG with transparent bg)</span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                {submitLoading ? 'Registering Doctor...' : 'Register Doctor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
