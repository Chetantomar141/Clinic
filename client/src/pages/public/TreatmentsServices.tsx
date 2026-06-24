import React from 'react';

export default function TreatmentsServices() {
  const services = [
    {
      title: 'General Consultation',
      desc: 'Comprehensive medical advice, check-ups, and treatments for acute ailments, infections, and general illnesses.'
    },
    {
      title: 'Health Screening',
      desc: 'Customized clinical screening packages, comprehensive blood panels, lipid profiles, and cardiovascular risk profiling.'
    },
    {
      title: 'Chronic Disease Management',
      desc: 'Long-term care, follow-up, and monitoring for hypertension, type-2 diabetes, high cholesterol, and asthma.'
    },
    {
      title: 'Women’s Health',
      desc: 'Specialized healthcare including regular Pap smears, breast screening advice, menopause relief, and family planning.'
    },
    {
      title: 'Minor Procedures',
      desc: 'Minor clinical treatments, wound cleaning, dressings, removal of skin tags, and abscess drainage.'
    },
    {
      title: 'Preventive Healthcare',
      desc: 'Adult immunizations (Flu, HPV, Pneumococcal), preventive advice, and lifestyle modifications for active wellness.'
    }
  ];

  return (
    <div className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-1.5 text-secondary font-bold text-sm tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-secondary"></span> Clinical Services
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Our Treatments & Services
        </h2>
        <p className="text-slate-500 leading-relaxed text-sm md:text-base">
          We provide a wide array of professional outpatient medical solutions tailored to satisfy your medical objectives.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div 
            key={idx} 
            className="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center mb-6 font-bold group-hover:bg-primary group-hover:text-white transition duration-300">
              {idx + 1}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{service.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
