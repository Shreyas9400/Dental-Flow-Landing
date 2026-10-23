// Internal console screens (dashboard, billing, patients). Loaded on demand so the
// charting library stays out of the landing page bundle.
import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Calendar, CreditCard, CheckCircle2, ReceiptText, Users, Plus, MoreVertical,
  TrendingUp, DollarSign, FileText, Clock, BarChart3, Cpu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getDashboardInsights } from '../../services/geminiService';
import { Patient, Invoice } from '../../types';

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

export const PatientsView = ({ patients }: { patients: Patient[] }) => (
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

export const BillingView = () => {
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

export const DashboardView = ({ patients, appointments, inventory }: any) => {
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
