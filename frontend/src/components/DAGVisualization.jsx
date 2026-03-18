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

const ROLE_COLORS = {
  'UI/UX Engineer': { bg: '#be185d', border: '#ec4899' },
  'Frontend Engineer': { bg: '#1d4ed8', border: '#3b82f6' },
  'Backend Engineer': { bg: '#15803d', border: '#22c55e' },
  'Data Engineer': { bg: '#a16207', border: '#eab308' },
  'DevOps Engineer': { bg: '#c2410c', border: '#f97316' },
  'ML Engineer': { bg: '#7e22ce', border: '#a855f7' },
  'Test Engineer': { bg: '#0e7490', border: '#06b6d4' },
};

const DEFAULT_COLOR = { bg: '#475569', border: '#64748b' };

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

  // Build task lookup by ID
  const taskMap = {};
  const taskIds = [];
  tasks.forEach((t, idx) => {
    const id = t.id || `T-${idx + 1}`;
    taskMap[id] = t;
    taskIds.push(id);
  });

  // Collect all edges from multiple sources, deduplicating
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

  // Source 1: dagData.adjacency_list — { node_id: [successor_ids] }
  const adjList = dagData?.adjacency_list || {};
  Object.entries(adjList).forEach(([from, successors]) => {
    if (Array.isArray(successors)) {
      successors.forEach((to) => addEdge(from, to));
    }
  });

  // Source 2: per-task dependencies — task.dependencies = ["dep_id", ...]
  tasks.forEach((task, idx) => {
    const taskId = task.id || `T-${idx + 1}`;
    if (Array.isArray(task.dependencies)) {
      task.dependencies.forEach((depId) => {
        addEdge(depId, taskId); // depId -> taskId (task depends on depId)
      });
    }
  });

  // Compute layers via BFS topological sort
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

  // Assign unvisited nodes to layer 0
  taskIds.forEach((id) => {
    if (layers[id] === undefined) layers[id] = 0;
  });

  // Group nodes by layer
  const layerGroups = {};
  taskIds.forEach((id) => {
    const layer = layers[id];
    if (!layerGroups[layer]) layerGroups[layer] = [];
    layerGroups[layer].push(id);
  });

  const NODE_WIDTH = 280;
  const LAYER_GAP_Y = 160;
  const NODE_GAP_X = 320;

  // Build React Flow nodes
  const nodes = taskIds.map((id) => {
    const task = taskMap[id] || {};
    const layer = layers[id] || 0;
    const group = layerGroups[layer] || [id];
    const indexInLayer = group.indexOf(id);
    const totalInLayer = group.length;
    const offsetX = (indexInLayer - (totalInLayer - 1) / 2) * NODE_GAP_X;
    const centerX = 600;

    const roleColors = getColorForRole(task.role);
    const description = task.description || task.title || '';
    const techDetails = task.technical_details;

    return {
      id,
      position: {
        x: centerX + offsetX,
        y: layer * LAYER_GAP_Y + 50,
      },
      data: {
        label: (
          <div style={{ padding: '4px 0' }}>
            {/* Header row: ID + Role */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 12, color: roleColors.border, letterSpacing: '0.02em' }}>
                {id}
              </span>
              {task.role && (
                <span
                  style={{
                    fontSize: 9,
                    padding: '2px 8px',
                    borderRadius: 20,
                    backgroundColor: roleColors.bg + '30',
                    color: roleColors.border,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                  }}
                >
                  {task.role}
                </span>
              )}
            </div>
            {/* Description */}
            <div style={{ fontSize: 11, color: '#f5f5f7', lineHeight: 1.5, marginBottom: techDetails ? 8 : 0, opacity: 0.85 }}>
              {description.length > 100 ? description.substring(0, 100) + '...' : description}
            </div>
            {/* Tech stack tags */}
            {techDetails?.tech_stack?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {techDetails.tech_stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      borderRadius: 20,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: '#86868b',
                      fontWeight: 500,
                    }}
                  >
                    {tech}
                  </span>
                ))}
                {techDetails.tech_stack.length > 4 && (
                  <span style={{ fontSize: 9, color: '#86868b' }}>
                    +{techDetails.tech_stack.length - 4}
                  </span>
                )}
              </div>
            )}
            {/* Inputs/Outputs indicator */}
            {techDetails && (techDetails.inputs?.length > 0 || techDetails.outputs?.length > 0) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 9, color: '#86868b' }}>
                {techDetails.inputs?.length > 0 && (
                  <span>{techDetails.inputs.length} input{techDetails.inputs.length > 1 ? 's' : ''}</span>
                )}
                {techDetails.outputs?.length > 0 && (
                  <span>{techDetails.outputs.length} output{techDetails.outputs.length > 1 ? 's' : ''}</span>
                )}
                {techDetails.estimated_hours && (
                  <span>{techDetails.estimated_hours}h</span>
                )}
              </div>
            )}
          </div>
        ),
      },
      style: {
        width: NODE_WIDTH,
        background: '#1c1c1e',
        border: `1.5px solid ${roleColors.border}`,
        borderRadius: 16,
        padding: '12px 16px',
        boxShadow: `0 8px 32px ${roleColors.bg}20, 0 0 0 1px rgba(255,255,255,0.04)`,
      },
    };
  });

  // Build React Flow edges
  const edges = edgeList.map(({ from, to }, idx) => ({
    id: `edge-${from}-${to}`,
    source: from,
    target: to,
    animated: true,
    style: { stroke: '#0071e3', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0071e3', width: 18, height: 18 },
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

  // Update nodes/edges when data changes
  useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [graphNodes, graphEdges, setNodes, setEdges]);

  const epic = epicData?.epic || epicData;
  const tasks = epic?.tasks || [];

  // Stats
  const depCount = graphEdges.length;
  const layerCount = new Set(graphNodes.map((n) => n.position.y)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
            DAG Visualization
          </h2>
          <p style={{ color: '#86868b', fontSize: 15, marginTop: 6, fontWeight: 400 }}>
            {tasks.length} tasks &middot; {depCount} dependencies &middot; {layerCount} layers
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
            backgroundColor: loading ? '#1c1c1e' : '#0071e3',
            color: loading ? '#86868b' : '#ffffff',
            fontWeight: 500,
            fontSize: 15,
            borderRadius: 980,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '-0.01em',
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

      {/* DAG Canvas */}
      <div
        style={{
          height: 600,
          borderRadius: 20,
          overflow: 'hidden',
          background: '#000',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
        }}
      >
        {graphNodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={2}
            attributionPosition="bottom-left"
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#0071e3', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#0071e3' },
            }}
          >
            <Background color="#222" gap={24} size={1} />
            <Controls
              style={{
                background: '#1c1c1e',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            <MiniMap
              nodeColor={(node) => {
                const borderStyle = node.style?.border || '';
                const match = borderStyle.match(/#[0-9a-fA-F]{6}/);
                return match ? match[0] : '#0071e3';
              }}
              maskColor="rgba(0, 0, 0, 0.85)"
              style={{
                background: '#111',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </ReactFlow>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <GitBranch style={{ width: 48, height: 48, margin: '0 auto 16px', color: '#86868b', opacity: 0.4 }} />
              <p style={{ color: '#86868b', fontSize: 15 }}>No tasks to visualize</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '20px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 500, color: '#86868b', marginBottom: 14, letterSpacing: '0.02em' }}>
              Role Colors
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {Object.entries(ROLE_COLORS).map(([role, colors]) => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: colors.border,
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#86868b', fontWeight: 400 }}>{role}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 2, backgroundColor: '#0071e3', borderRadius: 1 }} />
              <span style={{ fontSize: 12, color: '#86868b' }}>Dependency</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 4, border: '1.5px solid rgba(255,255,255,0.2)', background: '#1c1c1e' }} />
              <span style={{ fontSize: 12, color: '#86868b' }}>Task Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
