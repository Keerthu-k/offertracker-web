const statusConfig = {
    open: { label: 'Open', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', ring: 'ring-violet-600/20' },
    applied: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', ring: 'ring-blue-600/20' },
    shortlisted: { label: 'Shortlisted', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', ring: 'ring-sky-600/20' },
    interview: { label: 'Interview', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-600/20' },
    offer: { label: 'Offer', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-600/20' },
    rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', ring: 'ring-red-600/20' },
    closed: { label: 'Closed', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', ring: 'ring-slate-500/20' },
};

const defaultConfig = { label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', ring: 'ring-gray-500/20' };

export default function StatusBadge({ status }) {
    const key = (status || 'applied').toLowerCase();
    const config = statusConfig[key] || { ...defaultConfig, label: status };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}
