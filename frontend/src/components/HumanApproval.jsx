import React, { useState } from 'react';
import {
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Loader2,
  Target,
  ListChecks,
} from 'lucide-react';

export default function HumanApproval({ epicData, onApprove, loading }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const epic = epicData?.epic || epicData;
  const goal = epic?.goal || epic?.description || 'No goal specified';
  const tasks = epic?.tasks || [];

  const handleApprove = () => {
    onApprove(true, null);
  };

  const handleReject = () => {
    if (showFeedback && feedback.trim()) {
      onApprove(false, feedback.trim());
    } else {
      setShowFeedback(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center p-3.5 rounded-2xl mb-5"
          style={{ background: 'rgba(255, 159, 10, 0.12)' }}
        >
          <UserCheck className="w-8 h-8" style={{ color: '#ff9f0a' }} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#f5f5f7' }}>
          Human Approval
        </h2>
        <p className="text-base font-light" style={{ color: '#86868b' }}>
          Review the epic and decide whether to approve or request changes
        </p>
      </div>

      {/* Epic Summary Card */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Goal */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <Target className="w-4 h-4" style={{ color: '#0071e3' }} />
            <span className="text-sm font-medium" style={{ color: '#86868b' }}>Goal</span>
          </div>
          <p className="leading-relaxed" style={{ color: '#f5f5f7' }}>{goal}</p>
        </div>

        {/* Tasks Summary */}
        <div
          className="pt-6"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <ListChecks className="w-4 h-4" style={{ color: '#0071e3' }} />
            <span className="text-sm font-medium" style={{ color: '#86868b' }}>
              Tasks ({tasks.length})
            </span>
          </div>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {tasks.map((task, idx) => (
              <div
                key={task.id || idx}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(0, 0, 0, 0.3)' }}
              >
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(0, 113, 227, 0.12)',
                    color: '#0071e3',
                  }}
                >
                  {task.id || `T-${idx + 1}`}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: '#86868b' }}>
                  {task.description || task.title || 'No description'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback area (shown on reject) */}
      {showFeedback && (
        <div
          className="rounded-2xl p-8 animate-fade-in"
          style={{
            background: 'rgba(28, 28, 30, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <MessageSquare className="w-4 h-4" style={{ color: '#86868b' }} />
            <span className="text-sm font-medium" style={{ color: '#f5f5f7' }}>
              Feedback
            </span>
          </div>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Explain what needs to change..."
            className="w-full rounded-xl px-5 py-4 text-sm resize-none transition-all duration-200 focus:outline-none"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f5f5f7',
              caretColor: '#0071e3',
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid rgba(0, 113, 227, 0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
              e.target.style.boxShadow = 'none';
            }}
            disabled={loading}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleReject}
          disabled={loading || (showFeedback && !feedback.trim())}
          className="inline-flex items-center gap-2 px-7 py-3 font-medium rounded-full transition-all duration-200 disabled:opacity-40"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f5f5f7',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {loading && showFeedback ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ThumbsDown className="w-4 h-4" />
              {showFeedback ? 'Submit Feedback' : 'Request Changes'}
            </>
          )}
        </button>
        <button
          onClick={handleApprove}
          disabled={loading}
          className="inline-flex items-center gap-2 px-7 py-3 text-white font-medium rounded-full transition-all duration-200 disabled:opacity-40"
          style={{
            background: loading ? '#333' : '#30d158',
            color: loading ? '#666' : '#ffffff',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#34d65c';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#30d158';
          }}
        >
          {loading && !showFeedback ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <ThumbsUp className="w-4 h-4" />
              Approve
            </>
          )}
        </button>
      </div>

      {/* Status hint */}
      <p className="text-center text-xs" style={{ color: '#48484a' }}>
        Approving will proceed to DAG visualization and task assignment
      </p>
    </div>
  );
}
