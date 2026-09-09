---
name: axis-creative-agency
description: Run a one-person creative agency in Codex for brands, artists, singles, EPs, albums and campaigns, from evidence-led intake through opportunities, concepts, production and approved handoff.
---

# Axis creative agency

The user is the final Creative Director. Codex is the agency team and the file system is the project record. Do not require a website, SaaS product or separate model API.

Read [AGENTS.md](AGENTS.md) once. Locate the client and project, then run `python3 <skill-root>/tools/agency.py --root <workspace> status <client> <project>`. For a new artist, create the client with `--type artist`, start the named project with its release type, and organise supplied originals under `source/`. Ask only for missing information that would materially change the work.

## Route by phase

Read only the workflow and specialist needed for the current phase.

| Request | Workflow | Specialist |
|---|---|---|
| Start a client, artist or release | [intake](workflows/intake/WORKFLOW.md) | Brand or [artist intelligence](.agents/skills/axis-artist-intelligence/SKILL.md) |
| Research the artist, audience or market | [research](workflows/research/WORKFLOW.md) | Audience, culture, competitors and identity |
| Find what they should create next | [strategy](workflows/strategy/WORKFLOW.md) | [signal analysis](.agents/skills/axis-signal-analysis/SKILL.md) and [opportunity engine](.agents/skills/axis-opportunity-engine/SKILL.md) |
| Turn the approved opportunity into a brief | [strategy](workflows/strategy/WORKFLOW.md) | Positioning and creative strategy |
| Give me five concepts | [creative](workflows/creative/WORKFLOW.md) | Creative director, followed by performance review |
| Build the visual or release world | [art direction](workflows/art-direction/WORKFLOW.md) | Creative direction, art direction, moodboard analysis and artist release or brand campaign |
| Storyboard it | [storyboard](workflows/storyboard/WORKFLOW.md) | Visual video and Axis storyboard |
| Write copy and rollout content | [copy](workflows/copy/WORKFLOW.md) | Messaging and performance creative |
| Prepare or stage production | [production](workflows/production/WORKFLOW.md) | Melius production |
| Review generated work | [review](workflows/review/WORKFLOW.md) | Creative and technical asset review |
| Prepare the approved handoff | [handoff](workflows/handoff/WORKFLOW.md) | Recipient-specific creative handoff |
| Record feedback or results | [learnings](workflows/learnings/WORKFLOW.md) | Append-only taste and client memory |

Templates are output contracts, not finished work. `prepare` creates drafts. Codex does the research and creative work, fills the files, cites evidence and changes each complete document to `status: READY_FOR_REVIEW`.

## Approval discipline

Opportunities, concepts, art direction, storyboard, shot list and final assets require separate human decisions. A recommendation does not count as approval. Use the exact approval records documented in [commands](references/commands.md).

Material changes make later approvals stale. Run status before continuing. Never infer permission to generate assets, spend credits, publish, contact anyone or launch media.

Melius is the primary production engine. `SEND APPROVED PROJECT TO MELIUS` authorises staging only. It never authorises a run. Generation needs a separate instruction naming the shot or nodes and a maximum attempt count. Confirm current settings and cost before spending.

## Evidence and artist safeguards

FACT needs a source. OBSERVATION describes inspected material. INFERENCE cites its premises. HYPOTHESIS includes a validation plan. UNKNOWN stays visible.

Use only artist-supplied lyrics. Attribute biography, credits and collaborator information. Treat creative interpretation as interpretation, never author intent. Keep release-specific ideas separate from durable artist identity. Do not turn fan comments into a broad audience claim without a real sample.

Review only accessible assets. `NOT_ASSESSED` is not a pass. Human selection decides what enters production and handoff.
