import './StatusBadge.css';

const statusConfig = {
    applied: { label: 'Applied', color: 'var(--status-applied)' },
    interview: { label: 'Interview', color: 'var(--status-interview)' },
    interviewing: { label: 'Interviewing', color: 'var(--status-interview)' },
    offered: { label: 'Offered', color: 'var(--status-offered)' },
    rejected: { label: 'Rejected', color: 'var(--status-rejected)' },
    ghosted: { label: 'Ghosted', color: 'var(--status-ghosted)' },
    accepted: { label: 'Accepted', color: 'var(--status-accepted)' },
    declined: { label: 'Declined', color: 'var(--status-declined)' },
    withdrawn: { label: 'Withdrawn', color: 'var(--status-withdrawn)' },
};

export default function StatusBadge({ status }) {
    const key = (status || 'applied').toLowerCase();
    const config = statusConfig[key] || { label: status, color: 'var(--text-tertiary)' };

    return (
        <span
            className="status-badge"
            style={{
                '--badge-color': config.color,
            }}
        >
            <span className="status-dot" />
            {config.label}
        </span>
    );
}
