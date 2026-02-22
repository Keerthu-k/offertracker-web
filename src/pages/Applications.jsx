import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Briefcase,
    MapPin,
    Calendar,
    ExternalLink,
    Filter,
} from 'lucide-react';
import { getApplications, createApplication, getResumes } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import './Applications.css';

const STATUS_OPTIONS = [
    'All',
    'Applied',
    'Interview',
    'Offered',
    'Rejected',
    'Ghosted',
    'Accepted',
    'Declined',
    'Withdrawn',
];

const INITIAL_FORM = {
    company_name: '',
    role_title: '',
    applied_source: '',
    url: '',
    description: '',
    status: 'Applied',
    applied_date: '',
    resume_version_id: '',
};

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
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
            <div className="page-enter applications-page">
                <div className="dashboard-loading">
                    <div className="loading-spinner" />
                    <p>Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter applications-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Applications</h1>
                    <p className="page-subtitle">
                        {applications.length} application{applications.length !== 1 ? 's' : ''} tracked
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={16} />
                    New Application
                </button>
            </div>

            {applications.length > 0 && (
                <div className="applications-toolbar">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by company or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-chips">
                        <Filter size={14} className="filter-icon" />
                        {STATUS_OPTIONS.map((status) => (
                            <button
                                key={status}
                                className={`chip ${statusFilter === status ? 'chip-active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {filtered.length > 0 ? (
                <div className="applications-grid">
                    {filtered.map((app, index) => (
                        <div
                            key={app.id}
                            className="app-card glass-card"
                            onClick={() => navigate(`/applications/${app.id}`)}
                            style={{ animationDelay: `${index * 0.04}s` }}
                        >
                            <div className="app-card-header">
                                <div className="app-avatar">
                                    {app.company_name?.charAt(0)?.toUpperCase()}
                                </div>
                                <StatusBadge status={app.status} />
                            </div>
                            <div className="app-card-body">
                                <h3 className="app-company">{app.company_name}</h3>
                                <p className="app-role">{app.role_title}</p>
                                <div className="app-meta">
                                    {app.applied_date && (
                                        <span className="app-meta-item">
                                            <Calendar size={12} />
                                            {formatDate(app.applied_date)}
                                        </span>
                                    )}
                                    {app.applied_source && (
                                        <span className="app-meta-item">
                                            <MapPin size={12} />
                                            {app.applied_source}
                                        </span>
                                    )}
                                    {app.url && (
                                        <span className="app-meta-item">
                                            <ExternalLink size={12} />
                                            Link
                                        </span>
                                    )}
                                </div>
                            </div>
                            {app.stages?.length > 0 && (
                                <div className="app-card-footer">
                                    <span className="app-stages-count">
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
                    description="Start tracking your job search by adding your first application."
                    action={
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            <Plus size={16} />
                            Add Application
                        </button>
                    }
                />
            )}

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
                            <input
                                type="text"
                                placeholder="e.g. LinkedIn, Referral"
                                value={formData.applied_source}
                                onChange={(e) =>
                                    setFormData({ ...formData, applied_source: e.target.value })
                                }
                            />
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
