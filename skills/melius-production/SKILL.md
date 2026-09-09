---
name: melius-production
description: Convert an approved Axis artist, release or brand project into a self-contained production package and, when explicitly requested, stage it in Melius without starting paid generations.
---

# Melius production adapter

Require current opportunity, concept, art direction, storyboard and shot-list approvals plus ready copy for video production. Read the project package and [the current connector handoff contract](../../references/melius/canvas-handoff.md). Check supplied Melius documents when present. Live Melius guides, model listings and tool schemas are the authority for current node, edge, input, duration, resolution and cost support.

Always preserve universal plain-language briefs as the approved source. Never invent model names, prompt tokens, duration or resolution limits, reference counts, seeds or prices. Do not substitute another production engine. The compiler also emits a stage-only Melius canvas plan. That plan is a translation layer, not a new creative treatment.

Use the agency shot-plan.json and production templates. Each shot repeats its objective, visual, subject, environment, composition, camera, movement, light, colour, texture, action, product details, continuity, start/end frames, duration, sound intent, constraints and reference roles.

Create the master brief, canvas build brief, machine-readable canvas plan and generation plan with the agency tool after approvals. Check timing totals and actual product or identity continuity. Plan variants, maximum attempts, high-risk tests, validation order and fallback. Actual costs remain UNKNOWN until checked in Melius. A plan is not permission to spend.

## Stage an approved canvas

Only stage external work after the user says `SEND APPROVED PROJECT TO MELIUS`, `SEND APPROVED CAMPAIGN TO MELIUS`, or gives equally clear project-specific authority. This phrase means build the canvas and stop before runs.

1. Call the current Melius getting-started guide before any other Melius tool, then load the relevant creative guide.
2. Read live projects and canvases. Reuse the exact client project when it exists. Do not overwrite or silently alter an existing campaign canvas. Use a clearly named revision or ask when the target is ambiguous.
3. Before each canvas mutation, follow the connector's current read, layout, presence and progress requirements.
4. Create literal context as `custom_text` nodes: artist or brand anchor, project brief, rights or claim limits, approved execution, copy, sound and post-production rules.
5. Create one planned image or video node per approved shot. Use a still node when the approved shot is static. Use current model capabilities for node configuration and keep the approved duration visible. Connect every generative node to the context it needs.
6. Upload only user-supplied or already-authorised image references. Search and place an existing Melius library asset instead of duplicating it. If a required reference is missing, add a labelled placeholder text node and leave the affected shot ungenerated.
7. Add a stitch node only when the approved deliverable is a combined film. Preserve shot order. Do not run it.
8. Save a local `07_melius/melius-canvas-receipt.json` with the current project and canvas IDs, names, URL when returned, package manifest hash, staged node IDs and `runs_authorized: false`.
9. Display the staged canvas and stop.

Creating generative nodes normally implies running them in Melius. The user's stage-only phrase is the explicit exception. Never call a run tool during staging.

## Run approved generations

Require a separate user instruction naming the shot or node set and a maximum variant or attempt count. Before the first run, query the live model registry and defaults, report the chosen model settings and available cost information, and verify that required reference inputs exist. Start only the authorised nodes. Use Melius's run waiting and download tools. Record run IDs, actual prompt or reference changes and downloaded filenames. Stop at the approved cap.

Place downloaded outputs in `08_generations` with shot ID and take or variant in the filename, then route them to the agency review workflow. Final asset approval remains human. Never invoke Axis post-production as a side effect.
