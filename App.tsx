
import React, { useState, useEffect, useMemo } from 'react';
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
  DollarSign
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
import { getGeminiResponse, getDashboardInsights } from './services/geminiService';
import { ChatMessage, Feature, ViewState, Patient, Invoice, Tooth, ToothCondition, Appointment, InventoryItem } from './types';
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
                <button onClick={() => handleNav('features')} className="text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors">Features</button>
                <button onClick={() => handleNav('about')} className="text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors">Founders</button>
              </>
            )}
            <button 
              onClick={() => onViewChange(currentView === 'landing' ? 'dashboard' : 'landing')} 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
            >
              {currentView === 'landing' ? 'Launch Console' : 'Back to Home'}
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
              <button onClick={() => handleNav('features')} className="block w-full text-left py-3 font-bold text-slate-600">Features</button>
              <button onClick={() => handleNav('about')} className="block w-full text-left py-3 font-bold text-slate-600">Founders</button>
            </>
          )}
          <button onClick={() => onViewChange('dashboard')} className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-center font-black uppercase tracking-widest">Launch Console</button>
        </div>
      )}
    </nav>
  );
};

const StatCard: React.FC<{title: string; value: string | number; gradient: string; icon: React.ReactNode}> = ({ title, value, gradient, icon }) => (
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
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Patient Registry</h2>
        <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage clinical demographics & history</p>
      </div>
      <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
        <Plus size={16}/> Register Patient
      </button>
    </div>
    <div className="glass rounded-[2.5rem] overflow-hidden shadow-xl">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <th className="px-8 py-6">Identity</th>
            <th className="px-8 py-6">Status</th>
            <th className="px-8 py-6">Last Clinical Encounter</th>
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
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                  p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {p.status}
                </span>
              </td>
              <td className="px-8 py-6 text-sm font-bold text-slate-500">{p.lastVisit}</td>
              <td className="px-8 py-6 text-sm font-black text-slate-900">₹{p.balance.toLocaleString()}</td>
              <td className="px-8 py-6 text-right">
                <button className="p-2 hover:bg-white rounded-xl transition-all"><MoreVertical size={16}/></button>
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
          <ReceiptText size={16}/> Create Invoice
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Revenue (MTD)" value="₹2.4L" gradient="from-blue-500 to-indigo-600" icon={<DollarSign size={24}/>} />
        <StatCard title="Pending Collections" value="₹45k" gradient="from-amber-400 to-orange-500" icon={<TrendingUp size={24}/>} />
        <StatCard title="Tax Liability" value="₹12k" gradient="from-slate-700 to-slate-900" icon={<ShieldCheck size={24}/>} />
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
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    inv.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase tracking-widest">View PDF</button>
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
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Dashboard</h2>
              <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Practice Insights & Real-time Analytics</p>
          </div>
          <div className="flex gap-4">
            <button className="glass px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all shadow-sm">
              <FileText size={16}/> Export Report
            </button>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
              <Plus size={16}/> New Consultation
            </button>
          </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Total Registry" value={patients.length} gradient="from-cyan-500 to-blue-500" icon={<Users size={24}/>} />
          <StatCard title="Due Consultations" value={appointments.length} gradient="from-indigo-500 to-purple-500" icon={<Calendar size={24}/>} />
          <StatCard title="Receivables" value="₹42,500" gradient="from-pink-500 to-rose-500" icon={<CreditCard size={24}/>} />
          <StatCard title="Efficiency Score" value="94%" gradient="from-emerald-500 to-teal-500" icon={<CheckCircle2 size={24}/>} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-[2.5rem] shadow-xl">
              <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8 flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={20}/> Patient Traffic
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={patientFlowData}>
                      <defs>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                <ReceiptText className="text-indigo-500" size={20}/> Revenue Analysis
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">AI-Powered Practice Synthesis</p>
              </div>
              <button 
                onClick={handleGetInsights} 
                disabled={isLoading} 
                className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center shadow-2xl shadow-slate-900/30 transition-all text-[10px] uppercase tracking-widest"
              >
                  {isLoading && <Clock className="animate-spin mr-3" size={16}/>}
                  {isLoading ? 'Processing Analytics...' : 'Synthesize Insights'}
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
                  <p className="text-slate-400 font-bold text-sm tracking-tight">Request an automated summary of your clinical performance and supply chain alerts.</p>
              </div>
          )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
           <div className="glass p-8 rounded-[2.5rem] shadow-xl">
              <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8 flex items-center gap-2">
                <Database className="text-amber-500" size={20}/> Inventory Expiry
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                   <BarChart layout="vertical" data={top10ExpiringItems.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={tickStyle} width={120} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="daysToExpiry" radius={[0, 8, 8, 0]} barSize={20}>
                          {top10ExpiringItems.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.daysToExpiry < 10 ? '#f43f5e' : entry.daysToExpiry < 30 ? '#f59e0b' : '#3b82f6'} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </div>
           <div className="glass p-8 rounded-[2.5rem] shadow-xl">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Market Dynamics</h3>
                  <select 
                      value={selectedInventoryForPrice} 
                      onChange={(e) => setSelectedInventoryForPrice(e.target.value)}
                      className="px-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 text-[10px] uppercase tracking-widest outline-none"
                  >
                      {inventory.map((item: any) => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
               </div>
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    {date: 'Jan', price: 1150},
                    {date: 'Feb', price: 1180},
                    {date: 'Mar', price: 1200},
                  ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="stepAfter" dataKey="price" stroke="#ec4899" strokeWidth={4} dot={{ r: 6, fill: '#ec4899', strokeWidth: 0 }} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>

      <div className="glass p-10 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-4 mb-10">
              <div className="bg-emerald-500/10 p-3 rounded-2xl">
                  <MessageCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">Patient Recall Engine</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Targeted Engagement for Inactive Patients</p>
              </div>
          </div>
          
          {followUpList.length > 0 ? (
              <div className="overflow-x-auto">
                  <table className="min-w-full">
                      <thead>
                          <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-4">Patient</th>
                              <th className="px-6 py-4">Last Visit</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Engagement</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {followUpList.map((p: Patient, idx: number) => (
                              <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-6 text-sm text-slate-900 font-black">{p.name.toUpperCase()}</td>
                                  <td className="px-6 py-6 text-sm text-slate-500 font-bold">{p.lastVisit}</td>
                                  <td className="px-6 py-6">
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Recall Due</span>
                                  </td>
                                  <td className="px-6 py-6 text-right">
                                      <button 
                                          onClick={() => sendWhatsApp(p)}
                                          className="inline-flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
                                      >
                                          <MessageCircle className="w-4 h-4 mr-2" />
                                          Send WhatsApp
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          ) : (
              <div className="py-12 text-center">
                  <p className="text-slate-400 font-bold text-sm tracking-tight italic">Practice is current. No pending recalls detected.</p>
              </div>
          )}
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div className="glass p-10 rounded-[2.5rem] border border-white/20 hover:border-blue-300 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group cursor-pointer">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:-translate-y-2">
      {feature.icon}
    </div>
    <h3 className="text-2xl font-black mb-4 font-heading tracking-tight">{feature.title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Welcome to ClinicFloww Elite Support. How can I assist with your practice analytics or billing today?' }]);
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
    <div className="fixed bottom-10 right-10 z-[100]">
      {isOpen ? (
        <div className="bg-white w-96 h-[600px] rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8">
          <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div><p className="font-black text-sm uppercase tracking-widest">Elite AI</p><p className="text-[10px] opacity-60">Analytics Active</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-xl"><X size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-500/20' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] animate-pulse">Computing Insights...</div>}
          </div>
          <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Query clinical data..." 
              className="flex-1 bg-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all placeholder:text-slate-400" 
            />
            <button onClick={handleSend} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-black shadow-xl shadow-slate-900/10 active:scale-95 transition-all"><Send size={20}/></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-slate-900 text-white w-16 h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all hover:bg-black group">
          <MessageSquare className="group-hover:rotate-12 transition-transform" size={28}/>
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
      title: 'Secured Local Database',
      description: 'Industrial-grade local storage ensuring 100% data ownership. Your patient records never leave your secure office infrastructure.',
      icon: <Database size={32} />
    },
    {
      id: 'accounts',
      title: 'Account Management',
      description: 'Comprehensive oversight of practice logistics. Manage multiple doctors, staff permissions, and clinical schedules in one view.',
      icon: <Briefcase size={32} />
    },
    {
      id: 'intelligence',
      title: 'AI Intelligence',
      description: 'Powered by Gemini to synthesize treatment plans, predict patient recalls, and generate clinical insights instantly.',
      icon: <Cpu size={32} />
    }
  ];

  const renderContent = () => {
    switch(view) {
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
          <section id="hero" className="pt-48 pb-32 px-4 relative overflow-hidden">
            <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-400/5 blur-[120px] rounded-full -z-10" />
            <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
              
              {/* Dashed Border Container */}
              <div className="border-2 border-dashed border-blue-400/40 rounded-[2rem] p-4 md:p-8 mb-12 relative max-w-6xl w-full">
                
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-100 px-6 py-3 rounded-full shadow-lg mb-8 animate-in slide-in-from-top-4 duration-1000">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Elite Dental Management v4.0</span>
                </div>

                <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-0 font-heading tracking-tighter leading-none text-center">
                  ClinicFloww
                  <span className="text-3xl md:text-6xl font-black block mt-6 md:mt-12 text-slate-800 tracking-tight leading-snug">
                    The New Standard of Dentistry
                  </span>
                </h1>

                {/* Blue Feature Bar */}
                <div className="bg-blue-600 w-full mt-12 py-6 px-4 md:px-12 rounded-2xl shadow-2xl shadow-blue-500/20">
                  <p className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] text-center leading-relaxed">
                    Secured Local Database • Account Management • AI Intelligence
                  </p>
                </div>
              </div>

              <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-6 leading-relaxed font-medium px-4">
                ClinicFloww delivers industrial-grade dental infrastructure, local-first data security, and AI-powered intelligence for the elite practitioner.
              </p>
              
              <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-16 animate-pulse">
                Book your free access to Clinic Flow – Essentials today.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-md px-4">
                <button 
                  onClick={() => setView('dashboard')} 
                  className="w-full sm:w-auto bg-slate-900 text-white px-12 py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-black shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
                >
                  Launch Elite Console
                </button>
                <button onClick={() => safeScroll('features')} className="w-full sm:w-auto glass border border-white px-12 py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-white transition-all">Explore Systems</button>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-32 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="text-5xl font-black font-heading mb-6 text-slate-900 tracking-tighter">Engineered for Precision.</h2>
                <p className="text-slate-500 max-w-xl mx-auto font-medium">Advanced clinical tools that simplify complex practice management workflows.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-10">
                {features.map(f => <FeatureCard key={f.id} feature={f} />)}
              </div>
            </div>
          </section>

          {/* Visionary Section */}
          <section id="about" className="py-32 px-4 bg-slate-900 text-white rounded-[5rem] mx-4 md:mx-10 my-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div>
                   <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full mb-10">
                    <Award className="text-blue-500" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Founded by Clinicians</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black mb-10 font-heading leading-[1.1] tracking-tighter">Your Practice, Our Infrastructure.</h2>
                  <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                    Designed by Dr. Sayali Jadhav and Dr. Prashant Hajare to eliminate the friction of modern practice management. 
                  </p>
                  <div className="grid grid-cols-2 gap-10">
                    <div>
                      <p className="text-4xl font-black text-white mb-2 tracking-tighter">100%</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Local Privacy</p>
                    </div>
                    <div>
                      <p className="text-4xl font-black text-blue-500 mb-2 tracking-tighter">FREE</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Essentials Tier</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-800 relative group">
                      <img src={ASSETS.IMAGES.FOUNDERS.SAYALI} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="CEO" />
                      <div className="absolute bottom-6 left-6 z-20"><p className="font-black uppercase text-[10px] tracking-widest text-blue-400">CEO</p><p className="font-black text-lg tracking-tight">Dr. Sayali Jadhav</p></div>
                   </div>
                   <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-800 relative group mt-12">
                      <img src={ASSETS.IMAGES.FOUNDERS.PRASHANT} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="CMO" />
                      <div className="absolute bottom-6 left-6 z-20"><p className="font-black uppercase text-[10px] tracking-widest text-blue-400">CMO</p><p className="font-black text-lg tracking-tight">Dr. Prashant Hajare</p></div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="py-32 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-6xl font-black mb-6 font-heading tracking-tighter">Elevate Your Practice Today.</h2>
              <p className="text-xl text-slate-500 mb-10 font-medium">Request free access to the ClinicFloww Essentials tier.</p>
              
              <div className="flex items-center justify-center gap-3 mb-16">
                 <div className="h-px w-12 bg-slate-200" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Connect with us on <span className="text-blue-600">ClinicFloww@gmail.com</span></p>
                 <div className="h-px w-12 bg-slate-200" />
              </div>

              <div className="glass p-12 rounded-[3rem] shadow-2xl text-left">
                {formSubmitted ? (
                  <div className="py-20 text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-10">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-4xl font-black mb-4 tracking-tighter">Inquiry Logged.</h3>
                    <p className="text-slate-500 font-medium">Our onboarding specialist will reach out within 12 business hours.</p>
                  </div>
                ) : (
                  <form className="grid gap-8" onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Clinical Practitioner</label>
                        <input required placeholder="Dr. Jane Smith" className="w-full bg-slate-100 border-none p-6 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Practice Location</label>
                        <input required placeholder="City, State" className="w-full bg-slate-100 border-none p-6 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Secure Email</label>
                      <input required type="email" placeholder="clinic@provider.com" className="w-full bg-slate-100 border-none p-6 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900" />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-8 rounded-[1.5rem] hover:bg-black transition-all text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3">
                      <Send size={20} /> Initialize Onboarding
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        renderContent()
      )}

      <footer className="bg-white py-20 px-4 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Stethoscope className="text-white w-7 h-7" />
            </div>
            <span className="font-black text-3xl text-slate-900 font-heading tracking-tighter">ClinicFloww</span>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">© 2024 Elite Management Systems. All Data Local.</p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a href="mailto:ClinicFloww@gmail.com" className="hover:text-blue-600 transition-colors">Support</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Infrastructure</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
