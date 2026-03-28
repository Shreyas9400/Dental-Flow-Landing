import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Calendar,
  Database,
  MessageSquare,
  Cpu,
  CreditCard,
  Mail,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  Stethoscope,
  Briefcase,
  Send,
  User,
  ExternalLink,
  FileText,
  Clock,
  BarChart3,
  Smartphone,
  Gift,
  Award,
  ReceiptText,
  Users,
  LayoutDashboard,
  Plus,
  Search,
  ArrowUpRight,
  MoreVertical,
  MessageCircle,
  TrendingUp,
  Activity,
  DollarSign,
  Bot,
  Sparkles,
  SmartphoneIcon,
  HardDrive,
  Lock,
  ChevronDown,
  ChevronUp,
  Layout,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { marked } from 'marked';
import { getGeminiResponse, getDashboardInsights } from './services/geminiService';
import { ChatMessage, Feature, ViewState, Patient, Invoice, Tooth, ToothCondition, Appointment, InventoryItem } from './types';
import { ASSETS } from './constants/assets';
import { supabase } from './src/lib/supabase';
import { DashboardSnapshot } from './src/components/DashboardSnapshot';
import ContactForm from './src/components/ContactForm';

// --- NEW: ScrollReveal Component for animations ---
const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; animationClass: string; delay?: number }> = ({ children, className = "", animationClass, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${animationClass}`}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
};

const getYoutubeEmbedUrl = (url: string) => {
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    videoId = new URLSearchParams(url.split('?')[1]).get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1].split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const VideoSlider = ({ videos }: { videos: { url: string; title: string }[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-12">
      <div className="overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200 aspect-video bg-slate-900 group">
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {videos.map((video, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              {Math.abs(currentIndex - idx) <= 1 ? (
                <iframe
                  className="w-full h-full"
                  src={getYoutubeEmbedUrl(video.url)}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen>
                </iframe>
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <span className="text-white opacity-50 font-medium">Loading...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none md:-mx-4">
        <button
          onClick={prevSlide}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all hover:scale-110 active:scale-95 pointer-events-auto -ml-2 sm:ml-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all hover:scale-110 active:scale-95 pointer-events-auto -mr-2 sm:mr-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      <div className="flex justify-center items-center flex-col mt-8">
        <h3 className="text-2xl font-black text-slate-800 font-heading tracking-tight">{videos[currentIndex].title}</h3>
        <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">{currentIndex + 1} of {videos.length}</p>

        <div className="flex gap-2 flex-wrap justify-center mt-6 max-w-md">
          {videos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
// ---------------------------------------------------

const safeScroll = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const navbarHeight = 80;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navbarHeight;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

const Navbar = ({ onViewChange, currentView }: { onViewChange: (v: ViewState) => void, currentView: ViewState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleNav = (id: string) => {
    onViewChange('landing');
    setTimeout(() => safeScroll(id), 100);
    setIsOpen(false);
  };

  const navLinks = [
    { label: 'Dashboard', view: 'dashboard' as ViewState },
    { label: 'Billing', view: 'billing' as ViewState },
    { label: 'Patients', view: 'patients' as ViewState },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl z-[70] border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewChange('landing')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black font-heading text-slate-900 tracking-tighter">ClinicFloww</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {currentView !== 'landing' && navLinks.map(link => (
              <button
                key={link.view}
                onClick={() => onViewChange(link.view)}
                className={`${currentView === link.view ? 'text-blue-600' : 'text-slate-500'} hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors`}
              >
                {link.label}
              </button>
            ))}
            {currentView === 'landing' && (
              <>
                <button onClick={() => handleNav('features')} className="text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors">Outcomes</button>
                <button onClick={() => handleNav('about')} className="text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors">By doctors</button>
                <button onClick={() => handleNav('contact')} className="text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors">Contact Us</button>
              </>
            )}
            <button
              onClick={() => {
                if (currentView === 'landing') {
                  safeScroll('contact');
                } else {
                  onViewChange('landing');
                }
              }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
            >
              {currentView === 'landing' ? 'Download your free trial' : 'Exit Console'}
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 p-4 space-y-4 shadow-xl">
          {currentView !== 'landing' ? navLinks.map(link => (
            <button key={link.view} onClick={() => { onViewChange(link.view); setIsOpen(false); }} className="block w-full text-left py-3 font-bold text-slate-600">{link.label}</button>
          )) : (
            <>
              <button onClick={() => handleNav('features')} className="block w-full text-left py-3 font-bold text-slate-600">Outcomes</button>
              <button onClick={() => handleNav('about')} className="block w-full text-left py-3 font-bold text-slate-600">By doctors</button>
              <button onClick={() => handleNav('contact')} className="block w-full text-left py-3 font-bold text-slate-600">Contact Us</button>
            </>
          )}
          <button onClick={() => { safeScroll('contact'); setIsOpen(false); }} className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-center font-black uppercase tracking-widest">Download your free trial</button>
        </div>
      )}
    </nav>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; gradient: string; icon: React.ReactNode }> = ({ title, value, gradient, icon }) => (
  <div className="glass p-8 rounded-[2rem] shadow-xl border border-white/20 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
    <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
      <div className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-3 shadow-lg shadow-current/20`}>
        {icon}
      </div>
    </div>
  </div>
);

