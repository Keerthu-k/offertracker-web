import { useState, useEffect } from 'react';
import {
    Trophy,
    Target,
    TrendingUp,
    Flame,
    Lock,
    CheckCircle,
    Award,
    BarChart3,
    Users,
} from 'lucide-react';
import { getMilestones, getMyMilestones, getMyStats, getCommunity } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';

export default function Progress() {
    const { user } = useAuth();
    const [tab, setTab] = useState('milestones');
    const [milestones, setMilestones] = useState([]);
    const [myMilestones, setMyMilestones] = useState([]);
    const [stats, setStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, [tab]);

    async function load() {
        setLoading(true);
        try {
            if (tab === 'milestones') {
                const [all, mine] = await Promise.all([
                    getMilestones().catch(() => []),
                    getMyMilestones().catch(() => []),
                ]);
                setMilestones(all);
                setMyMilestones(mine);
            } else if (tab === 'stats') {
                const data = await getMyStats().catch(() => null);
                setStats(data);
            } else if (tab === 'leaderboard') {
                const data = await getCommunity(20).catch(() => []);
                setLeaderboard(data);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }

    const earnedIds = new Set(myMilestones.map((m) => m.milestone_id || m.id));

    const milestoneIcons = {
        first_app: '🚀',
        five_apps: '✋',
        ten_apps: '🔟',
        first_interview: '🎤',
        first_offer: '🎉',
        streak_7: '🔥',
        streak_30: '💪',
        reflector: '🪞',
    };

    return (
        <div className="page-enter">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Progress</h1>
                <p className="text-sm text-slate-400 mt-1">Track your achievements & growth</p>
            </div>

            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                {[
                    ['milestones', 'Milestones'],
                    ['stats', 'My Stats'],
                    ['leaderboard', 'Leaderboard'],
                ].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${key === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >{label}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Milestones */}
                    {tab === 'milestones' && (
                        milestones.length === 0 ? (
                            <EmptyState icon={Trophy} title="No milestones available" description="Milestones will appear as you progress in your job search." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {milestones.map((m) => {
                                    const earned = earnedIds.has(m.id);
                                    return (
                                        <div key={m.id}
                                            className={`rounded-2xl border p-5 transition-all duration-200 ${earned
                                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm'
                                                : 'bg-white border-slate-200/80 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${earned ? 'bg-amber-100' : 'bg-slate-100'}`}>
                                                    {earned ? (milestoneIcons[m.key] || '🏆') : <Lock size={20} className="text-slate-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm font-semibold ${earned ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {m.name || m.key}
                                                    </div>
                                                    {m.description && (
                                                        <div className="text-xs text-slate-400 truncate">{m.description}</div>
                                                    )}
                                                </div>
                                                {earned && <CheckCircle size={20} className="text-amber-500 shrink-0" />}
                                            </div>
                                            {m.xp_value && (
                                                <div className="text-xs font-medium text-amber-600">+{m.xp_value} XP</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Stats */}
                    {tab === 'stats' && (
                        stats ? (
                            <div className="max-w-2xl space-y-6">
                                {/* XP & Level */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                            <Award size={28} />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-extrabold">{stats.total_xp || 0} XP</div>
                                            <div className="text-sm opacity-80">Level {stats.level || 1}</div>
                                        </div>
                                    </div>
                                    {stats.xp_to_next_level && (
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 opacity-80">
                                                <span>Progress to next level</span>
                                                <span>{stats.xp_to_next_level} XP needed</span>
                                            </div>
                                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, ((stats.total_xp || 0) / ((stats.total_xp || 0) + (stats.xp_to_next_level || 1))) * 100)}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Applications', value: stats.total_applications || 0, icon: Target, color: 'text-blue-500 bg-blue-50' },
                                        { label: 'Interviews', value: stats.total_interviews || 0, icon: BarChart3, color: 'text-violet-500 bg-violet-50' },
                                        { label: 'Offers', value: stats.total_offers || 0, icon: Trophy, color: 'text-emerald-500 bg-emerald-50' },
                                        { label: 'Current Streak', value: stats.current_streak || 0, icon: Flame, color: 'text-orange-500 bg-orange-50' },
                                    ].map(({ label, value, icon: Icon, color }) => (
                                        <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                                            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="text-xl font-bold text-slate-900">{value}</div>
                                            <div className="text-xs text-slate-400">{label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Milestones earned count */}
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                                    <div className="text-sm font-semibold text-slate-800 mb-2">Milestones Earned</div>
                                    <div className="text-3xl font-extrabold text-indigo-600">{stats.milestones_earned || myMilestones.length}</div>
                                </div>
                            </div>
                        ) : (
                            <EmptyState icon={BarChart3} title="No stats yet" description="Start tracking applications to build your stats." />
                        )
                    )}

                    {/* Leaderboard */}
                    {tab === 'leaderboard' && (
                        leaderboard.length === 0 ? (
                            <EmptyState icon={Users} title="No community data" description="Leaderboard will populate as more users join." />
                        ) : (
                            <div className="max-w-2xl space-y-2">
                                {leaderboard.map((entry, i) => {
                                    const isMe = entry.user_id === user?.id || entry.username === user?.username;
                                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                                    return (
                                        <div key={entry.user_id || i}
                                            className={`flex items-center gap-4 rounded-xl border px-5 py-3 transition-all ${isMe ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200/80 hover:shadow-sm'}`}
                                        >
                                            <div className="w-8 text-center shrink-0">
                                                {medal ? (
                                                    <span className="text-lg">{medal}</span>
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-400">#{i + 1}</span>
                                                )}
                                            </div>
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {(entry.display_name || entry.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-slate-900">{entry.display_name || entry.username}</div>
                                                {entry.level && <div className="text-xs text-slate-400">Level {entry.level}</div>}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-bold text-indigo-600">{entry.total_xp || 0} XP</div>
                                                {entry.current_streak > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-orange-500 justify-end">
                                                        <Flame size={10} /> {entry.current_streak}d streak
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
