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

function getScoreColor(score) {
  if (score >= 95) return { bar: 'bg-[#30d158]', text: 'text-[#30d158]', bg: 'bg-[#30d158]/10' };
  if (score >= 90) return { bar: 'bg-[#ff9f0a]', text: 'text-[#ff9f0a]', bg: 'bg-[#ff9f0a]/10' };
  return { bar: 'bg-[#ff453a]', text: 'text-[#ff453a]', bg: 'bg-[#ff453a]/10' };
}

function getOverallColor(passed) {
  return passed
    ? { badge: 'bg-[#30d158]/15 text-[#30d158] border-[#30d158]/25', icon: 'text-[#30d158]' }
    : { badge: 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/25', icon: 'text-[#ff453a]' };
}

function getTriggerLabel(trigger) {
  switch (trigger) {
    case 'auto_generate': return 'Auto (Generate)';
    case 'replan': return 'Replan';
    case 'manual': return 'Manual';
    default: return trigger;
  }
}

function getTriggerColor(trigger) {
  switch (trigger) {
    case 'auto_generate': return 'bg-[#0071e3]/15 text-[#409cff] border-[#0071e3]/20';
    case 'replan': return 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/20';
    case 'manual': return 'bg-[#bf5af2]/15 text-[#bf5af2] border-[#bf5af2]/20';
    default: return 'bg-white/5 text-[#86868b] border-white/10';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#f5f5f7]">Validation Results</h2>
          <p className="text-[#86868b] text-sm mt-2">
            SPOQ quality metrics assessment
            {historyCount > 1 && (
              <span className="ml-2 text-[#0071e3]">
                ({historyCount} attempts recorded)
              </span>
            )}
          </p>
        </div>
        {passed && (
          <button
            onClick={onProceed}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#1c1c1e] disabled:text-[#86868b] text-white font-medium rounded-full transition-all duration-300"
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

      {/* Overall Score Card */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${passed ? 'bg-[#30d158]/10' : 'bg-[#ff453a]/10'}`}>
              {passed ? (
                <ShieldCheck className={`w-9 h-9 ${overallColors.icon}`} />
              ) : (
                <ShieldAlert className={`w-9 h-9 ${overallColors.icon}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold tracking-tight text-[#f5f5f7]">
                  {averageScore.toFixed(1)}
                </span>
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${overallColors.badge}`}
                >
                  {passed ? 'PASS' : 'FAIL'}
                </span>
                {/* Show delta from previous attempt */}
                {previousEntry && (() => {
                  const delta = getScoreDelta(averageScore, previousEntry.average);
                  if (!delta) return null;
                  return (
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${delta > 0 ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                      {delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[#86868b] text-sm mt-2">
                Average Score across all metrics
              </p>
            </div>
          </div>
          {historyCount > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-[#86868b]">
                <History className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Attempt #{historyCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replanning Action */}
      {!passed && (
        <div className="glass rounded-2xl p-6 flex items-center justify-between border-[#ff9f0a]/20 animate-fade-in" style={{ borderColor: 'rgba(255, 159, 10, 0.15)' }}>
          <div className="flex items-center gap-4">
            <RefreshCw className={`w-5 h-5 text-[#ff9f0a] ${loading ? 'animate-spin' : ''}`} />
            <div>
              <p className="text-[#ff9f0a] font-medium">Replanning Required</p>
              <p className="text-[#86868b] text-sm mt-0.5">
                One or more metrics scored below threshold. Trigger a replan to improve the epic.
                {historyCount > 1 && ' Full history will be used as feedback.'}
              </p>
            </div>
          </div>
          <button
            onClick={onReplan}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff9f0a] hover:bg-[#ffb340] disabled:bg-[#1c1c1e] disabled:text-[#86868b] text-black font-medium rounded-full transition-all duration-300 flex-shrink-0 ml-4"
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
        <div className="glass rounded-2xl p-6 animate-fade-in" style={{ borderColor: 'rgba(255, 69, 58, 0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#ff453a]" />
            <p className="text-[#ff453a] font-medium text-sm">Recurring Weak Areas</p>
          </div>
          <p className="text-[#86868b] text-sm mb-3">
            These metrics have failed in 2 or more attempts and need special attention:
          </p>
          <div className="flex flex-wrap gap-2">
            {recurringWeakMetrics.map((metric) => (
              <span
                key={metric}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20"
              >
                {metric.replace(/_/g, ' ')} ({weakMetricCounts[metric]}x)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Individual Metrics */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-[#0071e3]/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-[#0071e3]" />
          </div>
          <h3 className="text-lg font-semibold text-[#f5f5f7]">Detailed Metrics</h3>
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
                className={`glass rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.04] ${
                  isRecurringWeak ? '!border-[#ff453a]/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#f5f5f7] capitalize">
                      {metric.replace(/_/g, ' ')}
                    </span>
                    {isRecurringWeak && (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#ff453a]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {delta != null && (
                      <span className={`text-xs font-medium ${delta > 0 ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </span>
                    )}
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ease-out ${colors.bar}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
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
            className="flex items-center gap-3 mb-5 group"
          >
            <div className="p-2.5 bg-white/[0.05] rounded-xl group-hover:bg-white/[0.08] transition-colors duration-300">
              <History className="w-5 h-5 text-[#86868b]" />
            </div>
            <h3 className="text-lg font-semibold text-[#f5f5f7]">
              Validation History ({historyCount} attempts)
            </h3>
            {historyExpanded
              ? <ChevronUp className="w-4 h-4 text-[#86868b]" />
              : <ChevronDown className="w-4 h-4 text-[#86868b]" />
            }
          </button>

          {historyExpanded && (
            <div className="relative pl-6 space-y-4 animate-fade-in">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.08]" />

              {validationHistory.map((entry, idx) => {
                const isLatest = idx === historyCount - 1;
                const entryScores = entry.metrics || {};
                const entryAvg = entry.average ?? 0;
                const prevEntry = idx > 0 ? validationHistory[idx - 1] : null;
                const avgDelta = prevEntry ? getScoreDelta(entryAvg, prevEntry.average) : null;

                return (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-6 top-3 w-2.5 h-2.5 rounded-full border-2 ${
                      entry.passed
                        ? 'bg-[#30d158] border-[#30d158]/60'
                        : isLatest
                        ? 'bg-[#ff453a] border-[#ff453a]/60 animate-pulse'
                        : 'bg-[#86868b]/40 border-[#86868b]/30'
                    }`} />

                    <div className={`glass rounded-2xl p-5 ${
                      isLatest ? '!border-[#0071e3]/20' : ''
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#f5f5f7]">
                            Attempt #{entry.attempt_number}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTriggerColor(entry.trigger)}`}>
                            {getTriggerLabel(entry.trigger)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            entry.passed
                              ? 'bg-[#30d158]/15 text-[#30d158] border-[#30d158]/20'
                              : 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/20'
                          }`}>
                            {entry.passed ? 'PASS' : 'FAIL'}
                          </span>
                          {isLatest && (
                            <span className="text-xs text-[#0071e3] font-medium">(current)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          {avgDelta != null && (
                            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${avgDelta > 0 ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
                              {avgDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)}
                            </span>
                          )}
                          <span className="text-sm font-bold text-[#f5f5f7]">
                            {entryAvg.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Compact metric bars */}
                      <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {Object.entries(entryScores).map(([metric, score]) => {
                          const colors = getScoreColor(score);
                          return (
                            <div key={metric} className="group/metric relative">
                              <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${colors.bar}`}
                                  style={{ width: `${Math.min(score, 100)}%` }}
                                />
                              </div>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/metric:block z-10">
                                <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#f5f5f7] whitespace-nowrap shadow-xl">
                                  {metric.replace(/_/g, ' ')}: {score}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Low metrics and feedback */}
                      {entry.low_metrics && Object.keys(entry.low_metrics).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {Object.entries(entry.low_metrics).map(([metric, score]) => (
                            <span key={metric} className="text-xs px-2.5 py-1 bg-[#ff453a]/10 text-[#ff453a] rounded-full border border-[#ff453a]/15">
                              {metric.replace(/_/g, ' ')}: {score}
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.created_at && (
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-[#86868b]">
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
