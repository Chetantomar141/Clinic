import React from 'react';

export default function AboutClinic() {
  return (
    <div className="bg-white min-h-screen py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12">
        
        {/* Left Column: Details & Hours */}
        <div className="md:col-span-6 space-y-8">
          
          {/* Clinic Information */}
          <div className="space-y-2 text-slate-900">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Dr Katherine Lee's Clinic (Sim Lim Square)
            </h1>
            <div className="text-sm text-slate-700 leading-relaxed font-semibold">
              <p>Sim Lim Square #02-74</p>
              <p>1 Rochor Canal Rd, Singapore 188504</p>
              <p className="mt-1">
                Tel: <a href="tel:80615849" className="text-slate-800 hover:text-primary transition">8061 5849</a>{' '}
                <span className="text-red-600 font-normal">(click to call)</span>
              </p>
            </div>
          </div>



          {/* Operating Hours */}
          <div className="space-y-4 pt-4 border-t border-slate-100 max-w-md">
            <h3 className="font-bold text-slate-900 text-base">Operating Hours</h3>
            
            <div className="space-y-4 text-sm text-slate-800">
              {/* Monday */}
              <div className="grid grid-cols-12 items-start">
                <span className="col-span-4 font-bold">Monday</span>
                <div className="col-span-8 space-y-0.5 text-slate-700 font-medium">
                  <p>8:30 am - 12:30 pm</p>
                  <p>1:30 pm - 4:30 pm</p>
                  <p>6:00 pm - 9:00 pm</p>
                </div>
              </div>

              {/* Tuesday */}
              <div className="grid grid-cols-12 items-start">
                <span className="col-span-4 font-bold">Tuesday</span>
                <div className="col-span-8 space-y-0.5 text-slate-700 font-medium">
                  <p>8:30 am - 12:30 pm</p>
                  <p>1:30 pm - 4:30 pm</p>
                  <p>6:00 pm - 9:00 pm</p>
                </div>
              </div>

              {/* Wednesday */}
              <div className="grid grid-cols-12 items-start">
                <span className="col-span-4 font-bold">Wednesday</span>
                <div className="col-span-8 space-y-0.5 text-slate-700 font-medium">
                  <p>8:30 am - 12:30 pm</p>
                  <p>1:30 pm - 4:30 pm</p>
                  <p>6:00 pm - 9:00 pm</p>
                </div>
              </div>

              {/* Thursday */}
              <div className="grid grid-cols-12 items-start">
                <span className="col-span-4 font-bold">Thursday</span>
                <div className="col-span-8 text-slate-700 font-medium">
                  <p>8:30 am - 12:30 pm</p>
                </div>
              </div>

              {/* Friday */}
              <div className="grid grid-cols-12 items-start">
                <span className="col-span-4 font-bold">Friday</span>
                <div className="col-span-8 space-y-0.5 text-slate-700 font-medium">
                  <p>8:30 am - 12:30 pm</p>
                  <p>1:30 pm - 4:30 pm</p>
                </div>
              </div>

              {/* Saturday */}
              <div className="grid grid-cols-12 items-start">
                <span className="col-span-4 font-bold">Saturday</span>
                <div className="col-span-8 text-slate-700 font-medium">
                  <p>8:30 am - 12:30 pm</p>
                </div>
              </div>

              {/* Sunday & Public Holiday */}
              <div className="grid grid-cols-12 items-start pt-1">
                <div className="col-span-4 flex flex-col font-bold text-red-600">
                  <span>Sunday</span>
                  <span>Public Holiday</span>
                </div>
                <div className="col-span-8 font-bold text-red-600 self-center">
                  Closed
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Facade Image */}
        <div className="md:col-span-6 flex items-start">
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-100 mt-2">
            <img 
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80" 
              alt="Dr Katherine Lee Clinic Entry Gate Facade" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
