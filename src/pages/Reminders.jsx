import { useState, useEffect } from 'react';
import {
    Bell,
    Plus,
    Check,
    Clock,
    AlertTriangle,
    Calendar,
    Trash2,
} from 'lucide-react';
import { getReminders, getUpcomingReminders, createReminder, deleteReminder, completeReminder } from '../services/api';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';

const typeEmoji = {
    follow_up: '📬',
    deadline: '⏰',
    interview: '🎤',
    general: '📌',
};

function timeFromNow(date) {
    const diff = new Date(date) - new Date();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (diff < 0) return 'Overdue';
    if (days > 0) return `in ${days}d`;
    if (hours > 0) return `in ${hours}h`;
    if (minutes > 0) return `in ${minutes}m`;
    return 'Now';
}

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('pending');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', reminder_type: 'general', remind_at: '', application_id: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, [tab]);

    async function load() {
        setLoading(true);
        try {
            let data;
            if (tab === 'pending') {
                data = await getUpcomingReminders(100);
            } else {
                data = await getReminders({ is_completed: true });
            }
            // Sort pending by remind_at ascending
            if (tab === 'pending') data.sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at));
            setReminders(data);
        } catch { setReminders([]); }
        finally { setLoading(false); }
    }

    async function handleComplete(id) {
        try {
            await completeReminder(id);
            showToast('Marked complete', 'success');
            load();
        } catch (err) { showToast(err.message, 'error'); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this reminder?')) return;
        try {
            await deleteReminder(id);
            showToast('Deleted', 'success');
            load();
        } catch (err) { showToast(err.message, 'error'); }
    }

    async function handleCreate(e) {
        e.preventDefault();
        if (!form.title || !form.remind_at) return;
        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.application_id) delete payload.application_id;
            await createReminder(payload);
            showToast('Reminder created', 'success');
            setShowModal(false);
            setForm({ title: '', description: '', reminder_type: 'general', remind_at: '', application_id: '' });
            setTab('pending');
            load();
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    }

    const overdue = (r) => !r.is_completed && new Date(r.remind_at) < new Date();

    return (
        <div className="page-enter">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reminders</h1>
                    <p className="text-sm text-slate-400 mt-1">Stay on top of follow-ups & deadlines</p>
                </div>
                <button className="btn-primary text-sm" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> New Reminder
                </button>
            </div>

            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                {['pending', 'completed'].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${t === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >{t === 'pending' ? 'Pending' : 'Completed'}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : reminders.length === 0 ? (
                <EmptyState icon={Bell} title={tab === 'pending' ? 'All clear!' : 'No completed reminders'}
                    description={tab === 'pending' ? 'No pending reminders. Add one to stay organized.' : 'Completed reminders will appear here.'} />
            ) : (
                <div className="space-y-2">
                    {reminders.map((r) => {
                        const isOverdue = overdue(r);
                        return (
                            <div key={r.id}
                                className={`flex items-center gap-4 bg-white rounded-xl border px-5 py-4 transition-all duration-200 hover:shadow-sm ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200/80'}`}
                            >
                                {tab === 'pending' && (
                                    <button onClick={() => handleComplete(r.id)}
                                        className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 flex items-center justify-center text-transparent"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                                {tab === 'completed' && (
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Check size={14} />
                                    </div>
                                )}

                                <span className="text-lg">{typeEmoji[r.reminder_type] || '📌'}</span>

                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-semibold ${r.is_completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                        {r.title}
                                    </div>
                                    {r.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{r.description}</p>}
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {isOverdue ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                                            <AlertTriangle size={12} /> Overdue
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Clock size={12} /> {timeFromNow(r.remind_at)}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-300">
                                        {new Date(r.remind_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <button onClick={() => handleDelete(r.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Reminder" size="md">
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Title *</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Follow up with recruiter..." required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." rows={2} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Type</label>
                            <select value={form.reminder_type} onChange={(e) => setForm({ ...form, reminder_type: e.target.value })}>
                                <option value="general">📌 General</option>
                                <option value="follow_up">📬 Follow-up</option>
                                <option value="deadline">⏰ Deadline</option>
                                <option value="interview">🎤 Interview</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Remind At *</label>
                            <input type="datetime-local" value={form.remind_at} onChange={(e) => setForm({ ...form, remind_at: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Reminder'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
