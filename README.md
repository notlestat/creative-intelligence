# Axis Creative Intelligence v0.1

An internal creative-direction workspace for answering one question: **what should this brand or artist create next?**

Axis keeps sourced facts, observations, inferences, signals and creative proposals visibly separate. It supports brand and artist projects through one shared workflow, with explicit human selection before development.

## Run locally

```bash
npm install
npm run db:local
npm run dev
```

The app runs at `http://localhost:3000`. The two demo projects contain fictional evidence only.

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and add only the providers you intend to use.

- `OPENAI_API_KEY`: required only for model-assisted synthesis.
- `LLM_BASE_URL`: defaults to OpenAI and supports compatible endpoints.
- `LLM_MODEL`: must be chosen explicitly. Axis does not hardcode a model.
- `AGENT_REACH_BASE_URL`: optional HTTP bridge for a safe Agent Reach runtime. The installed local CLI is not invoked from a Cloudflare Worker.

Project records use D1 through Drizzle. Uploads and editable Excalidraw scenes use R2. The UI still works as a transparent demo when providers are absent.

Use `npm run db:generate` only after intentionally changing `db/schema.ts`; inspect the generated migration before applying it. Security review details and upstream dependency constraints are recorded in `docs/security.md`.

## Boundaries

- No authentication, billing, teams, CRM, outreach, ad accounts or autonomous posting.
- No image or video generation pipeline.
- No automatic lyric fetching.
- No recommendation counts as approval.
- Missing sources stay unavailable. Missing facts stay unknown.
