import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronRight } from 'lucide-react';

export default function DoctorProfile() {
  return (
    <div className="py-16 md:py-24 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 text-primary font-bold text-sm tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Profile
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Meet Dr Katherine Lee
          </h2>
          <p className="text-slate-700 font-semibold text-lg">
            Family Physician & General Practitioner
          </p>
          <p className="text-slate-600 leading-relaxed">
            Dr Katherine Lee has years of clinical practice experience across various medical centers in Singapore. She has an active interest in family health, preventive care, and managing common metabolic health conditions like diabetes and high blood pressure.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Dr Lee seeks to support all patients through detailed clinical education, lifestyle advice, and appropriate pharmacological care, empowering patients to make the best decisions for their health.
          </p>

          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Qualifications & Accreditations</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">MBBS (Singapore)</p>
                  <p className="text-xs text-slate-500">Bachelor of Medicine, Bachelor of Surgery</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <Award className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">GDFM (Singapore)</p>
                  <p className="text-xs text-slate-500">Graduate Diploma in Family Medicine</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm sm:col-span-2">
                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">College of Family Physicians Singapore</p>
                  <p className="text-xs text-slate-500">Registered Family Physician (MCR: 80615849)</p>
                </div>
              </div>
            </div>
          </div>

          <Link 
            to="/contact" 
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3.5 rounded-xl transition duration-200 shadow-sm inline-flex items-center gap-2"
          >
            Book Consultation With Dr Lee <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:col-span-5">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-6">
            <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-100 relative">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80" 
                alt="Dr Katherine Lee with stethoscope" 
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                Now Accepting Patients
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">Dr Katherine Lee</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-wide">Family Medicine Resident</p>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Specialty</span>
                  <span className="font-bold text-slate-700">Preventive Care</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Languages</span>
                  <span className="font-bold text-slate-700">English, Mandarin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
