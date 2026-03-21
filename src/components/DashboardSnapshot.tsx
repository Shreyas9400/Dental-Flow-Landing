import React, { useState, useMemo, useEffect } from 'react';
import type { Patient, Appointment, InventoryItem, ViewState } from '../../types';
import { getDashboardInsights } from '../../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea } from 'recharts';
import { MessageCircle as WhatsAppIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';

// Mocks for missing types to keep the component happy
export interface Expense {}
export interface Assistant {}
export interface ClinicNotification {
    id: string;
    type: string;
    timestamp: number;
    read: boolean;
    patientName: string;
    patientContact: string;
    message: string;
}
export type View = ViewState | 'communication' | 'calendar' | 'appointments';

interface DashboardProps {
    patients: Patient[];
    appointments: Appointment[];
    inventory: InventoryItem[];
    expenses: Expense[];
    assistants: Assistant[];
    currentTheme: 'light' | 'dark';
    setView: (view: View) => void;
    persistedInsights: string;
    onUpdateInsights: (insight: string) => void;
    onAccountsDrillDown?: (start: string, end: string) => void;
    isGoogleConnected?: boolean;
    onManualGoogleSync?: () => Promise<void>;
    syncCooldownUntil?: number | null;
    googleSessionExpired?: boolean;
    onReauth?: () => void;
    isActivated: boolean;
    licenseType: 'free' | 'pro';
    isAIEnabled?: boolean;
    onRequestActivation: () => void;
    onSendWhatsApp: (number: string, message: string) => void;
    whatsappStatus: string;
    isExpired?: boolean;
    canViewRevenue?: boolean;
}

const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
};

