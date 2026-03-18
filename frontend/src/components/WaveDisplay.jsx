import React from 'react';
import { Waves, RotateCcw, ArrowDown, Zap } from 'lucide-react';

const ROLE_COLORS = {
  'UI/UX Engineer': { bg: 'bg-pink-600/20', border: 'border-pink-500/30', text: 'text-pink-300', dot: 'bg-pink-500', accent: '#ec4899' },
  'Frontend Engineer': { bg: 'bg-blue-600/20', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-500', accent: '#3b82f6' },
  'Backend Engineer': { bg: 'bg-green-600/20', border: 'border-green-500/30', text: 'text-green-300', dot: 'bg-green-500', accent: '#22c55e' },
  'Data Engineer': { bg: 'bg-yellow-600/20', border: 'border-yellow-500/30', text: 'text-yellow-300', dot: 'bg-yellow-500', accent: '#eab308' },
  'DevOps Engineer': { bg: 'bg-orange-600/20', border: 'border-orange-500/30', text: 'text-orange-300', dot: 'bg-orange-500', accent: '#f97316' },
  'ML Engineer': { bg: 'bg-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-500', accent: '#a855f7' },
  'Test Engineer': { bg: 'bg-cyan-600/20', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-500', accent: '#06b6d4' },
};

function getRoleColors(role) {
  if (!role) return { bg: 'bg-slate-600/20', border: 'border-slate-500/30', text: 'text-slate-300', dot: 'bg-slate-500', accent: '#64748b' };
  const key = Object.keys(ROLE_COLORS).find((k) =>
    role.toLowerCase().includes(k.toLowerCase().split(' ')[0].toLowerCase())
  );
  return key ? ROLE_COLORS[key] : { bg: 'bg-slate-600/20', border: 'border-slate-500/30', text: 'text-slate-300', dot: 'bg-slate-500', accent: '#64748b' };
}

export default function WaveDisplay({ wavesData, epicData, onReset }) {
  const waves = wavesData?.waves || [];
  const epic = epicData?.epic || epicData;
  const tasks = epic?.tasks || [];

  // Build a task lookup
  const taskMap = {};
  tasks.forEach((t, idx) => {
    taskMap[t.id || `T-${idx + 1}`] = t;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
            Execution Waves
          </h2>
          <p style={{ color: '#86868b', fontSize: 15, marginTop: 6, fontWeight: 400 }}>
            Parallel execution plan with wave-based scheduling
          </p>
        </div>
        <button
          onClick={onReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            backgroundColor: 'transparent',
            color: '#f5f5f7',
            fontWeight: 500,
            fontSize: 15,
            borderRadius: 980,
            border: '1.5px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '-0.01em',
          }}
        >
          <RotateCcw style={{ width: 16, height: 16 }} />
          Start Over
        </button>
      </div>

      {/* Summary Card */}
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
            <Waves style={{ width: 22, height: 22, color: '#0071e3' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f7', margin: 0, letterSpacing: '-0.01em' }}>
              {waves.length} Wave{waves.length !== 1 ? 's' : ''} Computed
            </h3>
            <p style={{ color: '#86868b', fontSize: 14, marginTop: 2 }}>
              Tasks within the same wave can execute in parallel
            </p>
          </div>
        </div>
      </div>

      {/* Waves */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {waves.map((wave, waveIdx) => {
          const waveTasks = wave.tasks || wave.task_ids || wave || [];
          const waveNumber = wave.wave_number ?? wave.wave ?? waveIdx + 1;

          return (
            <React.Fragment key={waveIdx}>
              {/* Wave connector */}
              {waveIdx > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 1, height: 16, borderLeft: '2px dashed rgba(255,255,255,0.12)' }} />
                    <ArrowDown style={{ width: 16, height: 16, color: '#86868b', margin: '2px 0' }} />
                    <div style={{ width: 1, height: 16, borderLeft: '2px dashed rgba(255,255,255,0.12)' }} />
                  </div>
                </div>
              )}

              {/* Wave Lane */}
              <div
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  padding: '24px 28px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: 'rgba(0,113,227,0.12)',
                      color: '#0071e3',
                      fontSize: 15,
                      fontWeight: 700,
                      border: '1px solid rgba(0,113,227,0.2)',
                    }}
                  >
                    {waveNumber}
                  </span>
                  <div>
                    <h4 style={{ fontSize: 17, fontWeight: 600, color: '#f5f5f7', margin: 0, letterSpacing: '-0.01em' }}>
                      Wave {waveNumber}
                    </h4>
                    <p style={{ fontSize: 13, color: '#86868b', marginTop: 2 }}>
                      {(Array.isArray(waveTasks) ? waveTasks : []).length} task
                      {(Array.isArray(waveTasks) ? waveTasks : []).length !== 1 ? 's' : ''} in parallel
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap style={{ width: 14, height: 14, color: '#0071e3' }} />
                    <span style={{ fontSize: 13, color: '#0071e3', fontWeight: 500 }}>Parallel</span>
                  </div>
                </div>

                {/* Task Cards in the Wave */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {(Array.isArray(waveTasks) ? waveTasks : []).map((taskItem, tIdx) => {
                    const taskId = typeof taskItem === 'string' ? taskItem : taskItem.id || taskItem.task_id || `T-${tIdx + 1}`;
                    const taskInfo = taskMap[taskId] || (typeof taskItem === 'object' ? taskItem : {});
                    const role = taskInfo.role || taskItem?.role || null;
                    const description = taskInfo.description || taskInfo.title || taskItem?.description || taskId;
                    const colors = getRoleColors(role);

                    return (
                      <div
                        key={tIdx}
                        style={{
                          flex: '1 1 220px',
                          maxWidth: 380,
                          background: 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderLeft: `3px solid ${colors.accent}`,
                          borderRadius: 16,
                          padding: '16px 18px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: colors.accent, letterSpacing: '0.01em' }}>
                            {taskId}
                          </span>
                          {role && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.accent }} />
                              <span style={{ fontSize: 11, color: '#86868b', fontWeight: 400 }}>{role}</span>
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: '#f5f5f7', lineHeight: 1.5, margin: 0, opacity: 0.75 }}>
                          {description.substring(0, 80)}
                          {description.length > 80 ? '...' : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Completion Message */}
      {waves.length > 0 && (
        <div
          style={{
            background: 'rgba(48,209,88,0.06)',
            border: '1px solid rgba(48,209,88,0.15)',
            borderRadius: 20,
            padding: '32px 28px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 14,
              background: 'rgba(48,209,88,0.1)',
              borderRadius: 18,
              marginBottom: 16,
            }}
          >
            <Zap style={{ width: 28, height: 28, color: '#30d158' }} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#30d158', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
            Orchestration Complete
          </h3>
          <p style={{ color: 'rgba(48,209,88,0.6)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
            All tasks have been planned, validated, assigned, and scheduled into execution waves.
          </p>
        </div>
      )}
    </div>
  );
}
