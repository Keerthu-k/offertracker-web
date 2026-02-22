import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit3,
    Plus,
    Calendar,
    MapPin,
    ExternalLink,
    CheckCircle,
    XCircle,
    Ghost,
    Lightbulb,
    Target,
    AlertTriangle,
    TrendingUp,
    Clock,
    FileText,
    MessageSquare,
} from 'lucide-react';
import {
    getApplication,
    updateApplication,
    addStage,
    setOutcome,
    addReflection,
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import './ApplicationDetail.css';

const OUTCOME_STATUSES = ['Offered', 'Rejected', 'Ghosted', 'Withdrawn'];

export default function ApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStageModal, setShowStageModal] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [showReflectionModal, setShowReflectionModal] = useState(false);

    // Forms
    const [editForm, setEditForm] = useState({});
    const [stageForm, setStageForm] = useState({ stage_name: '', stage_date: '', notes: '' });
    const [outcomeForm, setOutcomeForm] = useState({ status: 'Offered', rejection_reason: '', notes: '' });
    const [reflectionForm, setReflectionForm] = useState({
        what_worked: '', what_failed: '', skill_gaps: '', improvement_plan: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadApplication();
    }, [id]);

    async function loadApplication() {
        try {
            const data = await getApplication(id);
            setApp(data);
            setEditForm({
                company_name: data.company_name || '',
                role_title: data.role_title || '',
                applied_source: data.applied_source || '',
                url: data.url || '',
                description: data.description || '',
                status: data.status || 'Applied',
                applied_date: data.applied_date?.split('T')[0] || '',
            });
        } catch {
            showToast('Failed to load application', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...editForm };
            if (!payload.applied_source) payload.applied_source = null;
            if (!payload.url) payload.url = null;
            if (!payload.description) payload.description = null;
            if (!payload.applied_date) payload.applied_date = null;
            await updateApplication(id, payload);
            showToast('Application updated!');
            setShowEditModal(false);
            loadApplication();
        } catch (err) {
            showToast(err.message || 'Update failed', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleStageSubmit(e) {
        e.preventDefault();
        if (!stageForm.stage_name) return;
        setSubmitting(true);
        try {
            const payload = { ...stageForm };
            if (!payload.stage_date) delete payload.stage_date;
            if (!payload.notes) delete payload.notes;
            await addStage(id, payload);
            showToast('Stage added!');
            setShowStageModal(false);
            setStageForm({ stage_name: '', stage_date: '', notes: '' });
            loadApplication();
        } catch (err) {
            showToast(err.message || 'Failed to add stage', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleOutcomeSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...outcomeForm };
            if (!payload.rejection_reason) delete payload.rejection_reason;
            if (!payload.notes) delete payload.notes;
            await setOutcome(id, payload);
            showToast('Outcome recorded!');
            setShowOutcomeModal(false);
            loadApplication();
        } catch (err) {
            showToast(err.message || 'Failed to set outcome', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleReflectionSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...reflectionForm };
            if (!payload.what_worked) delete payload.what_worked;
            if (!payload.what_failed) delete payload.what_failed;
            if (!payload.skill_gaps) delete payload.skill_gaps;
            if (!payload.improvement_plan) delete payload.improvement_plan;
            await addReflection(id, payload);
            showToast('Reflection saved!');
            setShowReflectionModal(false);
            loadApplication();
        } catch (err) {
            showToast(err.message || 'Failed to save reflection', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    if (loading) {
        return (
            <div className="page-enter detail-page">
                <div className="dashboard-loading">
                    <div className="loading-spinner" />
                    <p>Loading application...</p>
                </div>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="page-enter detail-page">
                <button className="back-btn" onClick={() => navigate('/applications')}>
                    <ArrowLeft size={16} /> Back to Applications
                </button>
                <div className="detail-not-found">Application not found.</div>
            </div>
        );
    }

    return (
        <div className="page-enter detail-page">
            <button className="back-btn" onClick={() => navigate('/applications')}>
                <ArrowLeft size={16} /> Back to Applications
            </button>

            {/* Header */}
            <div className="detail-header glass-card">
                <div className="detail-header-main">
                    <div className="detail-avatar">
                        {app.company_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="detail-header-info">
                        <h1 className="detail-company">{app.company_name}</h1>
                        <p className="detail-role">{app.role_title}</p>
                        <div className="detail-meta">
                            {app.applied_date && (
                                <span className="detail-meta-item">
                                    <Calendar size={13} /> {formatDate(app.applied_date)}
                                </span>
                            )}
                            {app.applied_source && (
                                <span className="detail-meta-item">
                                    <MapPin size={13} /> {app.applied_source}
                                </span>
                            )}
                            {app.url && (
                                <a href={app.url} target="_blank" rel="noreferrer" className="detail-meta-item detail-link">
                                    <ExternalLink size={13} /> Job Posting
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="detail-header-actions">
                    <StatusBadge status={app.status} />
                    <button className="btn-secondary" onClick={() => setShowEditModal(true)}>
                        <Edit3 size={14} /> Edit
                    </button>
                </div>
            </div>

            {/* Description */}
            {app.description && (
                <div className="detail-section glass-card">
                    <h2 className="detail-section-title">
                        <FileText size={16} /> Description
                    </h2>
                    <p className="detail-description">{app.description}</p>
                </div>
            )}

            <div className="detail-grid">
                {/* Timeline */}
                <div className="detail-section glass-card">
                    <div className="detail-section-header">
                        <h2 className="detail-section-title">
                            <Clock size={16} /> Interview Timeline
                        </h2>
                        <button className="btn-secondary btn-sm" onClick={() => setShowStageModal(true)}>
                            <Plus size={14} /> Add Stage
                        </button>
                    </div>
                    {app.stages?.length > 0 ? (
                        <div className="timeline">
                            {app.stages
                                .sort((a, b) => new Date(a.stage_date) - new Date(b.stage_date))
                                .map((stage, i) => (
                                    <div key={stage.id} className="timeline-item">
                                        <div className="timeline-marker">
                                            <div className="timeline-dot" />
                                            {i < app.stages.length - 1 && <div className="timeline-line" />}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="timeline-name">{stage.stage_name}</span>
                                                <span className="timeline-date">{formatDate(stage.stage_date)}</span>
                                            </div>
                                            {stage.notes && <p className="timeline-notes">{stage.notes}</p>}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="detail-empty">No interview stages recorded yet.</p>
                    )}
                </div>

                {/* Outcome & Reflection */}
                <div className="detail-right-col">
                    {/* Outcome */}
                    <div className="detail-section glass-card">
                        <div className="detail-section-header">
                            <h2 className="detail-section-title">
                                <Target size={16} /> Outcome
                            </h2>
                            {!app.outcome && (
                                <button className="btn-secondary btn-sm" onClick={() => setShowOutcomeModal(true)}>
                                    <Plus size={14} /> Set Outcome
                                </button>
                            )}
                        </div>
                        {app.outcome ? (
                            <div className="outcome-card">
                                <div className="outcome-status">
                                    {app.outcome.status?.toLowerCase() === 'offered' && <CheckCircle size={20} className="outcome-icon offered" />}
                                    {app.outcome.status?.toLowerCase() === 'rejected' && <XCircle size={20} className="outcome-icon rejected" />}
                                    {app.outcome.status?.toLowerCase() === 'ghosted' && <Ghost size={20} className="outcome-icon ghosted" />}
                                    {!['offered', 'rejected', 'ghosted'].includes(app.outcome.status?.toLowerCase()) && <AlertTriangle size={20} className="outcome-icon" />}
                                    <span className="outcome-label">{app.outcome.status}</span>
                                </div>
                                {app.outcome.rejection_reason && (
                                    <div className="outcome-detail">
                                        <span className="outcome-detail-label">Reason</span>
                                        <p>{app.outcome.rejection_reason}</p>
                                    </div>
                                )}
                                {app.outcome.notes && (
                                    <div className="outcome-detail">
                                        <span className="outcome-detail-label">Notes</span>
                                        <p>{app.outcome.notes}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="detail-empty">No outcome recorded yet.</p>
                        )}
                    </div>

                    {/* Reflection */}
                    <div className="detail-section glass-card">
                        <div className="detail-section-header">
                            <h2 className="detail-section-title">
                                <Lightbulb size={16} /> Reflection
                            </h2>
                            {!app.reflection && (
                                <button className="btn-secondary btn-sm" onClick={() => setShowReflectionModal(true)}>
                                    <Plus size={14} /> Add Reflection
                                </button>
                            )}
                        </div>
                        {app.reflection ? (
                            <div className="reflection-grid">
                                {app.reflection.what_worked && (
                                    <div className="reflection-item">
                                        <div className="reflection-label">
                                            <CheckCircle size={14} className="text-green" /> What Worked
                                        </div>
                                        <p>{app.reflection.what_worked}</p>
                                    </div>
                                )}
                                {app.reflection.what_failed && (
                                    <div className="reflection-item">
                                        <div className="reflection-label">
                                            <XCircle size={14} className="text-red" /> What Failed
                                        </div>
                                        <p>{app.reflection.what_failed}</p>
                                    </div>
                                )}
                                {app.reflection.skill_gaps && (
                                    <div className="reflection-item">
                                        <div className="reflection-label">
                                            <AlertTriangle size={14} className="text-amber" /> Skill Gaps
                                        </div>
                                        <p>{app.reflection.skill_gaps}</p>
                                    </div>
                                )}
                                {app.reflection.improvement_plan && (
                                    <div className="reflection-item">
                                        <div className="reflection-label">
                                            <TrendingUp size={14} className="text-cyan" /> Improvement Plan
                                        </div>
                                        <p>{app.reflection.improvement_plan}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="detail-empty">No reflection added yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Application" size="lg">
                <form onSubmit={handleEditSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Company Name *</label>
                            <input type="text" value={editForm.company_name || ''} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Role Title *</label>
                            <input type="text" value={editForm.role_title || ''} onChange={(e) => setEditForm({ ...editForm, role_title: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Source</label>
                            <input type="text" value={editForm.applied_source || ''} onChange={(e) => setEditForm({ ...editForm, applied_source: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                {['Applied', 'Interview', 'Offered', 'Rejected', 'Ghosted', 'Accepted', 'Declined', 'Withdrawn'].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Application Date</label>
                            <input type="date" value={editForm.applied_date || ''} onChange={(e) => setEditForm({ ...editForm, applied_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Job URL</label>
                            <input type="url" value={editForm.url || ''} onChange={(e) => setEditForm({ ...editForm, url: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows={3} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </Modal>

            {/* Stage Modal */}
            <Modal isOpen={showStageModal} onClose={() => setShowStageModal(false)} title="Add Interview Stage" size="md">
                <form onSubmit={handleStageSubmit}>
                    <div className="form-group">
                        <label>Stage Name *</label>
                        <input type="text" placeholder="e.g. Phone Screen, On-site, Technical" value={stageForm.stage_name} onChange={(e) => setStageForm({ ...stageForm, stage_name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" value={stageForm.stage_date} onChange={(e) => setStageForm({ ...stageForm, stage_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea rows={3} placeholder="Interview notes, questions asked, etc." value={stageForm.notes} onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowStageModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Stage'}</button>
                    </div>
                </form>
            </Modal>

            {/* Outcome Modal */}
            <Modal isOpen={showOutcomeModal} onClose={() => setShowOutcomeModal(false)} title="Set Outcome" size="md">
                <form onSubmit={handleOutcomeSubmit}>
                    <div className="form-group">
                        <label>Outcome Status *</label>
                        <select value={outcomeForm.status} onChange={(e) => setOutcomeForm({ ...outcomeForm, status: e.target.value })}>
                            {OUTCOME_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    {outcomeForm.status === 'Rejected' && (
                        <div className="form-group">
                            <label>Rejection Reason</label>
                            <input type="text" placeholder="e.g. Not enough experience" value={outcomeForm.rejection_reason} onChange={(e) => setOutcomeForm({ ...outcomeForm, rejection_reason: e.target.value })} />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea rows={3} placeholder="Any additional notes..." value={outcomeForm.notes} onChange={(e) => setOutcomeForm({ ...outcomeForm, notes: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowOutcomeModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Outcome'}</button>
                    </div>
                </form>
            </Modal>

            {/* Reflection Modal */}
            <Modal isOpen={showReflectionModal} onClose={() => setShowReflectionModal(false)} title="Add Reflection" size="lg">
                <form onSubmit={handleReflectionSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>What Worked</label>
                            <textarea rows={3} placeholder="What went well in this application?" value={reflectionForm.what_worked} onChange={(e) => setReflectionForm({ ...reflectionForm, what_worked: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>What Failed</label>
                            <textarea rows={3} placeholder="What could have gone better?" value={reflectionForm.what_failed} onChange={(e) => setReflectionForm({ ...reflectionForm, what_failed: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Skill Gaps</label>
                            <textarea rows={3} placeholder="Skills you need to improve..." value={reflectionForm.skill_gaps} onChange={(e) => setReflectionForm({ ...reflectionForm, skill_gaps: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Improvement Plan</label>
                            <textarea rows={3} placeholder="How will you improve?" value={reflectionForm.improvement_plan} onChange={(e) => setReflectionForm({ ...reflectionForm, improvement_plan: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowReflectionModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Reflection'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
