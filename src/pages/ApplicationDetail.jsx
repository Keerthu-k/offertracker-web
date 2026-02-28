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
    Trash2,
    Tag,
    DollarSign,
    X,
} from 'lucide-react';
import {
    getApplication,
    updateApplication,
    deleteApplication,
    addStage,
    deleteStage,
    createOutcome,
    createReflection,
    getApplicationTags,
    getTags,
    assignTag,
    removeTag,
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';

const OUTCOME_STATUSES = ['Offered', 'Rejected', 'Ghosted', 'Withdrawn'];

export default function ApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showStageModal, setShowStageModal] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [showReflectionModal, setShowReflectionModal] = useState(false);

    const [editForm, setEditForm] = useState({});
    const [stageForm, setStageForm] = useState({ stage_name: '', stage_date: '', notes: '' });
    const [outcomeForm, setOutcomeForm] = useState({ status: 'Offered', rejection_reason: '', notes: '' });
    const [reflectionForm, setReflectionForm] = useState({
        what_worked: '', what_failed: '', skill_gaps: '', improvement_plan: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Tags state
    const [appTags, setAppTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    useEffect(() => {
        loadApplication();
    }, [id]);

    async function loadApplication() {
        try {
            const [data, tags, at] = await Promise.all([
                getApplication(id),
                getTags().catch(() => []),
                getApplicationTags(id).catch(() => []),
            ]);
            setApp(data);
            setAllTags(tags);
            setAppTags(at);
            setEditForm({
                company_name: data.company_name || '',
                role_title: data.role_title || '',
                applied_source: data.applied_source || '',
                url: data.url || '',
                description: data.description || '',
                status: data.status || 'Applied',
                applied_date: data.applied_date?.split('T')[0] || '',
                salary_min: data.salary_min || '',
                salary_max: data.salary_max || '',
            });
        } catch {
            showToast('Failed to load application', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) return;
        try {
            await deleteApplication(id);
            showToast('Application deleted');
            navigate('/applications');
        } catch (err) {
            showToast(err.message || 'Delete failed', 'error');
        }
    }

    async function handleDeleteStage(stageId) {
        if (!confirm('Delete this stage?')) return;
        try {
            await deleteStage(id, stageId);
            showToast('Stage deleted');
            loadApplication();
        } catch (err) { showToast(err.message || 'Failed', 'error'); }
    }

    async function handleAssignTag(tagId) {
        try {
            await assignTag(id, tagId);
            setShowTagDropdown(false);
            const at = await getApplicationTags(id).catch(() => []);
            setAppTags(at);
        } catch (err) { showToast(err.message, 'error'); }
    }

    async function handleRemoveTag(tagId) {
        try {
            await removeTag(id, tagId);
            const at = await getApplicationTags(id).catch(() => []);
            setAppTags(at);
        } catch (err) { showToast(err.message, 'error'); }
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
            if (payload.salary_min) payload.salary_min = Number(payload.salary_min);
            else delete payload.salary_min;
            if (payload.salary_max) payload.salary_max = Number(payload.salary_max);
            else delete payload.salary_max;
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
            await createOutcome(id, payload);
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
            await createReflection(id, payload);
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

    if (loading) {
        return (
            <div className="max-w-4xl animate-[fadeInUp_0.4s_ease]">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                    <div className="w-9 h-9 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm">Loading application...</p>
                </div>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="max-w-4xl animate-[fadeInUp_0.4s_ease]">
                <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6" onClick={() => navigate('/applications')}>
                    <ArrowLeft size={16} /> Back to Applications
                </button>
                <div className="text-center py-16 text-slate-400 text-lg">Application not found.</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-[fadeInUp_0.4s_ease]">
            {/* Back */}
            <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6" onClick={() => navigate('/applications')}>
                <ArrowLeft size={16} /> Back to Applications
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-start justify-between mb-5">
                <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shrink-0 shadow-lg shadow-indigo-500/20">
                        {app.company_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mb-0.5">{app.company_name}</h1>
                        <p className="text-sm text-slate-500 mb-2">{app.role_title}</p>
                        <div className="flex flex-wrap gap-4">
                            {app.applied_date && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar size={13} /> {formatDate(app.applied_date)}
                                </span>
                            )}
                            {app.applied_source && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin size={13} /> {app.applied_source}
                                </span>
                            )}
                            {app.url && (
                                <a href={app.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                                    <ExternalLink size={13} /> Job Posting
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={app.status} />
                    <button className="btn-secondary btn-sm" onClick={() => setShowEditModal(true)}>
                        <Edit3 size={14} /> Edit
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={handleDelete} title="Delete application">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-4 mb-5 flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-slate-400 shrink-0" />
                {appTags.map((t) => (
                    <span key={t.tag_id || t.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">
                        {t.tag_name || t.name}
                        <button onClick={() => handleRemoveTag(t.tag_id || t.id)} className="text-indigo-400 hover:text-red-500"><X size={12} /></button>
                    </span>
                ))}
                <div className="relative">
                    <button onClick={() => setShowTagDropdown(!showTagDropdown)} className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-400 hover:text-indigo-600 border border-dashed border-slate-300 hover:border-indigo-300 transition-colors">
                        <Plus size={12} className="inline -mt-0.5" /> Tag
                    </button>
                    {showTagDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10 min-w-[140px]">
                            {allTags.filter((t) => !appTags.some((at) => (at.tag_id || at.id) === t.id)).map((t) => (
                                <button key={t.id} onClick={() => handleAssignTag(t.id)} className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">{t.name}</button>
                            ))}
                            {allTags.length === 0 && <div className="px-3 py-1.5 text-xs text-slate-400">No tags created</div>}
                        </div>
                    )}
                </div>
            </div>

            {/* Salary Info */}
            {(app.salary_min || app.salary_max) && (
                <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-4 mb-5 flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span className="text-sm text-slate-600 font-medium">
                        Salary Range: {app.salary_min ? `$${app.salary_min.toLocaleString()}` : '?'} – {app.salary_max ? `$${app.salary_max.toLocaleString()}` : '?'}
                    </span>
                </div>
            )}

            {/* Description */}
            {app.description && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-5">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                        <FileText size={16} className="text-slate-400" /> Description
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{app.description}</p>
                </div>
            )}

            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
                {/* Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" /> Interview Timeline
                        </h2>
                        <button className="btn-secondary btn-sm" onClick={() => setShowStageModal(true)}>
                            <Plus size={14} /> Add Stage
                        </button>
                    </div>
                    {app.stages?.length > 0 ? (
                        <div className="flex flex-col">
                            {app.stages
                                .sort((a, b) => new Date(a.stage_date) - new Date(b.stage_date))
                                .map((stage, i) => (
                                    <div key={stage.id} className="flex gap-4 relative">
                                        <div className="flex flex-col items-center shrink-0 pt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/30 shrink-0" />
                                            {i < app.stages.length - 1 && <div className="w-0.5 flex-1 bg-indigo-100 mt-1 min-h-5" />}
                                        </div>
                                        <div className="pb-5 flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-sm font-semibold text-slate-800">{stage.stage_name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{formatDate(stage.stage_date)}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteStage(stage.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                            {stage.notes && <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{stage.notes}</p>}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No interview stages recorded yet.</p>
                    )}
                </div>

                {/* Right Column: Outcome + Reflection */}
                <div className="flex flex-col gap-5">
                    {/* Outcome */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <Target size={16} className="text-slate-400" /> Outcome
                            </h2>
                            {!app.outcome && (
                                <button className="btn-secondary btn-sm" onClick={() => setShowOutcomeModal(true)}>
                                    <Plus size={14} /> Set Outcome
                                </button>
                            )}
                        </div>
                        {app.outcome ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-base font-bold">
                                    {app.outcome.status?.toLowerCase() === 'offered' && <CheckCircle size={20} className="text-emerald-500" />}
                                    {app.outcome.status?.toLowerCase() === 'rejected' && <XCircle size={20} className="text-red-500" />}
                                    {app.outcome.status?.toLowerCase() === 'ghosted' && <Ghost size={20} className="text-gray-400" />}
                                    {!['offered', 'rejected', 'ghosted'].includes(app.outcome.status?.toLowerCase()) && <AlertTriangle size={20} className="text-amber-500" />}
                                    <span className="text-slate-800">{app.outcome.status}</span>
                                </div>
                                {app.outcome.rejection_reason && (
                                    <div className="pl-7">
                                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Reason</span>
                                        <p className="text-sm text-slate-500 leading-relaxed">{app.outcome.rejection_reason}</p>
                                    </div>
                                )}
                                {app.outcome.notes && (
                                    <div className="pl-7">
                                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Notes</span>
                                        <p className="text-sm text-slate-500 leading-relaxed">{app.outcome.notes}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No outcome recorded yet.</p>
                        )}
                    </div>

                    {/* Reflection */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <Lightbulb size={16} className="text-slate-400" /> Reflection
                            </h2>
                            {!app.reflection && (
                                <button className="btn-secondary btn-sm" onClick={() => setShowReflectionModal(true)}>
                                    <Plus size={14} /> Add Reflection
                                </button>
                            )}
                        </div>
                        {app.reflection ? (
                            <div className="space-y-3">
                                {app.reflection.what_worked && (
                                    <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 mb-1">
                                            <CheckCircle size={14} /> What Worked
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{app.reflection.what_worked}</p>
                                    </div>
                                )}
                                {app.reflection.what_failed && (
                                    <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-100">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-red-700 mb-1">
                                            <XCircle size={14} /> What Failed
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{app.reflection.what_failed}</p>
                                    </div>
                                )}
                                {app.reflection.skill_gaps && (
                                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 mb-1">
                                            <AlertTriangle size={14} /> Skill Gaps
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{app.reflection.skill_gaps}</p>
                                    </div>
                                )}
                                {app.reflection.improvement_plan && (
                                    <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-sky-700 mb-1">
                                            <TrendingUp size={14} /> Improvement Plan
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{app.reflection.improvement_plan}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No reflection added yet.</p>
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
                    <div className="form-row">
                        <div className="form-group">
                            <label>Salary Min</label>
                            <input type="number" placeholder="e.g. 80000" value={editForm.salary_min || ''} onChange={(e) => setEditForm({ ...editForm, salary_min: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Salary Max</label>
                            <input type="number" placeholder="e.g. 120000" value={editForm.salary_max || ''} onChange={(e) => setEditForm({ ...editForm, salary_max: e.target.value })} />
                        </div>
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
