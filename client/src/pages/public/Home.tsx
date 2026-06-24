import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Award, HeartPulse, MapPin, Calendar, ArrowRight, Phone } from 'lucide-react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animations
      gsap.fromTo('.gsap-banner', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.gsap-hero', { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.gsap-trust', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, stagger: 0.15, ease: 'power2.out' });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const trustCards = [
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: 'Experienced Doctor',
      desc: 'Expert care by Dr Katherine Lee with a focus on comprehensive primary health and patient wellness.'
    },
    {
      icon: <HeartPulse className="w-6 h-6 text-secondary" />,
      title: 'Patient-Centered Care',
      desc: 'Personalized treatments and compassionate advice tailored to your specific healthcare needs.'
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: 'Convenient Singapore Location',
      desc: 'Located centrally at Sim Lim Square, highly accessible with excellent transit links.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-secondary" />,
      title: 'Easy Appointment Booking',
      desc: 'Book easily online, call directly, or chat via WhatsApp for prompt medical session scheduling.'
    }
  ];

  return (
    <div ref={containerRef} className="bg-white min-h-screen py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Healthier SG Banner Section */}
        <div className="gsap-banner flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Healthier SG Stylized Logo */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-rose-600 flex flex-col items-center justify-center leading-none text-center p-1 bg-white shadow-sm shrink-0">
                <span className="text-[7px] font-black text-rose-600 uppercase tracking-tighter">Healthier</span>
                <span className="text-[13px] font-extrabold text-rose-600 tracking-tighter -mt-0.5">SG</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-300 mx-2 hidden sm:block"></div>
              
              {/* Forward SG Stylized Logo */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block sm:inline">An Initiative of</span>
                <span className="font-extrabold text-slate-800 text-sm tracking-tight">FORWARD</span>
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">SG</span>
              </div>
            </div>

          </div>

          {/* Banner Text Headline */}
          <div className="text-center md:text-right font-sans shrink-0">
            <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
              WE ARE NOW A
            </h2>
            <h2 className="text-2xl md:text-4xl font-black text-rose-600 tracking-tight leading-none mt-1">
              HEALTHIER SG <span className="text-slate-900">CLINIC!</span>
            </h2>
          </div>
        </div>

        {/* Hero Section with Consult Doctor Background */}
        <div className="gsap-hero relative min-h-[500px] md:min-h-[600px] w-full rounded-3xl overflow-hidden shadow-md border border-slate-100 flex items-center">
          {/* Background Consultation Image */}
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80" 
            alt="Dr Katherine Lee consulting patient background" 
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Light/White Faded Layer for readability */}
          <div className="absolute inset-0 bg-white/75 md:bg-white/55"></div>

          {/* Overlaid Clinic Content */}
          <div className="relative z-10 p-8 md:p-16 max-w-xl space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-primary font-bold text-xs uppercase tracking-wide">
              Family Medicine & Preventive Healthcare
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
              Dr Katherine Lee's Clinic
            </h1>
            <p className="text-slate-700 text-base md:text-lg font-semibold leading-relaxed">
              Your Healthier SG partner located at Sim Lim Square. We offer comprehensive chronic disease management, active health screenings, and medical care for the Singapore community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                to="/contact" 
                className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl text-center shadow-md shadow-primary/10 flex items-center justify-center gap-2 group transition duration-200"
              >
                Book Appointment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition duration-200" />
              </Link>
              <a 
                href="tel:80615849" 
                className="border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-2xl text-center flex items-center justify-center gap-2 transition duration-200"
              >
                <Phone className="w-5 h-5 text-primary" /> Call Now
              </a>
            </div>
          </div>
        </div>

        {/* Trust Cards Section */}
        <div className="pt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustCards.map((card, idx) => (
              <div 
                key={idx} 
                className="gsap-trust bg-slate-50/60 border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-5 border border-slate-200/50 shadow-sm">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
