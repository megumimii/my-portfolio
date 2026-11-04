/**
 * Interactive Node-Based System Diagram for "My Thought Process" (80% Arena)
 *
 * Renders an interconnected architectural node topology:
 * Problems -> Requirements -> Constraints -> Possible Solutions ->
 * Architecture -> Dependencies -> Implementation -> Evaluation
 *
 * Features:
 * - Curved cubic-Bezier SVG connection wires with animated signal flow pulses
 * - Interactive node selection & hover path highlighting (upstream + downstream)
 * - Auto-Cycle / Step-through mode to trace the engineering thought pipeline
 * - Live Node Inspector drawer below the graph canvas
 */
import { useEffect, useMemo, useState } from 'react';
import styles from './ThoughtProcessGraph.module.css';

export default function ThoughtProcessGraph({ nodes: propNodes = [] }) {
  const nodes = useMemo(() => {
    if (Array.isArray(propNodes)) {
      return propNodes;
    }
    return [];
  }, [propNodes]);

  const [activeNodeId, setActiveNodeId] = useState(() => nodes[0]?.id || '');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [autoTrace, setAutoTrace] = useState(true);

  const focusedNodeId = hoveredNodeId || activeNodeId;

  useEffect(() => {
    if (!nodes.some((n) => n.id === activeNodeId) && nodes[0]) {
      setActiveNodeId(nodes[0].id);
    }
  }, [nodes, activeNodeId]);

  // Optional subtle auto-stepping through the thought process when autoTrace is active and not hovering
  useEffect(() => {
    if (!autoTrace || hoveredNodeId || nodes.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveNodeId((prevId) => {
        const currentIdx = nodes.findIndex((n) => n.id === prevId);
        const nextIdx = (currentIdx + 1) % nodes.length;
        return nodes[nextIdx].id;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [autoTrace, hoveredNodeId, nodes]);

  // Build lookup map & compute directed edges between nodes
  const { nodeMap, edges } = useMemo(() => {
    const map = {};
    nodes.forEach((node) => {
      map[node.id] = node;
    });

    const computedEdges = [];
    nodes.forEach((source) => {
      const targets = Array.isArray(source.connections) ? source.connections : [];
      targets.forEach((targetId) => {
        const target = map[targetId];
        if (target) {
          computedEdges.push({
            id: `${source.id}->${target.id}`,
            fromId: source.id,
            toId: target.id,
            x1: Number(source.x) || 10,
            y1: Number(source.y) || 20,
            x2: Number(target.x) || 50,
            y2: Number(target.y) || 50,
          });
        }
      });
    });

    return { nodeMap: map, edges: computedEdges };
  }, [nodes]);

  const activeNode = nodeMap[focusedNodeId] || nodes[0] || {};

  // Determine whether an edge or node is directly connected to the currently focused node
  const isEdgeHighlighted = (edge) =>
    edge.fromId === focusedNodeId || edge.toId === focusedNodeId;

  const isNodeConnected = (nodeId) => {
    if (nodeId === focusedNodeId) return true;
    return edges.some(
      (e) =>
        (e.fromId === focusedNodeId && e.toId === nodeId) ||
        (e.toId === focusedNodeId && e.fromId === nodeId)
    );
  };

  const handleSelectNode = (nodeId) => {
    setAutoTrace(false);
    setActiveNodeId(nodeId);
  };

  const handleStep = (direction) => {
    setAutoTrace(false);
    const currentIdx = nodes.findIndex((n) => n.id === activeNodeId);
    const nextIdx = (currentIdx + direction + nodes.length) % nodes.length;
    setActiveNodeId(nodes[nextIdx].id);
  };

  if (nodes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>NO THOUGHT PROCESS NODES CONFIGURED</p>
        <p className={styles.emptySub}>
          Configure nodes in the Admin Site Content tab to visualize your architectural pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.graphWrapper}>
      {/* Top Graph Telemetry Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.toolbarLabel}>
            SYSTEM TOPOLOGY // {nodes.length} INTERCONNECTED NODES
          </span>
        </div>

        <div className={styles.toolbarControls}>
          <button
            type="button"
            onClick={() => setAutoTrace((prev) => !prev)}
            className={`${styles.traceToggle} ${autoTrace ? styles.traceActive : ''}`}
          >
            {autoTrace ? '● AUTO-TRACE: ON' : '○ AUTO-TRACE: PAUSED'}
          </button>
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className={styles.stepBtn}
            aria-label="Previous thought process node"
          >
            [← PREV]
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            className={styles.stepBtn}
            aria-label="Next thought process node"
          >
            [NEXT →]
          </button>
        </div>
      </div>

      {/* Interactive Node Canvas */}
      <div className={styles.canvasContainer}>
        {/* SVG Coordinate Layer for Animated Bezier Connections */}
        <svg
          className={styles.svgLayer}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="nodeArrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="3.5"
              markerHeight="3.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#71717A" />
            </marker>
            <marker
              id="nodeArrowActive"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#FAFAFA" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const highlighted = isEdgeHighlighted(edge);
            const midX = (edge.x1 + edge.x2) / 2;
            const pathD = `M ${edge.x1} ${edge.y1} C ${midX} ${edge.y1}, ${midX} ${edge.y2}, ${edge.x2} ${edge.y2}`;

            return (
              <g key={edge.id}>
                {/* Base structural wire */}
                <path
                  d={pathD}
                  className={`${styles.edgeBase} ${
                    highlighted ? styles.edgeBaseActive : ''
                  }`}
                  markerEnd={
                    highlighted ? 'url(#nodeArrowActive)' : 'url(#nodeArrow)'
                  }
                />
                {/* Animated signal pulse wire */}
                <path
                  d={pathD}
                  className={`${styles.edgePulse} ${
                    highlighted ? styles.edgePulseActive : ''
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Node Cards Positioned on Canvas */}
        <div className={styles.nodesLayer}>
          {nodes.map((node, idx) => {
            const isFocused = node.id === focusedNodeId;
            const isConnected = isNodeConnected(node.id);
            const xPos = Number(node.x) || 12 + idx * 11;
            const yPos = Number(node.y) || (idx % 2 === 0 ? 25 : 65);

            return (
              <button
                key={node.id}
                type="button"
                style={{
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                }}
                onClick={() => handleSelectNode(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                aria-pressed={isFocused}
                className={`${styles.nodeButton} ${
                  isFocused ? styles.nodeFocused : ''
                } ${isConnected ? styles.nodeConnected : styles.nodeDimmed}`}
              >
                <div className={styles.nodeTopRow}>
                  <span className={styles.nodeIndex}>
                    {node.index || String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.nodeCategory}>
                    {node.category || 'STAGE'}
                  </span>
                </div>
                <span className={styles.nodeLabel}>{node.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Active Node Inspector Panel */}
      <div className={styles.inspectorPanel} aria-live="polite">
        <div className={styles.inspectorMeta}>
          <div className={styles.inspectorBadge}>
            <span>NODE // {activeNode.index || '01'}</span>
          </div>
          <span className={styles.inspectorCategory}>
            {activeNode.category || 'SYSTEM STAGE'}
          </span>
          <h4 className={styles.inspectorTitle}>{activeNode.label}</h4>
          <p className={styles.inspectorSummary}>{activeNode.summary}</p>
        </div>

        <div className={styles.inspectorBody}>
          <p className={styles.inspectorDetails}>{activeNode.details}</p>

          {Array.isArray(activeNode.connections) &&
            activeNode.connections.length > 0 && (
              <div className={styles.downstreamRow}>
                <span className={styles.downstreamLabel}>FEEDS INTO →</span>
                <div className={styles.downstreamChips}>
                  {activeNode.connections.map((targetId) => {
                    const targetNode = nodeMap[targetId];
                    if (!targetNode) return null;
                    return (
                      <button
                        key={targetId}
                        type="button"
                        onClick={() => handleSelectNode(targetId)}
                        className={styles.downstreamChip}
                      >
                        <span>{targetNode.index}</span>
                        <span>{targetNode.label}</span>
                        <span>↗</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

