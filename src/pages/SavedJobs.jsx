import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bookmark,
    Plus,
    Star,
    MapPin,
    ExternalLink,
    Trash2,
    ArrowRight,
    Search,
    Calendar,
} from 'lucide-react';
import {
    getSavedJobs,
    createSavedJob,
    updateSavedJob,
    deleteSavedJob,
    convertSavedJob,
} from '../services/api';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';

const priorityColors = {
    High: 'bg-red-50 text-red-700 ring-red-600/20',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Low: 'bg-green-50 text-green-700 ring-green-600/20',
};

const excitementStars = (level) =>
    Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < (level || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ));

export default function SavedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState('Active');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ company_name: '', role_title: '', url: '', location: '', priority: 'Medium', notes: '', excitement_level: 3 });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { loadJobs(); }, [filter]);

    async function loadJobs() {
        setLoading(true);
        try {
            const data = await getSavedJobs({ status: filter !== 'All' ? filter : undefined });
            setJobs(data);
        } catch { setJobs([]); }
        finally { setLoading(false); }
    }

    async function handleCreate(e) {
        e.preventDefault();
        if (!form.company_name) return;
        setSaving(true);
        try {
            await createSavedJob(form);
            showToast('Job saved!', 'success');
            setShowCreate(false);
            setForm({ company_name: '', role_title: '', url: '', location: '', priority: 'Medium', notes: '', excitement_level: 3 });
            loadJobs();
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    }

    async function handleConvert(id) {
        try {
            const app = await convertSavedJob(id);
            showToast('Converted to application!', 'success');
            navigate(`/applications/${app.id}`);
        } catch (err) { showToast(err.message, 'error'); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this saved job?')) return;
        try {
            await deleteSavedJob(id);
            showToast('Deleted', 'success');
            loadJobs();
        } catch (err) { showToast(err.message, 'error'); }
    }

    async function handleArchive(id) {
        try {
            await updateSavedJob(id, { status: 'Archived' });
            showToast('Archived', 'success');
            loadJobs();
        } catch (err) { showToast(err.message, 'error'); }
    }

    const filtered = jobs.filter((j) =>
        !search || j.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        j.role_title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-enter">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
                    <p className="text-sm text-slate-400 mt-1">Bookmark interesting postings for later</p>
                </div>
                <button className="btn-primary text-sm" onClick={() => setShowCreate(true)}>
                    <Plus size={16} /> Save a Job
                </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text" placeholder="Search saved jobs..." className="!pl-10 !bg-white !border-slate-200 !rounded-xl"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                    {['Active', 'Archived', 'Converted', 'All'].map((s) => (
                        <button
                            key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState icon={Bookmark} title="No saved jobs" description="Save job postings you're interested in and convert them to applications when ready." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((job) => (
                        <div key={job.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {job.company_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{job.company_name}</div>
                                        <div className="text-xs text-slate-400">{job.role_title || 'No title'}</div>
                                    </div>
                                </div>
                                {job.priority && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${priorityColors[job.priority] || ''}`}>
                                        {job.priority}
                                    </span>
                                )}
                            </div>
                            {job.location && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2"><MapPin size={12} /> {job.location}</div>
                            )}
                            {job.excitement_level && (
                                <div className="flex items-center gap-1 mb-2">{excitementStars(job.excitement_level)}</div>
                            )}
                            {job.deadline && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                                    <Calendar size={12} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                                </div>
                            )}
                            {job.notes && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{job.notes}</p>}
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                {job.status === 'Active' && (
                                    <button onClick={() => handleConvert(job.id)}
                                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                        <ArrowRight size={13} /> Apply Now
                                    </button>
                                )}
                                {job.url && (
                                    <a href={job.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
                                        <ExternalLink size={12} /> Link
                                    </a>
                                )}
                                <div className="flex-1" />
                                {job.status === 'Active' && (
                                    <button onClick={() => handleArchive(job.id)} className="text-xs text-slate-400 hover:text-slate-600">Archive</button>
                                )}
                                <button onClick={() => handleDelete(job.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            {job.status === 'Converted' && (
                                <div className="mt-3 text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1 text-center">
                                    Converted to Application
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Save a Job" size="md">
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Company Name *</label>
                        <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Stripe" required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Role Title</label>
                            <input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} placeholder="e.g. Software Engineer" />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote, NYC, etc." />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Job Posting URL</label>
                        <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Excitement (1-5)</label>
                            <div className="flex items-center gap-1 pt-2">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button key={n} type="button" onClick={() => setForm({ ...form, excitement_level: n })}>
                                        <Star size={20} className={n <= form.excitement_level ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Why are you interested?" rows={3} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Job'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
