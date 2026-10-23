import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import {
  ShieldCheck,
  Calendar,
  Cpu,
  CreditCard,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  Stethoscope,
  Briefcase,
  Send,
  Award,
  Users,
  LayoutDashboard,
  TrendingUp,
  Activity,
  DollarSign,
  Bot,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Mic,
  Camera,
  FlaskConical,
  Megaphone,
  QrCode,
  PenLine,
  CloudUpload,
  Quote,
  ArrowRight,
  MessageSquare,
  Wifi,
  Globe,
  HardDrive,
  CloudOff,
  Home,
  Building2,
  Plane,
  Plus
} from 'lucide-react';
import { marked } from 'marked';
import { getGeminiResponse } from './services/geminiService';
import { ChatMessage, Feature, ViewState, Patient, Appointment, InventoryItem } from './types';
import { ASSETS } from './constants/assets';
import ContactForm from './src/components/ContactForm';
import { TESTIMONIALS, STATS } from './constants/socialProof';
import { FAQ } from './constants/faq';

const PatientsView = lazy(() => import('./src/components/ConsoleViews').then(m => ({ default: m.PatientsView })));
const BillingView = lazy(() => import('./src/components/ConsoleViews').then(m => ({ default: m.BillingView })));
const DashboardView = lazy(() => import('./src/components/ConsoleViews').then(m => ({ default: m.DashboardView })));

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- useScrollProgress: writes --p (0 to 1) on the element as it crosses the viewport ---
// One rAF-throttled listener per section, active only while the section is on screen,
// and it only touches a CSS variable, so React never re-renders on scroll.
const useScrollProgress = <T extends HTMLElement>(start = 1, end = 0.2) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.style.setProperty('--p', '1'); return; }
    let frame = 0;
    let active = false;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top of the element is at `start` * vh, 1 when it reaches `end` * vh
      const p = (start * vh - r.top) / ((start - end) * vh);
      el.style.setProperty('--p', Math.min(Math.max(p, 0), 1).toFixed(3));
    };
    const onScroll = () => { if (active && !frame) frame = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active) onScroll(); });
    io.observe(el);
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [start, end]);
  return ref;
};

// --- Reveal: fades content up once it enters the viewport ---
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${className} transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
};

// --- Real ClinicFloww screenshots, served at two widths so phones fetch the small one ---
const Shot: React.FC<{ name: string; small: number; large: number; alt: string; className?: string; eager?: boolean; sizes?: string }> = ({ name, small, large, alt, className = '', eager = false, sizes = '(max-width: 768px) 90vw, 60vw' }) => (
  <img
    src={`/images/app/${name}-${large}.webp`}
    srcSet={`/images/app/${name}-${small}.webp ${small}w, /images/app/${name}-${large}.webp ${large}w`}
    sizes={sizes}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    className={`block w-full h-full object-cover object-top ${className}`}
  />
);

// --- Device frames (pure CSS) ---
const Laptop: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>
    <div className="rounded-t-[3.2%_5%] bg-[#1d1d1f] p-[1.4%] pb-[1.8%] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]">
      <div className="aspect-[16/10] overflow-hidden rounded-[0.4rem] bg-white">{children}</div>
    </div>
    <div className="relative mx-[-6%] h-[clamp(8px,1.4vw,18px)] rounded-b-[40%_100%] bg-gradient-to-b from-[#e3e4e8] to-[#b9bbc1]">
      <div className="absolute left-1/2 top-0 h-[40%] w-[14%] -translate-x-1/2 rounded-b-md bg-[#a9abb1]" />
    </div>
  </div>
);

const Monitor: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>
    <div className="rounded-[0.9rem] bg-[#e8e8ed] p-[2.2%] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
      <div className="aspect-[16/9] overflow-hidden rounded-[0.35rem] bg-white">{children}</div>
    </div>
    <div className="mx-auto h-[clamp(18px,4vw,46px)] w-[18%] bg-gradient-to-b from-[#d2d2d7] to-[#e8e8ed]" />
    <div className="mx-auto h-[clamp(4px,0.6vw,7px)] w-[34%] rounded-full bg-[#d2d2d7]" />
  </div>
);

const TV: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>
    <div className="rounded-[0.5rem] bg-[#111] p-[0.9%] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
      <div className="aspect-[16/9] overflow-hidden rounded-[0.2rem] bg-white">{children}</div>
    </div>
    <div className="flex justify-between px-[12%]">
      <div className="h-[clamp(8px,1.6vw,18px)] w-[2%] min-w-[4px] skew-x-[20deg] bg-[#2a2a2a]" />
      <div className="h-[clamp(8px,1.6vw,18px)] w-[2%] min-w-[4px] -skew-x-[20deg] bg-[#2a2a2a]" />
    </div>
  </div>
);

const Tablet: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>
    <div className="rounded-[7%/10%] bg-[#1d1d1f] p-[3%] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]">
      <div className="aspect-[1180/820] overflow-hidden rounded-[3%/4.4%] bg-white">{children}</div>
    </div>
  </div>
);

const Phone: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>
    <div className="relative rounded-[18%/8.5%] bg-[#1d1d1f] p-[4.5%] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)]">
      <div className="absolute left-1/2 top-[3.4%] z-10 h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      <div className="aspect-[390/844] overflow-hidden rounded-[14%/6.6%] bg-white">{children}</div>
    </div>
  </div>
);

