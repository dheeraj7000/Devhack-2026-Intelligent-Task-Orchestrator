import React from 'react';
import {
  Target,
  ListChecks,
  ArrowRight,
  CheckSquare,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export default function EpicDisplay({ epicData, onValidate, loading }) {
  if (!epicData) return null;

  const epic = epicData.epic || epicData;
  const goal = epic.goal || epic.description || 'No goal specified';
  const tasks = epic.tasks || [];
  const successCriteria = epic.success_criteria || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111', fontWeight: 700 }}
          >
            Generated Epic
          </h2>
          <p className="text-sm mt-1.5" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#555555', fontWeight: 400 }}>
            Review the AI-generated task breakdown
          </p>
        </div>
        <button
          onClick={onValidate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-7 py-3 font-bold transition-all duration-200 disabled:opacity-40"
          style={{
            fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
            borderRadius: '9999px',
            background: loading ? '#e5e5e5' : '#c8ff00',
            color: '#111111',
            fontWeight: 700,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#b8ee00';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(200, 255, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#c8ff00';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              Validate Epic
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Goal Card — DARK */}
      <div
        className="p-8"
        style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2.5"
            style={{
              borderRadius: '12px',
              background: 'rgba(200, 255, 0, 0.15)',
            }}
          >
            <Target className="w-5 h-5" style={{ color: '#c8ff00' }} />
          </div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#ffffff', fontWeight: 700 }}>Goal</h3>
        </div>
        <p className="leading-relaxed text-base" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#ffffff' }}>{goal}</p>
      </div>

      {/* Tasks Grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2.5"
            style={{
              borderRadius: '12px',
              background: 'rgba(200, 255, 0, 0.15)',
            }}
          >
            <ListChecks className="w-5 h-5" style={{ color: '#c8ff00' }} />
          </div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111', fontWeight: 700 }}>
            Tasks ({tasks.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task, idx) => (
            <div
              key={task.id || idx}
              className="p-6 transition-all duration-300"
              style={{
                borderRadius: '16px',
                background: '#ffffff',
                border: '1px solid #e5e5e5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = '#c8ff00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="inline-flex items-center px-3 py-1 text-sm font-bold"
                  style={{
                    borderRadius: '9999px',
                    background: '#c8ff00',
                    color: '#111111',
                  }}
                >
                  {task.id || `T-${idx + 1}`}
                </span>
                {task.role && (
                  <span
                    className="text-sm px-2.5 py-1 font-medium"
                    style={{
                      borderRadius: '9999px',
                      background: '#1a1a2e',
                      color: '#ffffff',
                    }}
                  >
                    {task.role}
                  </span>
                )}
              </div>
              <p className="text-sm mt-2 leading-relaxed" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111', fontWeight: 400 }}>
                {task.description || task.title || 'No description'}
              </p>

              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid #e5e5e5' }}
                >
                  <div className="flex items-center gap-1.5 text-sm mb-2" style={{ color: '#555555' }}>
                    <ArrowRight className="w-3 h-3" />
                    <span style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>Depends on:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {task.dependencies.map((dep, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-sm px-2.5 py-1"
                        style={{
                          borderRadius: '9999px',
                          background: '#e5e5e5',
                          color: '#111111',
                          fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
                        }}
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Success Criteria */}
      {successCriteria.length > 0 && (
        <div
          className="p-8"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e5e5',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="p-2.5"
              style={{
                borderRadius: '12px',
                background: 'rgba(200, 255, 0, 0.15)',
              }}
            >
              <CheckSquare className="w-5 h-5" style={{ color: '#c8ff00' }} />
            </div>
            <h3 className="text-xl font-semibold" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111', fontWeight: 700 }}>
              Success Criteria
            </h3>
          </div>
          <ul className="space-y-3">
            {successCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div
                  className="mt-1.5 w-2.5 h-2.5 flex-shrink-0"
                  style={{ borderRadius: '9999px', background: '#c8ff00' }}
                />
                <span className="text-sm leading-relaxed" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111', fontWeight: 400 }}>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
