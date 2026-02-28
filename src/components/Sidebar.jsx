import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Sparkles,
    Bookmark,
    Users,
    Settings,
    LogOut,
    Flame,
    ChevronDown,
    UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const mainNav = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/applications', icon: Briefcase, label: 'Applications' },
    { path: '/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
    { path: '/resumes', icon: FileText, label: 'Resumes' },
];

const organizeNav = [
    { path: '/contacts', icon: Users, label: 'Contacts' },
];

const NAV_ACTIVE = 'bg-indigo-500/15 text-white';
const NAV_INACTIVE = 'text-slate-300 hover:text-white hover:bg-white/[0.06]';

function NavSection({ title, items }) {
    return (
        <div className="mb-4">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em] px-3 mb-1.5">
                {title}
            </div>
            {items.map(({ path, icon: Icon, label }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={path === '/dashboard'}
                    className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5 ${
                            isActive ? NAV_ACTIVE : NAV_INACTIVE
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-400 rounded-r-full" />
                            )}
                            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                            <span>{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
}

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <aside className="fixed top-0 left-0 w-64 h-screen bg-slate-900 flex flex-col z-50 overflow-y-auto border-r border-slate-800">
            {/* Logo */}
            <div className="px-5 pt-6 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                        <Sparkles size={17} />
                    </div>
                    <div>
                        <div className="text-[15px] font-bold text-white tracking-tight">OfferTracker</div>
                        <div className="text-[10px] text-slate-500 font-medium">Career Intelligence</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 overflow-y-auto">
                <NavSection title="Overview" items={mainNav} />
                <NavSection title="Organize" items={organizeNav} />
            </nav>

            {/* User section */}
            <div className="px-3 pb-4 border-t border-slate-800 pt-3 relative">
                {user?.streak_days > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg bg-orange-500/10">
                        <Flame size={14} className="text-orange-400" />
                        <span className="text-[11px] font-semibold text-orange-300">{user.streak_days}-day streak</span>
                    </div>
                )}
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/[0.06] transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                        {(user?.display_name || user?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{user?.display_name || user?.username || 'User'}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user?.email || ''}</div>
                    </div>
                    <ChevronDown size={14} className="text-slate-500" />
                </button>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute left-3 right-3 bottom-full mb-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 py-1.5 animate-[fadeIn_0.15s_ease]">
                            <NavLink
                                to="/settings"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                            >
                                <Settings size={15} /> Settings
                            </NavLink>
                            <NavLink
                                to={`/profile`}
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                            >
                                <UserCircle size={15} /> Profile
                            </NavLink>
                            <div className="my-1 border-t border-slate-700" />
                            <button
                                onClick={() => { setShowMenu(false); logout(); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={15} /> Sign out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}
