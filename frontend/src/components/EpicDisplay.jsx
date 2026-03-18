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
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#f5f5f7' }}>
            Generated Epic
          </h2>
          <p className="text-sm mt-1.5" style={{ color: '#86868b' }}>
            Review the AI-generated task breakdown
          </p>
        </div>
        <button
          onClick={onValidate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-7 py-3 text-white font-medium rounded-full transition-all duration-200 disabled:opacity-40"
          style={{
            background: loading ? '#333' : '#0071e3',
            color: loading ? '#666' : '#ffffff',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#0077ed';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#0071e3';
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

      {/* Goal Card */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'rgba(0, 113, 227, 0.12)' }}
          >
            <Target className="w-5 h-5" style={{ color: '#0071e3' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#f5f5f7' }}>Goal</h3>
        </div>
        <p className="leading-relaxed text-base" style={{ color: '#86868b' }}>{goal}</p>
      </div>

      {/* Tasks Grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'rgba(0, 113, 227, 0.12)' }}
          >
            <ListChecks className="w-5 h-5" style={{ color: '#0071e3' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#f5f5f7' }}>
            Tasks ({tasks.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task, idx) => (
            <div
              key={task.id || idx}
              className="rounded-2xl p-6 transition-all duration-300"
              style={{
                background: 'rgba(28, 28, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.background = 'rgba(28, 28, 30, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.background = 'rgba(28, 28, 30, 0.6)';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(0, 113, 227, 0.12)',
                    color: '#0071e3',
                  }}
                >
                  {task.id || `T-${idx + 1}`}
                </span>
                {task.role && (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#86868b',
                    }}
                  >
                    {task.role}
                  </span>
                )}
              </div>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#86868b' }}>
                {task.description || task.title || 'No description'}
              </p>

              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
                >
                  <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: '#48484a' }}>
                    <ArrowRight className="w-3 h-3" />
                    <span>Depends on:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {task.dependencies.map((dep, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#86868b',
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
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(28, 28, 30, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'rgba(48, 209, 88, 0.12)' }}
            >
              <CheckSquare className="w-5 h-5" style={{ color: '#30d158' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#f5f5f7' }}>
              Success Criteria
            </h3>
          </div>
          <ul className="space-y-3">
            {successCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div
                  className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: '#30d158' }}
                />
                <span className="text-sm leading-relaxed" style={{ color: '#86868b' }}>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
