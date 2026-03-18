import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const fontFamily = "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif";

function getScoreColor(score) {
  if (score >= 95) return { bar: '#22c55e', text: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
  if (score >= 90) return { bar: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
  return { bar: '#ef4444', text: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
}

function getOverallColor(passed) {
  return passed
    ? { badge: { backgroundColor: '#c8ff00', color: '#111' }, icon: '#22c55e' }
    : { badge: { backgroundColor: '#ef4444', color: '#fff' }, icon: '#ef4444' };
}

function getTriggerLabel(trigger) {
  switch (trigger) {
    case 'auto_generate': return 'Auto (Generate)';
    case 'replan': return 'Replan';
    case 'manual': return 'Manual';
    default: return trigger;
  }
}

function getTriggerStyle(trigger) {
  switch (trigger) {
    case 'auto_generate': return { backgroundColor: 'rgba(200,255,0,0.15)', color: '#111', border: '1px solid rgba(200,255,0,0.3)' };
    case 'replan': return { backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' };
    case 'manual': return { backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' };
    default: return { backgroundColor: '#f5f5f5', color: '#555', border: '1px solid #e5e5e5' };
  }
}

function getScoreDelta(current, previous) {
  if (!previous) return null;
  const delta = current - previous;
  if (Math.abs(delta) < 0.1) return null;
  return delta;
}

export default function ValidationScores({ validationData, validationHistory = [], onProceed, onReplan, loading }) {
  const [historyExpanded, setHistoryExpanded] = useState(false);

  if (!validationData) return null;

  const scores = validationData.scores || validationData.metrics || {};
  const passed = validationData.passed ?? false;
  const averageScore = validationData.average
    ?? (Object.values(scores).length > 0
      ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
      : 0);

  const overallColors = getOverallColor(passed);
  const historyCount = validationHistory.length;

  // Find recurring weak metrics across history
  const weakMetricCounts = {};
  validationHistory.forEach((entry) => {
    if (entry.low_metrics) {
      Object.keys(entry.low_metrics).forEach((k) => {
        weakMetricCounts[k] = (weakMetricCounts[k] || 0) + 1;
      });
    }
  });
  const recurringWeakMetrics = Object.entries(weakMetricCounts)
    .filter(([, count]) => count >= 2)
    .map(([metric]) => metric);

  // Get previous attempt's scores for delta comparison
  const previousEntry = historyCount >= 2 ? validationHistory[historyCount - 2] : null;
  const previousScores = previousEntry?.metrics || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily, fontSize: '34px', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>Validation Results</h2>
          <p style={{ fontFamily, color: '#555', fontSize: '20px', marginTop: '8px' }}>
            SPOQ quality metrics assessment
            {historyCount > 1 && (
              <span style={{ marginLeft: '8px', color: '#f59e0b' }}>
                ({historyCount} attempts recorded)
              </span>
            )}
          </p>
        </div>
        {passed && (
          <button
            onClick={onProceed}
            disabled={loading}
            style={{
              fontFamily,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: loading ? '#e5e5e5' : '#c8ff00',
              color: loading ? '#555' : '#111',
              fontWeight: 500,
              borderRadius: '9999px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              fontSize: '20px',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Approval
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Overall Score Card - DARK */}
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            }}>
              {passed ? (
                <ShieldCheck style={{ width: '36px', height: '36px', color: overallColors.icon }} />
              ) : (
                <ShieldAlert style={{ width: '36px', height: '36px', color: overallColors.icon }} />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily, fontSize: '52px', fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff' }}>
                  {averageScore.toFixed(1)}
                </span>
                <span style={{
                  ...overallColors.badge,
                  fontFamily,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '20px',
                  fontWeight: 600,
                  border: 'none',
                }}>
                  {passed ? 'PASS' : 'FAIL'}
                </span>
                {/* Show delta from previous attempt */}
                {previousEntry && (() => {
                  const delta = getScoreDelta(averageScore, previousEntry.average);
                  if (!delta) return null;
                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '20px', fontWeight: 500, color: delta > 0 ? '#22c55e' : '#ef4444' }}>
                      {delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  );
                })()}
              </div>
              <p style={{ fontFamily, color: 'rgba(255,255,255,0.7)', fontSize: '20px', marginTop: '8px' }}>
                Average Score across all metrics
              </p>
            </div>
          </div>
          {historyCount > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)' }}>
                <History className="w-4 h-4" />
                <span style={{ fontFamily, fontSize: '20px', fontWeight: 500 }}>
                  Attempt #{historyCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replanning Action */}
      {!passed && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #e5e5e5',
          borderLeft: '4px solid #f59e0b',
        }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} style={{ color: '#f59e0b' }} />
            <div>
              <p style={{ fontFamily, color: '#f59e0b', fontWeight: 500 }}>Replanning Required</p>
              <p style={{ fontFamily, color: '#555', fontSize: '20px', marginTop: '2px' }}>
                One or more metrics scored below threshold. Trigger a replan to improve the epic.
                {historyCount > 1 && ' Full history will be used as feedback.'}
              </p>
            </div>
          </div>
          <button
            onClick={onReplan}
            disabled={loading}
            style={{
              fontFamily,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: loading ? '#e5e5e5' : '#f59e0b',
              color: loading ? '#555' : '#111',
              fontWeight: 500,
              borderRadius: '9999px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              flexShrink: 0,
              marginLeft: '16px',
              fontSize: '20px',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Replanning...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Replan Epic
              </>
            )}
          </button>
        </div>
      )}

      {/* Recurring Weak Areas Warning */}
      {recurringWeakMetrics.length > 0 && !passed && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e5e5',
          borderLeft: '4px solid #f59e0b',
        }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            <p style={{ fontFamily, color: '#ef4444', fontWeight: 500, fontSize: '20px' }}>Recurring Weak Areas</p>
          </div>
          <p style={{ fontFamily, color: '#555', fontSize: '20px', marginBottom: '12px' }}>
            These metrics have failed in 2 or more attempts and need special attention:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {recurringWeakMetrics.map((metric) => (
              <span
                key={metric}
                style={{
                  fontFamily,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '20px',
                  fontWeight: 500,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                }}
              >
                {metric.replace(/_/g, ' ')} ({weakMetricCounts[metric]}x)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Individual Metrics */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(200,255,0,0.15)', borderRadius: '16px' }}>
            <TrendingUp style={{ width: '20px', height: '20px', color: '#111' }} />
          </div>
          <h3 style={{ fontFamily, fontSize: '20px', fontWeight: 600, color: '#111' }}>Detailed Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(scores).map(([metric, score]) => {
            const colors = getScoreColor(score);
            const prevScore = previousScores ? previousScores[metric] : null;
            const delta = prevScore != null ? getScoreDelta(score, prevScore) : null;
            const isRecurringWeak = recurringWeakMetrics.includes(metric);

            return (
              <div
                key={metric}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: isRecurringWeak ? '1px solid rgba(239,68,68,0.3)' : '1px solid #e5e5e5',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily, fontSize: '20px', fontWeight: 500, color: '#111', textTransform: 'capitalize' }}>
                      {metric.replace(/_/g, ' ')}
                    </span>
                    {isRecurringWeak && (
                      <AlertTriangle style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {delta != null && (
                      <span style={{ fontSize: '20px', fontWeight: 500, color: delta > 0 ? '#22c55e' : '#ef4444' }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </span>
                    )}
                    <span style={{ fontSize: '20px', fontWeight: 700, color: colors.text }}>
                      {score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div style={{ width: '100%', borderRadius: '9999px', height: '8px', backgroundColor: '#e5e5e5' }}>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '9999px',
                      transition: 'all 0.7s ease-out',
                      width: `${Math.min(score, 100)}%`,
                      backgroundColor: colors.bar,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation History Timeline */}
      {historyCount > 1 && (
        <div>
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div style={{ padding: '10px', backgroundColor: 'rgba(200,255,0,0.1)', borderRadius: '16px', transition: 'background-color 0.3s' }}>
              <History style={{ width: '20px', height: '20px', color: '#555' }} />
            </div>
            <h3 style={{ fontFamily, fontSize: '20px', fontWeight: 600, color: '#111' }}>
              Validation History ({historyCount} attempts)
            </h3>
            {historyExpanded
              ? <ChevronUp style={{ width: '16px', height: '16px', color: '#555' }} />
              : <ChevronDown style={{ width: '16px', height: '16px', color: '#555' }} />
            }
          </button>

          {historyExpanded && (
            <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '1px', backgroundColor: '#e5e5e5' }} />

              {validationHistory.map((entry, idx) => {
                const isLatest = idx === historyCount - 1;
                const entryScores = entry.metrics || {};
                const entryAvg = entry.average ?? 0;
                const prevEntry = idx > 0 ? validationHistory[idx - 1] : null;
                const avgDelta = prevEntry ? getScoreDelta(entryAvg, prevEntry.average) : null;

                const dotColor = entry.passed
                  ? '#22c55e'
                  : isLatest
                  ? '#ef4444'
                  : '#ccc';

                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '12px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '9999px',
                      backgroundColor: dotColor,
                      border: `2px solid ${dotColor}`,
                      ...(isLatest && !entry.passed ? { animation: 'pulse 2s infinite' } : {}),
                    }} />

                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '20px',
                      border: isLatest ? '1px solid rgba(245,158,11,0.3)' : '1px solid #e5e5e5',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily, fontSize: '20px', fontWeight: 600, color: '#111' }}>
                            Attempt #{entry.attempt_number}
                          </span>
                          <span style={{
                            ...getTriggerStyle(entry.trigger),
                            fontFamily,
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 10px',
                            borderRadius: '9999px',
                            fontSize: '20px',
                            fontWeight: 500,
                          }}>
                            {getTriggerLabel(entry.trigger)}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 10px',
                            borderRadius: '9999px',
                            fontSize: '20px',
                            fontWeight: 600,
                            backgroundColor: entry.passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: entry.passed ? '#22c55e' : '#ef4444',
                            border: entry.passed ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                          }}>
                            {entry.passed ? 'PASS' : 'FAIL'}
                          </span>
                          {isLatest && (
                            <span style={{ fontSize: '20px', color: '#f59e0b', fontWeight: 500 }}>(current)</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {avgDelta != null && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '20px', fontWeight: 500, color: avgDelta > 0 ? '#22c55e' : '#ef4444' }}>
                              {avgDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)}
                            </span>
                          )}
                          <span style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>
                            {entryAvg.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Compact metric bars */}
                      <div className="grid grid-cols-5 gap-1.5" style={{ marginBottom: '12px' }}>
                        {Object.entries(entryScores).map(([metric, score]) => {
                          const colors = getScoreColor(score);
                          return (
                            <div key={metric} className="group/metric" style={{ position: 'relative' }}>
                              <div style={{ width: '100%', borderRadius: '9999px', height: '6px', backgroundColor: '#e5e5e5' }}>
                                <div
                                  style={{
                                    height: '6px',
                                    borderRadius: '9999px',
                                    width: `${Math.min(score, 100)}%`,
                                    backgroundColor: colors.bar,
                                  }}
                                />
                              </div>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/metric:block z-10">
                                <div style={{
                                  backgroundColor: '#1a1a2e',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '20px',
                                  color: '#ffffff',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                }}>
                                  {metric.replace(/_/g, ' ')}: {score}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Low metrics and feedback */}
                      {entry.low_metrics && Object.keys(entry.low_metrics).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                          {Object.entries(entry.low_metrics).map(([metric, score]) => (
                            <span key={metric} style={{
                              fontFamily,
                              fontSize: '20px',
                              padding: '4px 10px',
                              backgroundColor: 'rgba(239,68,68,0.1)',
                              color: '#ef4444',
                              borderRadius: '9999px',
                              border: '1px solid rgba(239,68,68,0.15)',
                            }}>
                              {metric.replace(/_/g, ' ')}: {score}
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.created_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '20px', color: '#555' }}>
                          <Clock className="w-3 h-3" />
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
