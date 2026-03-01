import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Mail,
    Phone,
    Linkedin,
    Building2,
    Trash2,
    Edit3,
} from 'lucide-react';
import { getContacts, createContact, updateContact, deleteContact } from '../services/api';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';

const contactTypes = ['Recruiter', 'Hiring Manager', 'Referral', 'HR', 'Peer', 'Other'];

const typeColors = {
    Recruiter: 'from-blue-500 to-cyan-500',
    'Hiring Manager': 'from-violet-500 to-purple-600',
    Referral: 'from-amber-400 to-orange-500',
    HR: 'from-emerald-400 to-teal-500',
    Peer: 'from-pink-400 to-rose-500',
    Other: 'from-slate-400 to-slate-500',
};

const emptyForm = {
    name: '', email: '', phone: '', role_title: '', company: '',
    contact_type: 'Other', linkedin_url: '', notes: '', last_contacted: '',
};

export default function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadContacts(); }, [filterType]);

    async function loadContacts() {
        setLoading(true);
        try {
            const data = await getContacts({ contact_type: filterType || undefined });
            setContacts(data);
        } catch { setContacts([]); }
        finally { setLoading(false); }
    }

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    }

    function openEdit(c) {
        setEditing(c);
        setForm({
            name: c.name || '', email: c.email || '', phone: c.phone || '',
            role_title: c.role_title || '', company: c.company || '',
            contact_type: c.contact_type || 'Other', linkedin_url: c.linkedin_url || '',
            notes: c.notes || '', last_contacted: c.last_contacted || '',
        });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.name) return;
        setSaving(true);
        try {
            if (editing) {
                await updateContact(editing.id, form);
                showToast('Contact updated', 'success');
            } else {
                await createContact(form);
                showToast('Contact added', 'success');
            }
            setShowModal(false);
            loadContacts();
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this contact?')) return;
        try {
            await deleteContact(id);
            showToast('Deleted', 'success');
            loadContacts();
        } catch (err) { showToast(err.message, 'error'); }
    }

    const filtered = contacts.filter((c) =>
        !search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-enter">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contacts</h1>
                    <p className="text-sm text-slate-400 mt-1">Your networking & hiring contacts</p>
                </div>
                <button className="btn-primary text-sm" onClick={openCreate}>
                    <Plus size={16} /> Add Contact
                </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" placeholder="Search contacts..." className="!pl-10 !bg-white !border-slate-200 !rounded-xl"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="!w-auto !rounded-xl">
                    <option value="">All Types</option>
                    {contactTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState icon={Users} title="No contacts yet" description="Keep track of recruiters, hiring managers, and referrals you connect with." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((c) => (
                        <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[c.contact_type] || typeColors.Other} flex items-center justify-center text-white font-bold text-sm`}>
                                        {c.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                                        {c.role_title && <div className="text-xs text-slate-400">{c.role_title}</div>}
                                    </div>
                                </div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    {c.contact_type}
                                </span>
                            </div>

                            {c.company && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><Building2 size={12} /> {c.company}</div>
                            )}
                            {c.email && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                    <Mail size={12} />
                                    <a href={`mailto:${c.email}`} className="hover:text-indigo-600 transition-colors">{c.email}</a>
                                </div>
                            )}
                            {c.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><Phone size={12} /> {c.phone}</div>
                            )}
                            {c.linkedin_url && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                    <Linkedin size={12} />
                                    <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">LinkedIn</a>
                                </div>
                            )}
                            {c.notes && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{c.notes}</p>}
                            {c.last_contacted && (
                                <div className="text-[10px] text-slate-400 mt-2">Last contacted: {new Date(c.last_contacted).toLocaleDateString()}</div>
                            )}
                            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                                <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Edit3 size={12} /> Edit
                                </button>
                                <div className="flex-1" />
                                <button onClick={() => handleDelete(c.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Contact' : 'Add Contact'} size="md">
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Name *</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Job Title</label>
                            <input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} placeholder="Their title" />
                        </div>
                        <div className="form-group">
                            <label>Company</label>
                            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Where they work" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Type</label>
                            <select value={form.contact_type} onChange={(e) => setForm({ ...form, contact_type: e.target.value })}>
                                {contactTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Last Contacted</label>
                            <input type="date" value={form.last_contacted} onChange={(e) => setForm({ ...form, last_contacted: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>LinkedIn URL</label>
                        <input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Context, conversation notes..." rows={3} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : editing ? 'Update' : 'Add Contact'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
