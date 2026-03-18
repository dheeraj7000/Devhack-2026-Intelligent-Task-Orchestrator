import React, { useState, useRef } from 'react';
import { Send, Loader2, FileText, Lightbulb, Upload, X, File } from 'lucide-react';

const EXAMPLE_REQUIREMENTS = [
  {
    title: "Real-time Chat App",
    icon: "💬",
    description: "Build a real-time chat application with WebSocket-based messaging, user authentication (OAuth2 + JWT), private and group channels, message history with search, file/image sharing with S3 storage, typing indicators, read receipts, and push notifications. Use React frontend with Node.js backend and Redis for pub/sub.",
  },
  {
    title: "E-Commerce Platform",
    icon: "🛒",
    description: "Create a full-stack e-commerce platform with product catalog (categories, filters, search), shopping cart with persistent state, Stripe payment integration, order tracking with status updates, user reviews and ratings, admin dashboard for inventory management, and email notifications. Use Next.js, PostgreSQL, and Redis caching.",
  },
  {
    title: "AI-Powered Analytics Dashboard",
    icon: "📊",
    description: "Develop an analytics dashboard that ingests data from multiple sources (REST APIs, databases, CSV uploads), processes it through an ETL pipeline, and visualizes insights using interactive charts. Include ML-based anomaly detection, automated report generation (PDF export), role-based access control, and scheduled email digests. Use Python FastAPI backend, React with D3.js frontend, and PostgreSQL.",
  },
  {
    title: "DevOps CI/CD Platform",
    icon: "🚀",
    description: "Build a CI/CD platform that supports GitHub/GitLab webhook integration, configurable multi-stage build pipelines (YAML-based), Docker container builds, automated testing with parallel execution, deployment to Kubernetes clusters, rollback support, build logs streaming, and Slack/email notifications. Include a dashboard for pipeline monitoring and team management.",
  },
  {
    title: "Healthcare Appointment System",
    icon: "🏥",
    description: "Create a healthcare appointment booking system with patient registration, doctor profiles with specialization and availability, calendar-based appointment scheduling, video consultation integration (WebRTC), prescription management, medical records with HIPAA-compliant encryption, SMS/email reminders, and an admin panel for clinic management. Use React, Node.js, PostgreSQL, and Twilio for notifications.",
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
        <h2 className="text-4xl font-bold tracking-tight mb-3" style={{ color: '#f5f5f7' }}>
          What would you like to build?
        </h2>
        <p className="text-lg font-light" style={{ color: '#86868b' }}>
          Describe your vision and let AI orchestrate the rest.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="relative glass rounded-2xl p-8"
          style={{
            background: 'rgba(28, 28, 30, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <label
            htmlFor="requirement"
            className="block text-sm font-medium mb-3"
            style={{ color: '#86868b' }}
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
            className="w-full rounded-xl px-5 py-4 text-base resize-none transition-all duration-200 focus:outline-none"
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {/* Drag overlay */}
          {isDragging && (
            <div
              className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
              style={{
                background: 'rgba(0, 113, 227, 0.08)',
                border: '2px dashed rgba(0, 113, 227, 0.5)',
              }}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#0071e3' }} />
                <p className="text-sm font-medium" style={{ color: '#0071e3' }}>Drop file here</p>
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
                className="flex items-center gap-2.5 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(0, 113, 227, 0.1)',
                  border: '1px solid rgba(0, 113, 227, 0.2)',
                }}
              >
                <File className="w-3.5 h-3.5" style={{ color: '#0071e3' }} />
                <span className="text-xs font-medium" style={{ color: '#0071e3' }}>{uploadedFile.name}</span>
                <span className="text-xs" style={{ color: '#86868b' }}>{formatFileSize(uploadedFile.size)}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="transition-colors ml-1"
                  style={{ color: '#86868b' }}
                  onMouseEnter={(e) => e.target.style.color = '#f5f5f7'}
                  onMouseLeave={(e) => e.target.style.color = '#86868b'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 disabled:opacity-40"
                style={{
                  color: '#86868b',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f5f5f7';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#86868b';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload file
                <span style={{ color: '#48484a' }}>.txt, .md, .json, .csv</span>
              </button>
            )}

            {fileError && (
              <span className="text-xs" style={{ color: '#ff453a' }}>{fileError}</span>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs" style={{ color: '#48484a' }}>
              {requirement.length} characters
            </span>
            <button
              type="submit"
              disabled={!requirement.trim() || loading}
              className="inline-flex items-center gap-2 px-8 py-3 text-white font-medium rounded-full transition-all duration-200 disabled:opacity-40"
              style={{
                background: (!requirement.trim() || loading) ? '#333' : '#0071e3',
                color: (!requirement.trim() || loading) ? '#666' : '#ffffff',
              }}
              onMouseEnter={(e) => {
                if (requirement.trim() && !loading) {
                  e.currentTarget.style.background = '#0077ed';
                }
              }}
              onMouseLeave={(e) => {
                if (requirement.trim() && !loading) {
                  e.currentTarget.style.background = '#0071e3';
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
          <Lightbulb className="w-4 h-4" style={{ color: '#ff9f0a' }} />
          <span className="text-sm font-medium" style={{ color: '#86868b' }}>
            Quick Start — click to generate instantly
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMPLE_REQUIREMENTS.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExample(example)}
              disabled={loading}
              className="text-left p-5 rounded-2xl transition-all duration-300 disabled:opacity-40 group"
              style={{
                background: 'rgba(28, 28, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(28, 28, 30, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(0, 113, 227, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(28, 28, 30, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-lg">{example.icon}</span>
                <span className="text-sm font-semibold" style={{ color: '#f5f5f7' }}>
                  {example.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#86868b' }}>
                {example.description.substring(0, 120)}...
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
