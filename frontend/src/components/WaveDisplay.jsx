import React from 'react';
import { Waves, RotateCcw, ArrowDown, Zap } from 'lucide-react';

const FONT = "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif";

const ROLE_COLORS = {
  'UI/UX Engineer': { bg: 'bg-pink-600/20', border: 'border-pink-500/30', text: 'text-pink-300', dot: 'bg-pink-500', accent: '#e06b9e' },
  'Frontend Engineer': { bg: 'bg-blue-600/20', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-500', accent: '#5ba3d9' },
  'Backend Engineer': { bg: 'bg-green-600/20', border: 'border-green-500/30', text: 'text-green-300', dot: 'bg-green-500', accent: '#4caf7c' },
  'Data Engineer': { bg: 'bg-yellow-600/20', border: 'border-yellow-500/30', text: 'text-yellow-300', dot: 'bg-yellow-500', accent: '#e8a83e' },
  'DevOps Engineer': { bg: 'bg-orange-600/20', border: 'border-orange-500/30', text: 'text-orange-300', dot: 'bg-orange-500', accent: '#47b5a0' },
  'ML Engineer': { bg: 'bg-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-500', accent: '#9b7ed6' },
  'Test Engineer': { bg: 'bg-cyan-600/20', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-500', accent: '#e07850' },
};

function getRoleColors(role) {
  if (!role) return { bg: 'bg-slate-600/20', border: 'border-slate-500/30', text: 'text-slate-300', dot: 'bg-slate-500', accent: '#888888' };
  const key = Object.keys(ROLE_COLORS).find((k) =>
    role.toLowerCase().includes(k.toLowerCase().split(' ')[0].toLowerCase())
  );
  return key ? ROLE_COLORS[key] : { bg: 'bg-slate-600/20', border: 'border-slate-500/30', text: 'text-slate-300', dot: 'bg-slate-500', accent: '#888888' };
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
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2, fontFamily: FONT }}>
            Execution Waves
          </h2>
          <p style={{ color: '#111', fontSize: 19, marginTop: 6, fontWeight: 400, fontFamily: FONT }}>
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
            color: '#111',
            fontWeight: 600,
            fontSize: 19,
            borderRadius: 9999,
            border: '2px solid #111',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '-0.01em',
            fontFamily: FONT,
          }}
        >
          <RotateCcw style={{ width: 16, height: 16 }} />
          Start Over
        </button>
      </div>

      {/* Summary Card */}
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
            <Waves style={{ width: 22, height: 22, color: '#c8ff00' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '-0.01em', fontFamily: FONT }}>
              {waves.length} Wave{waves.length !== 1 ? 's' : ''} Computed
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 2, fontFamily: FONT }}>
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
                    <div style={{ width: 1, height: 16, borderLeft: '2px dashed #e5e5e5' }} />
                    <ArrowDown style={{ width: 16, height: 16, color: '#bbb', margin: '2px 0' }} />
                    <div style={{ width: 1, height: 16, borderLeft: '2px dashed #e5e5e5' }} />
                  </div>
                </div>
              )}

              {/* Wave Lane */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 16,
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
                      borderRadius: 8,
                      background: '#c8ff00',
                      color: '#111',
                      fontSize: 19,
                      fontWeight: 700,
                      fontFamily: FONT,
                    }}
                  >
                    {waveNumber}
                  </span>
                  <div>
                    <h4 style={{ fontSize: 19, fontWeight: 600, color: '#111', margin: 0, letterSpacing: '-0.01em', fontFamily: FONT }}>
                      Wave {waveNumber}
                    </h4>
                    <p style={{ fontSize: 19, color: '#111', marginTop: 2, fontFamily: FONT }}>
                      {(Array.isArray(waveTasks) ? waveTasks : []).length} task
                      {(Array.isArray(waveTasks) ? waveTasks : []).length !== 1 ? 's' : ''} in parallel
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap style={{ width: 14, height: 14, color: '#c8ff00' }} />
                    <span style={{ fontSize: 19, color: '#c8ff00', fontWeight: 500, fontFamily: FONT }}>Parallel</span>
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
                          background: '#f8f8f8',
                          border: '1px solid #e5e5e5',
                          borderLeft: `4px solid ${colors.accent}`,
                          borderRadius: 12,
                          padding: '16px 18px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 19, fontWeight: 700, color: colors.accent, letterSpacing: '0.01em', fontFamily: FONT }}>
                            {taskId}
                          </span>
                          {role && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.accent }} />
                              <span style={{ fontSize: 19, color: colors.accent, fontWeight: 400, fontFamily: FONT }}>{role}</span>
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: 19, color: '#111', lineHeight: 1.5, margin: 0, fontFamily: FONT }}>
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
            background: 'rgba(200,255,0,0.1)',
            border: '1px solid rgba(200,255,0,0.25)',
            borderRadius: 16,
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
              background: 'rgba(200,255,0,0.15)',
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Zap style={{ width: 28, height: 28, color: '#c8ff00' }} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a2e', margin: '0 0 6px 0', letterSpacing: '-0.01em', fontFamily: FONT }}>
            Orchestration Complete
          </h3>
          <p style={{ color: '#1a1a2e', fontSize: 19, margin: 0, lineHeight: 1.5, fontFamily: FONT }}>
            All tasks have been planned, validated, assigned, and scheduled into execution waves.
          </p>
        </div>
      )}
    </div>
  );
}
