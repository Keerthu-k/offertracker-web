import { useMemo, useRef, useEffect, useState } from 'react';
import { sankey as d3Sankey, sankeyLinkHorizontal, sankeyCenter } from 'd3-sankey';
import './SankeyChart.css';

/* ── Color palette matching the app's status colors ───── */
const NODE_COLORS = {
    'All Applications': '#6366f1',
    'Applied':          '#3b82f6',
    'Interview':        '#f59e0b',
    'Offered':          '#10b981',
    'Accepted':         '#14b8a6',
    'Rejected':         '#ef4444',
    'Ghosted':          '#9ca3af',
    'Declined':         '#f97316',
    'Withdrawn':        '#a855f7',
    'Pending':          '#8b5cf6',
};

function getNodeColor(name) {
    return NODE_COLORS[name] || '#94a3b8';
}

function getLinkColor(source) {
    const c = getNodeColor(source);
    return c + '30'; // 30 = ~19% opacity in hex
}

function getLinkHoverColor(source) {
    const c = getNodeColor(source);
    return c + '55';
}

/* ── Build Sankey data from applications ──────────────── */
function buildSankeyData(applications) {
    if (!applications || applications.length === 0) return null;

    const counts = {};
    applications.forEach((app) => {
        const s = (app.status || 'Applied');
        counts[s] = (counts[s] || 0) + 1;
    });

    /* Node definitions — 3 layers:
       Layer 0: "All Applications"
       Layer 1: Pipeline stages (Applied, Interview, Offered)
       Layer 2: Final outcomes (Accepted, Rejected, Ghosted, Declined, Withdrawn)
    */

    const pipeline = ['Applied', 'Interview', 'Offered'];
    const outcomes = ['Accepted', 'Rejected', 'Ghosted', 'Declined', 'Withdrawn'];

    const nodes = [];
    const links = [];
    const nodeIndex = {};

    function ensureNode(name) {
        if (!(name in nodeIndex)) {
            nodeIndex[name] = nodes.length;
            nodes.push({ name });
        }
        return nodeIndex[name];
    }

    // Root node
    ensureNode('All Applications');

    // Layer 1 — pipeline stages
    pipeline.forEach((s) => {
        if (counts[s] && counts[s] > 0) {
            ensureNode(s);
        }
    });

    // Layer 2 — outcomes
    outcomes.forEach((s) => {
        if (counts[s] && counts[s] > 0) {
            ensureNode(s);
        }
    });

    // Also count "Pending" — apps in pipeline stages that haven't reached an outcome
    // For "Applied": pending = still Applied (not moved further)
    // For simplicity & clarity: All Applications → each status that exists
    //   then Interview/Offered → outcomes

    // Links from "All Applications" to pipeline stages
    pipeline.forEach((s) => {
        const count = counts[s] || 0;
        if (count > 0) {
            links.push({
                source: nodeIndex['All Applications'],
                target: nodeIndex[s],
                value: count,
            });
        }
    });

    // Links from "All Applications" directly to any outcome that exists
    // but we want the flow to show progression, so:
    // Applied stays as-is (leaf if no further progression)
    // Interview stays as-is (leaf)
    // Offered → can lead to Accepted/Declined
    // Also All Applications → Rejected/Ghosted/Withdrawn (since these can come from any stage)

    outcomes.forEach((s) => {
        const count = counts[s] || 0;
        if (count > 0) {
            // Determine which pipeline stage feeds into this outcome
            let sourceStage;
            if (s === 'Accepted' || s === 'Declined') {
                sourceStage = 'Offered';
            } else if (s === 'Withdrawn') {
                sourceStage = 'Applied';
            } else {
                // Rejected, Ghosted — come from Interview or directly
                sourceStage = counts['Interview'] ? 'Interview' : 'Applied';
            }
            // If that source stage exists as a node, link from it
            if (sourceStage in nodeIndex) {
                links.push({
                    source: nodeIndex[sourceStage],
                    target: nodeIndex[s],
                    value: count,
                });
            } else {
                // Fallback: link from All Applications
                links.push({
                    source: nodeIndex['All Applications'],
                    target: nodeIndex[s],
                    value: count,
                });
            }
        }
    });

    // If there are no links at all, bail
    if (links.length === 0) return null;

    return { nodes, links };
}

