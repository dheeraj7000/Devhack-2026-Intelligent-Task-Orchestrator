# OPAQ - Orchestrated Planning & Agent Queuing
## 4-Minute Pitch Script
### Track: Reducing Workplace Friction Through Intelligent Task Orchestration

---

**[0:00 - 0:30] THE PROBLEM (30 seconds)**

> "Picture this. A product manager walks into a standup and says: *'We need to build a real-time traffic management platform.'*
>
> What happens next? Chaos.
>
> The engineering lead spends two days breaking that down into tasks. Architects debate dependencies. The project manager manually figures out what can run in parallel. Three meetings later, someone realizes the ML team was blocked the entire time because nobody mapped the data pipeline dependency.
>
> This is workplace friction. Not a tooling problem — a *planning* problem. Teams don't fail because they lack talent. They fail because turning a vision into an executable plan is manual, slow, and error-prone. Studies show engineers spend 30% of their time on coordination overhead — not building."

---

**[0:30 - 1:15] OUR SOLUTION (45 seconds)**

> "We built OPAQ — Orchestrated Planning & Agent Queuing.
>
> You give it a project description in plain English. Within seconds, our system does what takes teams days:
>
> **One** — It generates a complete Epic: a structured plan with atomic tasks, each scoped to 1-4 hours of work, with clear dependencies and success criteria. Powered by NVIDIA NIM's LLM API.
>
> **Two** — It validates its own plan. A 10-metric quality gate scores the plan on architecture quality, task decomposition, dependency correctness, scope coherence, and six more dimensions. If the score falls below threshold, it *automatically replans* using the full history of what went wrong — no human intervention needed.
>
> **Three** — A human reviews and approves. We call this Human-as-Agent — the human is part of the pipeline, not outside it.
>
> **Four** — It generates technical specifications per task: tech stack, implementation approach, inputs, outputs, and time estimates.
>
> **Five** — It builds a Dependency Graph — a DAG — and computes execution waves. Tasks with no interdependencies run in parallel. This is the core innovation."

---

**[1:15 - 2:15] LIVE DEMO (60 seconds)**

> "Let me show you.
>
> *[Click the 'Smart City Traffic Platform' demo card]*
>
> I just entered a complex requirement — a real-time traffic management system with IoT sensors, AI prediction, emergency vehicle routing, and a full DevOps pipeline.
>
> *[Epic generates]*
>
> In seconds, OPAQ produced 14 atomic tasks with clear dependencies. Notice — it didn't just list tasks. It understood that the Kafka data pipeline must exist before the ML model can train, and the ML model must be deployed before the adaptive signal API can consume predictions.
>
> *[Validation scores appear]*
>
> Here's the quality gate — 10 metrics, each scored. Architecture quality: 96. Task decomposition: 97. If any metric drops below 90, or the average below 95, it automatically replans with full history feedback. You can see the validation history — each attempt learns from previous failures.
>
> *[Click Approve]*
>
> Now the technical enrichment — each task gets its tech stack, approach, inputs and outputs. This is what helps the system compute true parallelism.
>
> *[DAG appears]*
>
> Here's the dependency graph. Color-coded by role — green for Backend, blue for Frontend, purple for ML, gold for Data Engineering. The lime green edges show dependencies. You can see the natural layers forming.
>
> *[Role assignment]*
>
> Tasks assigned to 7 specialized roles. Notice Backend Engineer got 6 tasks — our system automatically load-balanced that into Backend Engineer 1 and Backend Engineer 2, each with at most 4 tasks. No engineer gets overloaded.
>
> *[Waves appear]*
>
> And here's the payoff — execution waves. Wave 1: infrastructure setup, database schema, and UI design all run in parallel. Wave 2: data pipeline, ML training, and core APIs — all parallel. Wave 3: integration. Wave 4: testing. What would take a team weeks of sequential planning, OPAQ computed in seconds."

---

