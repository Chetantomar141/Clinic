import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { 
  ShieldCheck, 
  QrCode, 
  Users, 
  FileText, 
  Activity, 
  Eye, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  Menu,
  X,
  Lock,
  Building,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.gsap-hero-badge', { opacity: 0, y: -20, duration: 0.8, ease: 'power3.out' });
      gsap.from('.gsap-hero-title', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.from('.gsap-hero-desc', { opacity: 0, y: 30, duration: 1, delay: 0.4, ease: 'power3.out' });
      gsap.from('.gsap-hero-btn', { opacity: 0, scale: 0.9, duration: 0.8, delay: 0.6, ease: 'back.out(1.7)' });
      gsap.from('.gsap-hero-card', { opacity: 0, x: 50, duration: 1.2, delay: 0.4, ease: 'power3.out' });

      // Stats stagger
      gsap.from('.gsap-stat-item', { 
        opacity: 0, 
        y: 20, 
        duration: 0.8, 
        delay: 0.8, 
        stagger: 0.15,
        ease: 'power2.out' 
      });

      // Feature cards stagger
      gsap.from('.gsap-feature-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 1,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '1,000+', label: 'Active Clinics' },
    { value: '50,000+', label: 'Registered Doctors' },
    { value: '5M+', label: 'Certificates Verified' },
    { value: '99.99%', label: 'Accuracy Rating' }
  ];

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: 'Digital Medical Certificates',
      description: 'Issue sick leaves, medical reports, and fitness certs in seconds with secure digital signatures.'
    },
    {
      icon: <QrCode className="w-6 h-6 text-secondary" />,
      title: 'Secure QR Verification',
      description: 'Each certificate carries an encrypted QR code. Verify instantly from any mobile camera.'
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: 'Doctor Management',
      description: 'Manage clinical licenses, upload digital signatures, and track doctor issuing analytics.'
    },
    {
      icon: <Activity className="w-6 h-6 text-secondary" />,
      title: 'Patient Records & Timeline',
      description: 'Review patient certificate histories, diagnosis logs, and historical leave request records.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: 'Cryptographic Auditing',
      description: 'SHA-256 validation hashes protect every document from tempering and forgery.'
    },
    {
      icon: <Building className="w-6 h-6 text-secondary" />,
      title: 'Multi-Clinic SaaS Operations',
      description: 'Hospitals and medical networks can administer multiple clinic branches with data isolation.'
    }
  ];

  const faqs = [
    {
      question: 'How does the QR verification work?',
      answer: 'Every issued certificate automatically generates a QR code containing a secure verification URL. When scanned by an employer or verifier, it routes to our portal which cross-checks the cryptographic signature hash in our database.'
    },
    {
      question: 'Is patient medical data exposed publicly?',
      answer: 'No. To ensure strict medical confidentiality (PDPA / HIPAA compliant), the public verification portal masks the patient name and identification number, and never displays the specific diagnosis or medical history.'
    },
    {
      question: 'Can clinics customize the certificate branding?',
      answer: 'Yes! Clinic Admins can upload their hospital or clinic logo, configure address/contact details, and apply custom branding styles directly from the dashboard.'
    },
    {
      question: 'What is the verification hash?',
      answer: 'It is a unique SHA-256 cryptographic signature calculated using the certificate ID, patient ID, doctor ID, and date of issue combined with a secure system key. This guarantees document integrity.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div ref={containerRef} className="bg-medical-bg text-slate-800 min-h-screen selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
              HV
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">Health<span className="text-primary">Verify</span></span>
              <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider -mt-1">Enterprise SaaS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-primary transition">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition">How It Works</a>
            <a href="#faq" className="hover:text-primary transition">FAQs</a>
            <a href="#contact" className="hover:text-primary transition">Contact</a>
            <Link to="/verify" className="flex items-center gap-1.5 text-secondary hover:text-secondary-dark font-semibold transition border border-secondary/30 bg-secondary/5 px-4 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" /> Verify Portal
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-xl transition shadow-md shadow-primary/25">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-xl transition shadow-md shadow-primary/25">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-slate-200 px-6 py-4 flex flex-col gap-4 font-semibold text-slate-700 animate-in slide-in-from-top duration-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary">How It Works</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary">FAQs</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary">Contact</a>
            <hr className="border-slate-200" />
            <Link to="/verify" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 text-secondary border border-secondary/30 bg-secondary/5 py-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4" /> Verify Portal
            </Link>
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="bg-primary text-white text-center py-2.5 rounded-xl shadow-lg">
                Go to Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-primary text-white text-center py-2.5 rounded-xl hover:bg-primary-dark transition shadow-md">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 px-6">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="gsap-hero-badge inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-primary font-bold text-sm">
              <Lock className="w-4 h-4" /> Secure Singapore Standard Integration
            </div>
            <h1 className="gsap-hero-title text-4xl md:text-6xl font-black text-slate-900 leading-tight font-sans">
              Trusted Medical Certificate <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Verification Platform</span>
            </h1>
            <p className="gsap-hero-desc text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed">
              Issue, manage, verify, and audit healthcare certificates with enterprise-grade security, QR validation, and complete data isolation.
            </p>
            <div className="gsap-hero-btn flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/verify" className="bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 rounded-2xl text-center shadow-lg shadow-secondary/25 flex items-center justify-center gap-2 group transition">
                Verify Certificate <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
          
          <div className="gsap-hero-card md:col-span-5 relative">
            <div className="w-full aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-tr from-primary to-secondary p-[1px] shadow-2xl">
              <div className="w-full h-full bg-white rounded-3xl p-6 flex flex-col justify-between">
                {/* Simulated Certificate UI */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900">Polyclinic Medical Group</h4>
                    <p className="text-[10px] text-slate-400">SINGAPORE HEALTH SERVICES</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black">
                    P
                  </div>
                </div>

                <div className="my-6 space-y-4">
                  <div className="text-center font-bold text-sm tracking-wider text-slate-400 uppercase">Medical Certificate</div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Patient Name</span>
                      <span className="text-xs font-semibold text-slate-700">SUK**** KAUR</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">NRIC / ID</span>
                      <span className="text-xs font-semibold text-slate-700">S*****567A</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Valid From</span>
                      <span className="text-xs font-semibold text-slate-700">16 Jun 2026</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Duration</span>
                      <span className="text-xs font-bold text-primary">2 Days</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                      <QrCode className="w-8 h-8 text-slate-700" />
                    </div>
                    <div className="text-[9px] text-slate-400 leading-tight">
                      Scan to verify authenticity<br/>
                      <span className="font-mono text-[7px] text-slate-500">SHA-256 Cryptographic Secure</span>
                    </div>
                  </div>
                  <div className="w-16 h-8 border border-emerald-300 rounded bg-emerald-50 text-emerald-600 font-bold text-[9px] flex items-center justify-center gap-1 shadow-sm glow-green">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> VERIFIED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="gsap-stat-item text-center space-y-1">
              <div className="text-3xl md:text-5xl font-black text-slate-900 font-sans tracking-tight">{stat.value}</div>
              <div className="text-sm text-slate-500 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-sans">Complete Enterprise Core Features</h2>
          <p className="text-slate-500">
            A production-ready environment designed specifically to meet compliance and data privacy requirements for medical networks.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="gsap-feature-card bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary/5 transition">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white border-y border-slate-200 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-sans">Simple Secure Flow</h2>
            <p className="text-slate-500">How the platform bridges clinics, patients, and third-party verifiers securely.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-extrabold text-lg flex items-center justify-center mx-auto">1</div>
              <h4 className="font-bold text-slate-950">Clinic Issues</h4>
              <p className="text-xs text-slate-400">Doctor creates the certificate. System generates sequential numbers, computes SHA-256 and compiles QR.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-secondary text-white font-extrabold text-lg flex items-center justify-center mx-auto">2</div>
              <h4 className="font-bold text-slate-950">Patient Downloads</h4>
              <p className="text-xs text-slate-400">Patient receives an email notification with a secure PDF file containing verification details.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-extrabold text-lg flex items-center justify-center mx-auto">3</div>
              <h4 className="font-bold text-slate-950">Verifier Scans</h4>
              <p className="text-xs text-slate-400">Employer scans the QR printed on the physical certificate, opening the verification page.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-secondary text-white font-extrabold text-lg flex items-center justify-center mx-auto">4</div>
              <h4 className="font-bold text-slate-950">Platform Validates</h4>
              <p className="text-xs text-slate-400">Verifier inputs the patient's ID. Platform confirms validity, showing masked authenticity results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-sans">Frequently Asked Questions</h2>
          <p className="text-slate-500">Got questions? We have answers to common operational inquiries.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-primary shrink-0" /> {faq.question}
              </h4>
              <p className="text-slate-500 text-sm pl-7 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white border-t border-slate-200 py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-950 font-sans">Contact Our Team</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Have questions about deploying our SaaS platform across your medical branches, licensing, or security guidelines? Drop us a line.
            </p>
            <div className="space-y-4 text-slate-600 font-medium text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>support@healthverify.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" />
                <span>+65 6789 0123</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Marina Boulevard, Singapore 018982</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-3xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-xl">Thank you for your message!</h4>
                <p className="text-sm text-emerald-600">Our medical representative will contact you in the next 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm transition"
                    placeholder="Sarah Lim"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm transition"
                    placeholder="sarah@clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm transition resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition shadow-md shadow-primary/20">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-sm">
              HV
            </div>
            <span className="font-extrabold text-lg text-white font-sans">Health<span className="text-primary">Verify</span></span>
          </div>
          <div className="text-xs text-slate-500">
            © 2026 HealthVerify SaaS Singapore. All rights reserved. Developed for secure healthcare validation.
          </div>
          <div className="flex gap-6 text-xs font-semibold">
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/verify" className="hover:text-white transition">Verify Document</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
