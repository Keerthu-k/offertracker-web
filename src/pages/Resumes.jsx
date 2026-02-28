import { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Edit3,
    Calendar,
    Link as LinkIcon,
    Check,
    X,
    Trash2,
    Upload,
} from 'lucide-react';
import { getResumes, createResume, updateResume, deleteResume, uploadResumeFile } from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';

const INITIAL_FORM = { version_name: '', notes: '', file_url: '' };

export default function Resumes() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await getResumes();
            setResumes(data);
        } catch {
            setResumes([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        if (!formData.version_name) return;
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.notes) delete payload.notes;
            if (!payload.file_url) delete payload.file_url;
            await createResume(payload);
            showToast('Resume version created!');
            setShowForm(false);
            setFormData(INITIAL_FORM);
            loadData();
        } catch (err) {
            showToast(err.message || 'Failed to create resume', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    function startEdit(resume) {
        setEditingId(resume.id);
        setEditData({
            version_name: resume.version_name || '',
            notes: resume.notes || '',
            file_url: resume.file_url || '',
        });
    }

    async function handleSaveEdit() {
        setSubmitting(true);
        try {
            const payload = { ...editData };
            if (!payload.notes) payload.notes = null;
            if (!payload.file_url) payload.file_url = null;
            await updateResume(editingId, payload);
            showToast('Resume updated!');
            setEditingId(null);
            loadData();
        } catch (err) {
            showToast(err.message || 'Update failed', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this resume version?')) return;
        try {
            await deleteResume(id);
            showToast('Resume deleted');
            loadData();
        } catch (err) {
            showToast(err.message || 'Delete failed', 'error');
        }
    }

    async function handleFileUpload(resumeId, e) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await uploadResumeFile(resumeId, file);
            showToast('File uploaded!');
            loadData();
        } catch (err) {
            showToast(err.message || 'Upload failed', 'error');
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    if (loading) {
        return (
            <div className="animate-[fadeInUp_0.4s_ease]">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                    <div className="w-9 h-9 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm">Loading resumes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-[fadeInUp_0.4s_ease]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Resumes</h1>
                    <p className="text-sm text-slate-400">
                        {resumes.length} version{resumes.length !== 1 ? 's' : ''} tracked
                    </p>
                </div>
                <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>
                    <Plus size={16} />
                    New Version
                </button>
            </div>

            {/* Cards Grid */}
            {resumes.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                    {resumes
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((resume, index) => (
                            <div
                                key={resume.id}
                                className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all duration-200 group animate-[fadeInUp_0.4s_ease_backwards]"
                                style={{ animationDelay: `${index * 0.04}s` }}
                            >
                                {editingId === resume.id ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="form-group">
                                            <label>Version Name</label>
                                            <input
                                                type="text"
                                                value={editData.version_name}
                                                onChange={(e) => setEditData({ ...editData, version_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Notes</label>
                                            <textarea
                                                rows={2}
                                                value={editData.notes}
                                                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>File URL</label>
                                            <input
                                                type="url"
                                                value={editData.file_url}
                                                onChange={(e) => setEditData({ ...editData, file_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button className="btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                                                <X size={14} /> Cancel
                                            </button>
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={handleSaveEdit}
                                                disabled={submitting}
                                            >
                                                <Check size={14} /> {submitting ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <label className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="Upload file">
                                                    <Upload size={14} />
                                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(resume.id, e)} />
                                                </label>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                                                    onClick={() => startEdit(resume)}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleDelete(resume.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">{resume.version_name}</h3>
                                        {resume.notes && (
                                            <p className="text-sm text-slate-500 mb-3 leading-relaxed line-clamp-3">{resume.notes}</p>
                                        )}
                                        <div className="flex flex-wrap gap-3">
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Calendar size={12} />
                                                {formatDate(resume.created_at)}
                                            </span>
                                            {resume.file_url && (
                                                <a
                                                    href={resume.file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                                                >
                                                    <LinkIcon size={12} />
                                                    View File
                                                </a>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                </div>
            ) : (
                <EmptyState
                    icon={FileText}
                    title="No resume versions"
                    description='Click "New Version" above to start tracking different versions of your resume.'
                />
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="New Resume Version"
                size="md"
            >
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Version Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. v2 - Added ML projects"
                            value={formData.version_name}
                            onChange={(e) =>
                                setFormData({ ...formData, version_name: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            rows={3}
                            placeholder="What changed in this version?"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>File URL</label>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={formData.file_url}
                            onChange={(e) =>
                                setFormData({ ...formData, file_url: e.target.value })
                            }
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
                            {submitting ? 'Creating...' : 'Create Version'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
