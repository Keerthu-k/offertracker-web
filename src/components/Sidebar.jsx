import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Sparkles } from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/applications', icon: Briefcase, label: 'Applications' },
    { path: '/resumes', icon: FileText, label: 'Resumes' },
];

const NAV_ACTIVE = 'bg-indigo-500/15 text-white';
const NAV_INACTIVE = 'text-slate-100 hover:text-white hover:bg-white/[0.08]';

export default function Sidebar() {
    return (
        <aside className="fixed top-0 left-0 w-64 h-screen bg-slate-900 flex flex-col z-50 overflow-y-auto">
            <div className="px-5 pt-7 pb-8">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <div className="text-[15px] font-bold text-white tracking-tight">OfferTracker</div>
                        <div className="text-[11px] text-slate-400">Career Intelligence</div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest px-3 mb-3">Menu</div>
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) =>
                            `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5 ${
                                isActive ? NAV_ACTIVE : NAV_INACTIVE
                            }`
                        }
                        style={({ isActive }) => ({
                            color: isActive ? '#ffffff' : '#f1f5f9',
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full" />
                                )}
                                <Icon size={18} />
                                <span>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="px-5 py-4 border-t border-slate-800">
                <div className="text-[11px] text-slate-500 text-center">v1.0.0</div>
            </div>
        </aside>
    );
}
