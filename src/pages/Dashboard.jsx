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
    Flame,
    Bell,
    DollarSign,
    BarChart3,
    Zap,
} from 'lucide-react';
import { getApplications, getDashboardAnalytics, getUpcomingReminders, getMyStats } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import SankeyChart from '../components/SankeyChart';

const statusColors = {
    Open: 'bg-violet-100 text-violet-700',
    Applied: 'bg-blue-100 text-blue-700',
    Shortlisted: 'bg-sky-100 text-sky-700',
    Interview: 'bg-amber-100 text-amber-700',
    Offer: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-600',
    Closed: 'bg-slate-100 text-slate-600',
};

export default function Dashboard() {
    const [applications, setApplications] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [reminders, setReminders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [apps, analyticsData, remindersData, statsData] = await Promise.allSettled([
                getApplications(),
                getDashboardAnalytics(),
                getUpcomingReminders(5),
                getMyStats(),
            ]);
            setApplications(apps.status === 'fulfilled' ? apps.value : []);
            setAnalytics(analyticsData.status === 'fulfilled' ? analyticsData.value : null);
            setReminders(remindersData.status === 'fulfilled' ? remindersData.value : []);
            setStats(statsData.status === 'fulfilled' ? statsData.value : null);
        } catch {
            /* handled by allSettled */
        } finally {
            setLoading(false);
        }
    }

    const recentApps = [...applications]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (loading) {
        return (
            <div className="page-enter">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                    <div className="w-9 h-9 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="page-enter">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                        <Rocket size={28} className="text-indigo-500" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Welcome to OfferTracker{user?.display_name ? `, ${user.display_name}` : ''}
                    </h1>
                    <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
                        Track every application, monitor your pipeline, and get insights into your job search — all in one place.
                    </p>
                    <button className="btn-primary text-sm" onClick={() => navigate('/applications?new=true')}>
                        <Plus size={16} /> Add Your First Application
                    </button>
                </div>
            </div>
        );
    }

    const totalApps = stats?.total_applications ?? applications.length;
    const responseRate = analytics?.response_rate != null ? Math.round(analytics.response_rate * 100) : null;
    const offerRate = analytics?.offer_rate != null ? Math.round(analytics.offer_rate * 100) : null;

    const statCards = [
        { label: 'Applications', value: totalApps, icon: Briefcase, gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Interviews', value: stats?.total_stages ?? 0, icon: Clock, gradient: 'from-amber-400 to-orange-500' },
        { label: 'Offers', value: stats?.total_offers ?? 0, icon: Award, gradient: 'from-emerald-400 to-teal-500' },
        { label: 'Streak', value: `${stats?.streak_days ?? user?.streak_days ?? 0}d`, icon: Flame, gradient: 'from-orange-400 to-red-500' },
    ];

    return (
        <div className="page-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {greeting()}{user?.display_name ? `, ${user.display_name}` : ''}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Here's how your job search is going</p>
                </div>
                <button className="btn-primary text-sm" onClick={() => navigate('/applications?new=true')}>
                    <Plus size={16} /> New Application
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-[fadeInUp_0.4s_ease_backwards]"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                            <stat.icon size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{stat.value}</div>
                            <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rate Indicators */}
            {(responseRate != null || offerRate != null) && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {responseRate != null && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
                            <Zap size={16} className="text-blue-500" />
                            <div>
                                <div className="text-lg font-bold text-slate-900">{responseRate}%</div>
                                <div className="text-xs text-slate-400">Response Rate</div>
                            </div>
                        </div>
                    )}
                    {analytics?.interview_rate != null && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
                            <Target size={16} className="text-amber-500" />
                            <div>
                                <div className="text-lg font-bold text-slate-900">{Math.round(analytics.interview_rate * 100)}%</div>
                                <div className="text-xs text-slate-400">Interview Rate</div>
                            </div>
                        </div>
                    )}
                    {offerRate != null && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
                            <Award size={16} className="text-emerald-500" />
                            <div>
                                <div className="text-lg font-bold text-slate-900">{offerRate}%</div>
                                <div className="text-xs text-slate-400">Offer Rate</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sankey Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-slate-400" />
                    Application Flow
                </h2>
                <p className="text-xs text-slate-400 mb-4">How your applications progress through each stage</p>
                <SankeyChart applications={applications} />
            </div>

            {/* Three Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Pipeline Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-5">
                        <BarChart3 size={16} className="text-slate-400" />
                        Pipeline
                    </h2>
                    <div className="space-y-3">
                        {(analytics?.pipeline || []).map(({ status, count }) => (
                            <div key={status} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <StatusBadge status={status} />
                                    <span className="text-sm font-semibold text-slate-500">{count}</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500/80 rounded-full transition-all duration-700"
                                        style={{ width: `${totalApps > 0 ? (count / totalApps) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {!analytics?.pipeline?.length && (
                            <p className="text-xs text-slate-400 text-center py-4">No pipeline data yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            Recent
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
                                className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => navigate(`/applications/${app.id}`)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    {app.company_name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-800 truncate">{app.company_name}</div>
                                    <div className="text-[11px] text-slate-400 truncate">{app.role_title}</div>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Reminders + Salary */}
                <div className="space-y-4">
                    {/* Reminders */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <Bell size={16} className="text-slate-400" />
                                Upcoming
                            </h2>
                            <button
                                className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800 transition-colors"
                                onClick={() => navigate('/reminders')}
                            >
                                All <ArrowRight size={12} />
                            </button>
                        </div>
                        {reminders.length > 0 ? (
                            <div className="space-y-2">
                                {reminders.map((r) => (
                                    <div key={r.id} className="flex items-start gap-2 py-1.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-slate-700 truncate">{r.title}</div>
                                            <div className="text-[11px] text-slate-400">
                                                {new Date(r.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-3">No upcoming reminders</p>
                        )}
                    </div>

                    {/* Salary Insight */}
                    {analytics?.salary_insights?.offers_with_salary > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/60 p-5">
                            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-3">
                                <DollarSign size={16} className="text-emerald-500" />
                                Salary Insights
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-emerald-600">Avg. Offered</span>
                                    <span className="font-bold text-emerald-800">
                                        ${(analytics.salary_insights.average_offered / 1000).toFixed(0)}k
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-emerald-600">Highest Offer</span>
                                    <span className="font-bold text-emerald-800">
                                        ${(analytics.salary_insights.highest_offer / 1000).toFixed(0)}k
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Source Effectiveness */}
            {analytics?.source_breakdown?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mt-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Source Effectiveness</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {analytics.source_breakdown.map((s) => (
                            <div key={s.source} className="bg-slate-50 rounded-xl p-3">
                                <div className="text-sm font-semibold text-slate-800">{s.source || 'Unknown'}</div>
                                <div className="text-[11px] text-slate-400 mt-1">
                                    {s.applied} applied · {s.interviews} interviews · {s.offers} offers
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
