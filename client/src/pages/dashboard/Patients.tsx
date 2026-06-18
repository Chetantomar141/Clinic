import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Search, Calendar, Eye, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';

interface Patient {
  id: string;
  fullName: string;
  identifier: string; // Passport / NRIC
  dob: string;
  gender: string;
  phone: string;
  email: string;
  createdAt: string;
  _count?: {
    certificates: number;
  };
}

interface TimelineItem {
  id: string;
  type: string;
  date: string;
  title: string;
  description: string;
  status: string;
  meta: any;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Registering Patient
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    identifier: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
  });

  // Selected Patient Details Timeline Drawer
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientTimeline, setPatientTimeline] = useState<TimelineItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/patients?q=${searchQuery}`);
      setPatients(data);
    } catch (err: any) {
      setError('Failed to fetch patient directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitLoading(true);

    try {
      await api.post('/patients', formData);
      setModalOpen(false);
      setFormData({
        fullName: '',
        identifier: '',
        dob: '',
        gender: 'Male',
        phone: '',
        email: '',
      });
      fetchPatients();
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to register patient record.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenTimeline = async (patient: Patient) => {
    try {
      setDrawerLoading(true);
      setSelectedPatient(patient);
      setDrawerOpen(true);
      
      const { data } = await api.get(`/patients/${patient.id}`);
      setPatientTimeline(data.timeline);
    } catch (err: any) {
      alert('Failed to retrieve patient historical timeline');
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete patient ${name}? All associated medical certificate records will remain but the patient listing will be soft-deleted.`)) {
      return;
    }
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
      if (selectedPatient?.id === id) {
        setDrawerOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to soft delete patient.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Clinic Patient Registry
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Register patients and trace historical leave timelines</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ID number (NRIC, Passport)..."
          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary text-xs font-semibold transition"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Roster list */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">NRIC / Passport</th>
                <th className="px-6 py-4">Birth Date</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4 text-center">MCs Issued</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {patients.map((pat) => (
                <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{pat.fullName}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{pat.identifier}</td>
                  <td className="px-6 py-4">{new Date(pat.dob).toLocaleDateString('en-SG')}</td>
                  <td className="px-6 py-4 leading-tight">
                    <div>{pat.email}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{pat.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-extrabold text-primary">{pat._count?.certificates || 0}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenTimeline(pat)}
                      className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-600 dark:text-slate-300 p-2 rounded-xl transition cursor-pointer"
                      title="View Timeline"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePatient(pat.id, pat.fullName)}
                      className="bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-500 p-2 rounded-xl transition cursor-pointer"
                      title="Delete Patient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {patients.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No patients registered under this clinic query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline Slide-over Drawer */}
      {drawerOpen && selectedPatient && (
        <>
          <div onClick={() => setDrawerOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 backdrop-blur-sm"></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-40 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-md">{selectedPatient.fullName}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">National Registry Timeline (ID: {selectedPatient.identifier})</p>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {drawerLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8">
                  {patientTimeline.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      {/* Node Bullet */}
                      <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-950 ${
                        item.type === 'CERTIFICATE_ISSUED' 
                          ? 'border-primary' 
                          : 'border-slate-400'
                      }`}></div>

                      <div className="space-y-1.5 leading-tight">
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(item.date).toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</h4>
                        <p className="text-[11px] text-slate-500">{item.description}</p>
                        
                        {item.type === 'CERTIFICATE_ISSUED' && (
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-[10px] text-slate-500 space-y-1 mt-2">
                            <div><strong>Leave Range:</strong> {new Date(item.meta.startDate).toLocaleDateString('en-SG')} to {new Date(item.meta.endDate).toLocaleDateString('en-SG')} ({item.meta.durationDays} Days)</div>
                            <div><strong>Assessment:</strong> {item.meta.diagnosis}</div>
                            <div className="flex items-center gap-1 mt-1 text-emerald-600 dark:text-emerald-500 font-bold uppercase text-[8px] tracking-wider bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-1.5 py-0.5 rounded w-fit">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" /> STATUS: {item.status}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {patientTimeline.length === 0 && (
                    <div className="text-center text-slate-400 text-xs py-8">
                      No records found for this patient timeline.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setDrawerOpen(false)}
                className="w-28 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition border border-slate-200 cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Patient Modal */}
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
              <h3 className="font-extrabold text-slate-900 dark:text-white text-md">Register New Patient</h3>
              <p className="text-[10px] text-slate-400">Add patient demographics into the clinic database</p>
            </div>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">NRIC / Passport</label>
                  <input type="text" name="identifier" required value={formData.identifier} onChange={handleInputChange} placeholder="e.g. S1234567A" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="+65 9123 4567" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="patient@gmail.com" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none focus:border-primary transition" />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                {submitLoading ? 'Registering Patient...' : 'Register Patient'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
