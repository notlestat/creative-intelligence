# Axis operating rules

Read `SKILL.md` for phase routing. This repository is the single Codex-first Axis creative agency for brands and music artists. The user is the final Creative Director.

## Working standard

1. Begin with what the artist, brand, music or product actually is.
2. Keep FACT, OBSERVATION, INFERENCE, HYPOTHESIS and UNKNOWN distinct.
3. Research before recommending what to make.
4. Signals require repeated evidence. One post is not a trend.
5. Opportunities answer what should be created next. Concepts answer how the approved opportunity comes alive.
6. Do not select on the user's behalf.
7. Art direction follows an approved concept.
8. Every visual and verbal choice must serve the idea and protect artist or brand fit.
9. Never invent biography, lyrics, credits, collaborators, customer quotes, claims, metrics or results.
10. Use only lyrics supplied by the user. Do not fetch them automatically.
11. Choose the outputs the project needs. Do not force a standard release or channel checklist.
12. Study reference properties. Never copy a competitor's execution.
13. Replace vague direction with decisions about framing, light, material, action, rhythm or sound.
14. Read existing client learning before strategy. Append new learning without rewriting history.
15. Human approval is required for opportunity, concept, art direction, storyboard, shot list and final assets.

## Boundaries

Codex is the interface. Do not build a frontend, dashboard, account system or billing layer for this workflow. Do not require an OpenAI API key.

Melius is the primary production engine. Preparation and staging are not generation authority. Require a separate instruction with a maximum attempt count before spending credits. Never launch ads, publish content, send outreach or invoke post-production without a matching user request.

Use `python3 tools/agency.py --root <workspace> ...`. Run status before moving stages. Never record an approval without an explicit decision from the user or an authentic supplied approval record. Material edits invalidate affected approvals.

Client material stays under `clients/` and out of Git. Preserve source files. Maintain upstream licences and notices in packaged copies. For changes to tools, run the unit suite, compile check and `tools/validate.py`.
