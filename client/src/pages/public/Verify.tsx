import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Search,
  ChevronRight,
  Building,
  User,
  Calendar,
  Clock,
  Fingerprint,
  Info
} from 'lucide-react';
import { api } from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';

interface VerificationResult {
  certificateNumber: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'CANCELLED';
  clinicName: string;
  clinicAddress?: string | null;
  clinicPhone?: string | null;
  clinicEmail?: string | null;
  doctorName: string;
  patientName: string;
  patientIdentifier: string;
  issueDate: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  verificationHash: string;
  pdfUrl?: string | null;
  qrUrl?: string | null;
  clinicLogoUrl?: string | null;
  doctorSignatureUrl?: string | null;
}

export default function Verify() {
  const { certNo } = useParams<{ certNo?: string }>();

  const [certificateNumber, setCertificateNumber] = useState(certNo || '');
  const [identifier, setIdentifier] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (result) {
        gsap.fromTo('.gsap-verify-results',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
        gsap.fromTo('.gsap-result-item',
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
        );
      } else {
        gsap.fromTo('.gsap-verify-title', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        gsap.fromTo('.gsap-verify-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [result]);

  // Set certNo from URL params
  useEffect(() => {
    if (certNo) {
      setCertificateNumber(certNo);
      // Automatically check existence of cert if passed in url
      checkExistence(certNo);
    }
  }, [certNo]);

  const [existenceClinic, setExistenceClinic] = useState<string | null>(null);
  const [checkingExistence, setCheckingExistence] = useState(false);

  const performVerification = async (certNum: string, ident: string) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const { data } = await api.post('/verify', {
        certificateNumber: certNum.trim(),
        identifier: ident.trim(),
      });

      if (!data) {
        throw new Error('Invalid response from verification service.');
      }

      setResult(data);
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Verification failed. Please check the credentials and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const checkExistence = async (num: string) => {
    try {
      setCheckingExistence(true);
      setError(null);
      const { data } = await api.get(`/verify/${num}`);
      if (!data?.clinicName) {
        throw new Error('Invalid response from verification service.');
      }
      setExistenceClinic(data.clinicName);
      if (data.patientIdentifier) {
        setIdentifier(data.patientIdentifier);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Certificate not found in database.'));
      setExistenceClinic(null);
    } finally {
      setCheckingExistence(false);
    }
  };

  const handleVerify = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!certificateNumber || !identifier) {
      setError('Please fill in both fields.');
      return;
    }
    await performVerification(certificateNumber, identifier);
  };

  const resetForm = () => {
    setResult(null);
    setIdentifier('');
    if (!certNo) {
      setCertificateNumber('');
      setExistenceClinic(null);
    }
  };

  return (
    <div ref={containerRef} className="bg-medical-bg min-h-screen flex flex-col justify-between text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Lee Care Clinic Logo" className="h-11 w-auto object-contain" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-12 px-6 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          <div className="gsap-verify-title text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 font-sans flex items-center justify-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" /> Certificate Verification Portal
            </h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Verify the authenticity of digital medical documents instantly. Compliant with Singapore Health Ministry security rules.
            </p>
          </div>

          {!result ? (
            /* Verification Request Form */
            <div className="gsap-verify-card bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden border-t-4 border-t-primary">

              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {checkingExistence && (
                  <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs px-4 py-2 rounded-xl">
                    Querying document catalog...
                  </div>
                )}

                {existenceClinic && (
                  <div className="bg-primary/5 border border-primary/20 text-primary-dark text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary shrink-0" />
                    <span>Found document catalog registered under <strong>{existenceClinic}</strong>. Enter NRIC/Passport below to challenge and verify details.</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Certificate Number</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        disabled={!!certNo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCertificateNumber(val);
                          if (!certNo && val.trim().length >= 6) {
                            checkExistence(val.trim());
                          }
                        }}
                        onBlur={() => !certNo && certificateNumber && checkExistence(certificateNumber)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                        placeholder=""
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 outline-none focus:bg-white focus:border-primary text-sm font-semibold transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Passport / NRIC Number</label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      placeholder=""
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:bg-white focus:border-primary text-sm font-semibold transition"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-xs text-slate-500">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong>Secure Verification:</strong> Full patient details are shown only after the certificate number and matching NRIC/Passport challenge are verified. Medical diagnosis details remain omitted.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Performing Challenge...' : 'Verify Certificate'} <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            /* Verification Successful Results Screen - HealthLight Style */
            <div className="gsap-verify-results bg-white border border-slate-200 rounded-3xl shadow-xl relative overflow-hidden max-w-xl mx-auto p-8 font-sans border-t-8 border-t-primary">

              {/* Header: Clinic Details & Seal */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {result.clinicName}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed whitespace-pre-line">
                    {(result.clinicAddress || 'Sim Lim Square #02-74, 1 Rochor Canal Rd, Singapore 188504').replace(', ', '\n')}
                  </p>
                </div>

                {/* Dynamic Approval Seal */}
                <div className="shrink-0 ml-4">
                  {(() => {
                    let sealColor = '#2563eb'; // blue for active/valid
                    let sealText = 'VALID';

                    if (result.status === 'REVOKED') {
                      sealColor = '#dc2626'; // red
                      sealText = 'REVOKED';
                    } else if (result.status === 'EXPIRED') {
                      sealColor = '#f59e0b'; // amber
                      sealText = 'EXPIRED';
                    } else if (result.status === 'CANCELLED') {
                      sealColor = '#475569'; // grey
                      sealText = 'CANCEL';
                    }

                    return (
                      <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="44" stroke={sealColor} strokeWidth="2" strokeDasharray="2 2" />
                        <circle cx="50" cy="50" r="40" stroke={sealColor} strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="32" stroke={sealColor} strokeWidth="1.5" />
                        <g transform="rotate(-15 50 50)">
                          <rect x="12" y="38" width="76" height="24" rx="2" fill={sealColor} />
                          <text x="50" y="55" fill="#ffffff" fontFamily="Arial, Helvetica, sans-serif" fontSize={sealText.length > 5 ? '10' : '13'} fontWeight="900" textAnchor="middle" letterSpacing="1">{sealText}</text>
                        </g>
                        <path id="sealPath" d="M 18 50 A 32 32 0 1 1 82 50" fill="none" />
                        <text fontFamily="Arial" fontSize="6" fontWeight="bold" fill={sealColor} letterSpacing="0.5">
                          <textPath href="#sealPath" startOffset="50%" textAnchor="middle">
                            APPROVAL SEAL
                          </textPath>
                        </text>
                        <path id="sealPathBottom" d="M 82 50 A 32 32 0 1 1 18 50" fill="none" />
                        <text fontFamily="Arial" fontSize="6" fontWeight="bold" fill={sealColor} letterSpacing="0.5">
                          <textPath href="#sealPathBottom" startOffset="50%" text-anchor="middle">
                            APPROVAL SEAL
                          </textPath>
                        </text>
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center mb-6 space-y-1">
                <h1 className="text-2xl font-black text-slate-800 tracking-wide">
                  MEDICAL CERTIFICATE
                </h1>
                <div className="text-slate-500 font-semibold text-sm">
                  No: {result.certificateNumber}
                </div>
                <div className="text-slate-500 font-semibold text-sm">
                  Issued date: {new Date(result.issueDate).toLocaleDateString('en-SG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>

              {/* Patient and Leave Details */}
              <div className="space-y-4 text-left border-b border-slate-100 pb-6 mb-6">
                <div className="gsap-result-item">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Name</span>
                  <span className="text-md font-extrabold text-slate-900">{result.patientName}</span>
                </div>

                <div className="gsap-result-item">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">NRIC/Passport number</span>
                  <span className="text-md font-extrabold text-slate-900">{result.patientIdentifier}</span>
                </div>

                <div className="gsap-result-item">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Start Date</span>
                  <span className="text-md font-extrabold text-slate-900">
                    {new Date(result.startDate).toLocaleDateString('en-SG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>

                <div className="gsap-result-item">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">End Date</span>
                  <span className="text-md font-extrabold text-slate-900">
                    {new Date(result.endDate).toLocaleDateString('en-SG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>

                <div className="gsap-result-item">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Type of medical leave granted</span>
                  <span className="text-md font-extrabold text-slate-900">Medical Certificate</span>
                </div>
              </div>

              {/* Certification Statement */}
              <div className="gsap-result-item text-left border-b border-slate-100 pb-6 mb-6 font-semibold text-slate-800 text-sm leading-relaxed">
                This is to certify that the patient is unfit for duty for a period of <span className="font-black text-slate-950 underline decoration-slate-400 decoration-2 underline-offset-2">{result.durationDays}</span> day(s).
              </div>

              {/* Attending Doctor */}
              <div className="gsap-result-item text-left border-b border-slate-100 pb-6 mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Issued by</span>
                <span className="text-md font-extrabold text-slate-900">{result.doctorName}</span>
              </div>

              {/* Cryptographic Signature Box */}
              <div className="gsap-result-item font-mono text-[9px] text-slate-400 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl break-all text-left mb-6">
                <span className="font-bold text-slate-500 block uppercase tracking-wider mb-1">SHA-256 Cryptographic Signature</span>
                {result.verificationHash}
              </div>

              {/* Footer Disclaimer */}
              <div className="gsap-result-item text-xs text-slate-500 italic font-semibold text-left mb-8 leading-relaxed">
                This MC is not valid for Court Attendance or Police Report
              </div>

              {/* Download / Action Buttons */}
              <div className="gsap-result-item flex flex-col sm:flex-row gap-4">
                {result.pdfUrl && (
                  <a
                    href={result.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Download Digital Certificate (PDF)
                  </a>
                )}
                <button
                  onClick={resetForm}
                  className="sm:w-48 bg-slate-50 hover:bg-slate-150 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-200 transition"
                >
                  Verify Another
                </button>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© 2010 Dr Katherine Lee Clinic. All rights reserved. Sim Lim Square, Singapore.</div>
          <div className="flex gap-4 font-semibold text-slate-600">
            <Link to="/" className="hover:text-primary">Landing Page</Link>

          </div>
        </div>
      </footer>
    </div>
  );
}
