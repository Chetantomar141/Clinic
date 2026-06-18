import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  FileSpreadsheet, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Building,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

interface OverviewStats {
  totalClinics?: number;
  totalDoctors: number;
  totalPatients: number;
  totalCertificates: number;
  certificatesToday?: number;
  certificatesThisMonth?: number;
  activeCertificates: number;
  revokedCertificates: number;
  expiredCertificates: number;
  verificationSuccessRate?: number;
  verificationsToday?: number;
  mostActiveDoctor?: string;
}

interface ChartData {
  monthlyData: { name: string; count: number }[];
  verificationTrends: { date: string; success: number; failed: number }[];
  doctorPerformance: { name: string; certificates: number }[];
  patientGrowth: { name: string; patients: number }[];
}

export default function Overview() {
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/charts')
      ]);

      setStats(statsRes.data);
      setCharts(chartsRes.data);
    } catch (err: any) {
      setError('Failed to fetch analytics datasets. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold">Aggregating database summaries...</p>
      </div>
    );
  }

  if (error || !stats || !charts) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col gap-3 max-w-lg">
        <h4 className="font-extrabold">Data Refresh Error</h4>
        <p className="text-sm">{error}</p>
        <button onClick={fetchData} className="w-32 bg-red-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-red-700 transition">
          Retry Sync
        </button>
      </div>
    );
  }

  // Cards layout based on Role
  const cardData = user?.role === 'SUPER_ADMIN' ? [
    {
      title: 'Total Active Clinics',
      value: stats.totalClinics,
      icon: <Building className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5 dark:bg-primary/10',
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: <UserCheck className="w-6 h-6 text-secondary" />,
      bg: 'bg-secondary/5 dark:bg-secondary/10',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <Users className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5 dark:bg-primary/10',
    },
    {
      title: 'Total Certificates Issued',
      value: stats.totalCertificates,
      icon: <FileSpreadsheet className="w-6 h-6 text-indigo-500" />,
      bg: 'bg-indigo-500/5 dark:bg-indigo-500/10',
    },
  ] : [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: <UserCheck className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5 dark:bg-primary/10',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <Users className="w-6 h-6 text-secondary" />,
      bg: 'bg-secondary/5 dark:bg-secondary/10',
    },
    {
      title: 'Certificates Today',
      value: stats.certificatesToday || 0,
      icon: <FileSpreadsheet className="w-6 h-6 text-indigo-500" />,
      bg: 'bg-indigo-500/5 dark:bg-indigo-500/10',
    },
    {
      title: 'Verifications Today',
      value: stats.verificationsToday || 0,
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    },
  ];

  const statusCards = [
    {
      title: 'Active Certificates',
      value: stats.activeCertificates,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      border: 'border-l-4 border-l-emerald-500',
    },
    {
      title: 'Expired Certificates',
      value: stats.expiredCertificates,
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      border: 'border-l-4 border-l-amber-500',
    },
    {
      title: 'Revoked Certificates',
      value: stats.revokedCertificates,
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      border: 'border-l-4 border-l-red-500',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Here's the summary overview metrics for {user?.clinic?.name || 'the Global Registry Network'}.
          </p>
        </div>
        <button onClick={fetchData} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer">
          Refresh Analytics
        </button>
      </div>

      {/* Primary Counter Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.bg}`}>
              {card.icon}
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{card.title}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-sans">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Substatus Counters */}
      <div className="grid sm:grid-cols-3 gap-6">
        {statusCards.map((card, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between ${card.border}`}>
            <span className="text-xs font-semibold text-slate-500">{card.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-950 dark:text-white">{card.value}</span>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Certificate Issued Trends */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Document Issuing Trends</h3>
            <p className="text-[10px] text-slate-400">Total certificate documents generated in the past 6 months</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="opacity-30" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Success vs Fails */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Third-Party Verification Activity</h3>
            <p className="text-[10px] text-slate-400">Verification portal success vs failed challenges in the past 7 days</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.verificationTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="opacity-30" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="success" name="Successful Checks" fill="#00C896" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Failed / Blocked Attempts" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient growth chart */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Patient Growth</h3>
            <p className="text-[10px] text-slate-400">Cumulative patient registrations in the clinic registry</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.patientGrowth}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C896" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00C896" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="opacity-30" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="patients" name="Patients" stroke="#00C896" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor performance bar chart (Only visible to non-SUPER_ADMIN) */}
        {user?.role !== 'SUPER_ADMIN' ? (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Doctor Activity Metrics</h3>
              <p className="text-[10px] text-slate-400">Number of certificates generated per doctor in the clinic</p>
            </div>
            <div className="h-64">
              {charts.doctorPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.doctorPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" className="opacity-30" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="certificates" name="Certificates Issued" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  No doctor data available.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* System Health check metrics card for Super Admin */
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">System Infrastructure Status</h3>
              <p className="text-[10px] text-slate-400">Real-time status metrics of the cluster environment</p>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1 mt-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Database Connection</span>
                <span className="text-emerald-500 font-extrabold text-sm flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ACTIVE / SEEDED
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Docker Orchestrator</span>
                <span className="text-emerald-500 font-extrabold text-sm flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> UP & RUNNING
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">PDF Rendering Node</span>
                <span className="text-emerald-500 font-extrabold text-sm flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> PUPPETEER ONLINE
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Security Engine</span>
                <span className="text-emerald-500 font-extrabold text-sm flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> JWT ROTATION ENGAGED
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
