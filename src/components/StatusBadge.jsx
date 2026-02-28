const statusConfig = {
    applied: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', ring: 'ring-blue-600/20' },
    interview: { label: 'Interview', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-600/20' },
    interviewing: { label: 'Interviewing', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-600/20' },
    offered: { label: 'Offered', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-600/20' },
    rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', ring: 'ring-red-600/20' },
    ghosted: { label: 'Ghosted', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', ring: 'ring-gray-500/20' },
    accepted: { label: 'Accepted', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', ring: 'ring-teal-600/20' },
    declined: { label: 'Declined', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', ring: 'ring-orange-600/20' },
    withdrawn: { label: 'Withdrawn', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', ring: 'ring-purple-600/20' },
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
