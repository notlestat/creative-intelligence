# Melius canvas handoff

Checked against the official Melius documentation on 2026-09-07:

- [MCP overview](https://docs.melius.com/mcp/overview.md)
- [MCP tools](https://docs.melius.com/mcp/tools.md)
- [Canvas mental model](https://docs.melius.com/help-center/marketers/mental-model.md)
- [Brand anchor](https://docs.melius.com/help-center/marketers/brand-anchor.md)
- [Video node handles](https://docs.melius.com/canvas/video.md)
- [Uploads and assets](https://docs.melius.com/uploads/overview.md)

## Integration contract

Melius is a project and canvas system. Briefs belong in literal text nodes. Image references belong in file or existing library nodes. Image, video and audio nodes make media when a run starts. Edges pass context or media into downstream nodes. A stitch node combines approved clips or stills.

There is no one-click ZIP or Markdown campaign import. Codex translates the local package into canvas nodes through MCP. Keep the source package unchanged for approvals and provenance.

## Stage-only command

`SEND APPROVED PROJECT TO MELIUS` or `SEND APPROVED CAMPAIGN TO MELIUS` means:

- use the named client and project;
- create or reuse the client project;
- create one clearly named project canvas;
- add approved context, shot and stitch nodes;
- upload only in-scope user-supplied image references;
- connect the required edges;
- display the resulting canvas;
- make no run calls and spend no credits.

This wording is an explicit request not to run newly created generative nodes. It is the narrow exception to Melius's normal create-and-run behavior.

Before any live work, call Melius `get_guide` for `getting-started` and the matching creative topic. Follow the returned requirements for current canvas reads, layout planning, presence, progress and display. Do not cache or invent IDs.

## Generation command

Generation needs a later instruction naming the shot or nodes and a maximum count. Example:

`GENERATE SHOT 02, MAXIMUM 3 VARIANTS`

Before running, inspect the current canvas, model registry, supported handles, durations and cost information. If the approved duration is unsupported, stop and ask whether to change the duration or model. Never silently pad, shorten or split an approved shot.

## Canvas structure

Use one Melius project per client and one canvas per creative project revision.

Create a context rail with:

- artist or brand anchor;
- strategy and chosen concept;
- claim evidence and prohibited claims;
- approved art direction and treatment;
- timed copy;
- sound and post-production rules.

Create a production rail with one node per shot. Use an image node for a truly static approved shot and a video node for motion. Connect each node to the minimum context and product references it needs. Missing product references remain visible placeholders, not invented assets.

When the approved output is one film, add a stitch node in shot order but do not run it during staging. Exact typography, editorial timing and final sound remain post-production checks unless the approved plan assigns them to a verified Melius operation.

## Upload and reuse

Local uploads are for images the user supplied or authorised. Existing Melius library assets should be searched and placed instead of uploaded again. Public media URLs use the connector's URL import path when permitted. Do not download web assets and re-upload them as a workaround.

Record the stage in `07_melius/melius-canvas-receipt.json`. Include the package manifest hash, team, project and canvas names and IDs, URL when returned, staged node IDs, missing references, and `runs_authorized: false`.
