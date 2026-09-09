# Source inspection and integration decisions

Inspected on 2026-09-03. Exact commits and full repository file inventories with hashes are in skill-sources.json and upstream-inventory.json. Repository entry points, licences, selected skill instructions and relevant methodology references were read. Unselected materials were inventoried and scoped out; inventory is not a claim of semantic verification of every case card or vendor assertion.

| Repository | Licence found | Selected | Decision |
|---|---|---|---|
| smixs/creative-director-skill | CC BY 4.0 | creative-director | Bundled with full supporting library and notices; adapted entry point |
| smixs/visual-skills | CC BY 4.0 | image and video | Both bundled; use universal visual/cinematic methodology, Melius adapter for production |
| realjaymes/marketingagentskills | MIT, James Praise | ad-creative, product-positioning, product-messaging, icp-persona | Bundled under Axis-specific names |
| adkit/ads-skills | AdKit Skills License | meta-ads-strategy | Internal local installation only; excluded from redistribution |

The marketing repository does not contain skills literally named `copywriting`, `product-marketing` or `customer-research` at this commit. Product positioning and messaging cover the relevant strategy/message work; icp-persona helps structure audience evidence. Persona generation is not customer research. Competitive-intelligence, customer-segments and copy-anatomy were inspected but not installed: the agency research workflow covers the needed competitor/consumer work without sales battlecards, lifecycle segmentation or copy templating. No additional source repositories were added.

## Conflicts resolved

- Creative director's top-three/automatic-refinement loop becomes five final territories, honest ten-criterion agency scoring and a human concept decision. Originality checks remain bounded by actual sources inspected; library URLs and claims need verification before client use.
- Visual skills retain original references, but their model selector and generator syntax do not operate in this agency. Universal direction feeds a dedicated Melius adapter. Provider examples in references do not establish Melius support.
- Ad-creative's aggressive copy default, mandatory creative-type detour, 5x5x5 production quotas, generation tools, Remotion and vault export are removed from the active entry point. Brand voice and approved concept govern copy.
- Positioning/messaging/persona minimum list sizes and realistic invented quotes are removed. Evidence and declared uncertainty govern output length and claims.
- AdKit account setup, launch, pixel, budget and execution routing are excluded. Only creative context/diagnostics are consulted, and current platform facts still need official verification.

Each bundled skill has a namespaced SKILL.md, original upstream-SKILL.md and licence notices. Supporting source resources are unchanged. The original entry point is provenance, not an alternate workflow. Existing globally installed generic skills were preserved.

## Melius connector update

On 2026-09-07, the production adapter was updated against Melius's official MCP, canvas, upload and video-node documentation. The update adds a stage-only connected handoff after the required creative approvals. It can create Melius project and canvas structure, literal context nodes, approved shot nodes, authorised image references, edges and a stitch plan. It cannot start a run without a separate user instruction naming the shot or nodes and a maximum attempt count.

The local universal production package remains the approval and provenance record. Live Melius guides, model listings and tool schemas control provider-specific node settings because those capabilities can change. The update adds no Melius code or provider content to the package and stores no credentials.

## AdKit restriction

The upstream licence grants personal/internal business use and restricts redistribution and competing products. The user's requested internal system uses a local copy. Neither that source nor its local adaptation is committed or packaged. The repository contains only an installer that fetches the pinned source for the user's own local installation. Do not publish that local dependency as part of a distributed service or skill library.

## Attribution

Serge Shima, https://github.com/smixs/creative-director-skill and https://github.com/smixs/visual-skills. CC BY 4.0. Original notices also identify https://t.me/aimastersme, https://sergeshima.com and https://aimasters.me. Creative director was created in collaboration with Paul Deadcough. Axis adaptations change routing, approval handling and output contracts as described above; no endorsement is implied.

James Praise, https://github.com/realjaymes/marketingagentskills. MIT. Original copyright and permission text are retained in each included adaptation.

AdKit, https://github.com/adkit/ads-skills. Copyright 2026 AdKit. Local installation retains the entire upstream licence.
