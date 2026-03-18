import React, { useState, useRef } from 'react';
import { Send, Loader2, FileText, Lightbulb, Upload, X, File } from 'lucide-react';

const EXAMPLE_REQUIREMENTS = [
  {
    title: "Smart City Traffic Platform (Demo)",
    icon: "\u{1F31F}",
    featured: true,
    description: `Build a Smart City Real-Time Traffic & Emergency Management Platform that monitors city-wide traffic flow, detects incidents, and optimizes signal timing using AI.

CORE FEATURES:
1. Real-Time Traffic Dashboard — interactive city map showing live traffic density heatmaps, vehicle counts per intersection, and average speeds. Built with React, Mapbox GL, and WebSocket streaming.
2. IoT Sensor Data Pipeline — ingest data from 500+ traffic cameras and road sensors via Apache Kafka, process with Apache Flink for real-time aggregation, and store in TimescaleDB (time-series database) and PostgreSQL.
3. AI Traffic Prediction Engine — LSTM neural network trained on 2 years of historical traffic data to predict congestion 30 minutes ahead. Serve predictions via FastAPI with model versioning and A/B testing support.
4. Adaptive Signal Control API — backend REST API (Python FastAPI) that receives AI predictions and sensor data, computes optimal green/red light timing per intersection using constraint optimization, and pushes commands to signal controllers via MQTT.
5. Emergency Vehicle Priority System — detect approaching emergency vehicles via GPS feeds, automatically create green-wave corridors by overriding normal signal timing along the emergency route. Real-time route visualization on the dashboard.
6. Incident Detection & Alerts — ML-based anomaly detection on camera feeds (sudden speed drops, unusual clustering) to auto-detect accidents. Push alerts to operators via WebSocket + SMS (Twilio) + Slack webhook integration.
7. Historical Analytics & Reporting — weekly/monthly traffic pattern reports with trend analysis, peak hour identification, and before/after comparison for signal timing changes. PDF export with charts.
8. Admin Configuration Panel — web UI for operators to configure sensor zones, set alert thresholds, manage user roles (RBAC), and override signal timing manually.
9. Infrastructure — Dockerized microservices deployed on Kubernetes with Terraform IaC, CI/CD via GitHub Actions, Prometheus + Grafana monitoring, and centralized logging with ELK stack.
10. Testing — comprehensive unit tests, integration tests for Kafka pipelines, load tests simulating 10,000 concurrent sensor streams, and end-to-end Cypress tests for the dashboard.

TECHNICAL REQUIREMENTS:
- Frontend: React 18, TypeScript, Tailwind CSS, Mapbox GL JS, Recharts, WebSocket client
- Backend: Python FastAPI, SQLAlchemy, Alembic migrations, Celery for async tasks, Redis caching
- Data: Apache Kafka, Apache Flink, TimescaleDB, PostgreSQL 15, Redis
- ML: PyTorch LSTM model, MLflow for experiment tracking, FastAPI model serving
- DevOps: Docker, Kubernetes (EKS), Terraform, GitHub Actions, Prometheus, Grafana, ELK
- Testing: Pytest, Locust load testing, Cypress E2E, Jest for frontend unit tests

This project should produce 12-15 atomic tasks with clear dependencies forming a multi-layered DAG with at least 4 execution waves. Tasks should span all engineering roles: UI/UX design, Frontend development, Backend API development, Data engineering, ML engineering, DevOps infrastructure, and Testing.`,
  },
  {
    title: "Real-time Chat App",
    icon: "\u{1F4AC}",
    description: "Build a real-time chat application with WebSocket-based messaging, user authentication (OAuth2 + JWT), private and group channels, message history with search, file/image sharing with S3 storage, typing indicators, read receipts, and push notifications. Use React frontend with Node.js backend and Redis for pub/sub.",
  },
  {
    title: "E-Commerce Platform",
    icon: "\u{1F6D2}",
    description: "Create a full-stack e-commerce platform with product catalog (categories, filters, search), shopping cart with persistent state, Stripe payment integration, order tracking with status updates, user reviews and ratings, admin dashboard for inventory management, and email notifications. Use Next.js, PostgreSQL, and Redis caching.",
  },
  {
    title: "AI-Powered Analytics Dashboard",
    icon: "\u{1F4CA}",
    description: "Develop an analytics dashboard that ingests data from multiple sources (REST APIs, databases, CSV uploads), processes it through an ETL pipeline, and visualizes insights using interactive charts. Include ML-based anomaly detection, automated report generation (PDF export), role-based access control, and scheduled email digests. Use Python FastAPI backend, React with D3.js frontend, and PostgreSQL.",
  },
  {
    title: "DevOps CI/CD Platform",
    icon: "\u{1F680}",
    description: "Build a CI/CD platform that supports GitHub/GitLab webhook integration, configurable multi-stage build pipelines (YAML-based), Docker container builds, automated testing with parallel execution, deployment to Kubernetes clusters, rollback support, build logs streaming, and Slack/email notifications. Include a dashboard for pipeline monitoring and team management.",
  },
];

const ACCEPTED_TYPES = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/pdf': ['.pdf'],
  'application/json': ['.json'],
  'text/csv': ['.csv'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};