**[2:15 - 3:00] TECHNICAL DEPTH (45 seconds)**

> "Under the hood, three things make this work:
>
> **First — the validation feedback loop.** This isn't a one-shot LLM call. Every validation attempt is stored with its scores, weak metrics, and feedback. When replanning triggers, the LLM receives the *complete history* — recurring weak areas are identified and prioritized. The system literally learns from its own mistakes within a single planning session.
>
> **Second — the graph engine.** We use NetworkX to build the DAG, extracting dependencies from both epic-level pairs and per-task dependency lists. Cycle detection ensures the plan is always executable. Topological sort groups tasks into waves — each wave contains only tasks whose *entire* dependency chain is already complete.
>
> **Third — intelligent load balancing.** After LLM-based role assignment, we cap each engineer at 4 tasks maximum. If a role exceeds that, we automatically split into numbered engineers. This models real-world team scaling — you don't give one person 8 tasks, you hire another engineer.
>
> The stack: FastAPI backend, React frontend with React Flow for DAG visualization, NVIDIA NIM API for all LLM operations, NetworkX for graph algorithms, and SQLite for persistence."

---

**[3:00 - 3:45] IMPACT & VISION (45 seconds)**

> "Let's talk impact.
>
> OPAQ eliminates the three biggest sources of workplace friction in software teams:
>
> **Planning friction** — no more two-day sprint planning sessions. A natural language description becomes an executable plan in seconds.
>
> **Coordination friction** — the DAG and wave computation tell every team member exactly what they can work on *right now*, and what they're blocked by. No more 'I didn't know I was waiting on you.'
>
> **Scaling friction** — automatic load balancing means as projects grow, the system distributes work optimally. Add complexity, it adds engineers.
>
> Looking ahead, OPAQ becomes a full orchestration platform — plug in actual coding agents per role, and the waves don't just *plan* parallel execution, they *execute* it. Each wave triggers specialized AI agents that write code, run tests, and deploy — all orchestrated by the DAG.
>
> We're not building a better project management tool. We're building the operating system for how software gets planned and built."

---

**[3:45 - 4:00] CLOSE (15 seconds)**

> "OPAQ — Orchestrated Planning & Agent Queuing.
>
> From a sentence to an executable parallel plan in seconds. Reducing workplace friction isn't about better Jira tickets — it's about intelligent orchestration.
>
> Thank you."

---

## KEY TALKING POINTS (if judges ask questions)

**Q: How is this different from just asking ChatGPT to break down a project?**
> "Three things ChatGPT doesn't do: validate its own output with a 10-metric quality gate and auto-replan, compute a mathematically valid dependency graph with cycle detection, and calculate parallel execution waves using topological sort. We turn unstructured LLM output into a verified, executable orchestration plan."

**Q: What about the validation threshold — isn't 95 average too strict?**
> "That's intentional. The strictness forces the replanning loop to actually engage — which is the innovation. A relaxed threshold would pass everything on first try, and you'd never see the system self-correct. In production, the threshold is configurable per organization."

**Q: How do you handle hallucinated dependencies or tasks?**
> "The DAG builder validates structural correctness — cycle detection catches impossible dependency chains, and orphan tasks get flagged. The 10-metric scoring catches semantic issues — dependency graph quality and coverage completeness specifically score whether the plan makes logical sense."

**Q: What's the SPOQ connection?**
> "SPOQ is a framework for agentic software orchestration. We implement its core concepts: Epic-based planning, DAG-based dependency modeling, wave-based parallel execution, validation gates with automated replanning, and Human-as-Agent approval loops. OPAQ is a working demonstration of the SPOQ philosophy."

**Q: Can this work for non-software projects?**
> "Absolutely. Any domain with decomposable tasks and dependencies — construction project planning, clinical trial workflows, event management, curriculum design. The DAG and wave computation are domain-agnostic. Only the LLM prompts need domain adaptation."
