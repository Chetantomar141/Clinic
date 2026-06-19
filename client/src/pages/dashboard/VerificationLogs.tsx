import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, AlertTriangle, Calendar, Info } from 'lucide-react';
import { api } from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';

interface VerificationLog {
  id: string;
  ipAddress: string;
  device: string;
  browser: string;
  country: string;
  result: string;
  timestamp: string;
  certificate?: {
    certificateNumber: string;
    patient: { fullName: string } | null;
  } | null;
}

export default function VerificationLogs() {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, resultFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get(`/analytics/verification-logs?q=${searchQuery}&result=${resultFilter}`);
      setLogs(data || []);
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Failed to fetch verification audit log trail.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-2">Syncing verification logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Verification Portal Traffic Audit
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Track external third-party validations, IP queries, and security alerts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by IP address, browser, country, MC number..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary text-xs font-semibold transition"
          />
        </div>
        <select 
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary transition w-full sm:w-48"
        >
          <option value="">All Results</option>
          <option value="SUCCESS">Verified (SUCCESS)</option>
          <option value="FAILED_INVALID_CERT">Invalid Certificate</option>
          <option value="FAILED_IDENTITY_MISMATCH">Identity Challenge Failed</option>
          <option value="FAILED_REVOKED">Revoked Access Blocked</option>
          <option value="FAILED_EXPIRED">Expired Access Warned</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Verification Date</th>
                <th className="px-6 py-4">MC Number</th>
                <th className="px-6 py-4">Origin Details</th>
                <th className="px-6 py-4">Device / Browser</th>
                <th className="px-6 py-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-6 py-4 leading-tight font-semibold">
                    {new Date(log.timestamp).toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    {log.certificate ? log.certificate.certificateNumber : 'N/A (Missing)'}
                  </td>
                  <td className="px-6 py-4 leading-tight">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{log.ipAddress}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{log.country}</div>
                  </td>
                  <td className="px-6 py-4 leading-tight">
                    <div className="font-medium">{log.browser}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{log.device}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                      log.result === 'SUCCESS'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30'
                        : log.result.startsWith('FAILED_IDENTITY')
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-100 dark:border-amber-900/30'
                        : 'bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/30'
                    }`}>
                      {log.result.replace('FAILED_', '')}
                    </span>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No verification attempts recorded in the database log.
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
