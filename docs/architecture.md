# Architecture

## Product flow

```text
Project
  -> source inbox
  -> structured memory
  -> classified research
  -> evidence-linked signals
  -> up to ten opportunities
  -> human selection
  -> creative development
  -> art direction and editable canvas
  -> recipient-specific handoff
  -> taste feedback
```

Brand and artist work share the same evidence and decision model. Their memory fields and development outputs specialise where needed.

## Application

- Vinext provides the Next.js-compatible React application and Cloudflare Worker build.
- Tailwind and the included Shadcn primitives supply accessible controls. Axis applies its own editorial design system.
- D1 stores relational project data. Drizzle owns schema and migrations.
- R2 stores uploads and `.excalidraw` scene files. D1 stores their metadata.
- Zod validates projects, findings, signals, opportunities, creative development, art direction, storyboards and handoffs at every generation boundary.
- Excalidraw runs inside the project workspace. It remains manually editable and exports PNG, SVG and `.excalidraw`.

## Provider boundaries

`src/integrations/research` defines `ResearchProvider`. The current adapters are manual, public web reader and an optional Agent Reach HTTP bridge. Each exposes a health result before research begins.

`src/integrations/llm` defines `LlmProvider`. The OpenAI-compatible provider accepts a model, base URL and API key through environment values. It asks for JSON and validates the result with Zod. Provider output never becomes evidence by itself.

## Human authority

Opportunity states are `PENDING`, `APPROVED`, `REJECTED` or `SAVED`. Axis may set `recommendation: true`, but there is no winner state. Feedback records both the decision and the founder's language so later work can retrieve taste without model fine-tuning.
