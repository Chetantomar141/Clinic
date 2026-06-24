import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.name && formData.message) {
      setSubmitted(true);
      setFormData({
        email: '',
        name: '',
        subject: '',
        message: ''
      });
    }
  };

  return (
    <div className="bg-white min-h-screen py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">
          Contact Us
        </h1>

        <div className="space-y-8">
          {/* Clinic Address Info */}
          <div className="space-y-4 text-slate-800">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Dr Katherine Lee's Clinic
            </h2>
            <h3 className="text-lg font-bold text-slate-900">
              Sim Lim Square Clinic
            </h3>
            
            <div className="text-sm leading-relaxed space-y-1 font-medium text-slate-700">
              <p>Sim Lim Square #02-74</p>
              <p>1 Rochor Canal Rd, Singapore 188504</p>
              <p>Tel: +65 8061 5849</p>
              <p className="pt-2 font-bold text-slate-800">Operating Hours:</p>
              <p>9.00 am to 5.30 pm from Monday to Friday</p>
              <p>9.00 am to 1.00 pm on Saturday</p>
              <p>Closed on Sunday and Public Holiday</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="pt-4">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-8 rounded-xl text-center space-y-3 max-w-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-lg">Message Sent Successfully!</h4>
                <p className="text-sm text-emerald-600">
                  Thank you. We have received your inquiry and will respond to you shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-primary font-bold hover:underline text-xs mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                
                {/* Row 1: Email and Name */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email *"
                      className="w-full bg-[#fed7c3]/60 border-none outline-none px-4 py-3 placeholder:italic placeholder-[#5b6376] text-slate-800 text-sm transition focus:bg-[#fed7c3]/80"
                    />
                  </div>
                  <div>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Name *"
                      className="w-full bg-[#fed7c3]/60 border-none outline-none px-4 py-3 placeholder:italic placeholder-[#5b6376] text-slate-800 text-sm transition focus:bg-[#fed7c3]/80"
                    />
                  </div>
                </div>

                {/* Row 2: Subject */}
                <div>
                  <input 
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Subject"
                    className="w-full bg-[#fed7c3]/60 border-none outline-none px-4 py-3 placeholder:italic placeholder-[#5b6376] text-slate-800 text-sm transition focus:bg-[#fed7c3]/80"
                  />
                </div>

                {/* Row 3: Message */}
                <div>
                  <textarea 
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Message"
                    className="w-full bg-[#fed7c3]/60 border-none outline-none px-4 py-3 placeholder:italic placeholder-[#5b6376] text-slate-800 text-sm transition resize-none focus:bg-[#fed7c3]/80"
                  ></textarea>
                </div>

                {/* Row 4: Submit Button (Right-aligned) */}
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-[#4b6cb7] hover:bg-[#3b5998] text-white px-8 py-3 text-sm font-semibold transition duration-200 cursor-pointer shadow-sm shadow-[#4b6cb7]/10"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* WhatsApp & Call Direct Action Badges */}
        <div className="mt-12 pt-8 border-t border-slate-100 max-w-xl flex flex-wrap gap-4">
          <a 
            href="tel:80615849" 
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 px-5 py-3 text-slate-700 font-bold rounded-xl transition text-sm bg-white hover:bg-slate-50"
          >
            Call Clinic: 8061 5849
          </a>
          <a 
            href="https://wa.me/6580615849" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition text-sm shadow-sm"
          >
            WhatsApp Direct Chat
          </a>
        </div>
      </div>
    </div>
  );
}
