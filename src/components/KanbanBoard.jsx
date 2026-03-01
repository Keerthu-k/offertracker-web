import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, GripVertical, MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './KanbanBoard.css';

/* ── 5 main pipeline columns ─────────────────────────────── */
const COLUMNS = [
    { key: 'Open', label: 'Open', color: '#8b5cf6' },
    { key: 'Applied', label: 'Applied', color: '#3b82f6' },
    { key: 'Shortlisted', label: 'Shortlisted', color: '#0ea5e9' },
    { key: 'Interview', label: 'Interview', color: '#f59e0b' },
    { key: 'Offer', label: 'Offer', color: '#10b981' },
    { key: 'Rejected', label: 'Rejected', color: '#ef4444' },
    { key: 'Closed', label: 'Closed', color: '#64748b' },
];

/* Which column should a status appear under? */
function getColumnKey(status) {
    const s = (status || 'Open').toLowerCase();
    const col = COLUMNS.find((c) => c.key.toLowerCase() === s);
    return col ? col.key : 'Open';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}



/* ── Popover menu for status changes ─────────────────────── */
function StatusMenu({ app, onStatusChange, onClose }) {
    const menuRef = useRef(null);
    const currentStatus = (app.status || 'Open');

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    /* Build option list: main columns minus current */
    const allOptions = COLUMNS
        .map((c) => ({ key: c.key, label: c.label, color: c.color }))
        .filter((o) => o.key.toLowerCase() !== currentStatus.toLowerCase());

    return (
        <div ref={menuRef} className="kanban-status-menu" style={{ backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', zIndex: 9999 }} onClick={(e) => e.stopPropagation()}>
            <div className="kanban-status-menu-title" style={{ color: '#64748b' }}>Move to</div>
            {allOptions.map((opt) => (
                <button
                    key={opt.key}
                    className="kanban-status-menu-item"
                    style={{ backgroundColor: 'transparent', color: '#1e293b' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(app.id, opt.key);
                        onClose();
                    }}
                >
                    <span className="kanban-status-menu-dot" style={{ backgroundColor: opt.color }} />
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

/* ── Main Board ──────────────────────────────────────────── */
export default function KanbanBoard({ applications, onStatusChange, search }) {
    const navigate = useNavigate();
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const dragCounter = useRef({});

    /* Filter by search, then bucket into columns */
    const searchFiltered = applications.filter((app) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            app.company_name?.toLowerCase().includes(q) ||
            app.role_title?.toLowerCase().includes(q)
        );
    });

    const columns = COLUMNS.map((col) => ({
        ...col,
        apps: searchFiltered.filter((app) => getColumnKey(app.status) === col.key),
    }));

    /* ── Drag handlers ────────────────────────────────────── */
    const handleDragStart = useCallback((e, appId) => {
        setDraggedId(appId);
        setOpenMenuId(null);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', appId);
        requestAnimationFrame(() => {
            e.target.classList.add('kanban-card--dragging');
        });
    }, []);

    const handleDragEnd = useCallback((e) => {
        e.target.classList.remove('kanban-card--dragging');
        setDraggedId(null);
        setDragOverColumn(null);
        dragCounter.current = {};
    }, []);

    const handleDragEnter = useCallback((e, colKey) => {
        e.preventDefault();
        dragCounter.current[colKey] = (dragCounter.current[colKey] || 0) + 1;
        setDragOverColumn(colKey);
    }, []);

    const handleDragLeave = useCallback((e, colKey) => {
        dragCounter.current[colKey] = (dragCounter.current[colKey] || 0) - 1;
        if (dragCounter.current[colKey] <= 0) {
            dragCounter.current[colKey] = 0;
            setDragOverColumn((prev) => (prev === colKey ? null : prev));
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(
        (e, colKey) => {
            e.preventDefault();
            setDragOverColumn(null);
            dragCounter.current = {};
            const appId = e.dataTransfer.getData('text/plain');
            if (!appId) return;
            const app = applications.find((a) => a.id === appId);
            if (!app) return;
            const currentCol = getColumnKey(app.status);
            if (currentCol !== colKey) {
                onStatusChange(appId, colKey);
            }
            setDraggedId(null);
        },
        [applications, onStatusChange],
    );

    return (
        <div className="kanban-board">
            {columns.map((col) => {
                const isOver = dragOverColumn === col.key && draggedId;
                const draggedApp = draggedId ? applications.find((a) => a.id === draggedId) : null;
                const isSameColumn = draggedApp && getColumnKey(draggedApp.status) === col.key;

                return (
                    <div
                        key={col.key}
                        className={`kanban-column ${isOver && !isSameColumn ? 'kanban-column--dragover' : ''}`}
                        onDragEnter={(e) => handleDragEnter(e, col.key)}
                        onDragLeave={(e) => handleDragLeave(e, col.key)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.key)}
                    >
                        {/* Column header */}
                        <div className="kanban-column-header">
                            <div className="kanban-column-title">
                                <span className="kanban-column-dot" style={{ backgroundColor: col.color }} />
                                <span className="kanban-column-name">{col.label}</span>
                                <span className="kanban-column-count">{col.apps.length}</span>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="kanban-column-body">
                            {col.apps.length === 0 && !isOver && (
                                <div className="kanban-empty">
                                    <p>No applications</p>
                                </div>
                            )}

                            {col.apps.map((app) => (
                                <div
                                    key={app.id}
                                    className={`kanban-card ${draggedId === app.id ? 'kanban-card--dragging' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, app.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => navigate(`/applications/${app.id}`)}
                                >
                                    <div className="kanban-card-grip">
                                        <GripVertical size={14} />
                                    </div>
                                    <div className="kanban-card-content">
                                        <div className="kanban-card-avatar" style={{ backgroundColor: col.color }}>
                                            {app.company_name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="kanban-card-info">
                                            <div className="kanban-card-top-row">
                                                <h4 className="kanban-card-company">{app.company_name}</h4>
                                                <button
                                                    className="kanban-card-menu-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === app.id ? null : app.id);
                                                    }}
                                                    title="Change status"
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </div>
                                            <p className="kanban-card-role">{app.role_title}</p>

                                            <div className="kanban-card-meta">
                                                {app.applied_date && (
                                                    <span className="kanban-card-meta-item">
                                                        <Calendar size={11} />
                                                        {formatDate(app.applied_date)}
                                                    </span>
                                                )}
                                                {app.applied_source && (
                                                    <span className="kanban-card-meta-item">
                                                        <MapPin size={11} />
                                                        {app.applied_source}
                                                    </span>
                                                )}
                                            </div>
                                            {app.stages?.length > 0 && (
                                                <span className="kanban-card-stages">
                                                    {app.stages.length} stage{app.stages.length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Dropdown status menu */}
                                    {openMenuId === app.id && (
                                        <StatusMenu
                                            app={app}
                                            onStatusChange={onStatusChange}
                                            onClose={() => setOpenMenuId(null)}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Drop placeholder */}
                            {isOver && !isSameColumn && col.apps.length === 0 && (
                                <div className="kanban-drop-placeholder">
                                    Drop here to move to <strong>{col.label}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
