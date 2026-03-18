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
          className="inline-flex items-center justify-center p-3.5 mb-5"
          style={{
            borderRadius: '16px',
            background: 'rgba(200, 255, 0, 0.15)',
          }}
        >
          <UserCheck className="w-8 h-8" style={{ color: '#c8ff00' }} />
        </div>
        <h2
          className="text-5xl font-bold tracking-tight mb-2"
          style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111', fontWeight: 700 }}
        >
          Human Approval
        </h2>
        <p className="text-base" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#555555', fontWeight: 400 }}>
          Review the epic and decide whether to approve or request changes
        </p>
      </div>

      {/* Epic Summary Card — DARK */}
      <div
        className="p-8"
        style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Goal */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <Target className="w-4 h-4" style={{ color: '#c8ff00' }} />
            <span className="text-sm font-medium" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: 'rgba(255, 255, 255, 0.7)' }}>Goal</span>
          </div>
          <p className="leading-relaxed" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#ffffff' }}>{goal}</p>
        </div>

        {/* Tasks Summary */}
        <div
          className="pt-6"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <ListChecks className="w-4 h-4" style={{ color: '#c8ff00' }} />
            <span className="text-sm font-medium" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: 'rgba(255, 255, 255, 0.7)' }}>
              Tasks ({tasks.length})
            </span>
          </div>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {tasks.map((task, idx) => (
              <div
                key={task.id || idx}
                className="flex items-start gap-3 p-3"
                style={{
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span
                  className="inline-flex items-center px-2.5 py-0.5 text-sm font-bold flex-shrink-0 mt-0.5"
                  style={{
                    borderRadius: '9999px',
                    background: '#c8ff00',
                    color: '#111111',
                  }}
                >
                  {task.id || `T-${idx + 1}`}
                </span>
                <span className="text-sm leading-relaxed" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#ffffff' }}>
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
          className="p-8 animate-fade-in"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e5e5',
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <MessageSquare className="w-4 h-4" style={{ color: '#555555' }} />
            <span className="text-sm font-medium" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111' }}>
              Feedback
            </span>
          </div>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Explain what needs to change..."
            className="w-full px-5 py-4 text-sm resize-none transition-all duration-200 focus:outline-none"
            style={{
              fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              color: '#111111',
              caretColor: '#c8ff00',
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #c8ff00';
              e.target.style.boxShadow = '0 0 0 3px rgba(200, 255, 0, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #e5e5e5';
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
          className="inline-flex items-center gap-2 px-7 py-3 font-medium transition-all duration-200 disabled:opacity-40"
          style={{
            fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
            borderRadius: '9999px',
            background: 'transparent',
            border: '2px solid #111111',
            color: '#111111',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = '#111111';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#111111';
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
      <p className="text-center text-sm" style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#555555' }}>
        Approving will proceed to DAG visualization and task assignment
      </p>
    </div>
  );
}
