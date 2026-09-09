# Melius production preparation

Read `skills/melius-production/SKILL.md`. Run status. Require current opportunity, concept, art-direction, storyboard and shot-list approvals; copy must be ready for review. Reconcile the written shot list with shot-plan.json before packaging.

Inspect project `references/melius/` and any campaign-supplied documentation. Record the doc path/URL, version, checked date and capability in a capability note. Without documentation, use universal prose and leave API syntax, supported durations, resolution, seeds, reference count, audio generation and credit costs UNKNOWN. Do not select another engine.

Also inspect `.local/melius/` when present; it is the designated location for confidential provider documents. Connected staging follows `references/melius/canvas-handoff.md` and the live Melius guide. Local preparation requires no API key.

Run `prepare <client> <project> production`. It creates a master brief, self-contained shot briefs, a generation plan and an input manifest. Review the generated package as an agency production planner, not just a file exporter. Each shot should be executable with minimal interpretation and repeat the identity, artist or product, reference-role and continuity constraints it needs.

The generation plan lists shots, variants, expected attempts, high-risk failures, a provisional cheapest validation order and fallback. Verify costs in Melius before spending. Test the difficult shot first and review it before the full batch. A failed hand/product/identity test is a reason to revise the shot, not spend indefinitely. This system makes no generation calls.

Keep old package revisions instead of overwriting manually edited briefs. Place new outputs under 08_generations using shot ID and variant/take in filenames. Record the actual prompt/reference set used and any Melius changes.
