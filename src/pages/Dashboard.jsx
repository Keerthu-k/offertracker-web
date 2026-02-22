import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    TrendingUp,
    Award,
    XCircle,
    Plus,
    ArrowRight,
    Target,
    Clock,
} from 'lucide-react';
import { getApplications } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import './Dashboard.css';

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
            // API may not be running, show empty state
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
            <div className="page-enter dashboard">
                <div className="dashboard-loading">
                    <div className="loading-spinner" />
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Your career intelligence at a glance</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/applications')}>
                    <Plus size={16} />
                    New Application
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-card" style={{ '--stat-accent': 'var(--status-applied)' }}>
                    <div className="stat-icon">
                        <Briefcase size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Applications</span>
                    </div>
                </div>
                <div className="stat-card glass-card" style={{ '--stat-accent': 'var(--status-interview)' }}>
                    <div className="stat-icon">
                        <Clock size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.interviewing}</span>
                        <span className="stat-label">In Interview</span>
                    </div>
                </div>
                <div className="stat-card glass-card" style={{ '--stat-accent': 'var(--status-offered)' }}>
                    <div className="stat-icon">
                        <Award size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.offered}</span>
                        <span className="stat-label">Offers</span>
                    </div>
                </div>
                <div className="stat-card glass-card" style={{ '--stat-accent': 'var(--status-rejected)' }}>
                    <div className="stat-icon">
                        <Target size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{rejectionRate}%</span>
                        <span className="stat-label">Rejection Rate</span>
                    </div>
                </div>
            </div>

            {applications.length > 0 && (
                <div className="dashboard-grid">
                    <div className="dashboard-section glass-card">
                        <div className="section-header">
                            <h2 className="section-title">
                                <TrendingUp size={18} />
                                Application Pipeline
                            </h2>
                        </div>
                        <div className="pipeline-bars">
                            {Object.entries(statusCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([status, count]) => (
                                    <div key={status} className="pipeline-row">
                                        <div className="pipeline-label">
                                            <StatusBadge status={status} />
                                            <span className="pipeline-count">{count}</span>
                                        </div>
                                        <div className="pipeline-bar-track">
                                            <div
                                                className="pipeline-bar-fill"
                                                style={{
                                                    width: `${(count / stats.total) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="dashboard-section glass-card">
                        <div className="section-header">
                            <h2 className="section-title">
                                <Clock size={18} />
                                Recent Applications
                            </h2>
                            <button
                                className="section-link"
                                onClick={() => navigate('/applications')}
                            >
                                View all <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="recent-list">
                            {recentApps.map((app) => (
                                <div
                                    key={app.id}
                                    className="recent-item"
                                    onClick={() => navigate(`/applications/${app.id}`)}
                                >
                                    <div className="recent-company-avatar">
                                        {app.company_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="recent-info">
                                        <span className="recent-company">{app.company_name}</span>
                                        <span className="recent-role">{app.role_title}</span>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {applications.length === 0 && (
                <EmptyState
                    icon={Briefcase}
                    title="No applications yet"
                    description="Start tracking your job applications to unlock powerful analytics and insights."
                    action={
                        <button className="btn-primary" onClick={() => navigate('/applications')}>
                            <Plus size={16} />
                            Add Your First Application
                        </button>
                    }
                />
            )}
        </div>
    );
}
