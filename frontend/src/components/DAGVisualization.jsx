import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GitBranch, ChevronRight, Loader2 } from 'lucide-react';

const FONT = "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif";

// Vivid role colors — designed for maximum contrast on dark canvas
const ROLE_COLORS = {
  'UI/UX Engineer': { bg: '#e06b9e', border: '#e06b9e', glow: 'rgba(224,107,158,0.25)' },
  'Frontend Engineer': { bg: '#5ba3d9', border: '#5ba3d9', glow: 'rgba(91,163,217,0.25)' },
  'Backend Engineer': { bg: '#4caf7c', border: '#4caf7c', glow: 'rgba(76,175,124,0.25)' },
  'Data Engineer': { bg: '#e8a83e', border: '#e8a83e', glow: 'rgba(232,168,62,0.25)' },
  'DevOps Engineer': { bg: '#47b5a0', border: '#47b5a0', glow: 'rgba(71,181,160,0.25)' },
  'ML Engineer': { bg: '#9b7ed6', border: '#9b7ed6', glow: 'rgba(155,126,214,0.25)' },
  'Test Engineer': { bg: '#e07850', border: '#e07850', glow: 'rgba(224,120,80,0.25)' },
};

const DEFAULT_COLOR = { bg: '#8a8a88', border: '#8a8a88', glow: 'rgba(138,138,136,0.15)' };

function getColorForRole(role) {
  if (!role) return DEFAULT_COLOR;
  const key = Object.keys(ROLE_COLORS).find((k) =>
    role.toLowerCase().includes(k.toLowerCase().split(' ')[0].toLowerCase())
  );
  return key ? ROLE_COLORS[key] : DEFAULT_COLOR;
}