const Card: React.FC<{ title: string; value: string | number; gradient: string; onClick?: () => void; children: React.ReactNode }> = ({ title, value, gradient, onClick, children }) => (
    <button
        onClick={onClick}
        className="w-full text-left glass p-8 rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/5 relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 active:scale-[0.98] outline-none focus:ring-2 focus:ring-blue-500/50"
    >
        <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
                <div className="mt-3 flex items-center text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View Module <svg className="ml-1 w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
            </div>
            <div className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-3 shadow-lg shadow-current/20 transform group-hover:scale-110 transition-transform duration-500`}>
                {children}
            </div>
        </div>
    </button>
);

export const DashboardSnapshot: React.FC<DashboardProps> = ({
    patients,
    appointments,
    inventory,
    expenses,
    assistants,
    currentTheme,
    setView,
    persistedInsights,
    onUpdateInsights,
    onAccountsDrillDown,
    isGoogleConnected,
    onManualGoogleSync,
    syncCooldownUntil,
    googleSessionExpired,
    onReauth,
    isActivated,
    licenseType,
    isAIEnabled = true,
    onRequestActivation,
    onSendWhatsApp,
    whatsappStatus,
    isExpired = false,
    canViewRevenue = true,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isFollowUpExpanded, setIsFollowUpExpanded] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [reportLogs, setReportLogs] = useState<string[]>([]);
    
    // Hardcoded dummy notification
    const [activeNotifications, setActiveNotifications] = useState<ClinicNotification[]>([
        { id: '1', type: 'call_request', timestamp: Date.now() - 300000, read: false, patientName: 'John Doe', patientContact: '9876543210', message: 'Hi, I need to reschedule my appt.' }
    ]);
    
    const [quadrantFilter, setQuadrantFilter] = useState('');
    const [quadrantSegmentFilter, setQuadrantSegmentFilter] = useState<string>('');
    const [revenueViewMode, setRevenueViewMode] = useState<'monthly' | 'yearly'>('monthly');

    const isDarkMode = currentTheme === 'dark';
    const isCooldownActive = syncCooldownUntil ? Date.now() < syncCooldownUntil : false;

    const markAsRead = async (id: string) => {
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleRevenueDrillDown = (data: any) => {
        if (!onAccountsDrillDown || !data || !data.payload || !data.payload.month) return;
        const [mStr, yStr] = data.payload.month.split(' ');
        const monthIndex = new Date(Date.parse(mStr + " 1, 2012")).getMonth();
        const year = parseInt(yStr, 10) || new Date().getFullYear();
        const firstDay = new Date(year, monthIndex, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, monthIndex + 1, 0).toISOString().split('T')[0];
        onAccountsDrillDown(firstDay, lastDay);
    };

    const tickStyle = {
        fill: isDarkMode ? '#71717a' : '#94a3b8',
        fontSize: '11px',
        fontWeight: 600
    };
    const gridStroke = isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';

    const tooltipStyle = {
        backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        borderRadius: '1.25rem',
        color: isDarkMode ? '#f4f4f5' : '#111827',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        fontSize: '12px',
        padding: '12px 16px',
        fontWeight: '700'
    };

    const cursorStyle = { fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' };

    const upcomingAppointments = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return appointments.filter(a => a.date >= today).length;
    }, [appointments]);

    const totalOutstanding = useMemo(() => {
        return patients.reduce((total, patient) => {
            const patientTotal = (patient.paymentHistory || []).reduce((sum, record) => sum + (record.totalAmount - record.amountPaid), 0);
            return total + patientTotal + (patient.balance || 0);
        }, 0);
    }, [patients]);

    const followUpList = useMemo(() => {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return patients.map(patient => {
            const pastAppts = appointments
                .filter(a => a.patientId === patient.id && new Date(a.date) < now)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Allow last visit from patient record as a fallback
            const lastAppt = pastAppts[0] || { date: patient.lastVisit, reason: 'Previous Visit' };
            const dentalHistory = patient.dentalHistory || [];
            const lastClinicalActivity = dentalHistory.length > 0
                ? new Date(dentalHistory[dentalHistory.length - 1].date)
                : new Date(patient.lastVisit);
                
            const hasRecentActivity = lastClinicalActivity > thirtyDaysAgo || (lastAppt && new Date(lastAppt.date) > thirtyDaysAgo);
            
            // Force mock patients to appear in follow up if they have older dates
            if (lastAppt && new Date(lastAppt.date) <= sixMonthsAgo && !hasRecentActivity) {
                const diffTime = Math.abs(now.getTime() - new Date(lastAppt.date).getTime());
                const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                return { patient, lastDate: lastAppt.date, reason: lastAppt.reason, monthsInactive: diffMonths || 6 };
            }
            return null;
        }).filter((item): item is any => item !== null).sort((a, b) => b.monthsInactive - a.monthsInactive);
    }, [patients, appointments]);

    const displayedFollowUp = useMemo(() => isFollowUpExpanded ? followUpList.slice(0, 50) : followUpList.slice(0, 5), [followUpList, isFollowUpExpanded]);

    const handleGetInsights = async () => {
        if (!isActivated || isExpired) {
            onRequestActivation();
            return;
        }
        if (!isAIEnabled) {
            alert("Your current license plan does not include AI Intelligence features.");
            return;
        }
        setIsLoading(true);
        try {
            const report = await getDashboardInsights({ patients, appointments, inventory });
            onUpdateInsights(report);
            setReportLogs(['Log 1: Analyzing patient demographics...', 'Log 2: Calculating revenue gaps...', 'Log 3: Generating final summary.']);
        } catch(e) { /* mock safe */ }
        setIsLoading(false);
    };

    const handleManualSync = async () => {
        if (!onManualGoogleSync || isSyncingGoogle || isCooldownActive) return;
        setIsSyncingGoogle(true);
        setSyncStatus('idle');
        try {
            await onManualGoogleSync();
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (error) {
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 5000);
        } finally {
            setIsSyncingGoogle(false);
        }
    };

    const sendFollowUpReminder = (patient: Patient, lastDate: string) => {
        const message = `Hello ${patient.name}, it has been some time since your last dental visit on ${lastDate}. We recommend scheduling a routine check-up. - Management`;
        onSendWhatsApp(patient.contact || '', message);
    };

    const patientFlowData = useMemo(() => {
        const monthCounts = appointments.reduce((acc, app) => {
            const dateObj = new Date(app.date);
            if (isNaN(dateObj.getTime())) return acc;
            const month = dateObj.toLocaleString('default', { month: 'short', year: 'numeric', timeZone: 'UTC' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        // Add fake historical data if empty for demo
        if (Object.keys(monthCounts).length < 2) {
            return [
                { month: 'Oct 2023', appointments: 45 },
                { month: 'Nov 2023', appointments: 52 },
                { month: 'Dec 2023', appointments: 38 },
                { month: 'Jan 2024', appointments: 65 },
                { month: 'Feb 2024', appointments: 48 },
                { month: 'Mar 2024', appointments: 59 },
            ];
        }

        const sortedMonths = Object.keys(monthCounts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        return sortedMonths.map(month => ({ month, appointments: monthCounts[month] }));
    }, [appointments]);

    const revenueData = useMemo(() => {
        const allRecords = patients.flatMap(p => p.paymentHistory || []);
        
        if (allRecords.length < 2) {
             return [
                { month: 'Oct 2023', revenue: 45000 },
                { month: 'Nov 2023', revenue: 52000 },
                { month: 'Dec 2023', revenue: 48000 },
                { month: 'Jan 2024', revenue: 75000 },
                { month: 'Feb 2024', revenue: 62000 },
                { month: 'Mar 2024', revenue: 89000 },
            ];
        }
        
        if (revenueViewMode === 'yearly') {
            const yearTotals = allRecords.reduce((acc, record) => {
                const dateObj = new Date(record.date);
                if (isNaN(dateObj.getTime())) return acc;
                const year = dateObj.getFullYear().toString();
                acc[year] = (acc[year] || 0) + record.amountPaid;
                return acc;
            }, {} as Record<string, number>);
            return Object.keys(yearTotals).sort().map(year => ({ month: year, revenue: yearTotals[year] }));
        }
        const monthTotals = allRecords.reduce((acc, record) => {
            const dateObj = new Date(record.date);
            if (isNaN(dateObj.getTime())) return acc;
            const month = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
            acc[month] = (acc[month] || 0) + record.amountPaid;
            return acc;
        }, {} as Record<string, number>);
        const sortedMonths = Object.keys(monthTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        return sortedMonths.map(month => ({ month, revenue: monthTotals[month] }));
    }, [patients, revenueViewMode]);

    const totalRevenueSum = useMemo(() => revenueData.reduce((s, d) => s + d.revenue, 0), [revenueData]);

    const quadrantData = useMemo(() => {
        // We will fake more data points if we don't have enough to show quadrant mapping nicely
        const patientMocks = patients.length > 5 ? patients : [
            ...patients,
            { name: 'Fake 1', id: 'f1', revenue: 5000, visits: 2, paymentHistory: [] },
            { name: 'Fake 2', id: 'f2', revenue: 15000, visits: 6, paymentHistory: [] },
            { name: 'Fake 3', id: 'f3', revenue: 2000, visits: 1, paymentHistory: [] },
            { name: 'Fake 4', id: 'f4', revenue: 25000, visits: 8, paymentHistory: [] }
        ];
        
        const now = new Date();
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const yearAgoStr = oneYearAgo.toISOString().split('T')[0];

        const raw = patientMocks.map((p: any) => {
            const revenue = p.revenue || (p.paymentHistory || []).reduce((sum: number, r: any) => sum + r.totalAmount, 0) || Math.random() * 20000;
            const visits = p.visits || appointments.filter(a => a.patientId === p.id && a.date >= yearAgoStr).length || Math.floor(Math.random() * 8);
            return { name: p.name, id: p.id, revenue, visits: visits || 1 };
        });

        const medianOf = (arr: number[]) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)] || 0;
        const revThreshold = Math.max(medianOf(raw.map(d => d.revenue)), 1);
        const engThreshold = Math.max(medianOf(raw.map(d => d.visits)), 1);

        const maxRev = Math.max(...raw.map(d => d.revenue), revThreshold * 2);
        const maxEng = Math.max(...raw.map(d => d.visits), engThreshold * 2);
        const xDomain: [number, number] = [0, Math.ceil(maxEng * 1.15)];
        const yDomain: [number, number] = [0, Math.ceil(maxRev * 1.15)];

        const counts: Record<string, number> = { Champion: 0, 'At Risk': 0, Nurture: 0, Dormant: 0 };

        const allData = raw.map(d => {
            const isHighRev = d.revenue >= revThreshold;
            const isHighEng = d.visits >= engThreshold;
            let quadrant: string, fill: string;
            if (isHighRev && isHighEng) { quadrant = 'Champion'; fill = '#10b981'; }
            else if (isHighRev && !isHighEng) { quadrant = 'At Risk'; fill = '#f59e0b'; }
            else if (!isHighRev && isHighEng) { quadrant = 'Nurture'; fill = '#3b82f6'; }
            else { quadrant = 'Dormant'; fill = '#9ca3af'; }
            counts[quadrant]++;
            const isHighlighted = quadrantFilter === d.id;
            return { ...d, quadrant, fill, isHighlighted, size: isHighlighted ? 300 : (quadrantFilter ? 40 : 100) };
        });

        const displayData = quadrantSegmentFilter ? allData.filter(d => d.quadrant === quadrantSegmentFilter) : allData;

        return { displayData, allData, revThreshold, engThreshold, xDomain, yDomain, counts };
    }, [patients, appointments, quadrantFilter, quadrantSegmentFilter]);

    const sortedPatientsForFilter = useMemo(() => [...patients].sort((a, b) => a.name.localeCompare(b.name)), [patients]);

    return (
        <div className="flex flex-col md:flex-row h-[800px] md:h-full md:min-h-[800px] w-full bg-slate-50/50 overflow-hidden">
            <div className="hidden md:block h-full border-r border-slate-200/30">
                <Sidebar 
                    currentView="dashboard" 
                    setView={setView} 
                    dentistName="Dr. Jane Smith"
                    onOpenSettings={() => {}}
                    isWhatsAppEnabled={true}
                    isAIEnabled={true}
                />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8 md:space-y-10 selection:bg-blue-100 selection:text-blue-900 text-slate-900 w-full text-left relative">
            {activeNotifications.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Action Center</h3>
                        </div>
                        <span className="px-3 py-1 bg-blue-600/10 text-blue-600 font-black rounded-full uppercase tracking-tighter border border-blue-600/20" style={{fontSize: '9px'}}>{activeNotifications.length} Incoming Requests</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeNotifications.map(n => (
                            <div key={n.id} className="relative glass p-6 rounded-[2.5rem] border border-white/30 dark:border-white/10 shadow-2xl flex flex-col group overflow-hidden transition-transform hover:-translate-y-1 bg-white">
                                <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full shadow-[0_0_15px_rgba(0,0,0,0.1)] ${n.type === 'call_request' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

                                <div className="flex justify-between items-start mb-5">
                                    <div className={`p-3 rounded-2xl shadow-inner ${n.type === 'call_request' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                                        {n.type === 'call_request' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        ) : (
                                            <CalendarIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">{formatTimeAgo(n.timestamp)}</span>
                                </div>

                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{n.type.replace('_', ' ')}</p>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{n.patientName.toUpperCase()}</h4>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
                                        <WhatsAppIcon className="w-3 h-3" />
                                        {n.patientContact}
                                    </p>
                                    <div className="mt-4 p-3 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 italic">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">"{n.message}"</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-3">
                                    <button
                                        onClick={() => { setView('communication'); markAsRead(n.id); }}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
                                    >
                                        Reply via WhatsApp
                                    </button>
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        className="px-4 py-3 bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Dashboard</h2>
                        {isActivated && <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${licenseType === 'pro' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>{licenseType === 'pro' ? 'Professional' : 'Starter'}</div>}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Practice Insights & Analytics</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card title="Patient Registry" value={patients.length} gradient="from-blue-500 to-indigo-500" onClick={() => setView('patients')}><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-.743-1.676M7 15v-2c0-.653.28-1.25.743-1.676M7 15h-.497m1.207-1.497A5 5 0 0112 10a5 5 0 014.793 3.503M12 10V4m0 6a2 2 0 100-4 2 2 0 000 4z" /></svg></Card>
                <Card title="Due Consultations" value={upcomingAppointments} gradient="from-indigo-500 to-purple-500" onClick={() => setView('calendar')}><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 0-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></Card>
                {canViewRevenue ? (
                    <Card title="Receivables" value={`Rs. ${totalOutstanding.toLocaleString()}`} gradient="from-purple-500 to-rose-500" onClick={() => setView('patients')}><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg></Card>
                ) : (
                    <div className="glass p-8 rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/5 relative overflow-hidden flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenue Hidden</p>
                            <p className="text-xs text-slate-400 mt-1">Contact Lead Doctor</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass bg-white p-8 rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/5 group hover:border-blue-500/30 cursor-pointer transition-all" onClick={() => setView('appointments')}>
                    <div className="flex justify-between items-start mb-8"><h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Patient Traffic</h3><div className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100">Analyze Schedule →</div></div>
                    <ResponsiveContainer width="100%" height={300}>
                        {patientFlowData.length > 0 ? (
                            <AreaChart data={patientFlowData}><defs><linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} /><XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} dy={10} /><YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} cursor={cursorStyle} /><Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" name="Consultations" /></AreaChart>
                        ) : <div className="flex items-center justify-center h-full text-slate-400 italic">Waiting for data...</div>}
                    </ResponsiveContainer>
                </div>
                <div className="glass bg-white p-8 rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/5 group hover:border-indigo-500/30 transition-all">
                    {canViewRevenue ? (
                        <>
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Revenue Analysis</h3>
                                        <p className="text-2xl font-black text-indigo-500 tracking-tight mt-1">Rs. {totalRevenueSum.toLocaleString()}<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">{revenueViewMode === 'yearly' ? 'All Time' : 'Total'}</span></p>
                                    </div>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                {revenueData.length > 0 ? (
                                    <BarChart data={revenueData} barCategoryGap="20%">
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                        <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `Rs.${(v / 1000).toFixed(0)}k` : `Rs.${v}`} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ ...cursorStyle, radius: 8 }} formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                                        <Bar dataKey="revenue" fill="url(#revenueGrad)" name="Revenue" radius={[10, 10, 4, 4]} cursor="pointer" onClick={handleRevenueDrillDown} animationBegin={0} animationDuration={1200} animationEasing="ease-out" />
                                    </BarChart>
                                ) : <div className="flex items-center justify-center h-full text-slate-400 italic">No revenue records.</div>}
                            </ResponsiveContainer>
                        </>
                    ) : null}
                </div>
            </div>

            {/* Patient Value Matrix — only visible when user has revenue access */}
            {canViewRevenue && (
                <div className="glass bg-white p-8 rounded-[2.5rem] shadow-xl border border-white/20 relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-500/10 p-3 rounded-2xl">
                                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-2xl tracking-tight">Patient Value Matrix</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue × Engagement • Quadrant Analysis</p>
                            </div>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={450}>
                        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                            <ReferenceArea x1={0} x2={quadrantData.engThreshold} y1={quadrantData.revThreshold} y2={quadrantData.yDomain[1]} fill="#f59e0b" fillOpacity={isDarkMode ? 0.06 : 0.05} />
                            <ReferenceArea x1={quadrantData.engThreshold} x2={quadrantData.xDomain[1]} y1={quadrantData.revThreshold} y2={quadrantData.yDomain[1]} fill="#10b981" fillOpacity={isDarkMode ? 0.06 : 0.05} />
                            <ReferenceArea x1={0} x2={quadrantData.engThreshold} y1={0} y2={quadrantData.revThreshold} fill="#9ca3af" fillOpacity={isDarkMode ? 0.06 : 0.05} />
                            <ReferenceArea x1={quadrantData.engThreshold} x2={quadrantData.xDomain[1]} y1={0} y2={quadrantData.revThreshold} fill="#3b82f6" fillOpacity={isDarkMode ? 0.06 : 0.05} />
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis
                                type="number"
                                dataKey="visits"
                                name="Visits"
                                tick={tickStyle}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                domain={quadrantData.xDomain}
                                label={{ value: 'ENGAGEMENT (Visits in 12 Months) →', position: 'bottom', offset: 10, style: { fill: isDarkMode ? '#71717a' : '#94a3b8', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em' } }}
                            />
                            <YAxis
                                type="number"
                                dataKey="revenue"
                                name="Revenue"
                                tick={tickStyle}
                                axisLine={false}
                                tickLine={false}
                                domain={quadrantData.yDomain}
                                tickFormatter={(v: number) => v >= 1000 ? `Rs.${(v / 1000).toFixed(0)}k` : `Rs.${v}`}
                                label={{ value: 'REVENUE (Total Billed) →', angle: -90, position: 'insideLeft', offset: 0, style: { fill: isDarkMode ? '#71717a' : '#94a3b8', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em' } }}
                            />
                            <ZAxis type="number" dataKey="size" range={[40, 300]} />
                            <ReferenceLine x={quadrantData.engThreshold} stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'} strokeWidth={2} />
                            <ReferenceLine y={quadrantData.revThreshold} stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'} strokeWidth={2} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3', stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                                content={({ active, payload }: any) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{ ...tooltipStyle, minWidth: '180px' }}>
                                            <p style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '-0.02em', marginBottom: '6px' }}>{d.name}</p>
                                            <p style={{ fontSize: '12px', fontWeight: 700 }}>Revenue: Rs. {d.revenue.toLocaleString()}</p>
                                            <p style={{ fontSize: '12px', fontWeight: 700 }}>Visits (12mo): {d.visits}</p>
                                            <p style={{ fontSize: '11px', fontWeight: 900, color: d.fill, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.quadrant}</p>
                                        </div>
                                    );
                                }}
                            />
                            <Scatter data={quadrantData.displayData} isAnimationActive={false}>
                                {quadrantData.displayData.map((entry: any, idx: number) => (
                                    <Cell
                                        key={idx}
                                        fill={entry.fill}
                                        fillOpacity={entry.isHighlighted ? 1 : (quadrantFilter ? 0.15 : 0.85)}
                                        stroke={entry.isHighlighted ? (isDarkMode ? '#fff' : '#1f2937') : 'rgba(255,255,255,0.4)'}
                                        strokeWidth={entry.isHighlighted ? 3 : 1}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
        </div>
    );
};
