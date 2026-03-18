import React, { useState } from 'react';
import {
  FileCode2,
  ChevronRight,
  Loader2,
  Wrench,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const fontFamily = "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif";

export default function TechnicalRequirements({ epicData, onProceed, loading }) {
  const [expandedTask, setExpandedTask] = useState(null);

  const epic = epicData?.epic || epicData;
  const tasks = epic?.tasks || [];

  const enrichedCount = tasks.filter((t) => t.technical_details).length;
  const totalHours = tasks.reduce(
    (sum, t) => sum + (t.technical_details?.estimated_hours || 0),
    0
  );

  // Collect all unique tech stack items
  const allTech = new Set();
  tasks.forEach((t) => {
    (t.technical_details?.tech_stack || []).forEach((tech) => allTech.add(tech));
  });

  const toggleTask = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily, fontSize: '34px', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>Technical Requirements</h2>
          <p style={{ fontFamily, color: '#555', fontSize: '20px', marginTop: '8px' }}>
            Implementation details and tech stack per task
          </p>
        </div>
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
              Loading...
            </>
          ) : (
            <>
              View DAG
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Summary Cards - DARK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(200,255,0,0.15)', borderRadius: '12px' }}>
              <FileCode2 style={{ width: '20px', height: '20px', color: '#c8ff00' }} />
            </div>
            <span style={{ fontFamily, fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>Tasks Enriched</span>
          </div>
          <p style={{ fontFamily, fontSize: '34px', fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>
            {enrichedCount}
            <span style={{ fontFamily, fontSize: '20px', color: 'rgba(255,255,255,0.7)', fontWeight: 400, marginLeft: '6px' }}>/ {tasks.length}</span>
          </p>
        </div>

        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(200,255,0,0.15)', borderRadius: '12px' }}>
              <Clock style={{ width: '20px', height: '20px', color: '#c8ff00' }} />
            </div>
            <span style={{ fontFamily, fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>Total Estimated</span>
          </div>
          <p style={{ fontFamily, fontSize: '34px', fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>
            {totalHours.toFixed(1)}
            <span style={{ fontFamily, fontSize: '20px', color: 'rgba(255,255,255,0.7)', fontWeight: 400, marginLeft: '6px' }}>hours</span>
          </p>
        </div>

        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(200,255,0,0.15)', borderRadius: '12px' }}>
              <Code2 style={{ width: '20px', height: '20px', color: '#c8ff00' }} />
            </div>
            <span style={{ fontFamily, fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>Technologies</span>
          </div>
          <p style={{ fontFamily, fontSize: '34px', fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>{allTech.size}</p>
        </div>
      </div>

      {/* Tech Stack Overview */}
      {allTech.size > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e5e5',
        }}>
          <h3 style={{ fontFamily, fontSize: '20px', fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Tech Stack Overview</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[...allTech].sort().map((tech) => (
              <span
                key={tech}
                style={{
                  fontFamily,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '20px',
                  fontWeight: 500,
                  backgroundColor: '#c8ff00',
                  color: '#111',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Task Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tasks.map((task, idx) => {
          const td = task.technical_details;
          const isExpanded = expandedTask === task.id;

          return (
            <div
              key={task.id || idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.3s',
                border: '1px solid #e5e5e5',
              }}
            >
              {/* Task Header (always visible) */}
              <button
                onClick={() => toggleTask(task.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(200,255,0,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span style={{
                    fontFamily,
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '20px',
                    fontWeight: 500,
                    backgroundColor: '#c8ff00',
                    color: '#111',
                    flexShrink: 0,
                  }}>
                    {task.id}
                  </span>
                  <p style={{ fontFamily, fontSize: '20px', color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '12px' }}>
                  {td?.estimated_hours && (
                    <span style={{ fontFamily, fontSize: '20px', color: '#555' }}>
                      {td.estimated_hours}h
                    </span>
                  )}
                  {td?.tech_stack?.length > 0 && (
                    <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '6px' }}>
                      {td.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          style={{
                            fontFamily,
                            fontSize: '20px',
                            padding: '2px 10px',
                            backgroundColor: 'rgba(200,255,0,0.15)',
                            color: '#111',
                            borderRadius: '9999px',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {td.tech_stack.length > 3 && (
                        <span style={{ fontFamily, fontSize: '20px', color: '#555' }}>
                          +{td.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp style={{ width: '16px', height: '16px', color: '#555' }} />
                  ) : (
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#555' }} />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && td && (
                <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #e5e5e5' }} className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginTop: '20px' }}>
                    {/* Approach */}
                    {td.approach && (
                      <div className="md:col-span-2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <Wrench style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                          <span style={{ fontFamily, fontSize: '20px', fontWeight: 500, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Approach
                          </span>
                        </div>
                        <p style={{ fontFamily, fontSize: '20px', color: 'rgba(17,17,17,0.8)', lineHeight: 1.6, margin: 0 }}>
                          {td.approach}
                        </p>
                      </div>
                    )}

                    {/* Tech Stack */}
                    {td.tech_stack?.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <Code2 style={{ width: '14px', height: '14px', color: '#8b5cf6' }} />
                          <span style={{ fontFamily, fontSize: '20px', fontWeight: 500, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Tech Stack
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {td.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                fontFamily,
                                fontSize: '20px',
                                padding: '4px 10px',
                                backgroundColor: '#c8ff00',
                                color: '#111',
                                borderRadius: '9999px',
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estimated Hours */}
                    {td.estimated_hours && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <Clock style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                          <span style={{ fontFamily, fontSize: '20px', fontWeight: 500, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Estimate
                          </span>
                        </div>
                        <p style={{ fontFamily, fontSize: '20px', color: 'rgba(17,17,17,0.8)', margin: 0 }}>
                          {td.estimated_hours} hour{td.estimated_hours !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {/* Inputs */}
                    {td.inputs?.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <ArrowDownToLine style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                          <span style={{ fontFamily, fontSize: '20px', fontWeight: 500, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Inputs
                          </span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {td.inputs.map((input, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ color: '#555', marginTop: '2px', fontSize: '20px' }}>&#8226;</span>
                              <span style={{ fontFamily, fontSize: '20px', color: 'rgba(17,17,17,0.8)' }}>{input}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Outputs */}
                    {td.outputs?.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <ArrowUpFromLine style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                          <span style={{ fontFamily, fontSize: '20px', fontWeight: 500, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Outputs
                          </span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {td.outputs.map((output, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ color: '#555', marginTop: '2px', fontSize: '20px' }}>&#8226;</span>
                              <span style={{ fontFamily, fontSize: '20px', color: 'rgba(17,17,17,0.8)' }}>{output}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No tech details fallback */}
              {isExpanded && !td && (
                <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #e5e5e5' }}>
                  <p style={{ fontFamily, fontSize: '20px', color: '#555', marginTop: '16px', fontStyle: 'italic' }}>
                    No technical details generated for this task.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
