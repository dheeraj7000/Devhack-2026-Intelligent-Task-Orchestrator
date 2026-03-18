# OPAQ — Orchestrated Planning & Agent Queuing

**Reducing workplace friction through intelligent task orchestration.**

OPAQ transforms natural language project descriptions into validated, executable parallel plans in seconds. Powered by LLMs and graph algorithms, it automates the entire planning pipeline — from epic generation to dependency mapping to wave-based parallel scheduling.

> Built for **DevHack 2026** | Track: *Intelligent Task Orchestration*

---

## The Problem

Engineering teams spend up to 30% of their time on coordination overhead — not building. Turning a product vision into an executable plan involves days of manual decomposition, dependency mapping, sprint planning meetings, and role assignment. OPAQ eliminates this friction.

---

## How It Works

```
Requirement (plain English)
        │
        ▼
┌─────────────────────┐
│  Epic Generation    │ ← LLM generates atomic tasks + dependencies
│  (NVIDIA NIM API)   │
└────────┬────────────┘
         ▼
┌─────────────────────┐
│  Validation Gate    │ ← 10-metric quality scoring (auto-replan if fails)
│  (LLM + History)    │
└────────┬────────────┘
         ▼
┌─────────────────────┐
│  Human Approval     │ ← Human-as-Agent: approve or reject with feedback
└────────┬────────────┘
         ▼
┌─────────────────────┐
│  Tech Enrichment    │ ← LLM generates tech stack, approach, I/O per task
└────────┬────────────┘
         ▼
┌─────────────────────┐
│  DAG Visualization  │ ← Dependency graph with cycle detection
│  (NetworkX)         │
└────────┬────────────┘
         ▼
┌─────────────────────┐
│  Role Assignment    │ ← LLM assigns 7 roles + auto load-balancing (max 4/engineer)
└────────┬────────────┘
         ▼
┌─────────────────────┐
│  Wave Computation   │ ← Topological sort → parallel execution groups
└─────────────────────┘
```

---

## Key Features

- **Epic Generation** — Converts natural language into structured plans with atomic tasks (1-4h each), dependencies, and success criteria
- **10-Metric Validation Gate** — Scores plans on vision clarity, architecture quality, task decomposition, dependency graph, coverage completeness, phase ordering, scope coherence, success criteria quality, risk identification, and integration strategy
- **Auto-Replanning with History** — Failed validations trigger automatic regeneration using full validation history as feedback. Recurring weak areas are identified and prioritized
- **Human-as-Agent (HaaA)** — Human approval/rejection is a pipeline step, not an external process
- **Technical Enrichment** — Per-task tech stack, implementation approach, inputs/outputs, and hour estimates
- **DAG Builder** — Directed Acyclic Graph construction with cycle detection, dual dependency extraction (epic-level + per-task)
- **Wave Computation** — Topological sort groups tasks into parallel execution waves
- **Intelligent Load Balancing** — Engineers are capped at 4 tasks max. Overloaded roles automatically split (e.g., "Backend Engineer 1", "Backend Engineer 2")
- **Interactive DAG Visualization** — React Flow with role-colored nodes, animated edges, zoom/pan, minimap

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, React Flow, Axios, Lucide Icons |
| **Backend** | Python FastAPI, SQLAlchemy, NetworkX, Pydantic |
| **LLM** | NVIDIA NIM API (OpenAI-compatible) |
| **Database** | SQLite |
| **Build** | Vite |

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry
│   │   ├── config.py                # Environment settings
│   │   ├── api/
│   │   │   └── routes.py            # All API endpoints
│   │   ├── db/
│   │   │   ├── database.py          # SQLAlchemy setup
│   │   │   └── models.py            # ORM models (Epic, Validation)
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic schemas
│   │   └── services/
│   │       ├── llm_service.py       # NVIDIA NIM LLM integration
│   │       ├── planning_validator.py # 10-metric scoring
│   │       ├── dag_builder.py       # NetworkX DAG construction
│   │       └── wave_engine.py       # Topological wave computation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Pipeline state machine (8 steps)
│   │   ├── api/client.js            # API client
│   │   └── components/
│   │       ├── RequirementInput.jsx  # Step 1: Input
│   │       ├── EpicDisplay.jsx       # Step 2: Generated epic
│   │       ├── ValidationScores.jsx  # Step 3: Quality scores + history
│   │       ├── HumanApproval.jsx     # Step 4: Approve/reject
│   │       ├── TechnicalRequirements.jsx # Step 5: Tech specs
│   │       ├── DAGVisualization.jsx  # Step 6: Dependency graph
│   │       ├── RoleAssignment.jsx    # Step 7: Role assignments
│   │       └── WaveDisplay.jsx       # Step 8: Execution waves
│   └── package.json
├── example.env                      # Environment variable reference
├── PITCH_SCRIPT.md                  # 4-minute demo pitch script
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- NVIDIA NIM API key ([get one here](https://build.nvidia.com/))

### Setup

**1. Clone and configure**

```bash
git clone <repo-url>
cd Devhack-2026-Intelligent-Task-Orchestrator
cp example.env backend/.env
```

Edit `backend/.env` and add your NVIDIA NIM API key:

```
NVIDIA_NIM_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
```

**2. Start the backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**3. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate-epic` | Generate epic from requirement (with auto-validation + replan) |
| POST | `/api/validate-epic/{id}` | Validate an existing epic |
| POST | `/api/replan-epic/{id}` | Manually trigger replanning with full history feedback |
| POST | `/api/approve-epic/{id}` | Approve or reject with feedback |
| POST | `/api/enrich-tasks/{id}` | Generate technical details per task |
| POST | `/api/assign-tasks/{id}` | Assign roles + load balance |
| POST | `/api/compute-waves/{id}` | Compute parallel execution waves |
| GET | `/api/epic/{id}` | Get full epic with history |
| GET | `/api/epic/{id}/dag` | Get DAG adjacency list |
| GET | `/api/epic/{id}/validation-history` | Get validation history |

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NVIDIA_NIM_API_KEY` | NVIDIA NIM API key | *required* |
| `NVIDIA_NIM_BASE_URL` | NIM API endpoint | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_NIM_MODEL` | LLM model | `meta/llama-3.1-70b-instruct` |
| `DATABASE_URL` | SQLite path | `sqlite:///./orchestrator.db` |
| `VALIDATION_AVG_THRESHOLD` | Min average score to pass | `95` |
| `VALIDATION_MIN_THRESHOLD` | Min per-metric score | `90` |
| `MAX_REPLAN_RETRIES` | Auto-replan attempts | `3` |

---

## SPOQ Concept Mapping

| SPOQ Concept | OPAQ Implementation |
|---|---|
| Epic | LLM-generated structured plan |
| DAG | NetworkX dependency graph with cycle detection |
| Waves | Topological sort parallel execution groups |
| Validation Gate | 10-metric LLM scoring with auto-replan |
| Human-as-Agent | Human approval step in the pipeline |
| Orchestration | Full 8-step automated pipeline |

---

## Team

Built by **Team Threshold** at DevHack 2026.

---

## License

MIT
