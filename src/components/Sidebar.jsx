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

function NavSection({ items }) {
    return (
        <div className="mb-4">
            {items.map(({ path, icon: Icon, label }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={path === '/dashboard'}
                    title={label}
                    className="relative flex justify-center items-center h-11 w-11 mx-auto rounded-xl transition-all duration-150 mb-2 hover:bg-white/[0.06] hover:text-white"
                    style={({ isActive }) => ({
                        backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        color: isActive ? '#ffffff' : '#94a3b8'
                    })}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-400 rounded-r-full" />
                            )}
                            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
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
        <aside className="fixed top-0 left-0 w-[72px] h-screen bg-slate-900 flex flex-col z-50 overflow-y-auto border-r border-slate-800">
            {/* Logo */}
            <div className="flex justify-center pt-6 pb-6">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25" title="OfferTracker">
                    <Sparkles size={17} />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 w-full overflow-y-auto pt-2">
                <NavSection items={mainNav} />
                <div className="w-8 h-px bg-slate-800 mx-auto mb-4" />
                <NavSection items={organizeNav} />
            </nav>

            {/* User section */}
            <div className="pb-4 pt-4 relative flex flex-col items-center border-t border-slate-800">
                {user?.streak_days > 0 && (
                    <div className="flex items-center justify-center w-8 h-8 mb-3 rounded-lg bg-orange-500/10" title={`${user.streak_days}-day streak`}>
                        <Flame size={16} className="text-orange-400" />
                    </div>
                )}
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300 transition-all"
                    title={user?.display_name || user?.username || 'User'}
                    style={{ color: '#e2e8f0' }}
                >
                    {(user?.display_name || user?.username || 'U')[0].toUpperCase()}
                </button>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="fixed left-[84px] bottom-4 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 py-1.5 animate-[fadeIn_0.15s_ease]">
                            <NavLink
                                to="/settings"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/[0.1] transition-colors"
                                style={{ color: '#e2e8f0' }}
                            >
                                <Settings size={15} /> Settings
                            </NavLink>
                            <NavLink
                                to={`/profile`}
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/[0.1] transition-colors"
                                style={{ color: '#e2e8f0' }}
                            >
                                <UserCircle size={15} /> Profile
                            </NavLink>
                            <div className="my-1 border-t border-slate-700" />
                            <button
                                onClick={() => { setShowMenu(false); logout(); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-500/20 transition-colors"
                                style={{ color: '#f87171' }}
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
