import React, { useState, useCallback } from 'react';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';
import RequirementInput from './components/RequirementInput';
import EpicDisplay from './components/EpicDisplay';
import ValidationScores from './components/ValidationScores';
import HumanApproval from './components/HumanApproval';
import TechnicalRequirements from './components/TechnicalRequirements';
import DAGVisualization from './components/DAGVisualization';
import RoleAssignment from './components/RoleAssignment';
import WaveDisplay from './components/WaveDisplay';
import {
  generateEpic,
  validateEpic,
  replanEpic,
  approveEpic,
  enrichTasks,
  assignTasks,
  computeWaves,
  getEpic,
  getDAG,
  getValidationHistory,
} from './api/client';

const STEPS = [
  { id: 'input', label: 'Input', icon: '1' },
  { id: 'generation', label: 'Generate', icon: '2' },
  { id: 'validation', label: 'Validate', icon: '3' },
  { id: 'approval', label: 'Approve', icon: '4' },
  { id: 'techspec', label: 'Tech Spec', icon: '5' },
  { id: 'dag', label: 'DAG', icon: '6' },
  { id: 'assignment', label: 'Assign', icon: '7' },
  { id: 'waves', label: 'Waves', icon: '8' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState('input');
  const [epicId, setEpicId] = useState(null);
  const [epicData, setEpicData] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [validationHistory, setValidationHistory] = useState([]);
  const [dagData, setDagData] = useState(null);
  const [assignmentData, setAssignmentData] = useState(null);
  const [wavesData, setWavesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleGenerate = useCallback(async (requirement) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateEpic(requirement);
      setEpicId(data.epic?.id);
      setEpicData(data);
      if (data.validation) {
        setValidationData(data.validation);
      }
      if (data.validation_history) {
        setValidationHistory(data.validation_history);
      }
      setCurrentStep('generation');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate epic. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleValidate = useCallback(async () => {
    if (!epicId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await validateEpic(epicId);
      setValidationData(data);
      const history = await getValidationHistory(epicId);
      setValidationHistory(history);
      setCurrentStep('validation');
    } catch (err) {
      setError(err.response?.data?.detail || 'Validation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  const handleReplan = useCallback(async () => {
    if (!epicId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await replanEpic(epicId);
      setEpicData(data);
      setValidationData(data.validation);
      if (data.validation_history) {
        setValidationHistory(data.validation_history);
      }
      setCurrentStep('generation');
    } catch (err) {
      setError(err.response?.data?.detail || 'Replanning failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  const handleApprove = useCallback(async (approved, feedback) => {
    if (!epicId) return;
    setLoading(true);
    setError(null);
    try {
      if (approved) {
        await approveEpic(epicId, true, null);
        // Enrich tasks with technical details
        const enriched = await enrichTasks(epicId);
        setEpicData(enriched);
        setCurrentStep('techspec');
      } else {
        await approveEpic(epicId, false, feedback);
        // Re-generate after rejection
        const updatedEpic = await getEpic(epicId);
        setEpicData(updatedEpic);
        setCurrentStep('generation');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Approval action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  const handleProceedToApproval = useCallback(() => {
    setCurrentStep('approval');
  }, []);

  const handleProceedToDAG = useCallback(async () => {
    if (!epicId) return;
    setLoading(true);
    setError(null);
    try {
      const dag = await getDAG(epicId);
      setDagData(dag);
      setCurrentStep('dag');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load DAG. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  const handleAssign = useCallback(async () => {
    if (!epicId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await assignTasks(epicId);
      setAssignmentData(data);
      // Refresh epicData so tasks have roles
      const updatedEpic = await getEpic(epicId);
      setEpicData(updatedEpic);
      setCurrentStep('assignment');
    } catch (err) {
      setError(err.response?.data?.detail || 'Task assignment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  const handleComputeWaves = useCallback(async () => {
    if (!epicId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await computeWaves(epicId);
      setWavesData(data);
      setCurrentStep('waves');
    } catch (err) {
      setError(err.response?.data?.detail || 'Wave computation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  const handleReset = useCallback(() => {
    setCurrentStep('input');
    setEpicId(null);
    setEpicData(null);
    setValidationData(null);
    setValidationHistory([]);
    setDagData(null);
    setAssignmentData(null);
    setWavesData(null);
    setError(null);
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'input':
        return <RequirementInput onGenerate={handleGenerate} loading={loading} />;
      case 'generation':
        return (
          <EpicDisplay
            epicData={epicData}
            onValidate={handleValidate}
            loading={loading}
          />
        );
      case 'validation':
        return (
          <ValidationScores
            validationData={validationData}
            validationHistory={validationHistory}
            onProceed={handleProceedToApproval}
            onReplan={handleReplan}
            loading={loading}
          />
        );
      case 'approval':
        return (
          <HumanApproval
            epicData={epicData}
            onApprove={handleApprove}
            loading={loading}
          />
        );
      case 'techspec':
        return (
          <TechnicalRequirements
            epicData={epicData}
            onProceed={handleProceedToDAG}
            loading={loading}
          />
        );
      case 'dag':
        return (
          <DAGVisualization
            dagData={dagData}
            epicData={epicData}
            onAssign={handleAssign}
            loading={loading}
          />
        );
      case 'assignment':
        return (
          <RoleAssignment
            assignmentData={assignmentData}
            epicData={epicData}
            onComputeWaves={handleComputeWaves}
            loading={loading}
          />
        );
      case 'waves':
        return (
          <WaveDisplay
            wavesData={wavesData}
            epicData={epicData}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="bg-black/95 border-b border-white/[0.08] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-[#f5f5f7]" />
              <h1 className="text-base font-semibold text-[#f5f5f7] tracking-tight">
                Task Orchestrator
              </h1>
            </div>
            {epicId && (
              <button
                onClick={handleReset}
                className="text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors duration-200"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-black border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-5">
          <div className="flex items-center justify-between gap-1">
            {STEPS.map((step, idx) => {
              const isActive = idx === stepIndex;
              const isCompleted = idx < stepIndex;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2 min-w-0">
                    <div
                      className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'w-2.5 h-2.5 bg-[#f5f5f7]'
                          : isCompleted
                          ? 'w-2.5 h-2.5 bg-[#30d158]'
                          : 'w-2 h-2 border border-[#48484a] bg-transparent'
                      }`}
                    >
                      {isCompleted && (
                        <CheckCircle className="w-2.5 h-2.5 text-black" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] tracking-wide hidden sm:inline transition-colors duration-200 ${
                        isActive
                          ? 'text-[#f5f5f7] font-medium'
                          : isCompleted
                          ? 'text-[#86868b]'
                          : 'text-[#48484a]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-1 transition-all duration-300 ${
                        idx < stepIndex
                          ? 'bg-[#30d158]/40'
                          : 'bg-white/[0.06]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-5xl mx-auto px-6 sm:px-8 mt-6">
          <div className="glass rounded-xl px-5 py-3.5 flex items-center gap-3 animate-fade-in border-[#ff453a]/20">
            <AlertCircle className="w-4 h-4 text-[#ff453a] flex-shrink-0" />
            <p className="text-[#ff453a]/90 text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-[#86868b] hover:text-[#f5f5f7] text-xs transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 sm:px-8 py-12 w-full">
        <div className="animate-fade-in">{renderCurrentStep()}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-6">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="text-center text-[11px] text-[#48484a] tracking-wide">
            AI-Driven Task Orchestration
          </p>
        </div>
      </footer>
    </div>
  );
}
