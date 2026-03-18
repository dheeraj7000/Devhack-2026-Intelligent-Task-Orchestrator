import React, { useMemo } from 'react';
import {
  Users,
  ChevronRight,
  Loader2,
  Palette,
  Monitor,
  Server,
  Database,
  Cloud,
  Cpu,
  TestTube,
} from 'lucide-react';

const FONT = "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif";

const ROLE_CONFIG = {
  'UI/UX Engineer': {
    bg: 'bg-pink-600/20',
    border: 'border-pink-500/30',
    text: 'text-pink-300',
    badge: 'bg-pink-600',
    dot: 'bg-pink-500',
    icon: Palette,
    accent: '#e06b9e',
  },
  'Frontend Engineer': {
    bg: 'bg-blue-600/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    badge: 'bg-blue-600',
    dot: 'bg-blue-500',
    icon: Monitor,
    accent: '#5ba3d9',
  },
  'Backend Engineer': {
    bg: 'bg-green-600/20',
    border: 'border-green-500/30',
    text: 'text-green-300',
    badge: 'bg-green-600',
    dot: 'bg-green-500',
    icon: Server,
    accent: '#4caf7c',
  },
  'Data Engineer': {
    bg: 'bg-yellow-600/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    badge: 'bg-yellow-600',
    dot: 'bg-yellow-500',
    icon: Database,
    accent: '#e8a83e',
  },
  'DevOps Engineer': {
    bg: 'bg-orange-600/20',
    border: 'border-orange-500/30',
    text: 'text-orange-300',
    badge: 'bg-orange-600',
    dot: 'bg-orange-500',
    icon: Cloud,
    accent: '#47b5a0',
  },
  'ML Engineer': {
    bg: 'bg-purple-600/20',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    badge: 'bg-purple-600',
    dot: 'bg-purple-500',
    icon: Cpu,
    accent: '#9b7ed6',
  },
  'Test Engineer': {
    bg: 'bg-cyan-600/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    badge: 'bg-cyan-600',
    dot: 'bg-cyan-500',
    icon: TestTube,
    accent: '#e07850',
  },
};

function getRoleConfig(role) {
  if (!role) {
    return {
      bg: 'bg-slate-600/20',
      border: 'border-slate-500/30',
      text: 'text-slate-300',
      badge: 'bg-slate-600',
      dot: 'bg-slate-500',
      icon: Users,
      accent: '#888888',
    };
  }
  const key = Object.keys(ROLE_CONFIG).find((k) =>
    role.toLowerCase().includes(k.toLowerCase().split(' ')[0].toLowerCase())
  );
  return key
    ? ROLE_CONFIG[key]
    : {
        bg: 'bg-slate-600/20',
        border: 'border-slate-500/30',
        text: 'text-slate-300',
        badge: 'bg-slate-600',
        dot: 'bg-slate-500',
        icon: Users,
        accent: '#888888',
      };
}

export default function RoleAssignment({ assignmentData, epicData, onComputeWaves, loading }) {
  const assignments = Array.isArray(assignmentData)
    ? assignmentData
    : (assignmentData?.assignments || assignmentData?.tasks || []);
  const epic = epicData?.epic || epicData;
  const epicTasks = epic?.tasks || [];

  // Build task lookup from epic
  const taskMap = {};
  epicTasks.forEach((t, idx) => {
    taskMap[t.id || `T-${idx + 1}`] = t;
  });

  // Group tasks by role
  const groupedByRole = useMemo(() => {
    const groups = {};

    assignments.forEach((assignment) => {
      const taskId = assignment.task_id || assignment.id;
      const role = assignment.role || assignment.assigned_to || 'Unassigned';
      const taskInfo = taskMap[taskId] || {};

      if (!groups[role]) {
        groups[role] = [];
      }

      groups[role].push({
        id: taskId,
        description: assignment.description || taskInfo.description || taskInfo.title || taskId,
        role,
      });
    });

    // If assignments don't have role info, try from epic tasks
    if (Object.keys(groups).length === 0 && epicTasks.length > 0) {
      epicTasks.forEach((task, idx) => {
        const role = task.role || 'Unassigned';
        const taskId = task.id || `T-${idx + 1}`;
        if (!groups[role]) groups[role] = [];
        groups[role].push({
          id: taskId,
          description: task.description || task.title || taskId,
          role,
        });
      });
    }

    return groups;
  }, [assignments, epicTasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2, fontFamily: FONT }}>
            Role Assignments
          </h2>
          <p style={{ color: '#111', fontSize: 19, marginTop: 6, fontWeight: 400, fontFamily: FONT }}>
            Tasks organized by assigned engineering role
          </p>
        </div>
        <button
          onClick={onComputeWaves}
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
            transition: 'all 0.3s ease',
            letterSpacing: '-0.01em',
            fontFamily: FONT,
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Computing...
            </>
          ) : (
            <>
              Compute Waves
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Summary */}
      <div
        style={{
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, background: 'rgba(200,255,0,0.12)', borderRadius: 12 }}>
            <Users style={{ width: 22, height: 22, color: '#c8ff00' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '-0.01em', fontFamily: FONT }}>
              {Object.keys(groupedByRole).length} Role{Object.keys(groupedByRole).length !== 1 ? 's' : ''} Assigned
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 2, fontFamily: FONT }}>
              {assignments.length || epicTasks.length} total tasks distributed
            </p>
          </div>
        </div>
      </div>

      {/* Role Groups */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 24 }}>
        {Object.entries(groupedByRole).map(([role, roleTasks]) => {
          const config = getRoleConfig(role);
          const IconComponent = config.icon;

          return (
            <div
              key={role}
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '24px',
                border: '1px solid #e5e5e5',
                borderLeft: `4px solid ${config.accent}`,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Role Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ padding: 10, background: `${config.accent}18`, borderRadius: 10 }}>
                  <IconComponent style={{ width: 20, height: 20, color: config.accent }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 19, fontWeight: 600, color: config.accent, margin: 0, letterSpacing: '-0.01em', fontFamily: FONT }}>
                    {role}
                  </h4>
                  <p style={{ fontSize: 19, color: '#555', marginTop: 2, fontFamily: FONT }}>
                    {roleTasks.length} task{roleTasks.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Task Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roleTasks.map((task, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8f8f8',
                      border: '1px solid #e5e5e5',
                      borderRadius: 12,
                      padding: '14px 16px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: 9999,
                          fontSize: 16,
                          fontWeight: 600,
                          background: '#c8ff00',
                          color: '#111',
                          flexShrink: 0,
                          marginTop: 1,
                          letterSpacing: '0.01em',
                          fontFamily: FONT,
                        }}
                      >
                        {task.id}
                      </span>
                      <p style={{ fontSize: 16, color: '#111', lineHeight: 1.5, margin: 0, fontFamily: FONT }}>
                        {task.description.substring(0, 100)}
                        {task.description.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
