# Verification record

Verified on 2026-09-09 after merging the Creative Intelligence prototype into the Codex-first creative agency.

- All 24 skill entry points passed the repository validator: one lead skill, eight established agency specialists and fifteen original intelligence specialists.
- The lead skill and all fifteen project-local intelligence skills passed the official Codex skill validator.
- The Python tools passed Ruff lint and formatting checks.
- Twenty-eight unit tests passed. They cover artist creation, release type, source folders, intake completeness, opportunity and concept approvals, stale decisions, storyboard and shot-list gates, production attempt caps, asset hashes, review requirements, handoff and append-only learning.
- A packaged copy installed into a fresh temporary location, passed its own tests and validation, and created a synthetic artist EP project with every approval state pending.
- The package includes the current stage-only Melius canvas contract and excludes client files, local restricted material and credentials.

Verified on 2026-09-29 after adding Cosmos as an optional visual-discovery provider.

- A live `cosmos_whoami` capability check reported an authenticated session and all 36 Cosmos tools available. The local build was based on [`mrmos/cosmos-mcp`](https://github.com/mrmos/cosmos-mcp) version 0.1.1 at commit `e29141f41e1f5a4f8f6c88170838b75c8d6f6d80`.
- The [Cosmos operating rules](cosmos.md) were added to the research and art-direction workflows.
- No Cosmos credential, account token, client material or bundled Cosmos runtime is stored in this repository or packaged with the skill.

Verified on 2026-11-17 after adding the director's taste ledger.

- Thirty-nine unit tests passed, including verbatim decision reasons, plain approval compatibility, unchanged approval gates, shared history across clients, repeat-read deduplication, correction preservation, interrupted-write recovery and private package boundaries.
- Python compilation, the repository validator, Ruff checks and formatting checks passed for the changed Python files.
- A separate CLI process recorded a synthetic concept decision, returned its reasons and source through `taste`, and surfaced them during concept preparation. The synthetic fixtures were temporary and did not enter the workspace history.
- A generated archive included the director feedback guide, excluded client files and director history, and passed validation after extraction.
- No real director preferences were seeded. No live creative project, connected production provider or improvement in creative quality was assessed by these checks.

These checks prove workflow mechanics and packaging. They do not prove creative quality, rights clearance, research truth, platform access, campaign results or current Melius prices. Those need project-specific evidence and human review.
