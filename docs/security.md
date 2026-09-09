# Security review — v0.1

Reviewed on 2026-09-09 with `npm audit`, followed by lint, typecheck, tests and a production build.

## Patched directly

- React, React DOM and React Server DOM Webpack: 19.2.8.
- Vinext: 1.0.0-beta.9.
- Vite: 8.2.2.
- Cloudflare Vite plugin: 1.54.6.
- Wrangler: 4.130.0.

This removed the React Server Functions advisory and the earlier Vite, WebSocket and Undici findings.

## Remaining upstream findings

The audit still reports six high and eleven moderate dependency findings. They are upstream of two required capabilities:

- The official Excalidraw package pulls older Nano ID and Mermaid parser packages. npm proposes Excalidraw 0.17.6, but that release only declares React 17/18 support and is incompatible with this React 19 scaffold. Axis does not call Nano ID directly.
- The current Cloudflare Vite plugin and Wrangler share a Miniflare alpha that pins Sharp 0.35.2. The patched Sharp release is not accepted by the pinned dependency. These packages are local build/development infrastructure, not application request handlers.
- Drizzle Kit's advisory is in its migration CLI toolchain. Drizzle Kit is not bundled into the deployed application.

No `npm audit fix --force`, unsupported override, or framework downgrade was applied. Recheck these upstream packages before any public or multi-user launch. The v0.1 deployment must remain owner-only.

## Application controls

- Inputs and generated structures are validated with Zod.
- File uploads are limited to 20 MB and stored outside D1.
- AI outputs are rejected when configuration is absent or schema validation fails.
- Existing generated stages are not silently overwritten.
- Facts, observations, inferences, signals and creative proposals remain visibly classified.
- Human opportunity approval is required before creative development.