const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_TYPES).flat();
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function RequirementInput({ onGenerate, loading }) {
  const [requirement, setRequirement] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requirement.trim() && !loading) {
      onGenerate(requirement.trim());
    }
  };

  const handleExample = (example) => {
    setRequirement(example.description);
    if (!loading) {
      onGenerate(example.description);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const processFile = async (file) => {
    setFileError(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isAccepted = ACCEPTED_EXTENSIONS.includes(ext) ||
      file.type === 'text/plain' ||
      file.type.startsWith('text/');

    if (!isAccepted) {
      setFileError(`Unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`);
      return;
    }

    try {
      const content = await readFileContent(file);
      if (!content.trim()) {
        setFileError('File is empty.');
        return;
      }
      setUploadedFile({ name: file.name, size: file.size });
      setRequirement(content.trim());
    } catch {
      setFileError('Could not read file. Please try a plain text file.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setRequirement('');
    setFileError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2
          className="text-5xl font-bold tracking-tight mb-3"
          style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111', fontWeight: 700 }}
        >
          What would you like to build?
        </h2>
        <p
          className="text-xl"
          style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#555555', fontWeight: 400 }}
        >
          Describe your vision and let AI orchestrate the rest.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="relative p-8"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e5e5',
          }}
        >
          <label
            htmlFor="requirement"
            className="block text-sm font-medium mb-3"
            style={{ fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif", color: '#111111' }}
          >
            Project Requirement
          </label>
          <textarea
            id="requirement"
            rows={8}
            value={requirement}
            onChange={(e) => {
              setRequirement(e.target.value);
              if (uploadedFile) setUploadedFile(null);
            }}
            placeholder="Describe your project in detail. Include features, technical requirements, and any constraints..."
            className="w-full px-5 py-4 text-base resize-none transition-all duration-200 focus:outline-none"
            style={{
              fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
              background: '#ffffff',
              borderRadius: '12px',
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {/* Drag overlay */}
          {isDragging && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              style={{
                borderRadius: '16px',
                background: 'rgba(200, 255, 0, 0.08)',
                border: '2px dashed #c8ff00',
              }}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#111111' }} />
                <p className="text-sm font-medium" style={{ color: '#111111', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>Drop file here</p>
              </div>
            </div>
          )}

          {/* File upload area */}
          <div className="mt-4 flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div
                className="flex items-center gap-2.5 px-4 py-2"
                style={{
                  borderRadius: '9999px',
                  background: 'rgba(200, 255, 0, 0.15)',
                  border: '1px solid rgba(200, 255, 0, 0.4)',
                }}
              >
                <File className="w-3.5 h-3.5" style={{ color: '#111111' }} />
                <span className="text-sm font-medium" style={{ color: '#111111', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>{uploadedFile.name}</span>
                <span className="text-sm" style={{ color: '#555555', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>{formatFileSize(uploadedFile.size)}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="transition-colors ml-1"
                  style={{ color: '#555555' }}
                  onMouseEnter={(e) => e.target.style.color = '#111111'}
                  onMouseLeave={(e) => e.target.style.color = '#555555'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 disabled:opacity-40"
                style={{
                  fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
                  color: '#111111',
                  background: 'transparent',
                  borderRadius: '9999px',
                  border: '2px solid #111111',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#111111';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#111111';
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload file
                <span style={{ color: 'inherit', opacity: 0.6 }}>.txt, .md, .json, .csv</span>
              </button>
            )}

            {fileError && (
              <span className="text-sm" style={{ color: '#c45a4a', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>{fileError}</span>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm" style={{ color: '#555555', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>
              {requirement.length} characters
            </span>
            <button
              type="submit"
              disabled={!requirement.trim() || loading}
              className="inline-flex items-center gap-2 px-8 py-3 font-bold transition-all duration-200 disabled:opacity-40"
              style={{
                fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif",
                borderRadius: '9999px',
                background: (!requirement.trim() || loading) ? '#e5e5e5' : '#c8ff00',
                color: '#111111',
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                if (requirement.trim() && !loading) {
                  e.currentTarget.style.background = '#b8ee00';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(200, 255, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (requirement.trim() && !loading) {
                  e.currentTarget.style.background = '#c8ff00';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Epic
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Start Examples */}
      <div className="mt-12">
        <div className="flex items-center gap-2.5 mb-5">
          <Lightbulb className="w-4 h-4" style={{ color: '#c8ff00' }} />
          <span className="text-sm font-medium" style={{ color: '#111111', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>
            Quick Start — click to generate instantly
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {/* Featured Demo Card */}
          {EXAMPLE_REQUIREMENTS.filter((e) => e.featured).map((example, idx) => (
            <button
              key={`featured-${idx}`}
              onClick={() => handleExample(example)}
              disabled={loading}
              className="text-left w-full p-6 transition-all duration-300 disabled:opacity-40 group"
              style={{
                borderRadius: '16px',
                background: '#1a1a2e',
                border: '2px solid #c8ff00',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(200, 255, 0, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{example.icon}</span>
                  <span className="text-base font-bold" style={{ color: '#ffffff', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>
                    {example.title}
                  </span>
                </div>
                <span
                  className="text-sm font-bold px-4 py-1.5"
                  style={{
                    background: '#c8ff00',
                    color: '#111111',
                    borderRadius: '9999px',
                  }}
                >
                  Recommended Demo
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>
                Showcases all features: 12+ tasks across 7 roles, deep DAG with 4+ execution waves, parallelism, AI prediction engine, real-time streaming, and full DevOps pipeline. Click to generate instantly.
              </p>
            </button>
          ))}

          {/* Other Examples */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXAMPLE_REQUIREMENTS.filter((e) => !e.featured).map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExample(example)}
                disabled={loading}
                className="text-left p-5 transition-all duration-300 disabled:opacity-40 group"
                style={{
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(200, 255, 0, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#c8ff00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e5e5e5';
                }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-xl">{example.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: '#111111', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>
                    {example.title}
                  </span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#555555', fontFamily: "'Aptos', 'Calibri', 'Inter', system-ui, sans-serif" }}>
                  {example.description.substring(0, 100)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
