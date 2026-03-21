import React, { useState, useEffect } from 'react';
import type { ViewState, AppUser } from '../../types';
import { 
    LayoutDashboard as DashboardIcon, 
    Users as PatientsIcon, 
    Calendar as CalendarIcon, 
    Stethoscope as LogoIcon, 
    Settings as SettingsIcon, 
    ClipboardList as AppointmentsIcon, 
    Briefcase as InventoryIcon, 
    Bot as ChatIcon, 
    CreditCard as AccountsIcon, 
    Database as DatabaseIcon, 
    Contact as AssistantsIcon, 
    MessageCircle as WhatsAppIcon 
} from 'lucide-react';

interface SidebarProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
    dentistName: string;
    onOpenSettings: () => void;
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen?: (open: boolean) => void;
    isWhatsAppEnabled?: boolean;
    isAIEnabled?: boolean;
    currentUser?: AppUser | null;
    onLogout?: () => void;
    canAccessSettings?: boolean;
    canViewAccounts?: boolean;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
    isLocked?: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed, isLocked }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? (isLocked ? `${label} (Locked)` : label) : ''}
        className={`group flex items-center w-full px-4 py-3 text-left text-sm font-semibold rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400'
            } ${isCollapsed ? 'justify-center px-0' : ''} ${isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isCollapsed ? 'mx-auto' : ''}`}>
            {icon}
        </div>
        {!isCollapsed && (
            <div className="ml-3 flex-1 flex items-center justify-between tracking-tight truncate">
                <span>{label}</span>
                {isLocked && (
                    <svg className="w-3 h-3 text-slate-400 dark:text-slate-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                )}
            </div>
        )}
        {isActive && !isCollapsed && (
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>
        )}
        {isActive && isCollapsed && (
            <div className="absolute inset-y-2 left-0 w-1 bg-white/40 rounded-full"></div>
        )}
        {isLocked && isCollapsed && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></div>
        )}
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    setView,
    dentistName,
    onOpenSettings,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isWhatsAppEnabled = true,
    isAIEnabled = true,
    currentUser,
    onLogout,
    canAccessSettings = true,
    canViewAccounts = true,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (currentView !== 'dashboard') {
            setIsCollapsed(true);
        } else {
            setIsCollapsed(false);
        }
    }, [currentView]);

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen?.(false)}
                />
            )}

            <aside
                className={`flex-shrink-0 bg-slate-50/50 md:border-r border-slate-200/20 dark:border-white/5 flex flex-col z-[55] transition-all duration-500 ease-in-out 
          relative inset-y-0 left-0 h-full
          ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${!isMobileMenuOpen && isCollapsed ? 'md:w-20' : 'md:w-72'}
        `}
            >
                <div className={`h-24 flex items-center relative transition-all duration-500 ${isCollapsed && !isMobileMenuOpen ? 'px-4 justify-center' : 'px-8'}`}>
                    <button
                        onClick={() => setView('dashboard')}
                        className="flex items-center group transition-all"
                        title="Go to Dashboard"
                    >
                        <div className="bg-blue-600 rounded-2xl p-2 shadow-xl shadow-blue-600/40 shrink-0 group-hover:scale-110 transition-transform">
                            <LogoIcon className="h-7 w-7 text-white" />
                        </div>
                        {(!isCollapsed || isMobileMenuOpen) && (
                            <h1 className="ml-3 text-2xl font-black text-slate-900 tracking-tighter truncate animate-in fade-in slide-in-from-left-2 duration-500 uppercase group-hover:opacity-80">
                                ClinicFloww
                            </h1>
                        )}
                    </button>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-all z-[60]`}
                    >
                        <svg className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setIsMobileMenuOpen?.(false)}
                        className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
                    {(!isCollapsed || isMobileMenuOpen) && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4 animate-in fade-in duration-500">Main Menu</div>}
                    <NavItem
                        icon={<DashboardIcon className="h-5 w-5" />}
                        label="Dashboard"
                        isActive={currentView === 'dashboard'}
                        onClick={() => setView('dashboard')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />
                    <NavItem
                        icon={<PatientsIcon className="h-5 w-5" />}
                        label="Patients"
                        isActive={currentView === 'patients'}
                        onClick={() => setView('patients')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />
                    <NavItem
                        icon={<CalendarIcon className="h-5 w-5" />}
                        label="Calendar"
                        isActive={currentView === 'calendar'}
                        onClick={() => setView('calendar')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />
                    <NavItem
                        icon={<AppointmentsIcon className="h-5 w-5" />}
                        label="Appointments"
                        isActive={currentView === 'appointments'}
                        onClick={() => setView('appointments')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />

                    <div className={`${isCollapsed && !isMobileMenuOpen ? 'h-4' : 'h-8'}`}></div>
                    {(!isCollapsed || isMobileMenuOpen) && <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4 animate-in fade-in duration-500">Management</div>}
                    <NavItem
                        icon={<WhatsAppIcon className="h-5 w-5" />}
                        label="Communication"
                        isActive={currentView === 'communication'}
                        onClick={() => setView('communication')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                        isLocked={!isWhatsAppEnabled}
                    />
                    <NavItem
                        icon={<InventoryIcon className="h-5 w-5" />}
                        label="Inventory"
                        isActive={currentView === 'inventory'}
                        onClick={() => setView('inventory')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />
                    <NavItem
                        icon={<AccountsIcon className="h-5 w-5" />}
                        label="Accounts"
                        isActive={currentView === 'accounts'}
                        onClick={() => setView('accounts')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                        isLocked={!canViewAccounts}
                    />
                    <NavItem
                        icon={<AssistantsIcon className="h-5 w-5" />}
                        label="Staff"
                        isActive={currentView === 'assistants'}
                        onClick={() => setView('assistants')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />
                    <NavItem
                        icon={<DatabaseIcon className="h-5 w-5" />}
                        label="Database"
                        isActive={currentView === 'database'}
                        onClick={() => setView('database')}
                        isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />

                    <div className={`pt-6 mt-6 border-t border-slate-100 dark:border-white/5`}>
                        <NavItem
                            icon={<ChatIcon className="h-5 w-5" />}
                            label="AI Assistant"
                            isActive={currentView === 'ai-assistant'}
                            onClick={() => setView('ai-assistant')}
                            isCollapsed={isCollapsed && !isMobileMenuOpen}
                            isLocked={!isAIEnabled}
                        />
                        <div className={`mt-2 pt-2 border-t border-slate-100 dark:border-white/5`}>
                            <NavItem
                                icon={<SettingsIcon className="h-5 w-5" />}
                                label="Settings"
                                isActive={false}
                                onClick={() => {
                                    if (!canAccessSettings) return;
                                    onOpenSettings();
                                    setIsCollapsed(true);
                                    setIsMobileMenuOpen?.(false);
                                }}
                                isCollapsed={isCollapsed && !isMobileMenuOpen}
                                isLocked={!canAccessSettings}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className={`p-4 relative transition-all duration-500 ${isCollapsed && !isMobileMenuOpen ? 'px-2' : 'p-6'}`}
                >
                    <div
                    className={`flex items-center p-3 rounded-2xl transition-all duration-300 ${isCollapsed && !isMobileMenuOpen ? 'justify-center bg-transparent' : 'bg-white shadow-sm border border-slate-100'}`}
                >
                    <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30">
                            {(currentUser?.name || dentistName).charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    {(!isCollapsed || isMobileMenuOpen) && (
                        <div className="ml-4 overflow-hidden flex-1 animate-in fade-in slide-in-from-left-2 duration-500">
                            <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.name || dentistName}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{currentUser?.position || 'Lead Dentist'}</p>
                        </div>
                    )}
                    {(!isCollapsed || isMobileMenuOpen) && onLogout && (
                        <button
                            onClick={onLogout}
                            title="Log out"
                            className="ml-2 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    )}
                </div>
            </div>
            </aside>
        </>
    );
};
