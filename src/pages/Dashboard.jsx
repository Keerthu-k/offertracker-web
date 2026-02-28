import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    TrendingUp,
    Award,
    Plus,
    ArrowRight,
    Target,
    Clock,
    Rocket,
} from 'lucide-react';
import { getApplications } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SankeyChart from '../components/SankeyChart';

export default function Dashboard() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const apps = await getApplications();
            setApplications(apps);
        } catch {
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }

    const stats = {
        total: applications.length,
        interviewing: applications.filter((a) =>
            ['interview', 'interviewing'].includes(a.status?.toLowerCase())
        ).length,
        offered: applications.filter((a) =>
            ['offered', 'accepted'].includes(a.status?.toLowerCase())
        ).length,
        rejected: applications.filter((a) =>
            a.status?.toLowerCase() === 'rejected'
        ).length,
    };

    const rejectionRate = stats.total > 0
        ? Math.round((stats.rejected / stats.total) * 100)
        : 0;

    const recentApps = [...applications]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    const statusCounts = {};
    applications.forEach((app) => {
        const status = app.status?.toLowerCase() || 'applied';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    if (loading) {
        return (
            <div className="animate-[fadeInUp_0.4s_ease]">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                    <div className="w-9 h-9 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    /* ── Empty / Onboarding State ── */
    if (applications.length === 0) {
        return (
            <div className="animate-[fadeInUp_0.4s_ease]">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                        <Rocket size={28} className="text-indigo-500" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome to OfferTracker</h1>
                    <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
                        Track every application, monitor your pipeline, and get insights into your job search — all in one place.
                    </p>
                    <button
                        className="btn-primary text-sm"
                        onClick={() => navigate('/applications?new=true')}
                    >
                        <Plus size={16} />
                        Add Your First Application
                    </button>
                </div>
            </div>
        );
    }

    /* ── Stat cards config ── */
    const statCards = [
        { label: 'Total', value: stats.total, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
        { label: 'Interviewing', value: stats.interviewing, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Offers', value: stats.offered, icon: Award, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Rejected', value: `${rejectionRate}%`, icon: Target, color: 'bg-red-50 text-red-500' },
    ];

    return (
        <div className="animate-[fadeInUp_0.4s_ease]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                <button
                    className="btn-primary text-sm"
                    onClick={() => navigate('/applications?new=true')}
                >
                    <Plus size={16} />
                    New Application
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 animate-[fadeInUp_0.4s_ease_backwards]"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{stat.value}</div>
                            <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Application Flow (Sankey) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-4 animate-[fadeInUp_0.5s_ease_backwards] [animation-delay:0.2s]">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-slate-400" />
                    Application Flow
                </h2>
                <p className="text-xs text-slate-400 mb-4">How your applications progress through stages</p>
                <SankeyChart applications={applications} />
            </div>

            {/* Two-column: Pipeline breakdown + Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pipeline Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-[fadeInUp_0.5s_ease_backwards] [animation-delay:0.25s]">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-5">
                        <Target size={16} className="text-slate-400" />
                        Status Breakdown
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(statusCounts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([status, count]) => (
                                <div key={status} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={status} />
                                        <span className="text-sm font-semibold text-slate-500">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                            style={{ width: `${(count / stats.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-[fadeInUp_0.5s_ease_backwards] [animation-delay:0.2s]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            Recent Applications
                        </h2>
                        <button
                            className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800 transition-colors"
                            onClick={() => navigate('/applications')}
                        >
                            View all <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="space-y-0.5">
                        {recentApps.map((app) => (
                            <div
                                key={app.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => navigate(`/applications/${app.id}`)}
                            >
                                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {app.company_name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{app.company_name}</div>
                                    <div className="text-xs text-slate-400 truncate">{app.role_title}</div>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
