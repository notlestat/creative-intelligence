# Corey Kavanagh creative intelligence

A Codex-first creative workflow for brands, artists and releases. Give Codex a client, the source material and the job. Codex keeps the work in local files, conducts evidence-led research, develops options and stops for your decisions.

There is no website, subscription product or model API to configure. Codex is the working interface.

## Setup

Requires Python 3.9+ for the file tools. Their runtime uses the standard library. Open the checkout in Codex for the research and creative workflow; the CLI creates and validates files rather than doing that work itself.

```sh
git clone https://github.com/notlestat/creative-intelligence.git
cd creative-intelligence
python3 tools/agency.py --help
```

Read [AGENTS.md](AGENTS.md) and [SKILL.md](SKILL.md) for routing, and [the command reference](references/commands.md) for manual operation.

Corey Kavanagh is the current practice. This checkout still uses `axis-creative-agency` in skill metadata, installer paths and internal operating files. Those are existing implementation identifiers. The separate [axis-creative-agency repository](https://github.com/notlestat/axis-creative-agency) contains the earlier campaign workflow.

An optional `python3 tools/install_skill.py --dest /path/to/skills/axis-creative-agency` copies a self-contained skill. Without `--dest`, it targets `$CODEX_HOME/skills/axis-creative-agency` or `~/.codex/skills/axis-creative-agency`. It preserves an existing destination and exits with code 2; review the target before installing alongside another version.

## Start an artist project

Open this folder in Codex and say:

> Start a new artist project for [artist]. This is a [single, EP, album or artist platform]. Here are the music, brief, links, assets and deadlines.

Codex will create the artist and project folders, organise what you supplied, identify the few missing answers that change the work, and begin the correct phase.

You can also run the file tools directly:

```sh
python3 tools/agency.py create-client aster-vale --name "Aster Vale" --type artist
python3 tools/agency.py start-project aster-vale new-single --name "New single" --type single
python3 tools/agency.py status aster-vale new-single
```

## The workflow

1. Intake and source organisation
2. Artist or brand intelligence
3. Audience, culture, competitor and visual research
4. Evidence-linked signals
5. Up to ten distinct creative opportunities
6. Your opportunity decision
7. Creative brief and five developed concepts
8. Your concept decision
9. Creative direction, art direction and moodboard analysis
10. Storyboard, shot list, sound and copy
11. Production package and controlled generation
12. Asset review, handoff and saved learning

The workflow supports brands, artists, singles, EPs, albums, ongoing artist platforms and label projects through the same evidence and approval system. It chooses only the deliverables the project needs. It does not force every artist into the same rollout checklist.

## Cosmos visual research

Codex can use the optional Cosmos MCP integration to search public visual references, inspect images and expand promising seeds through similar-image discovery. It is a research provider inside the existing workflow, not a replacement for the brief, creative judgment or approval gates.

Use the [Cosmos operating rules](references/cosmos.md) for query privacy, reference records, account writes and credential boundaries.

## Human decisions

Codex recommends but does not select. The guarded stages require explicit decisions:

- `APPROVE OPPORTUNITY 03`
- `APPROVE CONCEPT 02`
- `APPROVE ART DIRECTION`
- `APPROVE STORYBOARD`
- `APPROVE SHOT LIST`
- `APPROVE ASSETS`

Melius remains the primary visual production engine. Preparing or staging a Melius package does not authorise generation or credit spend. Generation requires a separate instruction naming the shot and maximum attempts.

## Client records

Each client lives under `clients/<slug>/`:

- `client.yaml` records supplied facts, preferences and unknowns.
- `source/` holds original music, lyrics, images, documents and references.
- `knowledge/` holds identity, audience, catalogue, competitors and append-only learnings.
- `projects/<project>/` holds the complete working trail from intake to handoff.

Client files are excluded from Git. Facts, observations, inferences, hypotheses and unknowns stay visibly separate.

## Checks

```sh
PYTHONPYCACHEPREFIX=/tmp/axis-agency-pycache python3 -m unittest discover -s tests -v
PYTHONPYCACHEPREFIX=/tmp/axis-agency-pycache python3 -m compileall -q tools tests
python3 tools/validate.py
```

The previous web application remains recoverable in this repository's Git history at commit `8e2e03a`. It is not part of the current file-based workflow.

The checks above cover local tools and contracts. They do not verify a connected Cosmos account, Melius staging or paid generation.
