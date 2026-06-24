import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { HeartPulse, Menu, X, Phone, MessageSquare } from 'lucide-react';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeStyle = ({ isActive }: { isActive: boolean }) =>
    `transition duration-200 cursor-pointer text-sm font-semibold ${
      isActive ? 'text-primary' : 'text-slate-600 hover:text-primary'
    }`;

  const mobileActiveStyle = ({ isActive }: { isActive: boolean }) =>
    `text-left py-1 font-semibold transition text-sm ${
      isActive ? 'text-primary' : 'text-slate-700 hover:text-primary'
    }`;

  return (
    <div className="bg-medical-bg text-slate-800 min-h-screen selection:bg-primary/20 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Healthmark Logo" className="h-11 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-semibold">
            <NavLink to="/" end className={activeStyle}>Home</NavLink>
            <NavLink to="/about" className={activeStyle}>About Clinic</NavLink>
            <NavLink to="/doctor" className={activeStyle}>Doctor Profile</NavLink>
            <NavLink to="/services" className={activeStyle}>Treatments & Services</NavLink>
            <NavLink to="/contact" className={activeStyle}>Contact</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:80615849" className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl transition duration-200 shadow-sm flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call 8061 5849
            </a>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-slate-100 px-6 py-5 flex flex-col gap-4 font-semibold text-slate-700 animate-in slide-in-from-top duration-300">
            <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={mobileActiveStyle}>Home</NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={mobileActiveStyle}>About Clinic</NavLink>
            <NavLink to="/doctor" onClick={() => setMobileMenuOpen(false)} className={mobileActiveStyle}>Doctor Profile</NavLink>
            <NavLink to="/services" onClick={() => setMobileMenuOpen(false)} className={mobileActiveStyle}>Treatments & Services</NavLink>
            <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className={mobileActiveStyle}>Contact</NavLink>
            <hr className="border-slate-100 my-1" />
            <div className="grid grid-cols-2 gap-3">
              <a href="tel:80615849" className="bg-primary text-white text-center py-2.5 rounded-xl font-bold hover:bg-primary-dark transition flex items-center justify-center gap-2 text-sm shadow-sm">
                <Phone className="w-4 h-4" /> Call
              </a>
              <a href="https://wa.me/6580615849" target="_blank" rel="noopener noreferrer" className="bg-emerald-600 text-white text-center py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-sm shadow-sm">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass-panel text-slate-600 py-12 px-6 border-t border-slate-200/50 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center shrink-0">
            <img src="/logo.png" alt="Healthmark Logo" className="h-11 w-auto object-contain" />
          </div>
          <div className="text-xs text-slate-500">
            © 2010 Dr Katherine Lee Clinic. All rights reserved. Sim Lim Square, Singapore.
          </div>
          <div className="flex gap-6 text-xs font-bold">
            
          </div>
        </div>
      </footer>
    </div>
  );
}
