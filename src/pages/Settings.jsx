import { useState, useEffect } from 'react';
import {
    User,
    Save,
    Eye,
    EyeOff,
    Shield,
} from 'lucide-react';
import { getMe, updateMe } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState({
        display_name: '',
        bio: '',
        profile_visibility: 'public',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getMe();
                setForm({
                    display_name: data.display_name || '',
                    bio: data.bio || '',
                    profile_visibility: data.profile_visibility || 'public',
                });
            } catch { /* empty */ }
            finally { setLoading(false); }
        }
        loadProfile();
    }, []);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateMe(form);
            await refreshUser();
            showToast('Profile updated!', 'success');
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    }

    if (loading) {
        return (
            <div className="page-enter flex justify-center py-20">
                <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-enter max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-sm text-slate-400 mt-1">Manage your profile & preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {(user?.display_name || user?.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-900">{user?.display_name || user?.username}</div>
                        <div className="text-sm text-slate-400">{user?.email}</div>
                        {user?.username && <div className="text-xs text-slate-400">@{user.username}</div>}
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" /> Display Name
                        </label>
                        <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                            placeholder="How others see you" />
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Tell others about yourself, your job search, interests..." rows={3} />
                    </div>

                    <div className="form-group">
                        <label className="flex items-center gap-1.5">
                            <Shield size={14} className="text-slate-400" /> Profile Visibility
                        </label>
                        <div className="flex gap-3">
                            {[
                                { value: 'public', label: 'Public', desc: 'Anyone can see your profile', icon: Eye },
                                { value: 'private', label: 'Private', desc: 'Only you can see your profile', icon: EyeOff },
                            ].map(({ value, label, desc, icon: Icon }) => (
                                <button key={value} type="button"
                                    onClick={() => setForm({ ...form, profile_visibility: value })}
                                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${form.profile_visibility === value
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <div className="text-left">
                                        <div className="text-sm font-semibold">{label}</div>
                                        <div className="text-xs opacity-70">{desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Account Information</h2>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Email</span>
                        <span className="text-slate-700 font-medium">{user?.email || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Username</span>
                        <span className="text-slate-700 font-medium">@{user?.username || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Member since</span>
                        <span className="text-slate-700 font-medium">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
