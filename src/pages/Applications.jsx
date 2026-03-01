import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Plus,
    Search,
    Briefcase,
    MapPin,
    Calendar,
    ExternalLink,
    Filter,
    LayoutGrid,
    Columns3,
    Trash2,
    DollarSign,
} from 'lucide-react';
import { getApplications, createApplication, updateApplication, deleteApplication, getResumes } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import KanbanBoard from '../components/KanbanBoard';
import { showToast } from '../components/Toast';

const STATUS_OPTIONS = [
    'All',
    'Open',
    'Applied',
    'Shortlisted',
    'Interview',
    'Offer',
    'Rejected',
    'Closed',
];

const SOURCE_OPTIONS = [
    'LinkedIn', 'Indeed', 'Glassdoor', 'Company Website',
    'Referral', 'Job Board', 'Recruiter', 'Networking',
    'Career Fair', 'Other',
];

const INITIAL_FORM = {
    company_name: '',
    role_title: '',
    applied_source: '',
    url: '',
    description: '',
    status: 'Open',
    applied_date: '',
    resume_version_id: '',
    salary_min: '',
    salary_max: '',
};

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState('kanban');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    /* Derive initial showForm from URL so the modal is open on the very first
       render — no flash of the page without the modal. */
    const autoOpen = searchParams.get('new') === 'true';
    const [showForm, setShowForm] = useState(autoOpen);

    useEffect(() => {
        loadData();
    }, []);

    /* Strip the ?new param from the URL (cosmetic, doesn't trigger re-render of modal) */
    useEffect(() => {
        if (autoOpen) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('new');
            setSearchParams(nextParams, { replace: true });
        }
        // Run only on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadData() {
        try {
            const [apps, res] = await Promise.all([
                getApplications().catch(() => []),
                getResumes().catch(() => []),
            ]);
            setApplications(apps);
            setResumes(res);
        } finally {
            setLoading(false);
        }
    }

    const filtered = applications.filter((app) => {
        const matchSearch =
            app.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            app.role_title?.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === 'All' ||
            app.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    /* ── Kanban drag-to-change-status handler ───────────── */
    async function handleStatusChange(appId, newStatus) {
        // Optimistically update local state
        setApplications((prev) =>
            prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
        );
        try {
            await updateApplication(appId, { status: newStatus });
            showToast(`Moved to ${newStatus}`);
        } catch (err) {
            // Revert on failure
            loadData();
            showToast(err.message || 'Failed to update status', 'error');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.company_name || !formData.role_title) return;
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.applied_source) delete payload.applied_source;
            if (!payload.url) delete payload.url;
            if (!payload.description) delete payload.description;
            if (!payload.applied_date) delete payload.applied_date;
            if (!payload.resume_version_id) delete payload.resume_version_id;
            if (payload.salary_min) payload.salary_min = Number(payload.salary_min);
            else delete payload.salary_min;
            if (payload.salary_max) payload.salary_max = Number(payload.salary_max);
            else delete payload.salary_max;
            await createApplication(payload);
            showToast('Application created successfully!');
            setShowForm(false);
            setFormData(INITIAL_FORM);
            loadData();
        } catch (err) {
            showToast(err.message || 'Failed to create application', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    if (loading) {
        return (
            <div className="animate-[fadeInUp_0.4s_ease]">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                    <div className="w-9 h-9 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-[fadeInUp_0.4s_ease]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Applications</h1>
                    <p className="text-sm text-slate-400">
                        {applications.length} application{applications.length !== 1 ? 's' : ''} tracked
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div className="view-toggle">
                        <button
                            className={`view-toggle-btn ${viewMode === 'kanban' ? 'view-toggle-btn--active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                            title="Kanban board"
                        >
                            <Columns3 size={14} />
                            Board
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid view"
                        >
                            <LayoutGrid size={14} />
                            Grid
                        </button>
                    </div>
                    <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>
                        <Plus size={16} />
                        New Application
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            {applications.length > 0 && (
                <div className="space-y-3 mb-8">
                    <div className="relative max-w-sm">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by company or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="!pl-10 !bg-white !border-slate-200"
                        />
                    </div>
                    {viewMode === 'grid' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter size={14} className="text-slate-400 shrink-0" />
                            {STATUS_OPTIONS.map((status) => (
                                <button
                                    key={status}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${statusFilter === status
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' ? (
                applications.length > 0 ? (
                    <KanbanBoard
                        applications={applications}
                        onStatusChange={handleStatusChange}
                        search={search}
                    />
                ) : (
                    <EmptyState
                        icon={Briefcase}
                        title="No applications yet"
                        description='Click "New Application" above to start tracking your job search.'
                    />
                )
            ) : (
                /* Grid View */
                <>
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                            {filtered.map((app, index) => (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group animate-[fadeInUp_0.4s_ease_backwards]"
                                    onClick={() => navigate(`/applications/${app.id}`)}
                                    style={{ animationDelay: `${index * 0.04}s` }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                                            {app.company_name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <div className="mb-3">
                                        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-0.5">{app.company_name}</h3>
                                        <p className="text-sm text-slate-500">{app.role_title}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {app.applied_date && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Calendar size={12} />
                                                {formatDate(app.applied_date)}
                                            </span>
                                        )}
                                        {app.applied_source && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <MapPin size={12} />
                                                {app.applied_source}
                                            </span>
                                        )}
                                        {app.url && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <ExternalLink size={12} />
                                                Link
                                            </span>
                                        )}
                                        {(app.salary_min || app.salary_max) && (
                                            <span className="flex items-center gap-1 text-xs text-emerald-500">
                                                <DollarSign size={12} />
                                                {app.salary_min ? `${(app.salary_min / 1000).toFixed(0)}k` : '?'}
                                                {' – '}
                                                {app.salary_max ? `${(app.salary_max / 1000).toFixed(0)}k` : '?'}
                                            </span>
                                        )}
                                    </div>
                                    {app.stages?.length > 0 && (
                                        <div className="pt-3 mt-3 border-t border-slate-100">
                                            <span className="text-xs text-slate-400 font-medium">
                                                {app.stages.length} stage{app.stages.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : applications.length > 0 ? (
                        <EmptyState
                            icon={Search}
                            title="No matches found"
                            description="Try adjusting your search or filter to find what you're looking for."
                        />
                    ) : (
                        <EmptyState
                            icon={Briefcase}
                            title="No applications yet"
                            description='Click "New Application" above to start tracking your job search.'
                        />
                    )}
                </>
            )}

            {/* New Application Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="New Application"
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Company Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Google"
                                value={formData.company_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, company_name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Role Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Software Engineer"
                                value={formData.role_title}
                                onChange={(e) =>
                                    setFormData({ ...formData, role_title: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Source</label>
                            <select
                                value={formData.applied_source}
                                onChange={(e) =>
                                    setFormData({ ...formData, applied_source: e.target.value })
                                }
                            >
                                <option value="">Select source</option>
                                {SOURCE_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                            >
                                {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Application Date</label>
                            <input
                                type="date"
                                value={formData.applied_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, applied_date: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Resume Version</label>
                            <select
                                value={formData.resume_version_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, resume_version_id: e.target.value })
                                }
                            >
                                <option value="">None</option>
                                {resumes.map((r) => (
                                    <option key={r.id} value={r.id}>{r.version_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Job URL</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            value={formData.url}
                            onChange={(e) =>
                                setFormData({ ...formData, url: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Salary Min</label>
                            <input
                                type="number"
                                placeholder="e.g. 80000"
                                value={formData.salary_min}
                                onChange={(e) =>
                                    setFormData({ ...formData, salary_min: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Salary Max</label>
                            <input
                                type="number"
                                placeholder="e.g. 120000"
                                value={formData.salary_max}
                                onChange={(e) =>
                                    setFormData({ ...formData, salary_max: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Job description or notes..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Application'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
