import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Building, User, Mail, Phone, Stethoscope } from 'lucide-react';

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
      <div className="bg-white border-2 border-emerald-100 p-8 md:p-12 rounded-[2rem] shadow-xl text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 min-h-[500px]">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Request Received Successfully!</h3>
        <p className="text-slate-600 font-medium text-lg max-w-lg mb-8 leading-relaxed">
          Thank you for requesting access to ClinicFloww. Our team has received your details and will contact you shortly with your secure download links and free-tier license key.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left max-w-sm w-full mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Next Steps</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">1</span>
              <p className="text-sm text-slate-700 font-medium">Keep an eye on your WhatsApp/Email inbox.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">2</span>
              <p className="text-sm text-slate-700 font-medium">Receive download links for macOS & Windows.</p>
            </li>
          </ul>
        </div>
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