// WhatsApp glyph (brand mark), drawn inline so it costs no extra request.
const WhatsAppLogo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-[17px] md:text-[21px] font-semibold text-gradient mb-3 ${className}`}>{children}</p>
);

// --- Statement: words light up one by one as the section scrolls through ---
const Statement: React.FC<{ text: string; highlight: string[] }> = ({ text, highlight }) => {
  const ref = useScrollProgress<HTMLDivElement>(0.85, 0.15);
  const words = text.split(' ');
  return (
    <div ref={ref} style={{ '--p': 0 } as React.CSSProperties}>
      <p className="text-[clamp(2rem,5.4vw,4.4rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
        {words.map((w, i) => {
          const at = i / words.length;
          const isHi = highlight.includes(w.replace(/[.,]/g, ''));
          return (
            <span
              key={i}
              className={isHi ? 'text-gradient' : 'text-[#1d1d1f]'}
              style={{ opacity: `clamp(0.14, calc((var(--p) - ${at.toFixed(3)}) * 14), 1)` } as React.CSSProperties}
            >
              {w}{' '}
            </span>
          );
        })}
      </p>
    </div>
  );
};

const getYoutubeId = (url: string) => {
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
  if (url.includes('youtube.com/watch')) return new URLSearchParams(url.split('?')[1]).get('v') || '';
  if (url.includes('youtube.com/embed/')) return url.split('youtube.com/embed/')[1].split('?')[0];
  return '';
};

const VideoSlider = ({ videos }: { videos: { url: string; title: string }[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // The YouTube player (~1 MB each) loads only after the visitor presses play.
  const [playing, setPlaying] = useState(false);

  const goTo = (idx: number) => {
    setPlaying(false);
    setCurrentIndex(idx);
  };
  const nextSlide = () => goTo(currentIndex === videos.length - 1 ? 0 : currentIndex + 1);
  const prevSlide = () => goTo(currentIndex === 0 ? videos.length - 1 : currentIndex - 1);

  const navButton = "w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 ring-1 ring-black/10 shadow-lg flex items-center justify-center text-[#1d1d1f] hover:bg-white transition-all active:scale-95 pointer-events-auto";

  return (
    <div className="relative max-w-4xl mx-auto px-2 sm:px-12">
      <div className="overflow-hidden rounded-[1.75rem] aspect-video bg-black shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
        <div className="flex transition-transform duration-500 ease-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {videos.map((video, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              {playing && idx === currentIndex ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(video.url)}?autoplay=1&rel=0`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen>
                </iframe>
              ) : (
                <button onClick={() => { setCurrentIndex(idx); setPlaying(true); }} aria-label={`Play video: ${video.title}`} className="group/play w-full h-full relative block">
                  {Math.abs(currentIndex - idx) <= 1 && (
                    <img src={`https://i.ytimg.com/vi/${getYoutubeId(video.url)}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90 group-hover/play:opacity-100 transition-opacity" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#1d1d1f"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-[calc(50%-3.5rem)] -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none md:-mx-4">
        <button onClick={prevSlide} aria-label="Previous video" className={navButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button onClick={nextSlide} aria-label="Next video" className={navButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      <div className="flex justify-center items-center flex-col mt-8">
        <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">{videos[currentIndex].title}</h3>
        <p className="text-sm text-[#6e6e73] mt-1">{currentIndex + 1} of {videos.length}</p>
        <div className="flex gap-2 flex-wrap justify-center mt-5 max-w-md">
          {videos.map((_, idx) => (
            <button key={idx} onClick={() => goTo(idx)} aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-[#1d1d1f]' : 'w-2 bg-[#d2d2d7] hover:bg-[#86868b]'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CountUp = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  // Starts at the real value so the prerendered HTML (what search engines read) says "300+", not "0".
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const el = ref.current;
    // Already on screen: leave the number as is rather than flash it back to 0.
    if (!el || el.getBoundingClientRect().top < window.innerHeight || prefersReducedMotion()) return;
    setDisplay(0);
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

const Testimonials = () => {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section id="testimonials" className="py-28 md:py-36 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <Eyebrow>From the chairside</Eyebrow>
          <h2 className="text-[clamp(2.4rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] leading-[1.05] text-[#1d1d1f]">Trusted by doctors.</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="rounded-[1.75rem] bg-[#f5f5f7] p-8 h-full flex flex-col">
                <Quote className="text-sky-500/40 mb-5" size={28} />
                <p className="text-[#1d1d1f] text-[17px] leading-relaxed mb-8 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} loading="lazy" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white text-sky-600 flex items-center justify-center font-semibold text-sm">
                      {t.name.replace(/^Dr\.?\s*/, '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#1d1d1f] text-sm">{t.name}</p>
                    <p className="text-xs text-[#6e6e73]">{[t.role, t.clinic, t.city].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const safeScroll = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const navbarHeight = 52;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
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

  const landingLinks = [
    { label: 'Connect', id: 'connect' },
    { label: 'Devices', id: 'devices' },
    { label: 'Tour', id: 'tour' },
    { label: "What's new", id: 'whats-new' },
    { label: 'Demo', id: 'demo-video' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[70] nav-glass">
      <div className="max-w-6xl mx-auto flex h-12 items-center justify-between px-5">
        <button className="flex items-center gap-2" onClick={() => onViewChange('landing')} aria-label="ClinicFloww home">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center">
            <Stethoscope className="text-white w-4 h-4" />
          </span>
          <span className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">ClinicFloww</span>
        </button>

        <div className="hidden md:flex items-center gap-7">
          {currentView !== 'landing' ? navLinks.map(link => (
            <button key={link.view} onClick={() => onViewChange(link.view)}
              className={`text-xs ${currentView === link.view ? 'text-[#1d1d1f]' : 'text-[#1d1d1f]/70'} hover:text-[#1d1d1f] transition-colors`}>
              {link.label}
            </button>
          )) : landingLinks.map(link => (
            <button key={link.id} onClick={() => handleNav(link.id)} className="text-xs text-[#1d1d1f]/75 hover:text-[#1d1d1f] transition-colors">{link.label}</button>
          ))}
          <button
            onClick={() => (currentView === 'landing' ? safeScroll('contact') : onViewChange('landing'))}
            className="rounded-full bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium px-3.5 py-1.5 transition-colors"
          >
            {currentView === 'landing' ? 'Free trial' : 'Exit Console'}
          </button>
        </div>

        <button className="md:hidden text-[#1d1d1f] p-1" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden px-5 pb-5 pt-1 bg-white/95">
          {(currentView !== 'landing'
            ? navLinks.map(l => ({ label: l.label, go: () => { onViewChange(l.view); setIsOpen(false); } }))
            : landingLinks.map(l => ({ label: l.label, go: () => handleNav(l.id) }))
          ).map(l => (
            <button key={l.label} onClick={l.go} className="block w-full text-left py-3 text-[17px] font-medium text-[#1d1d1f] border-b border-black/5">{l.label}</button>
          ))}
          <button onClick={() => { safeScroll('contact'); setIsOpen(false); }} className="mt-4 w-full rounded-full bg-sky-700 text-white py-3 font-medium">Download free trial</button>
        </div>
      )}
    </nav>
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
    <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[100] flex flex-col items-end">
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

      <div className="flex flex-col items-end gap-3">
        <a
          href="https://api.whatsapp.com/send?phone=918369908157&text=Hi%20ClinicFloww%2C%20I%20have%20a%20query%20regarding%20the%20app."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with ClinicFloww on WhatsApp"
          className="group flex items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] hover:bg-[#1ebe5b] transition-colors h-14 pl-[14px] pr-[14px]"
        >
          <WhatsAppLogo size={28} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-[10rem] transition-[max-width,margin] duration-500 whitespace-nowrap text-sm font-semibold ml-0 group-hover:ml-2">
            WhatsApp us
          </span>
        </a>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ask ClinicFloww AI"
          className="bg-[#1d1d1f] hover:bg-black text-white w-14 h-14 rounded-full shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] flex items-center justify-center active:scale-95 transition-all"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  );
};



