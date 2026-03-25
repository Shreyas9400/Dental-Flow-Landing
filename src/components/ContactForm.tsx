import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Building, User, Mail, Phone, Stethoscope, Download, Key, Video, ExternalLink } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    practiceSize: 'Solo Practice (1 Chair)',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formPayload = new FormData();
      formPayload.append('access_key', '1fbc83b2-f741-44f4-9595-5ac43675b0d7');
      formPayload.append('name', formData.name);
      formPayload.append('clinic', formData.clinicName);
      formPayload.append('email', formData.email);
      formPayload.append('phone', formData.phone);
      formPayload.append('practice_size', formData.practiceSize);
      formPayload.append('subject', 'New ClinicFloww Trial Request');
      formPayload.append('from_name', 'ClinicFloww Landing Page');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formPayload,
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white border-2 border-emerald-100 p-8 md:p-12 rounded-[3rem] shadow-xl text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 min-h-[500px]">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>

        <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">You're All Set!</h3>
        <p className="text-slate-500 font-medium text-lg max-w-xl mb-10 leading-relaxed">
          Thank you for requesting access to ClinicFloww. You can download the application right now from our GitHub repository and generate your free-tier license key.
        </p>

        <div className="w-full max-w-md space-y-4 relative z-10">
          {/* Mac Download Button */}
          <a
            href="https://github.com/Shreyas9400/Dental-Flow-Landing/releases/download/v1.0.0/ClinicFloww-mac.pkg"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white text-slate-900 rounded-[1.5rem] p-4 flex items-center justify-between group transition-all shadow-sm hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <Download size={22} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm tracking-tight text-slate-900">Download for macOS</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apple Silicon / Intel</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-slate-400 group-hover:text-blue-500 mr-2" />
          </a>

          {/* Windows Download Button */}
          <a
            href="https://github.com/Shreyas9400/Dental-Flow-Landing/releases/download/v1.0.0/ClinicFloww-win.exe"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white text-slate-900 rounded-[1.5rem] p-4 flex items-center justify-between group transition-all shadow-sm hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <Download size={22} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm tracking-tight text-slate-900">Download for Windows</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Windows 10 / 11</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-slate-400 group-hover:text-blue-500 mr-2" />
          </a>

          {/* Generate License Key Button */}
          <a
            href="https://clinicfloww.com/license.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 rounded-[1.5rem] p-4 flex items-center justify-between group transition-all transform hover:-translate-y-1 active:scale-95 border border-blue-500 mt-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                <Key size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase tracking-widest text-white">Generate Free-Tier Key</p>
                <p className="text-[10px] font-medium text-blue-100 uppercase tracking-wider">Required for activation</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-blue-200 group-hover:text-white mr-2" />
          </a>
        </div>

        {/* Back to Walkthrough Button */}
        <button
          onClick={() => {
            const demoVideo = document.getElementById('demo-video');
            if (demoVideo) {
              const navbarHeight = 80;
              const elementPosition = demoVideo.getBoundingClientRect().top + window.pageYOffset;
              window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
            }
          }}
          className="mt-12 flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all hover:bg-white shadow-sm"
        >
          <Video size={16} /> Back to Walkthrough
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 p-6 md:p-10 rounded-[2rem] shadow-xl text-left">
      <h3 className="text-2xl font-black text-slate-900 mb-2">Request Secure Access</h3>
      <p className="text-slate-500 font-medium mb-8">Fill out your clinic details below.</p>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3 mb-6 font-medium text-sm">
          <AlertCircle className="shrink-0" size={18} />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Doctor's Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Dr. John Doe"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Clinic Name</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="clinicName"
                required
                value={formData.clinicName}
                onChange={handleFormChange}
                placeholder="Elite Dental Care"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleFormChange}
                placeholder="doctor@clinic.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="+91 9876543210"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Practice Size</label>
          <div className="relative">
            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              name="practiceSize"
              value={formData.practiceSize}
              onChange={handleFormChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none appearance-none"
            >
              <option value="Solo Practice (1 Chair)">Solo Practice (1 Chair)</option>
              <option value="Small Clinic (2-3 Chairs)">Small Clinic (2-3 Chairs)</option>
              <option value="Medium Clinic (4-5 Chairs)">Medium Clinic (4-5 Chairs)</option>
              <option value="Large/Multi-Specialty Clinic">Large/Multi-Specialty Clinic</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white rounded-xl py-4 font-black flex items-center justify-center gap-2 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:pointer-events-none mt-4 text-sm uppercase tracking-widest"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              Submit Details <Send size={18} />
            </>
          )}
        </button>
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Your data is encrypted and completely secure.
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
