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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#f5f5f7]">Technical Requirements</h2>
          <p className="text-[#86868b] text-sm mt-2">
            Implementation details and tech stack per task
          </p>
        </div>
        <button
          onClick={onProceed}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#1c1c1e] disabled:text-[#86868b] text-white font-medium rounded-full transition-all duration-300"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#0071e3]/10 rounded-xl">
              <FileCode2 className="w-5 h-5 text-[#0071e3]" />
            </div>
            <span className="text-sm text-[#86868b]">Tasks Enriched</span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#f5f5f7]">
            {enrichedCount}
            <span className="text-base text-[#86868b] font-normal ml-1.5">/ {tasks.length}</span>
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#ff9f0a]/10 rounded-xl">
              <Clock className="w-5 h-5 text-[#ff9f0a]" />
            </div>
            <span className="text-sm text-[#86868b]">Total Estimated</span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#f5f5f7]">
            {totalHours.toFixed(1)}
            <span className="text-base text-[#86868b] font-normal ml-1.5">hours</span>
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#bf5af2]/10 rounded-xl">
              <Code2 className="w-5 h-5 text-[#bf5af2]" />
            </div>
            <span className="text-sm text-[#86868b]">Technologies</span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#f5f5f7]">{allTech.size}</p>
        </div>
      </div>

      {/* Tech Stack Overview */}
      {allTech.size > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xs font-medium text-[#86868b] uppercase tracking-wider mb-4">Tech Stack Overview</h3>
          <div className="flex flex-wrap gap-2">
            {[...allTech].sort().map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#0071e3]/10 text-[#409cff] border border-[#0071e3]/15"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Task Details */}
      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const td = task.technical_details;
          const isExpanded = expandedTask === task.id;

          return (
            <div
              key={task.id || idx}
              className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04]"
            >
              {/* Task Header (always visible) */}
              <button
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#0071e3]/10 text-[#409cff] border border-[#0071e3]/15 flex-shrink-0">
                    {task.id}
                  </span>
                  <p className="text-sm text-[#f5f5f7] truncate">
                    {task.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  {td?.estimated_hours && (
                    <span className="text-xs text-[#86868b]">
                      {td.estimated_hours}h
                    </span>
                  )}
                  {td?.tech_stack?.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5">
                      {td.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2.5 py-0.5 bg-white/[0.05] text-[#86868b] rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {td.tech_stack.length > 3 && (
                        <span className="text-xs text-[#86868b]">
                          +{td.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#86868b]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#86868b]" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && td && (
                <div className="px-6 pb-6 pt-0 border-t border-white/[0.06] animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    {/* Approach */}
                    {td.approach && (
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Wrench className="w-3.5 h-3.5 text-[#30d158]" />
                          <span className="text-xs font-medium text-[#30d158] uppercase tracking-wider">
                            Approach
                          </span>
                        </div>
                        <p className="text-sm text-[#f5f5f7]/80 leading-relaxed">
                          {td.approach}
                        </p>
                      </div>
                    )}

                    {/* Tech Stack */}
                    {td.tech_stack?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <Code2 className="w-3.5 h-3.5 text-[#bf5af2]" />
                          <span className="text-xs font-medium text-[#bf5af2] uppercase tracking-wider">
                            Tech Stack
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {td.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              className="text-xs px-2.5 py-1 bg-[#bf5af2]/10 text-[#bf5af2] rounded-full border border-[#bf5af2]/15"
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
                        <div className="flex items-center gap-2 mb-2.5">
                          <Clock className="w-3.5 h-3.5 text-[#ff9f0a]" />
                          <span className="text-xs font-medium text-[#ff9f0a] uppercase tracking-wider">
                            Estimate
                          </span>
                        </div>
                        <p className="text-sm text-[#f5f5f7]/80">
                          {td.estimated_hours} hour{td.estimated_hours !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {/* Inputs */}
                    {td.inputs?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <ArrowDownToLine className="w-3.5 h-3.5 text-[#0071e3]" />
                          <span className="text-xs font-medium text-[#0071e3] uppercase tracking-wider">
                            Inputs
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {td.inputs.map((input, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#86868b] mt-0.5 text-xs">&#8226;</span>
                              <span className="text-sm text-[#f5f5f7]/80">{input}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Outputs */}
                    {td.outputs?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <ArrowUpFromLine className="w-3.5 h-3.5 text-[#30d158]" />
                          <span className="text-xs font-medium text-[#30d158] uppercase tracking-wider">
                            Outputs
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {td.outputs.map((output, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#86868b] mt-0.5 text-xs">&#8226;</span>
                              <span className="text-sm text-[#f5f5f7]/80">{output}</span>
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
                <div className="px-6 pb-6 pt-0 border-t border-white/[0.06]">
                  <p className="text-sm text-[#86868b] mt-4 italic">
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
