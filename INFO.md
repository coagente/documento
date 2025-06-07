1  Why move from Next .js 14 to Next .js 15?
	•	Next .js 15 is already stable (released ~7 months ago) and ships with first-class support for React 19 RC, Turbopack-powered dev server, and new async APIs.  Vercel provides codemods to migrate safely, and the Pages & App Routers remain backward-compatible with React 18.  ￼
	•	The RC landed in mid-2024; the current GA contains additional bug-fixes and self-hosting improvements, so there's no reason to remain on v14 unless you have a hard React 18 constraint.  ￼

Bottom line: start green-field projects on Next .js 15 to gain React 19 concurrency, faster HMR with Turbopack, and a longer maintenance window.

⸻

2  2025-ready reference stack

| Concern          | Modern default (June 2025)                                                                      | Notes                                                                                            |
|------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| App framework    | [Next.js 15](https://nextjs.org/) + [React 19 RC](https://reactjs.org/) + [Turbopack](https://turbo.build/pack) | React Server Components + Turbopack-powered dev server                                          |
| RPC / data layer | [tRPC v11](https://trpc.io/)                                                                    | Officially GA March 2025; slimmer client & built-in React Server Actions helpers                 |
| Rich-text core   | [Lexical 0.15.x](https://lexical.dev/)                                                          | Continues monthly patch cycle; WCAG-compliant, <100 KB                                            |
| DOCX ↔ HTML bridge | [@nativedocuments/docx-wasm 2.2.13+](https://github.com/nativedocuments/docx-wasm)            | Pure-browser WASM; latest minor fixed style runs                                                 |
| Real-time CRDT   | [Yjs 15](https://yjs.dev/) (or [Automerge 2.0](https://automerge.org/))                         | Yjs still the lightest; community discussing protocol versioning for prod rollout                 |
| AI chat runtime  | [Gemini API](https://ai.google.dev/gemini-api/docs) behind [Vercel Edge Functions](https://vercel.com/) | |
| Auth             | [Auth.js v6](https://authjs.dev/)                                                               | (ex-NextAuth)                                                                                    |
| Storage          | [PostgreSQL](https://www.postgresql.org/) (Neon/Supabase) + [Cloudflare R2](https://www.cloudflare.com/products/r2/) for binaries | |
| Observability    | [Sentry](https://sentry.io/) + [LangSmith](https://langsmith.langchain.com/)                    | |
| CI/CD            | [GitHub Actions](https://github.com/features/actions) → [Vercel Preview](https://vercel.com/) → Prod promote | |

⸻

3  Product Requirements Document (PRD)

*(Codename *"ScribeAI DOCX" – AI-powered WYSIWYG for Word files)

3.1  Purpose & Vision

Enable teams to draft, revise, and polish Microsoft Word documents entirely in the browser, with live AI assistance and Google-Docs-grade collaboration—no desktop Word, no lost formatting.

3.2  Goals & Success Metrics

Goal	Metric	Target (M+6)
Seamless import/export	DOCX fidelity ≥ 95 % (open-test suite)	95 %
AI adoption	≥ 50 % of sessions use 1+ AI action	50 %
Collaboration	Median time-to-sync < 250 ms @ 200 concurrent edits	< 250 ms
Retention	WAU/MAU ≥ 35 %	35 %

3.3  Target Users
	•	Lawyers & compliance writers
	•	Marketing teams crafting proposals
	•	Students & researchers needing Word output

3.4  Core User Stories (MVP)
	1.	Import Word: As a writer, I upload a .docx and see the exact layout in the browser.
	2.	AI rewrite: I select a paragraph → "Make concise" → content rewrites inline.
	3.	Export: I download the edited document as .docx with tracked-changes preserved.
	4.	Chat context: Side-chat references current selection or full doc for Q&A.
	5.	Presence (stretch): I see collaborator cursors and edits merge in real-time.

3.5  Feature Scope

Area	MVP	v1.1	Futures
Editor	Import/export, basic formatting, tables	Comments, track-changes	Section-level permissions
AI	Rewrite, translate, summarize	Template generation, grammar fixes	Voice dictation, image-to-doc
Collab	View-only presence	Live editing w/ Yjs, version history	Offline PWA sync
Security	OAuth2 / email magic-link	Tenant isolation (RLS), DLP scans	Customer-managed keys

3.6  Non-functional Requirements
	•	Latency: AI response ≤ 2 s p95 for ≤ 2 k context tokens.
	•	Scalability: 1 M monthly active users, 10 GB docs/day.
	•	Compliance: SOC 2-Type II within 12 months; GDPR, LGPD ready.
	•	Accessibility: WCAG 2.2 AA.

3.7  Architecture Overview

Browser (Next.js 15)
 └─► Lexical + Yjs
       ▲        │
       │ WebSocket (Cloud Run)
       ▼        │
 Postgres (Neon)│
       │        ▼
   S3/R2  ◄─ docx-wasm
       ▲
Edge Function (AI Proxy)
 └─► OpenAI/Gemini

3.8  Roadmap & Milestones

Phase	Duration	Deliverables
0 – Prototype	4 wks	Lexical + docx-wasm POC; AI chat echo
1 – MVP Alpha	8 wks	Import/export, single-user AI edits, basic auth
2 – Beta Collab	6 wks	Yjs sync, comments, metrics dashboards
3 – GA	4 wks	Perf hardening, SOC2 audit kickoff, paywall

3.9  Risks & Mitigations

Risk	Impact	Mitigation
Conversion edge-cases (complex DOCX)	Broken layout	Build regression corpus; fall back to server-side python-docx render
LLM hallucination	Wrong legal text	Inline citations; "insert as suggestion" mode only
R2 vendor lock-in	Migration cost	Abstract StorageAdapter interface

3.10  Open Questions
	•	Will customers require on-prem deployment?
	•	Need built-in e-signature workflow?
	•	Preferred billing metric: seats vs. doc-credits?

⸻

Next steps: confirm scope freeze, allocate sprint zero resources, and spin up repo with Next .js 15 boilerplate plus Lexical skeleton.

Feel free to dive deeper into any section or request implementation samples.