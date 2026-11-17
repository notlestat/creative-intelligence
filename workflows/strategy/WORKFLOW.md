# Opportunities and creative brief

Read `knowledge/learnings.md`, intake, research summary, evidence log and signals before proposing work.

Run `python3 <skill-root>/tools/agency.py --root <workspace> taste` and read the returned director history before drafting opportunities or the creative brief. Follow [director feedback guidance](../../references/director-taste.md). Keep each reason tied to its artist, brand and decision date. Current instructions, project evidence and the brief take priority. One decision is not a general preference.

First run `prepare <client> <project> strategy`. Read `.agents/skills/ci-opportunity-engine/SKILL.md`. Create a small field of distinct opportunities. Ten is a maximum, not a target. Each route needs evidence, counter-evidence, fit, originality, feasibility and a clear answer to why this artist or brand should make it now. Do not manufacture urgency.

Present the opportunities with tradeoffs and a recommendation, then stop. The user selects with `APPROVE OPPORTUNITY 03`, or another numbered route. A recommendation is not approval.

If the user explains the choice or rejects other routes, capture their exact reasons with the approval. Do not add reasons on their behalf or require a note before continuing.

After current opportunity approval, run `prepare <client> <project> brief`. Use `skills/ci-positioning/SKILL.md` when the market frame needs clarification, then `.agents/skills/ci-creative-strategy/SKILL.md`. The brief must name the approved opportunity, identity or music truth, audience tension, proposition, emotional target, required outputs and evidence limits.

Set completed files to `READY_FOR_REVIEW`. Do not move into concepts until the chosen opportunity remains approved and the brief is complete.
