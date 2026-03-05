import React, { useState } from 'react';
import { ViewState } from '../types';
import {
    LayoutDashboard,
    Receipt,
    Package,
    LogOut,
    ChefHat,
    Bell,
    Users,
    Menu,
    X
} from 'lucide-react';

interface LayoutProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    onLogout: () => void;
    children: React.ReactNode;
    notificationCount: number;
}

const AppLayout: React.FC<LayoutProps> = ({
    currentView,
    onChangeView,
    onLogout,
    children,
    notificationCount
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
        <button
            onClick={() => {
                onChangeView(view);
                setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 group ${currentView === view
                    ? 'bg-amber-100 text-amber-900 font-medium'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
        >
            <Icon size={20} className={currentView === view ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex h-full shadow-sm z-30">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500 p-2 rounded-lg text-white shadow-md shadow-amber-200">
                            <ChefHat size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-800 tracking-tight">Crumb & Co.</h1>
                            <p className="text-xs text-slate-400 font-medium">Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Overview" />
                    <NavItem view={ViewState.BILLING} icon={Receipt} label="POS & Billing" />
                    <NavItem view={ViewState.INVENTORY} icon={Package} label="Menu & Stock" />
                    <NavItem view={ViewState.CUSTOMERS} icon={Users} label="Customers & CRM" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500 p-2 rounded-lg text-white shadow-md shadow-amber-200">
                            <ChefHat size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-800 tracking-tight">Crumb & Co.</h1>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Overview" />
                    <NavItem view={ViewState.BILLING} icon={Receipt} label="POS & Billing" />
                    <NavItem view={ViewState.INVENTORY} icon={Package} label="Menu & Stock" />
                    <NavItem view={ViewState.CUSTOMERS} icon={Users} label="Customers & CRM" />
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden text-slate-500 p-1"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg md:text-xl font-semibold text-slate-800 truncate">
                            {currentView === ViewState.DASHBOARD && 'Dashboard'}
                            {currentView === ViewState.BILLING && 'New Sale'}
                            {currentView === ViewState.INVENTORY && 'Menu & Stock'}
                            {currentView === ViewState.CUSTOMERS && 'Customers'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
                                <Bell size={20} />
                                {notificationCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        </div>
                        <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm border border-amber-200">
                            A
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