const PatientsView = ({ patients }: { patients: Patient[] }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Patient Directory</h2>
        <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage clinical demographics & history</p>
      </div>
      <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
        <Plus size={16} /> Add Record
      </button>
    </div>
    <div className="glass rounded-[2.5rem] overflow-hidden shadow-xl">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <th className="px-8 py-6">Identity</th>
            <th className="px-8 py-6">Status</th>
            <th className="px-8 py-6">Last Visit</th>
            <th className="px-8 py-6">Outstanding</th>
            <th className="px-8 py-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map(p => (
            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm tracking-tight">{p.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.contact}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {p.status}
                </span>
              </td>
              <td className="px-8 py-6 text-sm font-bold text-slate-500">{p.lastVisit}</td>
              <td className="px-8 py-6 text-sm font-black text-slate-900">₹{p.balance.toLocaleString()}</td>
              <td className="px-8 py-6 text-right">
                <button className="p-2 hover:bg-white rounded-xl transition-all"><MoreVertical size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BillingView = () => {
  const invoices: Invoice[] = [
    { id: 'INV-001', patientName: 'John Doe', amount: 1200, date: '2024-03-20', status: 'unpaid' },
    { id: 'INV-002', patientName: 'Sarah Miller', amount: 5000, date: '2024-03-18', status: 'paid' },
    { id: 'INV-003', patientName: 'Robert Chen', amount: 8500, date: '2024-03-15', status: 'overdue' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Financial Ledger</h2>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Invoices, Receivables & Revenue Tracking</p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/20">
          <ReceiptText size={16} /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Revenue (MTD)" value="₹2.4L" gradient="from-blue-500 to-indigo-600" icon={<DollarSign size={24} />} />
        <StatCard title="Collections Due" value="₹45k" gradient="from-amber-400 to-orange-500" icon={<TrendingUp size={24} />} />
        <StatCard title="Estimated Liability" value="₹12k" gradient="from-slate-700 to-slate-900" icon={<ShieldCheck size={24} />} />
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden shadow-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-6">Invoice ID</th>
              <th className="px-8 py-6">Patient</th>
              <th className="px-8 py-6">Date</th>
              <th className="px-8 py-6">Amount</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-black text-blue-600 text-xs">{inv.id}</td>
                <td className="px-8 py-6 font-bold text-slate-900 text-sm">{inv.patientName}</td>
                <td className="px-8 py-6 text-slate-500 text-sm font-medium">{inv.date}</td>
                <td className="px-8 py-6 font-black text-slate-900">₹{inv.amount.toLocaleString()}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    inv.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase tracking-widest">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardView = ({ patients, appointments, inventory }: any) => {
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInventoryForPrice, setSelectedInventoryForPrice] = useState<string>('Composite Resin');

  const patientFlowData = useMemo(() => [
    { month: 'Oct', appointments: 45 },
    { month: 'Nov', appointments: 52 },
    { month: 'Dec', appointments: 38 },
    { month: 'Jan', appointments: 65 },
    { month: 'Feb', appointments: 48 },
    { month: 'Mar', appointments: 59 },
  ], []);

  const revenueData = useMemo(() => [
    { month: 'Oct', revenue: 45000 },
    { month: 'Nov', revenue: 52000 },
    { month: 'Dec', revenue: 48000 },
    { month: 'Jan', revenue: 75000 },
    { month: 'Feb', revenue: 62000 },
    { month: 'Mar', revenue: 89000 },
  ], []);

  const followUpList = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return patients.filter((p: any) => new Date(p.lastVisit) < sixMonthsAgo);
  }, [patients]);

  const top10ExpiringItems = useMemo(() => {
    const today = new Date();
    return [...inventory].map((item: any) => {
      const diff = Math.round((new Date(item.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...item, daysToExpiry: diff };
    }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [inventory]);

  const handleGetInsights = async () => {
    setIsLoading(true);
    const result = await getDashboardInsights({ patients, appointments, inventory });
    setInsights(result);
    setIsLoading(false);
  };

  const sendWhatsApp = (p: Patient) => {
    const msg = `Hello ${p.name}, this is a reminder from ClinicFloww for your follow-up. Your last visit was on ${p.lastVisit}. Please call us to schedule.`;
    window.open(`https://wa.me/${p.contact}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const tickStyle = { fill: '#94a3b8', fontSize: '11px', fontWeight: 600 };
  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    fontSize: '12px',
    padding: '10px'
  };

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Practice Performance</h2>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Real-time Clinical & Financial Analytics</p>
        </div>
        <div className="flex gap-4">
          <button className="glass px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all shadow-sm">
            <FileText size={16} /> MTD Report
          </button>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
            <Plus size={16} /> New Consultation
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Active Records" value={patients.length} gradient="from-cyan-500 to-blue-500" icon={<Users size={24} />} />
        <StatCard title="Today's Ops" value={appointments.length} gradient="from-indigo-500 to-purple-500" icon={<Calendar size={24} />} />
        <StatCard title="AR Balance" value="₹42,500" gradient="from-pink-500 to-rose-500" icon={<CreditCard size={24} />} />
        <StatCard title="Clinic Health" value="94%" gradient="from-emerald-500 to-teal-500" icon={<CheckCircle2 size={24} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={20} /> Patient Volume Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={patientFlowData}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorApps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8 flex items-center gap-2">
            <ReceiptText className="text-indigo-500" size={20} /> Revenue Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h3 className="font-black text-slate-900 text-3xl tracking-tighter">Clinical Intelligence</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">AI-Powered Revenue Optimization</p>
          </div>
          <button
            onClick={handleGetInsights}
            disabled={isLoading}
            className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center shadow-2xl shadow-slate-900/30 transition-all text-[10px] uppercase tracking-widest"
          >
            {isLoading && <Clock className="animate-spin mr-3" size={16} />}
            {isLoading ? 'Synthesizing Data...' : 'Find Growth Opportunities'}
          </button>
        </div>
        {insights ? (
          <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] text-slate-700 text-lg leading-relaxed font-medium">
            {insights}
          </div>
        ) : (
          <div className="p-16 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cpu size={32} />
            </div>
            <p className="text-slate-400 font-bold text-sm tracking-tight">Generate an automated summary of clinical performance and missed revenue alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <ScrollReveal animationClass="scale-95">
    <div className="glass p-10 rounded-[2.5rem] border border-white/20 hover:border-blue-300 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group cursor-pointer h-full">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:-translate-y-2">
        {feature.icon}
      </div>
      <h3 className="text-2xl font-black mb-4 font-heading tracking-tight">{feature.title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
    </div>
  </ScrollReveal>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Welcome to ClinicFloww Elite Support. Want to see how much time or revenue your clinic could save?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);

    const response = await getGeminiResponse(textToSend);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  const suggestions = [
    "How to manage billing?",
    "About clinic privacy",
    "Clinical AI features",
    "Download your free trial"
  ];

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col items-end">
      {isOpen ? (
        <div
          className="bg-white w-[min(400px,calc(100vw-48px))] h-[min(650px,calc(100vh-120px))] rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 origin-bottom-right"
          style={{ marginBottom: '24px' }}
        >
          {/* Header */}
          <div className="bg-slate-900 p-5 flex justify-between items-center text-white relative shrink-0">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 opacity-10 blur-3xl rounded-full"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                  Ask ClinicFloww AI <Sparkles size={10} className="text-blue-400" />
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Support Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex items-end gap-2 max-w-[90%]`}>
                  {m.role === 'model' && (
                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mb-1">
                      <Bot size={12} className="text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-[1.5rem] text-[13px] font-medium leading-relaxed shadow-sm transition-all ${m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/10'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none chat-prose'
                      }`}
                    dangerouslySetInnerHTML={m.role === 'model' ? { __html: marked.parse(m.text) as string } : undefined}
                  >
                    {m.role === 'user' ? m.text : null}
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1.5 px-1">
                  {m.role === 'user' ? 'doctor' : 'Assistant'}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2 animate-pulse">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bot size={12} className="text-blue-600" />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="px-5 py-4 bg-white/80 border-t border-slate-100 space-y-4 shrink-0">
            {!loading && messages.length < 4 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors border border-transparent hover:border-blue-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about time-saving features..."
                className="flex-1 bg-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading}
                className="bg-slate-900 text-white p-3.5 rounded-2xl hover:bg-black shadow-xl shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-slate-900 rotate-90' : 'bg-slate-900 hover:bg-black'} text-white w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] md:rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all group relative`}
      >
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-slate-50 flex items-center justify-center animate-bounce">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          </div>
        )}
        {isOpen ? <X size={28} /> : <MessageSquare className="group-hover:rotate-12 transition-transform" size={32} />}
      </button>

      {/* UPDATED: Floating WhatsApp Connect Button using api.whatsapp.com */}
      <a
        href="https://api.whatsapp.com/send?phone=918369908157&text=Hi%20ClinicFloww%2C%20I%20have%20a%20query%20regarding%20the%20app."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-32 md:right-10 z-[100] bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
      >
        <MessageCircle size={28} className="group-hover:animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-xs font-black uppercase tracking-widest ml-0 group-hover:ml-3">
          WhatsApp Connect
        </span>
      </a>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Global Mock Data
  const patients: Patient[] = useMemo(() => [
    { id: '1', name: 'John Doe', contact: '9876543210', lastVisit: '2023-09-20', balance: 1200, status: 'active', paymentHistory: [{ id: 'p1', date: '2024-03-20', amountPaid: 5000, totalAmount: 6200 }] },
    { id: '2', name: 'Sarah Miller', contact: '8765432109', lastVisit: '2023-08-18', balance: 0, status: 'completed', paymentHistory: [{ id: 'p2', date: '2024-03-18', amountPaid: 800, totalAmount: 800 }] },
    { id: '3', name: 'Robert Chen', contact: '7654321098', lastVisit: '2024-03-15', balance: 4500, status: 'pending', paymentHistory: [] },
    { id: '4', name: 'Emily Wilson', contact: '9988776655', lastVisit: '2024-01-10', balance: 0, status: 'active', paymentHistory: [] },
  ], []);

  const appointments: Appointment[] = useMemo(() => [
    { id: 'a1', patientId: '1', date: '2024-03-22', reason: 'Routine Checkup' },
    { id: 'a2', patientId: '2', date: '2024-03-23', reason: 'Teeth Whitening' },
    { id: 'a3', patientId: '3', date: '2024-03-24', reason: 'Root Canal' },
    { id: 'a4', patientId: '1', date: '2024-04-10', reason: 'Follow-up' },
  ], []);

  const inventory: InventoryItem[] = useMemo(() => [
    { id: 'i1', name: 'Composite Resin', quantity: 12, expiryDate: '2024-04-01', purchaseDate: '2023-12-01', purchasePrice: 1200 },
    { id: 'i2', name: 'Dental Anesthesia', quantity: 45, expiryDate: '2024-06-15', purchaseDate: '2024-01-10', purchasePrice: 850 },
    { id: 'i3', name: 'Disposable Syringes', quantity: 200, expiryDate: '2025-01-01', purchaseDate: '2024-02-05', purchasePrice: 15 },
    { id: 'i4', name: 'Bonding Agent', quantity: 5, expiryDate: '2024-03-28', purchaseDate: '2023-11-20', purchasePrice: 2100 },
  ], []);

  const features: Feature[] = [
    {
      id: 'database',
      title: 'Industrial Data Security',
      description: '100% local storage. Your patient records never leave your secure clinic infrastructure. Complete data ownership',
      icon: <Lock size={32} />
    },
    {
      id: 'accounts',
      title: 'Admin Mastery',
      description: 'Comprehensive oversight of practice logistics. Manage doctors, staff permissions, and schedules from a single clinical hub.',
      icon: <LayoutDashboard size={32} />
    },
    {
      id: 'intelligence',
      title: 'Clinical Intelligence',
      description: 'AI that finds missed revenue, overdue recalls, and expiring inventory. Professional prescriptions in 2 seconds.',
      icon: <Cpu size={32} />
    }
  ];

  const featureGroups = [
    {
      group_title: "Patient & Clinical Management",
      icon: <Users size={18} className="text-blue-500" />,
      features: [
        "Comprehensive patient records and medical history",
        "Treatment history with clinical notes",
        "Digital consent forms",
        "Digital prescriptions"
      ]
    },
    {
      group_title: "Appointments & Follow-Ups",
      icon: <Calendar size={18} className="text-emerald-500" />,
      features: [
        "Appointment scheduling calendar",
        "Daily appointment planning",
        "Automated follow-up and recall reminders",
        "WhatsApp appointment notifications"
      ]
    },
    {
      group_title: "Billing & Revenue",
      icon: <DollarSign size={18} className="text-amber-500" />,
      features: [
        "Digital billing and invoicing",
        "Treatment quotations",
        "Payment tracking and outstanding balances",
        "Revenue reports and profit visibility"
      ]
    },
    {
      group_title: "Inventory & Operations",
      icon: <Briefcase size={18} className="text-indigo-500" />,
      features: [
        "Inventory tracking",
        "Expiry date alerts",
        "Cost and price history tracking"
      ]
    },
    {
      group_title: "Insights, AI & Automation",
      icon: <Sparkles size={18} className="text-purple-500" />,
      features: [
        "Patient insights and trends",
        "AI-assisted clinical summaries",
        "AI-generated prescriptions",
        "Natural language clinic queries"
      ]
    },
    {
      group_title: "Security & System",
      icon: <Lock size={18} className="text-slate-500" />,
      features: [
        "100% local database storage",
        "Offline operation",
        "Automated backups",
        "Hardware-locked licensing"
      ]
    }
  ];

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <DashboardView patients={patients} appointments={appointments} inventory={inventory} />;
      case 'billing': return <BillingView />;
      case 'patients': return <PatientsView patients={patients} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 text-slate-900 overflow-x-hidden">
      <Navbar currentView={view} onViewChange={setView} />

      {view === 'landing' ? (
        <>
          {/* Hero */}
          <section id="hero" className="pt-40 md:pt-48 pb-16 px-4 relative overflow-hidden">
            <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-400/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
              <ScrollReveal className="flex flex-col items-center pt-10" animationClass="-translate-y-8" delay={100}>
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-100 px-6 py-3 rounded-full shadow-lg mb-8">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Built By Practicing Clinicians</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 font-heading tracking-tighter leading-[1.1]">
                  The World's First<br />
                  <span className="text-blue-600">Local-First AI driven Clinic Management App.</span>
                </h1>

                <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-2xl px-4 lg:px-0">
                  Run your practice with 40% less admin. Appointments, billing, inventory, and AI insights—secure, offline-capable, and designed by doctors, not software vendors.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md lg:max-w-none justify-center px-4 lg:px-0">
                  <button
                    onClick={() => safeScroll('contact')}
                    className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-black shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Download your free trial
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => safeScroll('interactive-dashboard-snapshot')}
                    className="glass border border-slate-200 px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-white transition-all text-slate-700 flex items-center justify-center gap-2"
                  >
                    See Live Demo
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Interactive Dashboard Snapshot */}
          <section id="interactive-dashboard-snapshot" className="pb-32 px-4 relative overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto" animationClass="translate-y-16" delay={200}>
              <div className="mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-50 relative group">
                <div className="bg-slate-200/50 backdrop-blur-sm p-4 flex items-center justify-between border-b border-slate-200/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full">
                    Live Preview Mode
                  </div>
                  <div className="w-12"></div>
                </div>
                <div className="h-[800px] overflow-y-auto custom-scrollbar p-0 md:p-4 bg-slate-50/50">
                  <div className="scale-100 origin-top">
                    <DashboardSnapshot
                      patients={patients}
                      appointments={appointments}
                      inventory={inventory}
                      expenses={[]}
                      assistants={[]}
                      currentTheme="light"
                      setView={() => { }}
                      persistedInsights=""
                      onUpdateInsights={() => { }}
                      isActivated={true}
                      licenseType="pro"
                      onRequestActivation={() => { }}
                      onSendWhatsApp={() => { }}
                      whatsappStatus="active"
                      isGoogleConnected={true}
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Trust Section - Moved Up */}
          <section id="about" className="py-24 px-4 bg-slate-900 text-white rounded-[4rem] md:rounded-[5rem] mx-4 md:mx-10 my-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>

            <ScrollReveal animationClass="translate-y-16">
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <div>
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full mb-10">
                      <Award className="text-blue-500" size={20} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">By Practicing Clinicians</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black mb-10 font-heading leading-[1.1] tracking-tighter">Built by doctors,<br />Not Software Vendors.</h2>
                    <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                      ClinicFloww is designed from real clinic workflows, not generic clinic apps. Dr. Sayali Jadhav and Dr. Prashant Hajare built the system they wanted for their own practice.
                    </p>
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <p className="text-4xl font-black text-white mb-2 tracking-tighter">100%</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data Ownership</p>
                      </div>
                      <div>
                        <p className="text-4xl font-black text-blue-500 mb-2 tracking-tighter">0%</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cloud Risk</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <ScrollReveal animationClass="translate-y-12">
                      <div onClick={() => setShowEasterEgg(true)} className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-800 relative group shadow-2xl h-full cursor-pointer">
                        <img src={ASSETS.IMAGES.FOUNDERS.SAYALI} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="CEO" />
                        <div className="absolute bottom-6 left-6 z-20 pointer-events-none"><p className="font-black uppercase text-[10px] tracking-widest text-blue-400">CEO</p><p className="font-black text-lg tracking-tight">Dr. Sayali Jadhav</p></div>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal animationClass="translate-y-12" delay={200}>
                      <div onClick={() => setShowEasterEgg(true)} className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-800 relative group shadow-2xl h-full cursor-pointer">
                        <img src={ASSETS.IMAGES.FOUNDERS.PRASHANT} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="CMO" />
                        <div className="absolute bottom-6 left-6 z-20 pointer-events-none"><p className="font-black uppercase text-[10px] tracking-widest text-blue-400">CMO</p><p className="font-black text-lg tracking-tight">Dr. Prashant Hajare</p></div>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>



          {/* Outcomes */}
          <section id="features" className="py-32 px-4 relative overflow-hidden">

            <ScrollReveal animationClass="translate-y-12">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                  <h2 className="text-5xl font-black font-heading mb-6 text-slate-900 tracking-tighter">Clinical Precision. Business Mastery.</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto font-medium">Outcome-focused infrastructure that simplifies complex workflows while maximizing clinic footfall and revenue.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                  {features.map(f => <FeatureCard key={f.id} feature={f} />)}
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Privacy Comparison */}
          <section className="py-24 px-4 bg-white border-y border-slate-100">

            <ScrollReveal animationClass="translate-y-12">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <h3 className="text-3xl font-black tracking-tight mb-4">Your Patient Data Never Leaves Your Clinic</h3>
                  <p className="text-slate-500 font-medium">Generic cloud software puts your practice at the mercy of remote servers. ClinicFloww keeps you in control.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="p-8 bg-blue-50 rounded-[2rem] border-2 border-blue-100">
                    <h4 className="font-black text-blue-600 uppercase tracking-widest text-xs mb-6">ClinicFloww Advantage</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-slate-700 font-bold text-sm"><CheckCircle2 className="text-blue-600" size={18} /> Local Database Storage</li>
                      <li className="flex items-center gap-3 text-slate-700 font-bold text-sm"><CheckCircle2 className="text-blue-600" size={18} /> 100% Offline-First (No Internet Needed)</li>
                      <li className="flex items-center gap-3 text-slate-700 font-bold text-sm"><CheckCircle2 className="text-blue-600" size={18} /> Hardware-Locked Security</li>
                    </ul>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 opacity-60">
                    <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-6">Typical Cloud Software</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-slate-400 font-bold text-sm"><X className="text-rose-400" size={18} /> External Server Storage</li>
                      <li className="flex items-center gap-3 text-slate-400 font-bold text-sm"><X className="text-rose-400" size={18} /> Internet-Dependent Workflows</li>
                      <li className="flex items-center gap-3 text-slate-400 font-bold text-sm"><X className="text-rose-400" size={18} /> Vendor-Controlled Access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* AI Focus - Outcome Driven */}
          <section className="py-32 px-4">

            <ScrollReveal animationClass="translate-y-16">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                  <div className="glass p-12 rounded-[3rem] shadow-2xl relative">
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full"></div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <TrendingUp className="text-blue-600" size={24} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recall Insight</p>
                          <p className="font-bold text-slate-900">42 Inactive patients found with high RCT potential.</p>
                        </div>
                      </div>
                      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <Activity className="text-emerald-500" size={24} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Alert</p>
                          <p className="font-bold text-slate-900">Composite resin expiring in 4 days. Re-order suggested.</p>
                        </div>
                      </div>
                      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <DollarSign className="text-amber-500" size={24} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue Leakage</p>
                          <p className="font-bold text-slate-900">₹12,400 in unpaid bills detected from last week.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full mb-8">
                    <Cpu className="text-blue-600" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">AI Intelligence</span>
                  </div>
                  <h2 className="text-5xl font-black mb-10 font-heading tracking-tighter leading-tight">AI That Finds Missed Revenue & Lost Patients.</h2>
                  <p className="text-slate-500 text-xl leading-relaxed font-medium mb-10">
                    ClinicFloww AI doesn't just "store" data; it synthesizes insights. From drafting prescriptions to identifying revenue leakage, it acts as your elite clinical business analyst.
                  </p>
                  <button onClick={() => safeScroll('contact')} className="inline-flex items-center gap-3 font-black text-blue-600 uppercase tracking-widest text-sm hover:underline">
                    Schedule Your Free AI Audit <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Key Features Summary Section - NEW */}
          <section id="key-features-summary" className="py-32 px-4 bg-slate-50/50 relative overflow-hidden">

            <ScrollReveal animationClass="translate-y-12">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                  <div>
                    <h2 className="text-5xl font-black mb-6 font-heading tracking-tighter leading-tight text-slate-900">Run Your Clinic Without Chaos.</h2>
                    <p className="text-slate-500 text-xl leading-relaxed font-medium mb-10 max-w-xl">
                      Everything you need to stay organized, profitable, and in control — without juggling multiple systems.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-6 mb-12">
                      {[
                        "Never miss appointments or patient recalls",
                        "Capture every treatment, quotation, and payment",
                        "Know exactly what’s happening in your clinic, every day",
                        "Keep patient data 100% private and locally stored"
                      ].map((bullet, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="p-1.5 bg-blue-100 rounded-full mt-1 shrink-0">
                            <CheckCircle2 size={14} className="text-blue-600" />
                          </div>
                          <p className="text-slate-700 font-bold text-sm leading-snug">{bullet}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-6">
                      <button
                        onClick={() => setShowFullFeatures(!showFullFeatures)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                      >
                        {showFullFeatures ? 'Hide all features' : 'See all features'}
                        {showFullFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => safeScroll('contact')}
                        className="px-8 py-4 glass border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all text-slate-700"
                      >
                        Download your free trial
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="glass p-8 rounded-[3rem] border border-white shadow-2xl relative">
                      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/80 rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-3">
                          <Calendar className="text-emerald-500" size={24} />
                          <p className="font-black text-xs uppercase tracking-widest text-slate-400">Scheduler</p>
                        </div>
                        <div className="p-6 bg-white/80 rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-3">
                          <CreditCard className="text-blue-500" size={24} />
                          <p className="font-black text-xs uppercase tracking-widest text-slate-400">Payments</p>
                        </div>
                        <div className="p-6 bg-white/80 rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-3">
                          <Users className="text-amber-500" size={24} />
                          <p className="font-black text-xs uppercase tracking-widest text-slate-400">Patients</p>
                        </div>
                        <div className="p-6 bg-white/80 rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-3">
                          <Lock className="text-slate-900" size={24} />
                          <p className="font-black text-xs uppercase tracking-widest text-slate-400">Privacy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Full Feature Set */}
                {showFullFeatures && (
                  <div className="mt-20 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="text-center mb-16">
                      <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Complete Feature Set</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verify ClinicFloww completeness</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {featureGroups.map((group, idx) => (
                        <div key={idx} className="glass p-8 rounded-[2.5rem] border border-white shadow-lg hover:shadow-xl transition-shadow group">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                              {group.icon}
                            </div>
                            <h4 className="font-black text-sm tracking-tight text-slate-900">{group.group_title}</h4>
                          </div>
                          <ul className="space-y-3">
                            {group.features.map((item, i) => (
                              <li key={i} className="flex gap-3 text-sm font-medium text-slate-600 leading-snug">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-2 shrink-0 group-hover:bg-blue-300 transition-colors" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-16 text-center">
                      <button
                        onClick={() => safeScroll('contact')}
                        className="bg-slate-900 text-white px-12 py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-black shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
                      >
                        Download your free trial
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </section>

          <section id="contact" className="py-32 px-4 bg-slate-50">

            <ScrollReveal animationClass="translate-x-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-6xl font-black mb-6 font-heading tracking-tighter">Initialize Your Transformation.</h2>
                <p className="text-xl text-slate-500 mb-4 font-medium px-4">Request your secure access and personalized clinic audit today.</p>
                <div className="inline-block bg-blue-100/50 border border-blue-200 text-blue-800 px-6 py-3 rounded-2xl mb-10">
                  <p className="text-sm font-bold tracking-tight">Fill out the form below to get your secure app download links! <br /><span className="text-blue-600">Available for macOS and Windows.</span></p>
                </div>

                <div className="flex items-center justify-center gap-3 mb-16">
                  <div className="h-px w-12 sm:w-24 bg-slate-200 hidden sm:block" />
                  <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-slate-400 text-center">
                    Email: <span className="text-blue-600">clinicfloww@gmail.com</span> <span className="mx-2 inline-block">|</span> Mobile: <span className="text-blue-600">8369908157</span>
                  </p>
                  <div className="h-px w-12 sm:w-24 bg-slate-200 hidden sm:block" />
                </div>

                <div className="glass p-8 md:p-12 rounded-[3rem] shadow-2xl text-center border border-white">
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8 text-left inline-block max-w-2xl">
                    <div className="flex gap-4 items-start">
                      <AlertCircle className="text-amber-600 shrink-0 mt-1" size={24} />
                      <div>
                        <h4 className="font-black text-amber-900 text-lg mb-1">Important: License Activation</h4>
                        <p className="text-amber-800 text-sm leading-relaxed mb-3">After you submit the form below, the <b>download links</b> and instructions to generate your free-tier key will be provided immediately in the confirmation message!</p>

                        <div className="mt-4 pt-4 border-t border-amber-200/50">
                          <p className="text-amber-800 text-xs text-center"><a href="https://api.whatsapp.com/send?phone=918369908157" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold hover:text-blue-800">Need help instantly? Connect with us on WhatsApp</a></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full relative rounded-2xl">
                    <ContactForm />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </>
      ) : (
        renderContent()
      )}

      {/* Video Walkthrough Section */}
      <section id="demo-video" className="py-24 px-4 relative z-10 bg-white">

        <ScrollReveal animationClass="scale-95 opacity-0">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 px-6 py-3 rounded-full mb-8">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Platform Walkthrough</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-16 font-heading tracking-tighter">See ClinicFloww in Action.</h2>

            <VideoSlider videos={[
              { url: "https://youtu.be/Zr3CCzOpQp0", title: "Setting Up" },
              { url: "https://youtu.be/nN4joIyUKr8", title: "Syncing Google" },
              { url: "https://youtu.be/lThXMWp8VZQ", title: "AI Setup" },
              { url: "https://youtu.be/6fVm5qsqMD8", title: "WhatsApp Setup" },
              { url: "https://youtu.be/zu69nTpgwXw", title: "Patient Records and Bills" },
              { url: "https://youtu.be/WqR7g6DLnrw", title: "Schedule Appointments" },
              { url: "https://youtu.be/2Xw6OK-CjEI", title: "Accounts" },
              { url: "https://youtu.be/zRo8f-hW0yY", title: "Staff Records" },
              { url: "https://youtu.be/QdXGnfllBxM", title: "AI chat" },
              { url: "https://youtu.be/Yc3XujLhmNw", title: "Dashboard and Analytics" }
            ]} />
          </div>
        </ScrollReveal>
      </section>

      <footer className="bg-white py-20 px-4 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Stethoscope className="text-white w-7 h-7" />
            </div>
            <span className="font-black text-3xl text-slate-900 font-heading tracking-tighter">ClinicFloww</span>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">© 2024 Elite Management Systems. Local Data Mastery.</p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a href="mailto:ClinicFloww@gmail.com" className="hover:text-blue-600 transition-colors">Support</a>
            {/* UPDATED Footer Link */}
            <a href="https://api.whatsapp.com/send?phone=918369908157" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">WhatsApp Support</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      <ChatBot />

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500"
          onClick={() => setShowEasterEgg(false)}
        >
          <div className="flex flex-col items-center gap-8 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src="/images/founders/Easter.PNG"
              alt="Easter Egg"
              className="max-h-[65vh] w-auto object-contain rounded-3xl shadow-2xl shadow-blue-500/20 border-2 border-white/10 animate-in zoom-in-95 duration-500"
            />
            <button
              onClick={() => {
                setShowEasterEgg(false);
                safeScroll('contact');
              }}
              className="bg-blue-600 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-500 shadow-2xl shadow-blue-500/40 transition-all hover:scale-110 active:scale-95 flex items-center gap-3 animate-in slide-in-from-bottom-8 duration-700"
            >
              Download App Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
