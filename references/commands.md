# Daily commands

Use `python3 tools/agency.py` from the repository. From an installed skill use its absolute script path and `--root /path/to/agency-workspace` before the subcommand.

```sh
python3 tools/agency.py create-client aster-vale --name 'Aster Vale' --type artist
python3 tools/agency.py start-project aster-vale new-single --name 'New single' --type single
python3 tools/agency.py prepare aster-vale new-single research
python3 tools/agency.py prepare aster-vale new-single strategy
python3 tools/agency.py status aster-vale new-single
```

Preparation creates the appropriate draft files without overwriting existing work. Codex fills the drafts using the phase workflow. DRAFT means unfinished. READY_FOR_REVIEW means the work is ready for human review, not approved. Required sections must be substantive. Optional unknowns stay UNKNOWN with a reason.

After a real user decision, save the exact message to a text file and record it:

```sh
python3 tools/agency.py approve aster-vale new-single opportunity --choice 03 --by Corey --evidence-file /path/to/actual-user-message.txt
python3 tools/agency.py prepare aster-vale new-single brief
python3 tools/agency.py prepare aster-vale new-single concepts
python3 tools/agency.py approve aster-vale new-single concept --choice 02 --by Corey --evidence-file /path/to/concept-approval.txt
python3 tools/agency.py prepare aster-vale new-single art-direction
python3 tools/agency.py approve aster-vale new-single art-direction --by Corey --evidence-file /path/to/art-approval.txt
python3 tools/agency.py prepare aster-vale new-single storyboard
python3 tools/agency.py approve aster-vale new-single storyboard --by Corey --evidence-file /path/to/storyboard-approval.txt
python3 tools/agency.py approve aster-vale new-single shot-list --by Corey --evidence-file /path/to/shot-list-approval.txt
python3 tools/agency.py prepare aster-vale new-single copy
python3 tools/agency.py prepare aster-vale new-single production
```

Approval phrases are `APPROVE OPPORTUNITY 03`, `APPROVE CONCEPT 02`, `APPROVE ART DIRECTION`, `APPROVE STORYBOARD`, `APPROVE SHOT LIST`, `APPROVE ASSETS`. The tool stores the message, reviewer, time and hashes of the reviewed files. It cannot authenticate who typed the message. Agents must never manufacture the evidence file.

Complete `06_storyboard/shot-plan.json` alongside the human-readable storyboard and shot list. It is the checked source for shot durations and generated Melius shot briefs. Populate every field, keep shot IDs unique, and make durations sum to the planned film duration. `prepare production` blocks on incomplete data and stale approvals.

```sh
python3 tools/agency.py prepare aster-vale new-single review
python3 tools/agency.py approve aster-vale new-single assets --by Corey --evidence-file /path/to/assets-approval.txt
python3 tools/agency.py prepare aster-vale new-single handoff
python3 tools/agency.py learn aster-vale new-single --file /path/to/results-or-feedback.md
```

For asset review, fill `09_review/asset-reviews.json`. Use relative paths beneath `08_generations/`. Every reviewed asset must exist; capture its SHA-256 using `python3 tools/agency.py asset-hash <path>`. Human-selected assets must have PASS and assessed scores on every criterion. PASS WITH CHANGES needs a new reviewed file before handoff. Handoff never invokes Axis.

Client learnings are append-only and include the project and time. For metrics, record platform, dates, attribution window, denominators, source and sample limitations. Reimporting the same text for the same project is idempotent.