const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [tourTab, setTourTab] = useState(0);
  const heroStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Hero devices spread apart over the first half-screen of scrolling.
  useEffect(() => {
    const el = heroStageRef.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.style.setProperty('--p', '1'); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      el.style.setProperty('--p', Math.min(window.scrollY / (window.innerHeight * 0.55), 1).toFixed(3));
    };
    const onScroll = () => { if (!frame && window.scrollY < window.innerHeight * 1.2) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [view]);

  // Mock data for the internal console views
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
    { id: 'database', title: 'Industrial data security', description: '100% local storage. Your patient records never leave your clinic. Complete data ownership.', icon: <Lock size={26} /> },
    { id: 'accounts', title: 'Admin mastery', description: 'Manage doctors, staff permissions, and schedules from a single clinical hub.', icon: <LayoutDashboard size={26} /> },
    { id: 'intelligence', title: 'Clinical intelligence', description: 'AI that finds missed revenue, overdue recalls, and expiring inventory. Prescriptions in 2 seconds.', icon: <Cpu size={26} /> },
  ];

  const featureGroups = [
    { group_title: "Patient & Clinical Management", icon: <Users size={18} />, features: ["Comprehensive patient records and medical history", "Treatment history with clinical notes", "Interactive dental odontogram charting", "Treatment photo gallery per patient", "Printable case papers from your own templates", "Digital consent forms with patient and doctor signatures", "Digital prescriptions", "Lab work tracking"] },
    { group_title: "Appointments & Follow-Ups", icon: <Calendar size={18} />, features: ["Appointment scheduling calendar", "Per-doctor schedule calendars", "Daily appointment planning", "Automated follow-up and recall reminders", "WhatsApp appointment notifications", "Two-way WhatsApp chat with patients", "AI-drafted WhatsApp campaigns"] },
    { group_title: "Billing & Revenue", icon: <DollarSign size={18} />, features: ["Digital billing and invoicing", "Treatment quotations", "Payment tracking and outstanding balances", "Expense tracking by category", "Revenue, profitability and top-patient reports"] },
    { group_title: "Inventory & Operations", icon: <Briefcase size={18} />, features: ["Inventory tracking", "Expiry date alerts", "Cost and price history tracking"] },
    { group_title: "Insights, AI & Automation", icon: <Sparkles size={18} />, features: ["Patient insights and trends", "AI-assisted clinical summaries", "AI-generated prescriptions", "AI-drafted consent forms", "Natural language clinic queries", "Voice assistant (beta)"] },
    { group_title: "Security & Access", icon: <Lock size={18} />, features: ["100% local database storage", "Works offline", "ClinicFloww Connect: reach your clinic from anywhere", "Phones, tablets, laptops, desktops and smart TVs", "Automated backups, with optional Google Drive backup", "Role-based staff access permissions", "Hardware-locked licensing"] },
  ];

  const newFeatures = [
    { icon: <Globe size={22} />, title: 'ClinicFloww Connect', tag: 'New', span: 'lg:col-span-2', description: 'Open your clinic from home, a second clinic or a conference. Your records stay on your clinic PC.' },
    { icon: <Mic size={22} />, title: 'Voice Assistant', tag: 'Beta', description: 'Ask "Tell me about Rahul Sharma" or "What is outstanding this month?" and hear the answer.' },
    { icon: <Stethoscope size={22} />, title: 'Odontogram Charting', description: 'Chart conditions and treatments tooth by tooth on an interactive dental chart.' },
    { icon: <Camera size={22} />, title: 'Treatment Photos', description: 'Before and after clinical images in each patient\'s visual record.' },
    { icon: <FlaskConical size={22} />, title: 'Lab Tracking', description: 'Track lab work sent and received, so no crown or denture goes missing.' },
    { icon: <PenLine size={22} />, title: 'Signed Consent & Case Papers', description: 'Patient and doctor signatures, AI-drafted consent, and case papers printed from your template.' },
    { icon: <Megaphone size={22} />, title: 'AI Campaigns', span: 'lg:col-span-2', description: 'Draft WhatsApp campaigns with AI and chat with patients two-way from inside the app.' },
    { icon: <CloudUpload size={22} />, title: 'Google Drive Backup', description: 'Optional backup to your own Google Drive account, alongside local backups.' },
    { icon: <Users size={22} />, title: 'Staff Access Control', span: 'lg:col-span-2', description: 'Give each doctor and assistant only the screens and actions their role needs.' },
  ];

  const tour = [
    { label: 'Dashboard', shot: 'tour-dashboard', text: 'Revenue, patient traffic and follow-ups at a glance, every morning.' },
    { label: 'Patient record', shot: 'tour-record', text: 'History, alerts, prescriptions, consent and invoices for every patient in one place.' },
    { label: 'Calendar', shot: 'tour-calendar', text: 'The whole month of appointments, per doctor or for the clinic.' },
    { label: 'Accounts', shot: 'tour-accounts', text: 'Collections against expenses, day by day, with your real profit.' },
    { label: 'Inventory', shot: 'tour-inventory', text: 'Stock levels and expiry dates, so nothing runs out or goes to waste.' },
    { label: 'Lab tracking', shot: 'tour-lab', text: 'Every crown, bridge and denture, from sent to delivered.' },
  ];

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <DashboardView patients={patients} appointments={appointments} inventory={inventory} />;
      case 'billing': return <BillingView />;
      case 'patients': return <PatientsView patients={patients} />;
      default: return null;
    }
  };

  const pillPrimary = "inline-flex items-center justify-center gap-1.5 rounded-full bg-sky-700 hover:bg-sky-800 text-white text-[17px] font-medium px-6 py-3 transition-colors";
  const linkCta = "inline-flex items-center gap-1 text-[17px] text-sky-600 hover:underline";
  const h2 = "text-[clamp(2.4rem,6.4vw,5rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#1d1d1f]";
  const lead = "text-[clamp(1.1rem,2vw,1.5rem)] leading-snug text-[#6e6e73] font-medium";

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] selection:bg-sky-200/60 overflow-x-hidden">
      <Navbar currentView={view} onViewChange={setView} />

      {view === 'landing' ? (
        <>
          {/* Hero */}
          <section id="hero" className="relative pt-24 md:pt-32 px-5 overflow-hidden bg-[radial-gradient(120%_70%_at_50%_0%,#eaf6ff_0%,#ffffff_60%)]">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="animate-rise text-[17px] md:text-[21px] font-semibold text-[#1d1d1f]">
                ClinicFloww <span className="text-[#6e6e73] font-medium">· Clinic management software</span>
              </h1>
              <p className="animate-rise [animation-delay:80ms] mt-2 text-[clamp(3.2rem,10.5vw,8.5rem)] font-semibold tracking-[-0.05em] leading-[0.95]">
                Your clinic.<br /><span className="text-gradient">Everywhere.</span>
              </p>
              <p className={`animate-rise [animation-delay:160ms] mt-6 max-w-2xl mx-auto ${lead}`}>
                Local-first clinic management for doctors and dental clinics. Zero cloud risk. On every screen you own.
              </p>
              <div className="animate-rise [animation-delay:240ms] mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <button onClick={() => safeScroll('contact')} className={pillPrimary}>Download free trial</button>
                <button onClick={() => safeScroll('tour')} className={linkCta}>Take the tour <ChevronRight size={18} /></button>
              </div>
            </div>

            {/* Device lineup: spreads apart as you scroll */}
            <div ref={heroStageRef} className="animate-rise [animation-delay:320ms] relative max-w-[1120px] mx-auto mt-14 md:mt-20 aspect-[16/10] md:aspect-[16/8.6]" style={{ '--p': 0 } as React.CSSProperties}>
              <Laptop className="absolute left-[14%] top-0 w-[72%] z-10 origin-top" >
                <Shot name="laptop" small={800} large={1600} alt="ClinicFloww dashboard on a laptop" eager sizes="(max-width: 768px) 72vw, 800px" />
              </Laptop>
              <div className="absolute left-[1%] bottom-[2%] w-[33%] z-20" style={{ transform: 'translate3d(calc((1 - var(--p)) * 22%), calc((1 - var(--p)) * 6%), 0)' }}>
                <Tablet>
                  <Shot name="tablet" small={700} large={1400} alt="ClinicFloww patient directory on a tablet" eager sizes="(max-width: 768px) 33vw, 380px" />
                </Tablet>
              </div>
              <div className="absolute right-[3%] bottom-0 w-[14.5%] z-30" style={{ transform: 'translate3d(calc((1 - var(--p)) * -55%), calc((1 - var(--p)) * 8%), 0)' }}>
                <Phone>
                  <Shot name="phone" small={400} large={780} alt="ClinicFloww dashboard on a phone" eager sizes="(max-width: 768px) 15vw, 170px" />
                </Phone>
              </div>
            </div>
          </section>

          {/* Stats */}
          {STATS.length > 0 && (
            <section className="px-5 pt-16 pb-20 md:pt-24 md:pb-28 bg-white">
              <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-10">
                {STATS.map((s, i) => (
                  <Reveal key={i} delay={i * 80} className="text-center">
                    <p className="text-[clamp(2.6rem,6vw,4.2rem)] font-semibold tracking-[-0.04em] text-gradient leading-none">
                      <CountUp value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="mt-2 text-[15px] text-[#6e6e73]">{s.label}</p>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* Statement */}
          <section className="px-5 py-28 md:py-44 bg-[#f5f5f7]">
            <div className="max-w-5xl mx-auto">
              <Statement
                text="Your patient records live on your clinic PC. Not on our servers. Not in the cloud. And yet, they go wherever you go."
                highlight={['clinic', 'PC', 'wherever', 'you', 'go']}
              />
            </div>
          </section>

          {/* ClinicFloww Connect */}
          <section id="connect" className="px-5 py-28 md:py-40 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <Reveal className="text-center max-w-3xl mx-auto">
                <Eyebrow>ClinicFloww Connect</Eyebrow>
                <h2 className={h2}>Access from anywhere.<br />Stored nowhere else.</h2>
                <p className={`mt-6 ${lead}`}>
                  Open your clinic from home, a second clinic or a conference abroad. Every record stays on the PC in your clinic. Nothing is copied to a cloud database.
                </p>
              </Reveal>

              {/* Phones: stacked version of the diagram */}
              <Reveal delay={120} className="mt-14 md:hidden">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 rounded-[2rem] bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center shadow-[0_30px_60px_-20px_rgba(14,165,233,0.6)]">
                    <HardDrive className="text-white w-12 h-12" strokeWidth={1.5} />
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1d1d1f] text-white text-[11px] font-medium px-3 py-1">Your clinic PC</span>
                  </div>
                  <p className="mt-6 text-sm text-[#6e6e73]">All data stored here, and only here.</p>
                  <div className="h-10 w-px border-l-2 border-dashed border-sky-400/60 my-2" />
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {[{ icon: <Home size={18} />, t: 'At home', s: 'Phone' }, { icon: <Building2 size={18} />, t: 'Second clinic', s: 'Laptop' }, { icon: <Plane size={18} />, t: 'Travelling', s: 'Tablet' }, { icon: <Wifi size={18} />, t: 'Clinic Wi-Fi', s: 'Scan a QR code' }].map(d => (
                      <div key={d.t} className="flex items-center gap-2.5 rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] px-3 py-2.5">
                        <span className="w-8 h-8 shrink-0 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">{d.icon}</span>
                        <span className="text-left min-w-0"><span className="block text-sm font-semibold">{d.t}</span><span className="block text-xs text-[#6e6e73]">{d.s}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120} className="mt-20 hidden md:block">
                <div className="relative mx-auto max-w-4xl">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 360" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="cf-line" x1="0" x2="1"><stop offset="0" stopColor="#0ea5e9" /><stop offset="1" stopColor="#14b8a6" /></linearGradient>
                    </defs>
                    {['M400 180 C 300 180, 220 70, 110 70', 'M400 180 C 300 180, 220 290, 110 290', 'M400 180 C 500 180, 580 70, 690 70', 'M400 180 C 500 180, 580 290, 690 290'].map((d, i) => (
                      <path key={i} d={d} fill="none" stroke="url(#cf-line)" strokeWidth="2" strokeDasharray="6 8" className="connect-flow" style={{ animationDelay: `${-i * 0.4}s` }} vectorEffect="non-scaling-stroke" />
                    ))}
                  </svg>
                  <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-10 min-h-[300px] md:min-h-[360px]">
                    <div className="flex flex-col gap-16 md:gap-24 items-start">
                      {[{ icon: <Home size={20} />, t: 'At home', s: 'Phone' }, { icon: <Building2 size={20} />, t: 'Second clinic', s: 'Laptop' }].map(d => (
                        <div key={d.t} className="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] px-3 py-2.5 md:px-4 md:py-3">
                          <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">{d.icon}</span>
                          <span className="text-left"><span className="block text-sm md:text-[15px] font-semibold">{d.t}</span><span className="block text-xs text-[#6e6e73]">{d.s}</span></span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-[2rem] bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center shadow-[0_30px_60px_-20px_rgba(14,165,233,0.6)]">
                        <HardDrive className="text-white w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1d1d1f] text-white text-[11px] md:text-xs font-medium px-3 py-1">Your clinic PC</span>
                      </div>
                      <p className="mt-6 text-xs md:text-sm text-[#6e6e73] max-w-[10rem]">All data stored here, and only here.</p>
                    </div>
                    <div className="flex flex-col gap-16 md:gap-24 items-end">
                      {[{ icon: <Plane size={20} />, t: 'Travelling', s: 'Tablet' }, { icon: <Wifi size={20} />, t: 'Clinic Wi-Fi', s: 'Scan a QR code' }].map(d => (
                        <div key={d.t} className="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] px-3 py-2.5 md:px-4 md:py-3">
                          <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">{d.icon}</span>
                          <span className="text-left"><span className="block text-sm md:text-[15px] font-semibold">{d.t}</span><span className="block text-xs text-[#6e6e73]">{d.s}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: <HardDrive size={22} />, t: 'Stays in your clinic', d: 'Records are stored on your clinic PC. Not on our servers, not in a cloud database.' },
                  { icon: <Lock size={22} />, t: 'Encrypted when you\'re away', d: 'Reach your clinic over a secure, encrypted connection from any browser.' },
                  { icon: <CloudOff size={22} />, t: 'Zero cloud risk', d: 'No vendor copy of your data to leak, lose or lock you out of.' },
                  { icon: <QrCode size={22} />, t: 'Instant on clinic Wi-Fi', d: 'Phones and tablets in the clinic join by scanning a QR code. No extra setup.' },
                ].map((c, i) => (
                  <Reveal key={c.t} delay={i * 80}>
                    <div className="h-full rounded-[1.75rem] bg-[#f5f5f7] p-7">
                      <span className="w-11 h-11 rounded-2xl bg-white text-sky-600 flex items-center justify-center mb-5">{c.icon}</span>
                      <h3 className="text-[19px] font-semibold tracking-tight mb-2">{c.t}</h3>
                      <p className="text-[15px] leading-relaxed text-[#6e6e73]">{c.d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Every screen */}
          <section id="devices" className="px-5 py-28 md:py-40 bg-[#f5f5f7]">
            <div className="max-w-6xl mx-auto">
              <Reveal className="text-center max-w-3xl mx-auto mb-16">
                <Eyebrow>Every device</Eyebrow>
                <h2 className={h2}>One app.<br />Every screen.</h2>
                <p className={`mt-6 ${lead}`}>Phone, tablet, laptop, desktop or the TV in your waiting room. If it has a browser, it runs ClinicFloww.</p>
              </Reveal>

              <div className="grid lg:grid-cols-2 gap-5">
                <Reveal className="lg:col-span-2">
                  <div className="rounded-[2rem] bg-white p-7 md:p-12 overflow-hidden">
                    <div className="max-w-xl mb-8">
                      <h3 className="text-[26px] md:text-[32px] font-semibold tracking-tight">Smart TV</h3>
                      <p className="text-[17px] text-[#6e6e73] mt-1">Put the day's appointment queue on the big screen.</p>
                    </div>
                    <TV className="max-w-4xl mx-auto"><Shot name="tv" small={800} large={1600} alt="ClinicFloww appointment queue on a smart TV" sizes="(max-width: 768px) 90vw, 900px" /></TV>
                  </div>
                </Reveal>
                <Reveal>
                  <div className="h-full rounded-[2rem] bg-white p-7 md:p-10 overflow-hidden flex flex-col">
                    <h3 className="text-[26px] font-semibold tracking-tight">Desktop</h3>
                    <p className="text-[17px] text-[#6e6e73] mt-1 mb-8">Your clinic's command centre at the front desk.</p>
                    <Monitor className="mt-auto"><Shot name="desktop" small={800} large={1600} alt="ClinicFloww calendar on a desktop monitor" sizes="(max-width: 1024px) 90vw, 520px" /></Monitor>
                  </div>
                </Reveal>
                <Reveal delay={80}>
                  <div className="h-full rounded-[2rem] bg-white p-7 md:p-10 overflow-hidden flex flex-col">
                    <h3 className="text-[26px] font-semibold tracking-tight">Laptop</h3>
                    <p className="text-[17px] text-[#6e6e73] mt-1 mb-8">Billing, reports and records, wherever you sit.</p>
                    <Laptop className="mt-auto px-[6%]"><Shot name="laptop" small={800} large={1600} alt="ClinicFloww dashboard on a laptop" sizes="(max-width: 1024px) 90vw, 520px" /></Laptop>
                  </div>
                </Reveal>
                <Reveal>
                  <div className="h-full rounded-[2rem] bg-white p-7 md:p-10 overflow-hidden flex flex-col">
                    <h3 className="text-[26px] font-semibold tracking-tight">Tablet</h3>
                    <p className="text-[17px] text-[#6e6e73] mt-1 mb-8">Patient records and charting, right at the chair.</p>
                    <Tablet className="mt-auto"><Shot name="tablet" small={700} large={1400} alt="ClinicFloww patient directory on a tablet" sizes="(max-width: 1024px) 90vw, 520px" /></Tablet>
                  </div>
                </Reveal>
                <Reveal delay={80}>
                  <div className="h-full rounded-[2rem] bg-white p-7 md:p-10 overflow-hidden flex flex-col">
                    <h3 className="text-[26px] font-semibold tracking-tight">Phone</h3>
                    <p className="text-[17px] text-[#6e6e73] mt-1 mb-8">Today's schedule and dues in your pocket.</p>
                    <Phone className="mt-auto mx-auto w-[46%] max-w-[230px]"><Shot name="phone" small={400} large={780} alt="ClinicFloww dashboard on a phone" sizes="230px" /></Phone>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Tour (live demo of the real app) */}
          <section id="tour" className="px-5 py-28 md:py-40 bg-white">
            <div className="max-w-6xl mx-auto">
              <Reveal className="text-center max-w-3xl mx-auto mb-12">
                <Eyebrow>Take the tour</Eyebrow>
                <h2 className={h2}>See the real app.</h2>
                <p className={`mt-6 ${lead}`}>Actual ClinicFloww screens, shown with sample clinic data.</p>
              </Reveal>
              <Reveal>
                <div className="flex justify-center mb-10">
                  <div className="inline-flex max-w-full overflow-x-auto rounded-full bg-[#f5f5f7] p-1 no-scrollbar">
                    {tour.map((t, i) => (
                      <button key={t.label} onClick={() => setTourTab(i)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${i === tourTab ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mx-auto max-w-5xl rounded-[1.25rem] bg-[#f5f5f7] p-2 md:p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                  <div className="flex items-center gap-1.5 px-2 pb-2 md:pb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[0.75rem] bg-white">
                    {tour.map((t, i) => (
                      <div key={t.shot} className={`absolute inset-0 transition-opacity duration-500 ${i === tourTab ? 'opacity-100' : 'opacity-0'}`} aria-hidden={i !== tourTab}>
                        {Math.abs(i - tourTab) <= 1 && <Shot name={t.shot} small={800} large={1600} alt={`ClinicFloww ${t.label}`} sizes="(max-width: 768px) 95vw, 1000px" />}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-center mt-8 text-[17px] text-[#6e6e73] max-w-xl mx-auto min-h-[3em]">{tour[tourTab].text}</p>
              </Reveal>
            </div>
          </section>

          {/* Outcomes */}
          <section id="features" className="px-5 py-28 md:py-36 bg-[#f5f5f7]">
            <div className="max-w-6xl mx-auto">
              <Reveal className="text-center mb-16">
                <Eyebrow>Outcomes</Eyebrow>
                <h2 className={h2}>Clinical precision.<br />Business mastery.</h2>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-5">
                {features.map((f, i) => (
                  <Reveal key={f.id} delay={i * 80}>
                    <div className="h-full rounded-[2rem] bg-white p-9">
                      <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400 text-white flex items-center justify-center mb-8">{f.icon}</span>
                      <h3 className="text-[24px] font-semibold tracking-tight mb-2">{f.title}</h3>
                      <p className="text-[17px] leading-relaxed text-[#6e6e73]">{f.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* What's new */}
          <section id="whats-new" className="px-5 py-28 md:py-36 bg-white">
            <div className="max-w-6xl mx-auto">
              <Reveal className="text-center mb-16">
                <Eyebrow>What's new</Eyebrow>
                <h2 className={h2}>More ways to run<br />your clinic.</h2>
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {newFeatures.map((f, i) => (
                  <Reveal key={f.title} delay={(i % 3) * 80} className={f.span ?? ''}>
                    <div className="h-full rounded-[2rem] bg-[#f5f5f7] p-8 hover:bg-[#eeeef1] transition-colors">
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-11 h-11 rounded-2xl bg-white text-sky-600 flex items-center justify-center">{f.icon}</span>
                        {f.tag && <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${f.tag === 'New' ? 'bg-sky-700 text-white' : 'bg-amber-100 text-amber-800'}`}>{f.tag}</span>}
                      </div>
                      <h3 className="text-[21px] font-semibold tracking-tight mb-2">{f.title}</h3>
                      <p className="text-[16px] leading-relaxed text-[#6e6e73] max-w-md">{f.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* AI */}
          <section className="px-5 py-28 md:py-36 bg-[#f5f5f7] overflow-hidden">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <Reveal>
                <Eyebrow>AI intelligence</Eyebrow>
                <h2 className={h2}>Finds missed revenue and lost patients.</h2>
                <p className={`mt-6 ${lead}`}>ClinicFloww AI doesn't just store data. It drafts prescriptions, flags revenue leakage and tells you who is due for a recall.</p>
                <button onClick={() => safeScroll('contact')} className={`mt-8 ${linkCta}`}>Schedule your free AI audit <ChevronRight size={18} /></button>
              </Reveal>
              <div className="space-y-4">
                {[
                  { icon: <TrendingUp className="text-sky-600" size={22} />, label: 'Recall insight', text: '42 inactive patients found with high RCT potential.' },
                  { icon: <Activity className="text-teal-600" size={22} />, label: 'Inventory alert', text: 'Composite resin expiring in 4 days. Re-order suggested.' },
                  { icon: <DollarSign className="text-amber-600" size={22} />, label: 'Revenue leakage', text: '₹12,400 in unpaid bills detected from last week.' },
                ].map((c, i) => (
                  <Reveal key={c.label} delay={i * 120}>
                    <div className="flex items-center gap-4 rounded-[1.5rem] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]" style={{ marginLeft: `${i * 6}%` }}>
                      <span className="w-12 h-12 shrink-0 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">{c.icon}</span>
                      <span>
                        <span className="block text-xs font-medium text-[#6e6e73]">{c.label}</span>
                        <span className="block text-[17px] font-semibold">{c.text}</span>
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Founder */}
          <section id="about" className="px-5 py-28 md:py-36 bg-white">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
              <Reveal>
                <Eyebrow>By practicing clinicians</Eyebrow>
                <h2 className={h2}>Built by a doctor.<br />Not software vendors.</h2>
                <div className="mt-12 grid grid-cols-2 gap-10 max-w-md">
                  <div>
                    <p className="text-[clamp(2.6rem,5vw,3.6rem)] font-semibold tracking-[-0.04em] leading-none">100%</p>
                    <p className="mt-2 text-[15px] text-[#6e6e73]">Data ownership</p>
                  </div>
                  <div>
                    <p className="text-[clamp(2.6rem,5vw,3.6rem)] font-semibold tracking-[-0.04em] leading-none text-gradient">0%</p>
                    <p className="mt-2 text-[15px] text-[#6e6e73]">Cloud risk</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={120} className="flex justify-center lg:justify-end">
                <button onClick={() => setShowEasterEgg(true)} className="group relative w-full max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden bg-[#f5f5f7] text-left">
                  <img src={ASSETS.IMAGES.FOUNDERS.SAYALI} loading="lazy" decoding="async" width={720} height={1290} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" alt="Dr. Sayali Jadhav, CEO" />
                  <span className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <span className="block text-xs font-medium text-white/80">CEO</span>
                    <span className="block text-xl font-semibold text-white">Dr. Sayali Jadhav</span>
                  </span>
                </button>
              </Reveal>
            </div>
          </section>

          <Testimonials />

          {/* Privacy comparison */}
          <section className="px-5 py-28 md:py-36 bg-[#f5f5f7]">
            <div className="max-w-5xl mx-auto">
              <Reveal className="text-center mb-14">
                <h2 className={h2}>Local-first beats<br />cloud-first.</h2>
                <p className={`mt-6 max-w-2xl mx-auto ${lead}`}>Generic cloud software keeps your patients on someone else's servers. ClinicFloww keeps them with you.</p>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-5">
                <Reveal>
                  <div className="h-full rounded-[2rem] bg-white p-9 ring-2 ring-sky-500/30">
                    <p className="text-sm font-semibold text-sky-600 mb-6">ClinicFloww</p>
                    <ul className="space-y-4">
                      {['Records stored on your clinic PC', 'Works even when the internet is down', 'Reach it from anywhere with Connect', 'Hardware-locked security'].map(t => (
                        <li key={t} className="flex items-center gap-3 text-[17px] font-medium"><CheckCircle2 className="text-sky-600 shrink-0" size={22} /> {t}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
                <Reveal delay={80}>
                  <div className="h-full rounded-[2rem] bg-white/60 p-9">
                    <p className="text-sm font-semibold text-[#86868b] mb-6">Typical cloud software</p>
                    <ul className="space-y-4">
                      {['Records stored on vendor servers', 'Stops when the internet stops', 'Vendor controls access to your data', 'One breach can expose many clinics'].map(t => (
                        <li key={t} className="flex items-center gap-3 text-[17px] text-[#86868b]"><X className="text-rose-400 shrink-0" size={22} /> {t}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Full feature list */}
          <section id="key-features-summary" className="px-5 py-28 md:py-36 bg-white">
            <div className="max-w-6xl mx-auto">
              <Reveal className="text-center">
                <h2 className={h2}>Run your clinic<br />without chaos.</h2>
                <p className={`mt-6 max-w-2xl mx-auto ${lead}`}>Everything you need to stay organised, profitable and in control, without juggling systems.</p>
                <button onClick={() => setShowFullFeatures(!showFullFeatures)} className={`mt-8 ${linkCta}`}>
                  {showFullFeatures ? 'Hide all features' : 'See all features'} {showFullFeatures ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </Reveal>
              {showFullFeatures && (
                <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-rise">
                  {featureGroups.map(group => (
                    <div key={group.group_title} className="rounded-[1.75rem] bg-[#f5f5f7] p-7">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="w-9 h-9 rounded-xl bg-white text-sky-600 flex items-center justify-center">{group.icon}</span>
                        <h3 className="font-semibold text-[17px]">{group.group_title}</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {group.features.map(item => (
                          <li key={item} className="flex gap-3 text-[15px] text-[#424245] leading-snug">
                            <span className="w-1 h-1 rounded-full bg-sky-500 mt-2.5 shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Videos */}
          <section id="demo-video" className="px-5 py-28 md:py-36 bg-[#f5f5f7]">
            <div className="max-w-5xl mx-auto">
              <Reveal className="text-center mb-14">
                <Eyebrow>Platform walkthrough</Eyebrow>
                <h2 className={h2}>See it in action.</h2>
              </Reveal>
              <Reveal>
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
              </Reveal>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="px-5 py-28 md:py-36 bg-[#f5f5f7]">
            <div className="max-w-3xl mx-auto">
              <Reveal className="text-center mb-14">
                <Eyebrow>FAQ</Eyebrow>
                <h2 className={h2}>Questions, answered.</h2>
              </Reveal>
              <div className="divide-y divide-black/10 border-y border-black/10">
                {FAQ.map(item => (
                  <details key={item.q} className="group py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-[19px] md:text-[21px] font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                      <h3>{item.q}</h3>
                      <Plus size={22} className="shrink-0 text-[#6e6e73] transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="mt-4 text-[17px] leading-relaxed text-[#424245]">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="px-5 py-28 md:py-36 bg-white">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <Eyebrow>Get started</Eyebrow>
                <h2 className={h2}>Try ClinicFloww free.</h2>
                <p className={`mt-6 ${lead}`}>Fill in the form to get your download links and free-tier key instantly.</p>
                <p className="mt-6 text-[15px] text-[#6e6e73]">
                  <a href="mailto:clinicfloww@gmail.com" className="text-sky-600 hover:underline">clinicfloww@gmail.com</a>
                  <span className="mx-3 text-[#d2d2d7]">|</span>
                  <a href="tel:+918369908157" className="text-sky-600 hover:underline">+91 83699 08157</a>
                </p>
              </Reveal>
              <Reveal delay={100}>
                <div className="mt-12 rounded-[2rem] bg-[#f5f5f7] p-4 md:p-10 text-left">
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-6 max-w-2xl mx-auto">
                    <div className="flex gap-4 items-start">
                      <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={22} />
                      <div>
                        <h3 className="font-semibold text-amber-900 mb-1">Important: License Activation</h3>
                        <p className="text-amber-800 text-sm leading-relaxed">After you submit the form, the <b>download links</b> and instructions to generate your free-tier key appear immediately in the confirmation message.</p>
                        <a href="https://api.whatsapp.com/send?phone=918369908157" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#128C7E] hover:underline">
                          <WhatsAppLogo size={16} /> Need help instantly? WhatsApp us
                        </a>
                      </div>
                    </div>
                  </div>
                  <ContactForm />
                </div>
              </Reveal>
            </div>
          </section>
        </>
      ) : (
        <div className="bg-slate-50 text-slate-900 min-h-screen">
          <Suspense fallback={null}>{renderContent()}</Suspense>
        </div>
      )}

      <footer className="px-5 py-10 bg-[#f5f5f7] border-t border-black/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-xs text-[#6e6e73]">
          <p>© {new Date().getFullYear()} Elite Management Systems. ClinicFloww. Local data mastery.</p>
          <div className="flex gap-6">
            <a href="mailto:ClinicFloww@gmail.com" className="hover:text-[#1d1d1f]">Support</a>
            <a href="https://api.whatsapp.com/send?phone=918369908157" target="_blank" rel="noopener noreferrer" className="hover:text-[#1d1d1f]">WhatsApp Support</a>
            <a href="/privacy" className="hover:text-[#1d1d1f]">Privacy</a>
            <a href="/terms" className="hover:text-[#1d1d1f]">Terms</a>
          </div>
        </div>
      </footer>

      <ChatBot />

      {showEasterEgg && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-xl" onClick={() => setShowEasterEgg(false)}>
          <div className="flex flex-col items-center gap-8 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src="/images/founders/easter.webp" alt="Easter Egg" className="max-h-[65vh] w-auto object-contain rounded-3xl shadow-2xl" />
            <button onClick={() => { setShowEasterEgg(false); safeScroll('contact'); }} className={pillPrimary}>Download App Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
