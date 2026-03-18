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

const ROLE_CONFIG = {
  'UI/UX Engineer': {
    bg: 'bg-pink-600/20',
    border: 'border-pink-500/30',
    text: 'text-pink-300',
    badge: 'bg-pink-600',
    dot: 'bg-pink-500',
    icon: Palette,
    accent: '#ec4899',
  },
  'Frontend Engineer': {
    bg: 'bg-blue-600/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    badge: 'bg-blue-600',
    dot: 'bg-blue-500',
    icon: Monitor,
    accent: '#3b82f6',
  },
  'Backend Engineer': {
    bg: 'bg-green-600/20',
    border: 'border-green-500/30',
    text: 'text-green-300',
    badge: 'bg-green-600',
    dot: 'bg-green-500',
    icon: Server,
    accent: '#22c55e',
  },
  'Data Engineer': {
    bg: 'bg-yellow-600/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    badge: 'bg-yellow-600',
    dot: 'bg-yellow-500',
    icon: Database,
    accent: '#eab308',
  },
  'DevOps Engineer': {
    bg: 'bg-orange-600/20',
    border: 'border-orange-500/30',
    text: 'text-orange-300',
    badge: 'bg-orange-600',
    dot: 'bg-orange-500',
    icon: Cloud,
    accent: '#f97316',
  },
  'ML Engineer': {
    bg: 'bg-purple-600/20',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    badge: 'bg-purple-600',
    dot: 'bg-purple-500',
    icon: Cpu,
    accent: '#a855f7',
  },
  'Test Engineer': {
    bg: 'bg-cyan-600/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    badge: 'bg-cyan-600',
    dot: 'bg-cyan-500',
    icon: TestTube,
    accent: '#06b6d4',
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
      accent: '#64748b',
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
        accent: '#64748b',
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
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
            Role Assignments
          </h2>
          <p style={{ color: '#86868b', fontSize: 15, marginTop: 6, fontWeight: 400 }}>
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
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, background: 'rgba(0,113,227,0.12)', borderRadius: 14 }}>
            <Users style={{ width: 22, height: 22, color: '#0071e3' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f7', margin: 0, letterSpacing: '-0.01em' }}>
              {Object.keys(groupedByRole).length} Role{Object.keys(groupedByRole).length !== 1 ? 's' : ''} Assigned
            </h3>
            <p style={{ color: '#86868b', fontSize: 14, marginTop: 2 }}>
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
                background: '#111',
                borderRadius: 20,
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `3px solid ${config.accent}`,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Role Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ padding: 10, background: `${config.accent}18`, borderRadius: 12 }}>
                  <IconComponent style={{ width: 20, height: 20, color: config.accent }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 17, fontWeight: 600, color: config.accent, margin: 0, letterSpacing: '-0.01em' }}>
                    {role}
                  </h4>
                  <p style={{ fontSize: 13, color: '#86868b', marginTop: 2 }}>
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
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14,
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
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'rgba(255,255,255,0.06)',
                          color: '#f5f5f7',
                          flexShrink: 0,
                          marginTop: 1,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {task.id}
                      </span>
                      <p style={{ fontSize: 14, color: '#f5f5f7', lineHeight: 1.5, margin: 0, opacity: 0.8 }}>
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
