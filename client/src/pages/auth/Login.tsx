import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';
import { useAuthStore } from '../../store/authStore';
import gsap from 'gsap';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gsap-login-logo', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.gsap-login-title', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
      gsap.fromTo('.gsap-login-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.gsap-login-input', { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.6, delay: 0.4, stagger: 0.1, ease: 'power2.out' });
      gsap.fromTo('.gsap-login-btn', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: 'power2.out' });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (!response?.data?.user || !response.data.accessToken || !response.data.refreshToken) {
        throw new Error('Invalid response from authentication service.');
      }

      const { data } = response;

      // Save to Zustand and LocalStorage
      setAuth(data.user, data.accessToken, data.refreshToken);

      // Redirect to dashboard overview
      navigate('/dashboard/overview');
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-medical-bg min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="gsap-login-logo inline-block">
            <img src="/logo.png" alt="Healthmark Logo" className="h-12 w-auto object-contain mx-auto" />
          </Link>
          <div className="gsap-login-title space-y-1">
            <h2 className="text-xl font-bold text-slate-700 mt-2">Doctor Portal</h2>
            <p className="text-slate-400 text-xs">Sign in to your clinical dashboard</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="gsap-login-card bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden border-t-4 border-t-primary">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="gsap-login-input">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@clinic.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-primary text-sm font-semibold transition"
                />
              </div>
            </div>

            <div className="gsap-login-input">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-primary text-sm font-semibold transition"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" className="rounded text-primary focus:ring-primary border-slate-300 w-3.5 h-3.5" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline font-semibold">Forgot Password?</a>
            </div>

            <div className="gsap-login-btn">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-primary/20 cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>


        </div>

      </div>
    </div>
  );
}
