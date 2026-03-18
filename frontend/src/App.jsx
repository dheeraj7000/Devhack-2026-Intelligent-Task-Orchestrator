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
    <div className="min-h-screen flex flex-col" style={{ background: '#ffffff' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Brain className="w-6 h-6" style={{ color: '#111111' }} />
              <h1
                style={{
                  fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
                  fontWeight: 700,
                  color: '#111111',
                  letterSpacing: '-0.02em',
                  fontSize: '22px',
                }}
              >
                Orchestrated Planning & Agent Queuing
              </h1>
            </div>
            {epicId && (
              <button
                onClick={handleReset}
                className="text-sm transition-all duration-200"
                style={{
                  color: '#111111',
                  border: '1.5px solid #111111',
                  borderRadius: '9999px',
                  padding: '6px 16px',
                  fontWeight: 600,
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#111111';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#111111';
                }}
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const isActive = idx === stepIndex;
              const isCompleted = idx < stepIndex;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2.5 min-w-0">
                    <div
                      className="transition-all duration-300 rounded-full flex items-center justify-center"
                      style={{
                        width: '36px',
                        height: '36px',
                        background: isCompleted
                          ? '#111111'
                          : isActive
                          ? '#c8ff00'
                          : '#e5e5e5',
                        fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isCompleted
                          ? '#ffffff'
                          : isActive
                          ? '#111111'
                          : '#999999',
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" style={{ color: '#ffffff' }} />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </div>
                    <span
                      className="text-[13px] tracking-wide hidden sm:inline transition-colors duration-200"
                      style={{
                        fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
                        color: isActive
                          ? '#111111'
                          : isCompleted
                          ? '#555555'
                          : '#999999',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className="flex-1 mx-2 transition-all duration-300"
                      style={{
                        height: '2px',
                        background: idx < stepIndex ? '#c8ff00' : '#e5e5e5',
                        marginTop: '-18px',
                      }}
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
          <div
            className="px-5 py-4 flex items-center gap-3 animate-fade-in"
            style={{
              background: '#ffffff',
              borderLeft: '4px solid #dc2626',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <AlertCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: '#dc2626' }}
            />
            <p className="text-sm flex-1" style={{ color: '#111111' }}>
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-sm transition-colors duration-200"
              style={{ color: '#555555', fontWeight: 600 }}
              onMouseEnter={(e) => (e.target.style.color = '#111111')}
              onMouseLeave={(e) => (e.target.style.color = '#555555')}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 sm:px-8 py-12 w-full" style={{ background: '#ffffff' }}>
        <div className="animate-fade-in">{renderCurrentStep()}</div>
      </main>

      {/* Footer */}
      <footer
        className="py-8"
        style={{
          background: '#1a1a2e',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 flex flex-col items-center gap-3">
          <div
            style={{
              width: '32px',
              height: '3px',
              background: '#c8ff00',
              borderRadius: '2px',
            }}
          />
          <p
            className="text-center text-sm tracking-wide"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Powered by Orchestrated Planning & Agent Queuing
          </p>
        </div>
      </footer>
    </div>
  );
}
