import React, { useState, useEffect } from 'react';
import { History, Search, AlertTriangle, User } from 'lucide-react';
import { api } from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/analytics/audit-logs?q=${searchQuery}&action=${actionFilter}`);
      setLogs(data || []);
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Failed to fetch internal audit trail logs.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2">Syncing audit trail logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-primary" /> Internal Workspace Audit Trail
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Track diagnostic changes, certificate revocations, and staff authorizations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action description, operator name..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary text-xs font-semibold transition"
          />
        </div>
        <select 
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary transition w-full sm:w-48"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">Sign In (LOGIN)</option>
          <option value="LOGOUT">Sign Out (LOGOUT)</option>
          <option value="CERTIFICATE_CREATE">Issue Certificate</option>
          <option value="CERTIFICATE_REVOKE">Revoke Certificate</option>
          <option value="DOCTOR_CREATE">Add Doctor</option>
          <option value="STAFF_CREATE">Add Staff</option>
          <option value="PATIENT_CREATE">Register Patient</option>
          <option value="CLINIC_UPDATE">Branding Edits</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Roster list */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Operator User</th>
                <th className="px-6 py-4">Change Log Details</th>
                <th className="px-6 py-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-6 py-4 leading-tight font-semibold">
                    {new Date(log.timestamp).toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase ${
                      log.action.includes('CREATE')
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30'
                        : log.action.includes('REVOKE')
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/30'
                        : 'bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10 dark:border-primary/20'
                    }`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 leading-tight">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System / Guest'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {log.user ? `${log.user.role} (${log.user.email})` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-sm font-medium">{log.details}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No administrative audit trails logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