function buildGraph(epicData, dagData) {
  const epic = epicData?.epic || epicData;
  const tasks = epic?.tasks || [];

  if (tasks.length === 0) return { nodes: [], edges: [] };

  const taskMap = {};
  const taskIds = [];
  tasks.forEach((t, idx) => {
    const id = t.id || `T-${idx + 1}`;
    taskMap[id] = t;
    taskIds.push(id);
  });

  const edgeSet = new Set();
  const edgeList = [];
  const addEdge = (from, to) => {
    const key = `${from}->${to}`;
    if (edgeSet.has(key)) return;
    if (!taskMap[from] || !taskMap[to]) return;
    if (from === to) return;
    edgeSet.add(key);
    edgeList.push({ from, to });
  };

  const adjList = dagData?.adjacency_list || {};
  Object.entries(adjList).forEach(([from, successors]) => {
    if (Array.isArray(successors)) {
      successors.forEach((to) => addEdge(from, to));
    }
  });

  tasks.forEach((task, idx) => {
    const taskId = task.id || `T-${idx + 1}`;
    if (Array.isArray(task.dependencies)) {
      task.dependencies.forEach((depId) => {
        addEdge(depId, taskId);
      });
    }
  });

  const inDegree = {};
  const adj = {};
  taskIds.forEach((id) => {
    inDegree[id] = 0;
    adj[id] = [];
  });

  edgeList.forEach(({ from, to }) => {
    adj[from].push(to);
    inDegree[to]++;
  });

  const layers = {};
  const queue = taskIds.filter((id) => inDegree[id] === 0);
  queue.forEach((id) => (layers[id] = 0));

  const bfsQueue = [...queue];
  const visited = new Set();
  while (bfsQueue.length > 0) {
    const current = bfsQueue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    adj[current].forEach((next) => {
      layers[next] = Math.max(layers[next] || 0, (layers[current] || 0) + 1);
      inDegree[next]--;
      if (inDegree[next] <= 0 && !visited.has(next)) {
        bfsQueue.push(next);
      }
    });
  }

  taskIds.forEach((id) => {
    if (layers[id] === undefined) layers[id] = 0;
  });

  const layerGroups = {};
  taskIds.forEach((id) => {
    const layer = layers[id];
    if (!layerGroups[layer]) layerGroups[layer] = [];
    layerGroups[layer].push(id);
  });

  const NODE_WIDTH = 260;
  const LAYER_GAP_Y = 220;
  const NODE_GAP_X = NODE_WIDTH + 60; // 60px gap between nodes

  // Find the widest layer to calculate canvas center
  const maxNodesInLayer = Math.max(...Object.values(layerGroups).map((g) => g.length), 1);
  const totalCanvasWidth = maxNodesInLayer * NODE_GAP_X;
  const centerX = totalCanvasWidth / 2 + 80; // pad left

  const nodes = taskIds.map((id) => {
    const task = taskMap[id] || {};
    const layer = layers[id] || 0;
    const group = layerGroups[layer] || [id];
    const indexInLayer = group.indexOf(id);
    const totalInLayer = group.length;
    const offsetX = (indexInLayer - (totalInLayer - 1) / 2) * NODE_GAP_X;

    const roleColors = getColorForRole(task.role);
    const description = task.description || task.title || '';

    return {
      id,
      position: {
        x: centerX + offsetX,
        y: layer * LAYER_GAP_Y + 60,
      },
      data: {
        label: (
          <div style={{ padding: '2px 0' }}>
            {/* Header: ID + Role */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{
                fontWeight: 700,
                fontSize: 12,
                color: '#fff',
                letterSpacing: '0.04em',
                fontFamily: FONT,
                textTransform: 'uppercase',
              }}>
                {id}
              </span>
              {task.role && (
                <span style={{
                  fontSize: 9,
                  padding: '2px 7px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontWeight: 600,
                  fontFamily: FONT,
                  whiteSpace: 'nowrap',
                }}>
                  {task.role.replace(' Engineer', '')}
                </span>
              )}
            </div>
            {/* Description — compact, max 2 lines */}
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.45,
              fontFamily: FONT,
              fontWeight: 400,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {description}
            </div>
          </div>
        ),
      },
      style: {
        width: NODE_WIDTH,
        background: roleColors.bg,
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: `0 4px 20px ${roleColors.glow}, 0 2px 6px rgba(0,0,0,0.25)`,
      },
    };
  });

  // Edges: LIME GREEN with glow for visibility on dark bg
  const edges = edgeList.map(({ from, to }) => ({
    id: `edge-${from}-${to}`,
    source: from,
    target: to,
    animated: true,
    style: { stroke: '#c8ff00', strokeWidth: 2.5, filter: 'drop-shadow(0 0 4px rgba(200,255,0,0.4))' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#c8ff00', width: 20, height: 20 },
  }));

  return { nodes, edges };
}

export default function DAGVisualization({ dagData, epicData, onAssign, loading }) {
  const { nodes: graphNodes, edges: graphEdges } = useMemo(
    () => buildGraph(epicData, dagData),
    [epicData, dagData]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [graphNodes, graphEdges, setNodes, setEdges]);

  const epic = epicData?.epic || epicData;
  const tasks = epic?.tasks || [];

  const depCount = graphEdges.length;
  const layerCount = new Set(graphNodes.map((n) => n.position.y)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 34, fontWeight: 700, color: '#111', letterSpacing: '-0.01em', margin: 0, lineHeight: 1.2, fontFamily: FONT }}>
            Dependency Graph
          </h2>
          <p style={{ color: '#111', fontSize: 19, marginTop: 6, fontWeight: 400, fontFamily: FONT }}>
            <strong>{tasks.length}</strong> tasks &middot; <strong>{depCount}</strong> dependencies &middot; <strong>{layerCount}</strong> execution layers
          </p>
        </div>
        <button
          onClick={onAssign}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            backgroundColor: loading ? '#e5e5e5' : '#c8ff00',
            color: loading ? '#999' : '#111',
            fontWeight: 600,
            fontSize: 19,
            borderRadius: 9999,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: FONT,
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              Assign Roles
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* DAG Canvas — DARK background for maximum contrast */}
      <div
        style={{
          height: 700,
          borderRadius: 16,
          overflow: 'hidden',
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}
      >
        {graphNodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            minZoom={0.15}
            maxZoom={2}
            attributionPosition="bottom-left"
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#c8ff00', strokeWidth: 2.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#c8ff00' },
            }}
          >
            <Background color="rgba(255,255,255,0.03)" gap={28} size={1} />
            <Controls
              style={{
                background: '#2a2a35',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            <MiniMap
              nodeColor={(node) => {
                const bg = node.style?.background;
                return bg || '#c8ff00';
              }}
              maskColor="rgba(26,26,46,0.8)"
              style={{
                background: '#2a2a35',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </ReactFlow>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <GitBranch style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'rgba(255,255,255,0.3)' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 19, fontFamily: FONT }}>No tasks to visualize</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: 16,
          padding: '18px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            {Object.entries(ROLE_COLORS).map(([role, colors]) => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: colors.bg,
                  boxShadow: `0 1px 4px ${colors.glow}`,
                }} />
                <span style={{ fontSize: 16, color: '#111', fontWeight: 500, fontFamily: FONT }}>{role}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, backgroundColor: '#c8ff00', borderRadius: 1 }} />
              <span style={{ fontSize: 16, color: '#111', fontFamily: FONT }}>Dependency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
