
import React, { useState, useEffect } from 'react';
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
  MoreVertical
} from 'lucide-react';
import { getGeminiResponse } from './services/geminiService';
import { ChatMessage, Feature, ViewState, Patient, Invoice, Tooth, ToothCondition } from './types';
import { ASSETS } from './constants/assets';

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

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onViewChange('landing')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-heading text-slate-900 tracking-tight">ClinicFloww</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNav('features')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</button>
            <button onClick={() => handleNav('about')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Founders</button>
            <button 
              onClick={() => onViewChange(currentView === 'landing' ? 'dashboard' : 'landing')} 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              {currentView === 'landing' ? 'Launch Dashboard' : 'Back to Home'}
              <ChevronRight size={18} />
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
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-xl">
          <button onClick={() => handleNav('features')} className="block w-full text-left py-3">Features</button>
          <button onClick={() => handleNav('about')} className="block w-full text-left py-3">Founders</button>
          <button onClick={() => onViewChange('dashboard')} className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-center">Launch Dashboard</button>
        </div>
      )}
    </nav>
  );
};

const Odontogram = () => {
  const [teeth, setTeeth] = useState<Tooth[]>(Array.from({ length: 32 }, (_, i) => ({ id: i + 1, condition: 'healthy' })));
  
  const cycleCondition = (id: number) => {
    const conditions: ToothCondition[] = ['healthy', 'cavity', 'crown', 'rct', 'missing'];
    setTeeth(prev => prev.map(t => {
      if (t.id === id) {
        const nextIdx = (conditions.indexOf(t.condition) + 1) % conditions.length;
        return { ...t, condition: conditions[nextIdx] };
      }
      return t;
    }));
  };

  const getConditionColor = (c: ToothCondition) => {
    switch (c) {
      case 'cavity': return 'bg-red-500';
      case 'crown': return 'bg-amber-500';
      case 'rct': return 'bg-purple-500';
      case 'missing': return 'bg-slate-300';
      default: return 'bg-white border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100">
      <h3 className="text-xl font-bold mb-6 font-heading flex items-center gap-2">
        <Stethoscope className="text-blue-600" /> Interactive Odontogram
      </h3>
      <div className="grid grid-cols-8 gap-3 mb-8">
        {teeth.slice(0, 16).map(t => (
          <button 
            key={t.id} 
            onClick={() => cycleCondition(t.id)}
            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-105 ${getConditionColor(t.condition)}`}
          >
            {t.id}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-3">
        {teeth.slice(16, 32).map(t => (
          <button 
            key={t.id} 
            onClick={() => cycleCondition(t.id)}
            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-105 ${getConditionColor(t.condition)}`}
          >
            {t.id}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Cavity</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded" /> Crown</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded" /> RCT</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 rounded" /> Missing</div>
      </div>
    </div>
  );
};

const DashboardView = () => {
  const patients: Patient[] = [
    { id: '1', name: 'John Doe', lastVisit: '2024-03-20', balance: 1200, status: 'active' },
    { id: '2', name: 'Sarah Miller', lastVisit: '2024-03-18', balance: 0, status: 'completed' },
    { id: '3', name: 'Robert Chen', lastVisit: '2024-03-15', balance: 4500, status: 'pending' },
  ];

  const invoices: Invoice[] = [
    { id: 'INV-001', patientName: 'John Doe', amount: 1200, date: '2024-03-20', status: 'unpaid' },
    { id: 'INV-002', patientName: 'Sarah Miller', amount: 800, date: '2024-03-18', status: 'paid' },
  ];

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading">Clinic Dashboard</h1>
          <p className="text-slate-500">Welcome back, Dr. Jadhav. Here is your clinic's pulse.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
            <Plus size={20} /> New Patient
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: '1,284', icon: <Users />, color: 'blue' },
          { label: 'Pending Billing', value: '₹42,500', icon: <CreditCard />, color: 'amber' },
          { label: 'Appointments Today', value: '12', icon: <Calendar />, color: 'indigo' },
          { label: 'Completed Cases', value: '89', icon: <CheckCircle2 />, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Odontogram & Billing */}
        <div className="lg:col-span-8 space-y-8">
          <Odontogram />
          
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-bold font-heading">Recent Billing</h3>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1">View All <ExternalLink size={14}/></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">{inv.id}</td>
                      <td className="px-6 py-4 font-semibold">{inv.patientName}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">₹{inv.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><MoreVertical size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Patients & Quick Actions */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold font-heading mb-4">Patient Queue</h3>
            <div className="space-y-4">
              {patients.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">Last: {p.lastVisit}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${p.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {p.balance > 0 ? `₹${p.balance}` : 'Clear'}
                    </p>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 ml-auto transition-colors" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-sm font-bold text-slate-500 hover:text-blue-600 border border-dashed border-slate-200 rounded-2xl hover:border-blue-200 transition-all">
              Manage All Patients
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-2">Pro Feature: WhatsApp</h3>
            <p className="text-sm opacity-80 mb-4">Automatically send reminders to patients with outstanding balances.</p>
            <button className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
              <Smartphone size={18} /> Configure WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group">
    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {feature.icon}
    </div>
    <h3 className="text-xl font-bold mb-3 font-heading">{feature.title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Hello! I am your ClinicFloww Assistant. Ask me about our free Essentials access, WhatsApp integration, or local data security.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    const response = await getGeminiResponse(currentInput);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div><p className="font-bold leading-none">ClinicFloww AI</p><p className="text-[10px] opacity-80 mt-1">Essentials Support Active</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100 shadow-md' : 'bg-white text-slate-700 shadow-sm border rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Thinking...</div>}
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Ask a question..." 
              className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all" 
            />
            <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all"><Send size={18}/></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all hover:bg-blue-700">
          <MessageSquare />
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [view, setView] = useState<ViewState>('landing');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const features: Feature[] = [
    {
      id: 'billing',
      title: 'Advanced Billing & Invoicing',
      description: 'Generate professional GST-ready invoices, manage outstanding payments, and provide itemized quotations in seconds.',
      icon: <ReceiptText />
    },
    {
      id: 'accounts',
      title: 'Account Management',
      description: 'Complete patient account management, including treatment history, ledger tracking, and automated balance reminders.',
      icon: <Users />
    },
    {
      id: 'odontogram',
      title: 'Interactive Odontogram',
      description: 'Advanced visual teeth charts for adults and children. Mark Cavities, Crowns, and RCT with one-click precision.',
      icon: <Stethoscope />
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Automation',
      description: 'Send automated appointment reminders and billing follow-ups. Drastically reduce no-shows with seamless messaging.',
      icon: <Smartphone />
    },
    {
      id: 'ai-prescriptions',
      title: 'AI Prescription Engine',
      description: 'Draft clinical prescriptions instantly using AI based on symptom notes. Save hours on administrative work.',
      icon: <Cpu />
    },
    {
      id: 'privacy',
      title: 'Desktop Security',
      description: 'Local-first architecture. Your data stays on your machine, ensuring 100% privacy and full offline functionality.',
      icon: <ShieldCheck />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <Navbar currentView={view} onViewChange={setView} />
      
      {view === 'landing' ? (
        <>
          {/* Hero */}
          <section id="hero" className="pt-32 pb-20 px-4 md:pt-48 md:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-white text-center">
            <div className="max-w-7xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold mb-8 uppercase tracking-widest border border-blue-100">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Complete Dental Billing & Account Management
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 font-heading tracking-tight leading-[1.1]">
                Streamline Billing. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Own Your Practice.</span>
              </h1>
              <p className="text-2xl text-blue-600 font-bold mb-6 font-heading">
                Get free access to ClinicFloww – Essentials.
              </p>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                The ultimate desktop suite for dental billing, account management, and clinical charting. Built by clinicians who value efficiency and privacy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setView('dashboard')} 
                  className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                  Launch App Preview
                </button>
                <button onClick={() => safeScroll('features')} className="w-full sm:w-auto bg-white border border-slate-200 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">Explore Features</button>
              </div>
              <div className="mt-20 relative max-w-5xl mx-auto px-4 group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/50 to-indigo-200/50 blur-3xl opacity-30 -z-10 group-hover:opacity-50 transition-opacity" />
                <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                  <img 
                    src={ASSETS.IMAGES.HERO} 
                    className="rounded-[2rem] w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-[1.02]" 
                    alt="ClinicFloww Billing Dashboard" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-24 px-4 bg-white relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-slate-100" />
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold font-heading mb-4 text-slate-900">Your Clinic, Simplified.</h2>
                <p className="text-slate-600 max-w-xl mx-auto">Powerful billing and management tools designed to work locally, securely, and efficiently.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map(f => <FeatureCard key={f.id} feature={f} />)}
              </div>
            </div>
          </section>

          {/* About / Founders Section */}
          <section id="about" className="py-24 px-4 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5 lg:sticky lg:top-32">
                  <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
                    <Award size={18} />
                    Visionary Leadership
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading text-slate-900 leading-tight">Expert Care for Your Practice.</h2>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    ClinicFloww was conceptualized by dental practitioners who understood the pain of legacy software. 
                    Our mission is to empower every dentist with elite tools, starting with our **Essentials** tier. 
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Gift size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Free Essentials Tier</h4>
                        <p className="text-sm text-slate-500">Full billing and clinical modules at zero cost to support growing clinics.</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => safeScroll('contact')} className="flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all group">
                    Book your onboarding demo <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 md:pt-0">
                  {/* Sayali Card */}
                  <div className="group relative">
                    <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 bg-slate-200 ring-1 ring-slate-100">
                      <img 
                        src={ASSETS.IMAGES.FOUNDERS.SAYALI} 
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000" 
                        alt="Dr. Sayali Jadhav" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-80" />
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h4 className="text-2xl font-bold font-heading">Dr. Sayali Jadhav</h4>
                        <p className="text-blue-300 font-bold text-sm tracking-wide">Chief Executive Officer</p>
                      </div>
                    </div>
                  </div>

                  {/* Prashant Card */}
                  <div className="group relative">
                    <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 bg-slate-200 ring-1 ring-slate-100">
                      <img 
                        src={ASSETS.IMAGES.FOUNDERS.PRASHANT} 
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000" 
                        alt="Dr. Prashant Hajare" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-80" />
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h4 className="text-2xl font-bold font-heading">Dr. Prashant Hajare</h4>
                        <p className="text-blue-300 font-bold text-sm tracking-wide">Chief Marketing & Business Lead Officer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="py-24 px-4 bg-slate-900 text-white rounded-t-[5rem] mt-20">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold font-heading mb-8 leading-tight">Get Your Clinic <br /><span className="text-blue-500">Flowing.</span></h2>
                <p className="text-slate-400 text-xl mb-12">Submit an inquiry to book your free access to ClinicFloww – Essentials today.</p>
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Mail className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Direct Support</p>
                      <p className="text-xl font-semibold">ClinicFloww@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 text-slate-900 shadow-2xl">
                {formSubmitted ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 font-heading">Inquiry Received</h3>
                    <p className="text-slate-500">Our team will contact you within 24 hours to set up your Essentials access.</p>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 ml-1">First Name</label>
                        <input required className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 ml-1">Last Name</label>
                        <input required className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">Work Email</label>
                      <input required type="email" className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">Clinic Name & City</label>
                      <input required className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">Inquiry Details</label>
                      <textarea required rows={3} placeholder="Tell us about your practice..." className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-100 active:scale-95">
                      <Send size={20} /> Request Free Access
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        <DashboardView />
      )}

      <footer className="bg-slate-900 text-slate-500 py-16 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-white font-heading tracking-tight">ClinicFloww</span>
          </div>
          <p className="text-sm">© 2024 ClinicFloww Management Systems. Clinical precision, professional growth.</p>
          <div className="flex gap-8 font-medium">
            <a href="mailto:ClinicFloww@gmail.com" className="hover:text-blue-400 transition-colors">Support</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
