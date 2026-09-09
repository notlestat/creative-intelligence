# External methodology audit

Reviewed on 2026-09-09. These repositories informed Axis methods. They are references, not runtime dependencies, and their text was not copied into the original Axis skills.

## Adopted

### Marketing skills

Source: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)

- Product context should be durable and versioned so later work does not keep rebuilding foundations.
- Positioning starts with alternatives, useful difference, audience and credible proof.
- Audience work should focus on the situation and job, not demographic decoration.
- Mental models are prompts for inquiry, not proof about a buyer.
- Social and launch formats belong downstream of a selected opportunity.

### Brand strategy and documentation

Sources: [arnabbagxd/brand-building-skills](https://github.com/arnabbagxd/brand-building-skills), [magnus919/agent-skills](https://github.com/magnus919/agent-skills)

- Strategy, visual identity, voice and asset inventory are separate but linked memory domains.
- Strategy comes before visual rules.
- Templates are elicitation aids and records, not evidence or finished design.

### Art direction and moodboards

Sources: [rampstackco/claude-skills](https://github.com/rampstackco/claude-skills), [SkillMedev/skills](https://github.com/SkillMedev/skills)

- Art direction connects story, look, execution, variants and quality standards.
- Write the emotional target before collecting references.
- Analyse a reference collection through colour, texture, light, composition, people and tension.
- Label inspiration separately from execution and record what to avoid.
- A production brief must cover licensing and actual distribution formats.

### Competitive intelligence and social listening

Sources: [slgoodrich/agents](https://github.com/slgoodrich/agents/blob/main/plugins/ai-pm-copilot/skills/competitive-analysis-templates/SKILL.md), [roohe/agentic-super-skills](https://github.com/roohe/agentic-super-skills/blob/master/skills_library/social-listening/SKILL.md)

- Every competitor feature, price, message and quote needs a dated public source.
- Missing pricing or product access stays explicit.
- Listening starts with a declared scope and keyword matrix, then groups repeated conversation patterns.
- Platform access and sample limitations belong in the finding itself.

### Frontend design

Source: [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)

- Visual choices come from the product's subject and use, not a default SaaS kit.
- Typography and structure carry the identity. Decoration must encode information or go.
- Axis uses one memorable device, a diagonal red measurement line, inside a restrained monochrome workbench.

### Excalidraw

Sources: [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw), [excalidraw/excalidraw-mcp](https://github.com/excalidraw/excalidraw-mcp), [yctimlin/mcp_excalidraw](https://github.com/yctimlin/mcp_excalidraw)

- The official React package is the simplest reliable embedded canvas.
- `initialData`, `onChange` and the imperative API support editable application state.
- Built-in export utilities cover PNG, SVG and `.excalidraw`.
- The official MCP is useful for one-shot chat diagrams. The yctimlin server is stronger for a persistent coding-agent workbench, but both add a second state system. Axis v0.1 keeps AI board generation in its own provider layer and writes ordinary editable Excalidraw elements.

### Agent Reach

Source: [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach)

- The safe local installation was already present, so no system packages were replaced.
- Health checks showed web and RSS available. X lacked full credentials. Reddit and Instagram adapters existed but were not connected. YouTube was unavailable because `yt-dlp` was not installed.
- Axis displays availability and continues with healthy or manual sources. It never treats an installed command as proof that a platform returned data.

## Rejected or changed

- Synthetic persona names, ages, incomes and quotes were rejected. Unknown audience details stay unknown.
- Fixed social alert thresholds were rejected unless a client supplies a real baseline.
- Generic SWOT output was rejected as the main competitor view. Axis maps clusters, differences and possible creative whitespace instead.
- Forced output quotas were rejected. Axis allows up to ten opportunities, and only distinct evidence-backed possibilities survive.
- Direct competitor work is not a literal art reference.
- Automatic image generation and model fine-tuning are outside v0.1.
- Excalidraw MCP servers were not added as runtime dependencies because the embedded package already meets the editing and export requirement with less operational risk.
