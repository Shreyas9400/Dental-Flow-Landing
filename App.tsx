import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
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
  Info,
  Mic,
  Camera,
  FlaskConical,
  Megaphone,
  QrCode,
  PenLine,
  CloudUpload,
  Quote,
  ArrowRight,
  WifiOff,
  Monitor
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
import { TESTIMONIALS, STATS } from './constants/socialProof';

const Hero3D = lazy(() => import('./src/components/Hero3D'));

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- ScrollReveal: fades content in once it enters the viewport ---
const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; animationClass: string; delay?: number }> = ({ children, className = "", animationClass, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${animationClass}`}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
};

// --- TiltCard: rotates toward the pointer in 3D with a moving glare ---
const TiltCard: React.FC<{ children: React.ReactNode; className?: string; max?: number }> = ({ children, className = '', max = 10 }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative preserve-3d transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(500px circle at var(--gx, 50%) var(--gy, 50%), rgba(103,232,249,0.12), transparent 40%)' }}
      />
      {children}
    </div>
  );
};

// --- PerspectiveOnScroll: starts tilted back in 3D and straightens as it scrolls into view ---
const PerspectiveOnScroll: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(prefersReducedMotion() ? 1 : 0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setProgress(Math.min(Math.max((vh - r.top) / (vh * 0.9), 0), 1));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const eased = 1 - Math.pow(1 - progress, 3);
  return (
    <div ref={ref} className={className} style={{ perspective: '1600px' }}>
      <div
        style={{
          transform: `rotateX(${(1 - eased) * 28}deg) scale(${0.88 + eased * 0.12}) translateY(${(1 - eased) * 40}px)`,
          transformOrigin: 'center top',
          opacity: 0.4 + eased * 0.6,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
  <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2 mb-8">
    {icon ?? <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_2px_rgba(103,232,249,0.7)]" />}
    <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-200/90">{children}</span>
  </div>
);

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

  const navButton = "w-11 h-11 sm:w-14 sm:h-14 rounded-full glass-dark flex items-center justify-center text-slate-300 hover:text-cyan-200 hover:border-cyan-300/40 transition-all hover:scale-110 active:scale-95 pointer-events-auto";

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-12">
      <div className="gradient-border rounded-[2rem] p-px">
        <div className="overflow-hidden rounded-[2rem] aspect-video bg-black">
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
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <span className="text-white opacity-50 font-medium">Loading...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-[calc(50%-4rem)] -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none md:-mx-6">
        <button onClick={prevSlide} aria-label="Previous video" className={navButton}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button onClick={nextSlide} aria-label="Next video" className={navButton}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      <div className="flex justify-center items-center flex-col mt-10">
        <h3 className="text-2xl font-bold text-white font-heading tracking-tight">{videos[currentIndex].title}</h3>
        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mt-2">{String(currentIndex + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}</p>

        <div className="flex gap-2 flex-wrap justify-center mt-6 max-w-md">
          {videos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-cyan-300' : 'w-1.5 bg-slate-700 hover:bg-slate-500'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CountUp = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (prefersReducedMotion()) { setDisplay(value); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1600, 1);
        setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
};

const StatsStrip = () => {
  if (STATS.length === 0) return null;
  return (
    <div className={`grid grid-cols-2 ${STATS.length > 2 ? 'md:grid-cols-4' : ''} gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06]`}>
      {STATS.map((s, i) => (
        <div key={i} className="bg-[#070a12] px-6 py-8 text-center">
          <p className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-gradient mb-2">
            <CountUp value={s.value} suffix={s.suffix} />
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

const Testimonials = () => {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section id="testimonials" className="py-32 px-4 relative overflow-hidden">
      <ScrollReveal animationClass="translate-y-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>From the chairside</SectionLabel>
            <h2 className="text-5xl md:text-6xl font-extrabold font-heading tracking-tight text-white">
              Trusted by <span className="font-serif-accent text-gradient">doctors.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <TiltCard key={i} className="rounded-[2rem]">
                <div className="glass-dark rounded-[2rem] p-8 h-full flex flex-col">
                  <Quote className="text-cyan-300/40 mb-5" size={28} />
                  <p className="text-slate-300 leading-relaxed mb-8 flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-cyan-300/10 text-cyan-200 flex items-center justify-center font-bold text-sm">
                        {t.name.replace(/^Dr\.?\s*/, '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white text-sm">{t.name}</p>
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                        {[t.role, t.clinic, t.city].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
// ---------------------------------------------------

const safeScroll = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const navbarHeight = 96;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navbarHeight;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

const Navbar = ({ onViewChange, currentView }: { onViewChange: (v: ViewState) => void, currentView: ViewState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const landingLinks = [
    { label: 'Features', id: 'features' },
    { label: "What's new", id: 'whats-new' },
    { label: 'By doctors', id: 'about' },
    { label: 'Demo', id: 'demo-video' },
    { label: 'Contact', id: 'contact' },
  ];

  const linkClass = "text-slate-400 hover:text-white text-sm font-medium transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[70] px-4 pt-4">
      <div className={`max-w-6xl mx-auto rounded-2xl transition-all duration-500 ${scrolled || isOpen ? 'glass-dark shadow-2xl shadow-black/40' : 'border border-transparent'}`}>
        <div className="flex justify-between h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewChange('landing')}>
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-300 to-teal-400 flex items-center justify-center group-hover:rotate-[-8deg] transition-transform shadow-[0_0_24px_rgba(103,232,249,0.35)]">
              <Stethoscope className="text-slate-950 w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold font-heading text-white tracking-tight">ClinicFloww</span>
          </div>

          <div className="hidden md:flex items-center gap-7">
            {currentView !== 'landing' && navLinks.map(link => (
              <button
                key={link.view}
                onClick={() => onViewChange(link.view)}
                className={`${currentView === link.view ? 'text-white' : 'text-slate-400'} hover:text-white text-sm font-medium transition-colors`}
              >
                {link.label}
              </button>
            ))}
            {currentView === 'landing' && landingLinks.map(link => (
              <button key={link.id} onClick={() => handleNav(link.id)} className={linkClass}>{link.label}</button>
            ))}
            <button
              onClick={() => {
                if (currentView === 'landing') {
                  safeScroll('contact');
                } else {
                  onViewChange('landing');
                }
              }}
              className="btn-shine text-slate-950 px-5 py-2.5 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.03] active:scale-95 flex items-center gap-1.5"
            >
              {currentView === 'landing' ? 'Start free trial' : 'Exit Console'}
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" className="text-slate-300 p-2">
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden px-4 pb-4 space-y-1">
            {currentView !== 'landing' ? navLinks.map(link => (
              <button key={link.view} onClick={() => { onViewChange(link.view); setIsOpen(false); }} className="block w-full text-left py-3 font-medium text-slate-300">{link.label}</button>
            )) : landingLinks.map(link => (
              <button key={link.id} onClick={() => handleNav(link.id)} className="block w-full text-left py-3 font-medium text-slate-300">{link.label}</button>
            ))}
            <button onClick={() => { safeScroll('contact'); setIsOpen(false); }} className="block w-full btn-shine text-slate-950 px-6 py-3 rounded-xl text-center font-semibold mt-2">Start free trial</button>
          </div>
        )}
      </div>
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
      description: '100% local storage. Your patient records never leave your secure clinic infrastructure. Complete data ownership.',
      icon: <Lock size={26} />
    },
    {
      id: 'accounts',
      title: 'Admin Mastery',
      description: 'Comprehensive oversight of practice logistics. Manage doctors, staff permissions, and schedules from a single clinical hub.',
      icon: <LayoutDashboard size={26} />
    },
    {
      id: 'intelligence',
      title: 'Clinical Intelligence',
      description: 'AI that finds missed revenue, overdue recalls, and expiring inventory. Professional prescriptions in 2 seconds.',
      icon: <Cpu size={26} />
    }
  ];

  const featureGroups = [
    {
      group_title: "Patient & Clinical Management",
      icon: <Users size={18} />,
      features: [
        "Comprehensive patient records and medical history",
        "Treatment history with clinical notes",
        "Interactive dental odontogram charting",
        "Treatment photo gallery per patient",
        "Printable case papers from your own templates",
        "Digital consent forms with patient and doctor signatures",
        "Digital prescriptions",
        "Lab work tracking"
      ]
    },
    {
      group_title: "Appointments & Follow-Ups",
      icon: <Calendar size={18} />,
      features: [
        "Appointment scheduling calendar",
        "Per-doctor schedule calendars",
        "Daily appointment planning",
        "Automated follow-up and recall reminders",
        "WhatsApp appointment notifications",
        "Two-way WhatsApp chat with patients",
        "AI-drafted WhatsApp campaigns"
      ]
    },
    {
      group_title: "Billing & Revenue",
      icon: <DollarSign size={18} />,
      features: [
        "Digital billing and invoicing",
        "Treatment quotations",
        "Payment tracking and outstanding balances",
        "Expense tracking by category",
        "Revenue, profitability and top-patient reports"
      ]
    },
    {
      group_title: "Inventory & Operations",
      icon: <Briefcase size={18} />,
      features: [
        "Inventory tracking",
        "Expiry date alerts",
        "Cost and price history tracking"
      ]
    },
    {
      group_title: "Insights, AI & Automation",
      icon: <Sparkles size={18} />,
      features: [
        "Patient insights and trends",
        "AI-assisted clinical summaries",
        "AI-generated prescriptions",
        "AI-drafted consent forms",
        "Natural language clinic queries",
        "Voice assistant (beta)"
      ]
    },
    {
      group_title: "Security & System",
      icon: <Lock size={18} />,
      features: [
        "100% local database storage",
        "Offline operation",
        "Automated backups, with optional Google Drive backup",
        "Use on phones and tablets over clinic Wi-Fi",
        "Role-based staff access permissions",
        "Hardware-locked licensing"
      ]
    }
  ];

  const newFeatures = [
    { icon: <Mic size={22} />, title: 'Voice Assistant', tag: 'Beta', span: 'lg:col-span-2', description: 'Ask "Tell me about Rahul Sharma" or "What is outstanding this month?" and get the answer from your own clinic data.' },
    { icon: <QrCode size={22} />, title: 'Phones & Tablets', description: 'Scan a QR code to open ClinicFloww on any device on your clinic Wi-Fi. Data still stays on your clinic PC.' },
    { icon: <Stethoscope size={22} />, title: 'Odontogram Charting', description: 'Chart conditions and treatments tooth by tooth on an interactive dental chart.' },
    { icon: <Camera size={22} />, title: 'Treatment Photos', description: 'Keep before and after clinical images in each patient\'s visual record.' },
    { icon: <FlaskConical size={22} />, title: 'Lab Tracking', description: 'Track lab work sent out and received, so no crown or denture goes missing.' },
    { icon: <PenLine size={22} />, title: 'Signed Consent & Case Papers', description: 'Collect patient and doctor signatures, draft consent with AI, and print case papers from your template.' },
    { icon: <Megaphone size={22} />, title: 'AI Campaigns', span: 'lg:col-span-2', description: 'Draft WhatsApp campaigns with AI and chat with patients two-way from inside the app.' },
    { icon: <CloudUpload size={22} />, title: 'Google Drive Backup', description: 'Optional backup to your own Google Drive account, alongside local backups.' },
    { icon: <Users size={22} />, title: 'Staff Access Control', span: 'lg:col-span-2', description: 'Give each doctor and assistant only the screens and actions their role needs.' },
  ];

  const marqueeItems = ['Appointments', 'Billing', 'Odontogram', 'WhatsApp', 'Inventory', 'Prescriptions', 'Lab Tracking', 'Consent Forms', 'Voice AI', 'Expenses', 'Recalls', 'Case Papers', 'Staff Access', 'Analytics'];

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <DashboardView patients={patients} appointments={appointments} inventory={inventory} />;
      case 'billing': return <BillingView />;
      case 'patients': return <PatientsView patients={patients} />;
      default: return null;
    }
  };

  const primaryCta = "btn-shine text-slate-950 px-8 py-4 rounded-2xl font-semibold text-base transition-transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 shadow-[0_10px_40px_-10px_rgba(103,232,249,0.6)]";
  const secondaryCta = "glass-dark px-8 py-4 rounded-2xl font-semibold text-base text-slate-200 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2";

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-200 selection:bg-cyan-300/30 selection:text-white overflow-x-hidden">
      <Navbar currentView={view} onViewChange={setView} />

      {view === 'landing' ? (
        <>
          {/* Hero */}
          <section id="hero" className="relative min-h-[100svh] flex items-center pt-28 pb-16 px-4 overflow-hidden noise">
            {/* Aurora + grid background */}
            <div className="absolute inset-0 -z-0 pointer-events-none">
              <div className="absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full bg-cyan-500/20 blur-[140px] animate-aurora" />
              <div className="absolute top-20 right-[-10%] w-[560px] h-[560px] rounded-full bg-indigo-500/20 blur-[140px] animate-aurora [animation-delay:-6s]" />
              <div className="absolute bottom-[-20%] left-1/3 w-[520px] h-[520px] rounded-full bg-teal-400/10 blur-[140px] animate-aurora [animation-delay:-12s]" />
              <div className="absolute inset-x-0 bottom-0 h-[55%] grid-floor" style={{ transform: 'perspective(600px) rotateX(60deg)', transformOrigin: 'bottom' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center">
              <ScrollReveal animationClass="translate-y-8" delay={100}>
                <SectionLabel>Built by a practicing clinician</SectionLabel>

                <h1 className="font-heading text-[2.9rem] leading-[1.02] sm:text-6xl md:text-7xl xl:text-[5.4rem] font-extrabold text-white tracking-[-0.035em] mb-7">
                  The world's first <span className="font-serif-accent text-gradient pr-1">local-first</span> AI clinic app.
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                  Run your practice with 40% less admin. Appointments, billing, inventory, WhatsApp and AI insights, all on your own clinic PC. Designed by doctors, not software vendors.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => safeScroll('contact')} className={`${primaryCta} group`}>
                    Download your free trial
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button onClick={() => safeScroll('interactive-dashboard-snapshot')} className={secondaryCta}>
                    See live demo
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <span className="flex items-center gap-2"><Monitor size={14} className="text-cyan-300/70" /> macOS &amp; Windows</span>
                  <span className="flex items-center gap-2"><WifiOff size={14} className="text-cyan-300/70" /> Works offline</span>
                  <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-cyan-300/70" /> Data stays local</span>
                </div>
              </ScrollReveal>

              {/* 3D scene with floating product chips */}
              <div className="relative h-[420px] sm:h-[520px] lg:h-[640px] -mx-4 lg:mx-0">
                <Suspense fallback={null}>
                  <Hero3D className="absolute inset-0" />
                </Suspense>
                <div className="absolute top-[12%] left-[2%] sm:left-[6%] glass-dark rounded-2xl px-4 py-3 animate-float shadow-2xl shadow-black/40">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Recall insight</p>
                  <p className="text-sm font-semibold text-white">42 patients due for follow-up</p>
                </div>
                <div className="absolute bottom-[18%] right-[2%] sm:right-[4%] glass-dark rounded-2xl px-4 py-3 animate-float [animation-delay:-2s] shadow-2xl shadow-black/40">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Revenue leakage</p>
                  <p className="text-sm font-semibold text-emerald-300">₹12,400 unpaid, flagged</p>
                </div>
                <div className="absolute bottom-[6%] left-[10%] glass-dark rounded-2xl px-4 py-3 animate-float [animation-delay:-4s] shadow-2xl shadow-black/40 hidden sm:block">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Voice</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2"><Mic size={14} className="text-cyan-300" /> "Open Rahul's record"</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="px-4 -mt-4 relative z-10">
            <ScrollReveal className="max-w-6xl mx-auto" animationClass="translate-y-8">
              <StatsStrip />
            </ScrollReveal>
          </section>

          {/* Marquee */}
          <section className="py-16 overflow-hidden" aria-hidden="true">
            <div className="relative [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
              <div className="flex w-max animate-marquee gap-12">
                {[...marqueeItems, ...marqueeItems].map((item, i) => (
                  <span key={i} className="font-heading text-3xl md:text-4xl font-bold text-slate-700/80 whitespace-nowrap flex items-center gap-12">
                    {item}
                    <span className="w-2 h-2 rounded-full bg-cyan-300/40" />
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Dashboard Snapshot */}
          <section id="interactive-dashboard-snapshot" className="pb-32 pt-8 px-4 relative">
            <div className="max-w-7xl mx-auto text-center mb-14">
              <SectionLabel>Live preview</SectionLabel>
              <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                Your whole clinic, <span className="font-serif-accent text-gradient">one screen.</span>
              </h2>
            </div>
            <PerspectiveOnScroll className="max-w-7xl mx-auto">
              <div className="relative">
                <div className="absolute -inset-x-10 -top-10 bottom-0 bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="gradient-border relative rounded-[1.75rem] p-px shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
                  <div className="rounded-[1.75rem] overflow-hidden bg-[#0b0f1a]">
                    <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.06]">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest bg-white/[0.04] px-4 py-1.5 rounded-full">
                        localhost · clinicfloww
                      </div>
                      <div className="w-12"></div>
                    </div>
                    <div className="h-[640px] md:h-[780px] overflow-y-auto custom-scrollbar bg-slate-50 text-slate-900">
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
              </div>
            </PerspectiveOnScroll>
          </section>

          {/* Outcomes */}
          <section id="features" className="py-32 px-4 relative">
            <div className="max-w-7xl mx-auto">
              <ScrollReveal animationClass="translate-y-12" className="text-center mb-20">
                <SectionLabel>Outcomes</SectionLabel>
                <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                  Clinical precision. <span className="font-serif-accent text-gradient">Business mastery.</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">Outcome-focused infrastructure that simplifies complex workflows while maximizing clinic footfall and revenue.</p>
              </ScrollReveal>
              <div className="grid md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <ScrollReveal key={f.id} animationClass="translate-y-12" delay={i * 120}>
                    <TiltCard className="rounded-[2rem] h-full">
                      <div className="glass-dark rounded-[2rem] p-9 h-full relative overflow-hidden">
                        <span className="absolute top-6 right-7 font-mono text-xs text-slate-600">0{i + 1}</span>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-300/20 to-indigo-400/10 border border-cyan-300/20 text-cyan-200 flex items-center justify-center mb-8" style={{ transform: 'translateZ(40px)' }}>
                          {f.icon}
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{f.description}</p>
                      </div>
                    </TiltCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* What's New - bento */}
          <section id="whats-new" className="py-32 px-4 relative overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />
            <div className="max-w-7xl mx-auto relative">
              <ScrollReveal animationClass="translate-y-12" className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
                <div>
                  <SectionLabel icon={<Sparkles size={14} className="text-cyan-300" />}>What's new</SectionLabel>
                  <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    More ways to run <br className="hidden md:block" />your <span className="font-serif-accent text-gradient">clinic.</span>
                  </h2>
                </div>
                <p className="text-slate-400 max-w-sm text-lg">Recent additions to ClinicFloww, shaped by feedback from practicing doctors.</p>
              </ScrollReveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {newFeatures.map((f, i) => (
                  <ScrollReveal key={i} animationClass="translate-y-10" delay={(i % 3) * 100} className={f.span ?? ''}>
                    <TiltCard className="rounded-[1.75rem] h-full" max={6}>
                      <div className="glass-dark rounded-[1.75rem] p-7 h-full relative overflow-hidden hover:border-cyan-300/20 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 text-cyan-200 flex items-center justify-center group-hover:bg-cyan-300 group-hover:text-slate-950 transition-colors">
                            {f.icon}
                          </div>
                          {f.tag && (
                            <span className="font-mono px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest bg-amber-300/10 text-amber-200 border border-amber-300/20">{f.tag}</span>
                          )}
                        </div>
                        <h3 className="font-heading text-xl font-bold mb-2 tracking-tight text-white">{f.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-[15px] max-w-md">{f.description}</p>
                        {i === 0 && (
                          <div className="flex items-end gap-1 h-12 mt-8" aria-hidden="true">
                            {Array.from({ length: 48 }).map((_, b) => (
                              <span
                                key={b}
                                className="flex-1 rounded-full bg-gradient-to-t from-cyan-400/30 to-teal-200/80 animate-float"
                                style={{ height: `${20 + Math.abs(Math.sin(b * 0.55)) * 80}%`, animationDuration: `${1.2 + (b % 5) * 0.25}s`, animationDelay: `${-b * 0.08}s` }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </TiltCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* AI Focus - layered 3D cards */}
          <section className="py-32 px-4 relative">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
              <ScrollReveal animationClass="translate-y-12" className="order-2 lg:order-1">
                <div className="relative h-[420px] flex items-center justify-center" style={{ perspective: '1200px' }}>
                  <div className="relative w-full max-w-md preserve-3d" style={{ transform: 'rotateX(14deg) rotateY(-18deg)' }}>
                    {[
                      { icon: <TrendingUp className="text-cyan-300" size={22} />, label: 'Recall insight', text: '42 inactive patients found with high RCT potential.', z: 120, y: -150 },
                      { icon: <Activity className="text-emerald-300" size={22} />, label: 'Inventory alert', text: 'Composite resin expiring in 4 days. Re-order suggested.', z: 60, y: -20 },
                      { icon: <DollarSign className="text-amber-300" size={22} />, label: 'Revenue leakage', text: '₹12,400 in unpaid bills detected from last week.', z: 0, y: 110 },
                    ].map((c, i) => (
                      <div key={i} className="absolute inset-x-0 animate-float" style={{ animationDelay: `${-i * 1.5}s` }}>
                        <div
                          className="glass-dark rounded-2xl p-6 flex items-center gap-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
                          style={{ transform: `translateY(${c.y}px) translateZ(${c.z}px) translateX(${i * 24}px)` }}
                        >
                          <div className="w-12 h-12 shrink-0 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">{c.icon}</div>
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{c.label}</p>
                            <p className="font-semibold text-white">{c.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal animationClass="translate-y-12" className="order-1 lg:order-2">
                <SectionLabel icon={<Cpu size={14} className="text-cyan-300" />}>AI intelligence</SectionLabel>
                <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-8">
                  AI that finds <span className="font-serif-accent text-gradient">missed revenue</span> and lost patients.
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10">
                  ClinicFloww AI doesn't just store data; it synthesizes insights. From drafting prescriptions to identifying revenue leakage, it acts as your clinical business analyst.
                </p>
                <button onClick={() => safeScroll('contact')} className="inline-flex items-center gap-2 font-semibold text-cyan-200 hover:text-white transition-colors group">
                  Schedule your free AI audit <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </ScrollReveal>
            </div>
          </section>

          {/* Trust / founder */}
          <section id="about" className="py-8 px-4">
            <ScrollReveal animationClass="translate-y-16">
              <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-white/[0.08] bg-gradient-to-br from-[#0b1222] via-[#070a12] to-[#0a0f1f] px-6 py-20 md:px-16 noise">
                <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-cyan-400/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
                  <div>
                    <SectionLabel icon={<Award size={14} className="text-cyan-300" />}>By practicing clinicians</SectionLabel>
                    <h2 className="font-heading text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.02] mb-12">
                      Built by a doctor, <br /><span className="font-serif-accent text-gradient">not software vendors.</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-10 max-w-md">
                      <div>
                        <p className="font-heading text-5xl font-extrabold text-white mb-2 tracking-tight">100%</p>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Data ownership</p>
                      </div>
                      <div>
                        <p className="font-heading text-5xl font-extrabold text-gradient mb-2 tracking-tight">0%</p>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Cloud risk</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-end">
                    <TiltCard className="rounded-[2rem] w-full max-w-sm" max={12}>
                      <div onClick={() => setShowEasterEgg(true)} className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-800 relative cursor-pointer border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">
                        <img src={ASSETS.IMAGES.FOUNDERS.SAYALI} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="Dr. Sayali Jadhav, CEO" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-6 z-20 pointer-events-none" style={{ transform: 'translateZ(50px)' }}>
                          <p className="font-mono uppercase text-[10px] tracking-widest text-cyan-300">CEO</p>
                          <p className="font-heading font-bold text-xl text-white">Dr. Sayali Jadhav</p>
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          <Testimonials />

          {/* Privacy Comparison */}
          <section className="py-32 px-4">
            <ScrollReveal animationClass="translate-y-12">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <h3 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Your patient data <span className="font-serif-accent text-gradient">never leaves</span> your clinic.</h3>
                  <p className="text-slate-400 text-lg">Generic cloud software puts your practice at the mercy of remote servers. ClinicFloww keeps you in control.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="gradient-border rounded-[2rem]">
                    <div className="p-8 rounded-[2rem] bg-cyan-300/[0.05] h-full">
                      <h4 className="font-mono text-cyan-200 uppercase tracking-widest text-xs mb-6">ClinicFloww advantage</h4>
                      <ul className="space-y-4">
                        {['Local database storage', '100% offline-first (no internet needed)', 'Hardware-locked security'].map(t => (
                          <li key={t} className="flex items-center gap-3 text-white font-medium"><CheckCircle2 className="text-cyan-300 shrink-0" size={20} /> {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-8 rounded-[2rem] border border-white/[0.06] bg-white/[0.02]">
                    <h4 className="font-mono text-slate-500 uppercase tracking-widest text-xs mb-6">Typical cloud software</h4>
                    <ul className="space-y-4">
                      {['External server storage', 'Internet-dependent workflows', 'Vendor-controlled access'].map(t => (
                        <li key={t} className="flex items-center gap-3 text-slate-500 font-medium"><X className="text-rose-400/70 shrink-0" size={20} /> {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Key Features Summary */}
          <section id="key-features-summary" className="py-32 px-4 relative overflow-hidden border-t border-white/[0.05]">
            <ScrollReveal animationClass="translate-y-12">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                  <div>
                    <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">Run your clinic <span className="font-serif-accent text-gradient">without chaos.</span></h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">
                      Everything you need to stay organized, profitable, and in control, without juggling multiple systems.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-5 mb-12">
                      {[
                        "Never miss appointments or patient recalls",
                        "Capture every treatment, quotation, and payment",
                        "Know exactly what's happening in your clinic, every day",
                        "Keep patient data 100% private and locally stored"
                      ].map((bullet, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <CheckCircle2 size={18} className="text-cyan-300 mt-0.5 shrink-0" />
                          <p className="text-slate-300 font-medium leading-snug">{bullet}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <button onClick={() => setShowFullFeatures(!showFullFeatures)} className={primaryCta}>
                        {showFullFeatures ? 'Hide all features' : 'See all features'}
                        {showFullFeatures ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <button onClick={() => safeScroll('contact')} className={secondaryCta}>
                        Download your free trial
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:flex justify-center" style={{ perspective: '1000px' }}>
                    <div className="grid grid-cols-2 gap-4 preserve-3d" style={{ transform: 'rotateX(18deg) rotateZ(-8deg)' }}>
                      {[
                        { icon: <Calendar size={26} />, label: 'Scheduler', c: 'text-emerald-300' },
                        { icon: <CreditCard size={26} />, label: 'Payments', c: 'text-cyan-300' },
                        { icon: <Users size={26} />, label: 'Patients', c: 'text-amber-300' },
                        { icon: <Lock size={26} />, label: 'Privacy', c: 'text-indigo-300' },
                      ].map((t, i) => (
                        <div key={t.label} className="animate-float" style={{ animationDelay: `${-i * 1.2}s` }}>
                          <div className="glass-dark w-44 h-44 rounded-3xl flex flex-col justify-between p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]">
                            <span className={t.c}>{t.icon}</span>
                            <p className="font-mono text-xs uppercase tracking-widest text-slate-400">{t.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expandable Full Feature Set */}
                {showFullFeatures && (
                  <div className="mt-20 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="text-center mb-14">
                      <h3 className="font-heading text-3xl font-bold tracking-tight text-white mb-2">Complete feature set</h3>
                      <p className="font-mono text-slate-500 uppercase tracking-widest text-[11px]">Everything in ClinicFloww</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {featureGroups.map((group, idx) => (
                        <div key={idx} className="glass-dark p-7 rounded-[1.75rem] hover:border-cyan-300/20 transition-colors">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 rounded-xl bg-white/[0.05] text-cyan-200">
                              {group.icon}
                            </div>
                            <h4 className="font-heading font-bold text-white">{group.group_title}</h4>
                          </div>
                          <ul className="space-y-2.5">
                            {group.features.map((item, i) => (
                              <li key={i} className="flex gap-3 text-[15px] text-slate-400 leading-snug">
                                <div className="w-1 h-1 rounded-full bg-cyan-300/60 mt-2.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </section>

          {/* Video Walkthrough */}
          <section id="demo-video" className="py-32 px-4 relative z-10">
            <ScrollReveal animationClass="scale-95">
              <div className="max-w-5xl mx-auto text-center">
                <SectionLabel>Platform walkthrough</SectionLabel>
                <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-16">See ClinicFloww <span className="font-serif-accent text-gradient">in action.</span></h2>

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

          {/* Contact */}
          <section id="contact" className="py-32 px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-cyan-400/10 blur-[160px] rounded-full" />
            </div>
            <ScrollReveal animationClass="translate-y-10">
              <div className="max-w-4xl mx-auto text-center relative">
                <SectionLabel>Get started</SectionLabel>
                <h2 className="font-heading text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.02] mb-6">Initialize your <span className="font-serif-accent text-gradient">transformation.</span></h2>
                <p className="text-lg text-slate-400 mb-6">Request your secure access and personalized clinic audit today.</p>
                <p className="text-slate-300 mb-10">Fill out the form below to get your secure app download links. <span className="text-cyan-200">Available for macOS and Windows.</span></p>

                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-14 font-mono text-xs md:text-sm uppercase tracking-[0.15em] text-slate-500">
                  <span>Email: <a href="mailto:clinicfloww@gmail.com" className="text-cyan-200 hover:text-white normal-case tracking-normal">clinicfloww@gmail.com</a></span>
                  <span className="hidden sm:inline text-slate-700">|</span>
                  <span>Mobile: <a href="tel:+918369908157" className="text-cyan-200 hover:text-white">8369908157</a></span>
                </div>

                <div className="gradient-border rounded-[2.5rem] p-px">
                  <div className="bg-white text-slate-900 p-6 md:p-12 rounded-[2.5rem] text-center">
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8 text-left inline-block max-w-2xl">
                      <div className="flex gap-4 items-start">
                        <AlertCircle className="text-amber-600 shrink-0 mt-1" size={24} />
                        <div>
                          <h4 className="font-bold text-amber-900 text-lg mb-1">Important: License Activation</h4>
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
              </div>
            </ScrollReveal>
          </section>
        </>
      ) : (
        <div className="bg-slate-50 text-slate-900 min-h-screen">
          {renderContent()}
        </div>
      )}

      <footer className="py-16 px-4 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-300 to-teal-400 flex items-center justify-center">
              <Stethoscope className="text-slate-950 w-5 h-5" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-white tracking-tight">ClinicFloww</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-600">© {new Date().getFullYear()} Elite Management Systems. Local Data Mastery.</p>
          <div className="flex gap-8 text-sm text-slate-400">
            <a href="mailto:ClinicFloww@gmail.com" className="hover:text-white transition-colors">Support</a>
            <a href="https://api.whatsapp.com/send?phone=918369908157" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Support</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
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
              className="max-h-[65vh] w-auto object-contain rounded-3xl shadow-2xl shadow-cyan-500/20 border-2 border-white/10 animate-in zoom-in-95 duration-500"
            />
            <button
              onClick={() => {
                setShowEasterEgg(false);
                safeScroll('contact');
              }}
              className={primaryCta}
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