/* ── React component ──────────────────────────────────── */
export default function SankeyChart({ applications }) {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredLink, setHoveredLink] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    /* Observe container for responsive sizing */
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height: Math.max(height, 240) });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const rawData = useMemo(() => buildSankeyData(applications), [applications]);

    const graph = useMemo(() => {
        if (!rawData || dimensions.width === 0) return null;

        const margin = { top: 16, right: 16, bottom: 16, left: 16 };
        const w = dimensions.width - margin.left - margin.right;
        const h = dimensions.height - margin.top - margin.bottom;

        if (w < 100 || h < 80) return null;

        // Deep-clone because d3-sankey mutates in place
        const data = {
            nodes: rawData.nodes.map((n) => ({ ...n })),
            links: rawData.links.map((l) => ({ ...l })),
        };

        const sankeyGen = d3Sankey()
            .nodeId((d) => d.index)
            .nodeAlign(sankeyCenter)
            .nodeWidth(18)
            .nodePadding(14)
            .extent([[margin.left, margin.top], [margin.left + w, margin.top + h]])
            .iterations(32);

        const result = sankeyGen({
            nodes: data.nodes.map((d, i) => ({ ...d, index: i })),
            links: data.links.map((d) => ({ ...d })),
        });

        return result;
    }, [rawData, dimensions]);

    const linkPath = sankeyLinkHorizontal();

    if (!rawData) {
        return (
            <div className="sankey-empty">
                <p>Add a few applications to see your flow diagram</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="sankey-container">
            {graph && dimensions.width > 0 && (
                <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    className="sankey-svg"
                >
                    <defs>
                        {graph.links.map((link, i) => {
                            const sourceColor = getNodeColor(link.source.name);
                            const targetColor = getNodeColor(link.target.name);
                            return (
                                <linearGradient
                                    key={`grad-${i}`}
                                    id={`sankey-grad-${i}`}
                                    gradientUnits="userSpaceOnUse"
                                    x1={link.source.x1}
                                    x2={link.target.x0}
                                >
                                    <stop offset="0%" stopColor={sourceColor} stopOpacity={0.25} />
                                    <stop offset="100%" stopColor={targetColor} stopOpacity={0.25} />
                                </linearGradient>
                            );
                        })}
                    </defs>

                    {/* Links */}
                    <g className="sankey-links">
                        {graph.links.map((link, i) => {
                            const isHovered = hoveredLink === i;
                            const isNodeHovered = hoveredNode !== null && (
                                link.source.index === hoveredNode ||
                                link.target.index === hoveredNode
                            );
                            const dimmed = (hoveredNode !== null || hoveredLink !== null) && !isHovered && !isNodeHovered;

                            return (
                                <path
                                    key={i}
                                    d={linkPath(link)}
                                    fill="none"
                                    stroke={`url(#sankey-grad-${i})`}
                                    strokeWidth={Math.max(link.width, 2)}
                                    strokeOpacity={dimmed ? 0.08 : isHovered || isNodeHovered ? 0.55 : 0.3}
                                    className="sankey-link"
                                    onMouseEnter={() => setHoveredLink(i)}
                                    onMouseLeave={() => setHoveredLink(null)}
                                >
                                    <title>{`${link.source.name} → ${link.target.name}: ${link.value}`}</title>
                                </path>
                            );
                        })}
                    </g>

                    {/* Nodes */}
                    <g className="sankey-nodes">
                        {graph.nodes.map((node) => {
                            const color = getNodeColor(node.name);
                            const isHovered = hoveredNode === node.index;
                            const h = node.y1 - node.y0;
                            const isLeftmost = node.depth === 0;
                            const isRightmost = node.sourceLinks.length === 0;
                            /* Label placement: left nodes → label on right,
                               right/terminal nodes → label on right,
                               middle nodes → label on left */
                            const labelOnRight = isLeftmost || isRightmost;

                            return (
                                <g
                                    key={node.index}
                                    onMouseEnter={() => setHoveredNode(node.index)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    className="sankey-node-group"
                                >
                                    <rect
                                        x={node.x0}
                                        y={node.y0}
                                        width={node.x1 - node.x0}
                                        height={h}
                                        fill={color}
                                        rx={4}
                                        ry={4}
                                        opacity={isHovered ? 1 : 0.85}
                                        className="sankey-node-rect"
                                    />
                                    {/* Label */}
                                    <text
                                        x={labelOnRight ? node.x1 + 8 : node.x0 - 8}
                                        y={(node.y0 + node.y1) / 2}
                                        dy="0.35em"
                                        textAnchor={labelOnRight ? 'start' : 'end'}
                                        className="sankey-node-label"
                                    >
                                        {node.name}
                                    </text>
                                    {/* Value */}
                                    <text
                                        x={(node.x0 + node.x1) / 2}
                                        y={(node.y0 + node.y1) / 2}
                                        dy="0.35em"
                                        textAnchor="middle"
                                        className="sankey-node-value"
                                        fill="#fff"
                                    >
                                        {h > 18 ? node.value : ''}
                                    </text>
                                    <title>{`${node.name}: ${node.value}`}</title>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            )}
        </div>
    );
}
