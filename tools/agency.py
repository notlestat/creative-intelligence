#!/usr/bin/env python3
"""Local Axis projects, approvals, Melius briefs and learning history. No network."""

import argparse
import hashlib
import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

BUNDLE = Path(__file__).resolve().parents[1]
PHASES = {
    "intake": ("01_intake", {"intake.md": "briefs/intake.md"}),
    "research": (
        "02_research",
        {
            f"{x}.md": f"research/{x}.md"
            for x in (
                "entity-intelligence",
                "audience-research",
                "cultural-research",
                "competitor-research",
                "creative-references",
                "signals",
                "research-summary",
                "evidence-log",
            )
        },
    ),
    "strategy": (
        "03_strategy",
        {"opportunities.md": "briefs/opportunities.md"},
    ),
    "brief": ("03_strategy", {"creative-brief.md": "briefs/creative-brief.md"}),
    "concepts": (
        "04_concepts",
        {
            **{f"concept-{i:02}.md": "concepts/concept.md" for i in range(1, 6)},
            "concept-comparison.md": "concepts/concept-comparison.md",
        },
    ),
    "art-direction": (
        "05_art-direction",
        {
            "creative-direction.md": "treatments/creative-direction.md",
            "art-direction.md": "treatments/art-direction.md",
            "moodboard-analysis.md": "treatments/moodboard-analysis.md",
            "project-system.md": "treatments/project-system.md",
            "reference-plan.md": "treatments/reference-plan.md",
        },
    ),
    "storyboard": (
        "06_storyboard",
        {
            "treatment.md": "treatments/treatment.md",
            "storyboard.md": "storyboards/storyboard.md",
            "shot-list.md": "storyboards/shot-list.md",
            "sound-plan.md": "storyboards/sound-plan.md",
            "shot-plan.json": "storyboards/shot-plan.json",
        },
    ),
    "copy": ("07_copy", {"copy.md": "briefs/copy.md"}),
    "production": ("07_melius", {}),
    "review": (
        "09_review",
        {
            "creative-review.md": "reviews/creative-review.md",
            "asset-reviews.json": "reviews/asset-reviews.json",
        },
    ),
    "handoff": ("10_approved", {}),
}
GATE_PHASE = {
    "opportunity": "strategy",
    "concept": "concepts",
    "art-direction": "art-direction",
    "storyboard": "storyboard",
    "shot-list": "storyboard",
    "assets": "review",
}
DEPS = {
    "opportunity": [],
    "concept": ["opportunity"],
    "art-direction": ["concept"],
    "storyboard": ["art-direction"],
    "shot-list": ["storyboard"],
    "assets": ["shot-list"],
}
PHASE_GATES = {
    "brief": ["opportunity"],
    "concepts": ["opportunity"],
    "art-direction": ["concept"],
    "storyboard": ["art-direction"],
    "copy": ["concept"],
    "production": ["concept", "art-direction", "storyboard", "shot-list"],
    "review": ["shot-list"],
    "handoff": ["assets"],
}
PREVIOUS = {
    "research": "intake",
    "strategy": "research",
    "brief": "strategy",
    "concepts": "brief",
}
CRITERIA = [
    "concept_fidelity",
    "art_direction",
    "brand_fit",
    "product_accuracy",
    "composition",
    "camera",
    "lighting",
    "continuity",
    "performance",
    "emotion",
    "believability",
    "ai_artifacts",
    "stopping_power",
    "message_clarity",
    "platform_suitability",
]
SHOT_FIELDS = [
    "objective",
    "visual_description",
    "subject",
    "environment",
    "composition",
    "camera",
    "movement",
    "lighting",
    "colour",
    "texture",
    "action",
    "product_details",
    "continuity",
    "starting_frame",
    "ending_frame",
    "sound_intent",
    "negative_constraints",
    "reference_notes",
]


class AgencyError(Exception):
    pass


def now():
    return datetime.now(timezone.utc).isoformat()


def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def slug(value):
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
        raise AgencyError(
            "Use a lowercase slug with letters, digits and single hyphens."
        )
    return value


def contained(base, relative):
    path = base / relative
    if Path(relative).is_absolute() or ".." in Path(relative).parts:
        raise AgencyError("Absolute paths and traversal are not allowed here.")
    if not path.resolve().is_relative_to(base.resolve()):
        raise AgencyError(f"Path escapes its workspace: {relative}")
    # Reject symlink aliases even when their targets remain inside the workspace.
    if any(p.is_symlink() for p in [path, *path.parents] if p != base.parent):
        raise AgencyError(f"Symlink path is not supported: {relative}")
    return path


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")
    temp.replace(path)


def read_json(path):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError) as e:
        raise AgencyError(f"Cannot read {path}: {e}") from e


def new_file(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(text)


def client_path(root, client):
    return contained(root, f"clients/{slug(client)}")


def campaign_path(root, client, campaign):
    path = contained(root, f"clients/{slug(client)}/projects/{slug(campaign)}")
    if not (path / "campaign.json").is_file():
        raise AgencyError("Project does not exist. Run start-project first.")
    return path


def ready(path, template=None):
    if not path.is_file():
        raise AgencyError(f"Missing deliverable: {path}")
    text = path.read_text()
    frontmatter = re.match(r"\A---\n(.*?)\n---\n", text, re.DOTALL)
    if not frontmatter or not re.search(
        r"^status: READY_FOR_REVIEW$", frontmatter[1], re.MULTILINE
    ):
        raise AgencyError(f"Draft is not ready for review: {path.name}")
    if "TO_COMPLETE" in text:
        raise AgencyError(f"Unfilled template fields in {path.name}")
    if len(text.strip()) < 120:
        raise AgencyError(f"Deliverable is too short to review: {path.name}")
    if template:
        expected = re.findall(r"^## (.+)$", template.read_text(), re.MULTILINE)
        for title in expected:
            section = re.search(
                r"^## " + re.escape(title) + r"\n(.*?)(?=^## |\Z)",
                text,
                re.MULTILINE | re.DOTALL,
            )
            if (
                not section
                or len(section[1].strip()) < 8
                or section[1].strip() in ("UNKNOWN", "NOT_ASSESSED")
            ):
                raise AgencyError(
                    f"Complete section '{title}' in {path.name}; explain any unknown."
                )


def phase_ready(campaign, phase):
    folder, mapping = PHASES[phase]
    for name in mapping:
        if name.endswith(".md"):
            ready(
                contained(campaign, f"{folder}/{name}"),
                BUNDLE / "templates" / mapping[name],
            )


def events(campaign):
    path = contained(campaign, "approvals.jsonl")
    if not path.exists():
        return []
    try:
        return [
            json.loads(line) for line in path.read_text().splitlines() if line.strip()
        ]
    except ValueError as e:
        raise AgencyError(
            "Approval ledger is malformed; recover it before proceeding."
        ) from e


def latest(campaign, gate):
    return next((e for e in reversed(events(campaign)) if e["gate"] == gate), None)


def gate_files(campaign, gate):
    # Hash all material inputs, including earlier stages, rather than trusting a status flag.
    folders = ["01_intake", "02_research"]
    specific_files = []
    if gate == "opportunity":
        specific_files.append("03_strategy/opportunities.md")
    else:
        folders.append("03_strategy")
    if gate != "opportunity":
        folders += ["04_concepts"]
    if gate not in ("opportunity", "concept"):
        folders += ["05_art-direction"]
    if gate in ("storyboard", "shot-list", "assets"):
        folders += ["06_storyboard"]
    if gate == "assets":
        folders += ["07_copy", "07_melius", "08_generations", "09_review"]
    result = [contained(campaign, "campaign.json")]
    client = campaign.parents[1]
    result.append(contained(client, "client.yaml"))
    result.extend(contained(campaign, rel) for rel in specific_files)
    for folder in folders:
        directory = contained(campaign, folder)
        for p in sorted(directory.rglob("*")):
            if p.is_symlink():
                raise AgencyError(f"Symlink found in material: {p}")
            if p.is_file():
                result.append(p)
    # Source files and knowledge are captured so changed facts invalidate creative decisions.
    for folder in ("brand", "source", "knowledge"):
        directory = contained(client, folder)
        for p in sorted(directory.rglob("*")):
            if p.is_symlink():
                raise AgencyError(f"Symlink found in client inputs: {p}")
            if p.is_file():
                result.append(p)
    return result


def fingerprint(campaign, gate):
    client = campaign.parents[1]
    return {str(p.relative_to(client)): sha(p) for p in gate_files(campaign, gate)}


def gate_status(campaign, gate):
    event = latest(campaign, gate)
    if not event:
        return "PENDING"
    if event["hashes"] != fingerprint(campaign, gate):
        return "STALE"
    for dep in DEPS[gate]:
        if gate_status(campaign, dep) != "APPROVED":
            return "STALE"
        if event["dependencies"].get(dep) != latest(campaign, dep)["id"]:
            return "STALE"
    return "APPROVED"


def require_gates(campaign, gates):
    for gate in gates:
        state = gate_status(campaign, gate)
        if state != "APPROVED":
            raise AgencyError(
                f"Human {gate} approval required; current state is {state}."
            )


def shot_plan(campaign):
    plan = read_json(contained(campaign, "06_storyboard/shot-plan.json"))
    shots = plan.get("shots", [])
    if not isinstance(shots, list) or not shots:
        raise AgencyError("Shot plan must contain at least one shot.")
    seen, total = set(), 0.0
    for shot in shots:
        ident = shot.get("id", "")
        if not re.fullmatch(r"shot-\d{2,3}", ident) or ident in seen:
            raise AgencyError("Shot IDs must be unique shot-01 style identifiers.")
        seen.add(ident)
        duration = shot.get("duration_seconds")
        if (
            isinstance(duration, bool)
            or not isinstance(duration, (int, float))
            or not math.isfinite(duration)
            or duration <= 0
        ):
            raise AgencyError(f"{ident}: positive duration required.")
        total += duration
        for field in SHOT_FIELDS:
            value = shot.get(field)
            if (
                not isinstance(value, str)
                or not value.strip()
                or value.strip() in ("UNKNOWN", "TO_COMPLETE")
            ):
                raise AgencyError(
                    f"{ident}: complete {field}; use NONE with a reason when inapplicable."
                )
        for key in ("expected_generations", "variants"):
            if type(shot.get(key)) is not int or shot[key] < 1:
                raise AgencyError(f"{ident}: {key} must be a positive integer.")
        if shot.get("risk") not in ("low", "medium", "high"):
            raise AgencyError(f"{ident}: risk must be low, medium or high.")
        for key in ("risk_reason", "validation_check", "fallback"):
            if not isinstance(shot.get(key), str) or shot[key].strip() in (
                "",
                "UNKNOWN",
                "TO_COMPLETE",
            ):
                raise AgencyError(f"{ident}: complete {key}.")
    target = plan.get("duration_seconds")
    if (
        type(target) not in (int, float)
        or not math.isfinite(target)
        or not math.isclose(total, target, abs_tol=0.01)
    ):
        raise AgencyError("Shot durations do not sum to campaign duration.")
    for key in ("aspect_ratios", "platform_versions"):
        if (
            not isinstance(plan.get(key), list)
            or not plan[key]
            or any(
                not isinstance(v, str) or v in ("UNKNOWN", "TO_COMPLETE", "")
                for v in plan[key]
            )
        ):
            raise AgencyError(f"Complete {key} in shot plan.")
    return plan


def reviews(campaign, approved_only=False):
    data = read_json(contained(campaign, "09_review/asset-reviews.json"))
    rows = data.get("assets", [])
    if not rows:
        raise AgencyError("No inspected assets recorded.")
    shots = {s["id"]: s for s in shot_plan(campaign)["shots"]}
    files, selected = set(), []
    for row in rows:
        filename = row.get("file", "")
        if not filename or filename in files:
            raise AgencyError("Each reviewed asset needs a unique file.")
        files.add(filename)
        path = contained(campaign / "08_generations", filename)
        if not path.is_file() or row.get("sha256") != sha(path):
            raise AgencyError(f"Missing or changed reviewed asset: {filename}")
        if row.get("shot_id") not in shots:
            raise AgencyError("Review references an unknown shot.")
        if row.get("classification") not in (
            "PASS",
            "PASS WITH CHANGES",
            "REGENERATE",
            "REJECT",
        ):
            raise AgencyError("Invalid review classification.")
        if type(row.get("selected")) is not bool:
            raise AgencyError(
                "Asset selected must be a boolean from the human selection."
            )
        if not row.get("inspection_notes") or row["inspection_notes"] == "TO_COMPLETE":
            raise AgencyError(
                "Record what was actually inspected, with timestamps or frame references."
            )
        if row.get("selected"):
            if row["classification"] != "PASS":
                raise AgencyError(
                    "Selected assets must pass. Review changed outputs again."
                )
            duration = row.get("duration_seconds")
            if (
                type(duration) not in (int, float)
                or not math.isfinite(duration)
                or duration < shots[row["shot_id"]]["duration_seconds"]
            ):
                raise AgencyError(
                    "Selected asset is shorter than the planned shot, or duration is unverified."
                )
            for criterion in CRITERIA:
                value = row.get("scores", {}).get(criterion)
                if (
                    type(value) not in (int, float)
                    or not math.isfinite(value)
                    or not 1 <= value <= 10
                ):
                    raise AgencyError(
                        f"Selected asset needs an assessed 1-10 score for {criterion}."
                    )
            selected.append(row)
    if approved_only:
        if len(selected) != len(shots) or {r["shot_id"] for r in selected} != set(
            shots
        ):
            raise AgencyError(
                "Select exactly one passing asset for every approved shot."
            )
        return selected
    return rows


def prepare(campaign, phase):
    require_gates(campaign, PHASE_GATES.get(phase, []))
    if phase in PREVIOUS:
        phase_ready(campaign, PREVIOUS[phase])
    if phase in ("strategy", "brief"):
        print(
            f"Read client learnings before strategy: {campaign.parents[1] / 'knowledge/learnings.md'}"
        )
    if phase == "production":
        return production(campaign)
    if phase == "handoff":
        return handoff(campaign)
    if phase == "review":
        package_current(campaign)
        if not any(
            p.is_file()
            for p in (campaign / "08_generations").rglob("*")
            if p.name != ".gitkeep"
        ):
            raise AgencyError("Place Melius outputs in 08_generations before review.")
    folder, mapping = PHASES[phase]
    for name, template in mapping.items():
        text = (BUNDLE / "templates" / template).read_text()
        text = text.replace("{{campaign}}", campaign.name).replace(
            "{{concept_id}}", name.removeprefix("concept-").removesuffix(".md")
        )
        new_file(contained(campaign, f"{folder}/{name}"), text)
    print(
        f"Prepared {phase} drafts in {campaign / folder}; fill them using the workflow."
    )


def package_current(campaign):
    manifest = read_json(contained(campaign, "07_melius/package-manifest.json"))
    if manifest.get("input_hashes") != fingerprint(
        campaign, "shot-list"
    ) or manifest.get("copy_sha256") != sha(contained(campaign, "07_copy/copy.md")):
        raise AgencyError(
            "Production package is stale. Reconcile and rebuild it before review."
        )
    for rel, digest in manifest.get("output_hashes", {}).items():
        path = contained(campaign / "07_melius", rel)
        if not path.is_file() or sha(path) != digest:
            raise AgencyError(
                "Production brief changed after packaging. Reconcile the package before review."
            )


def production(campaign):
    phase_ready(campaign, "copy")
    plan = shot_plan(campaign)
    destination = contained(campaign, "07_melius")
    # Protect hand-edited packages; an explicit new revision directory is needed after changes.
    if any(p.name != ".gitkeep" for p in destination.iterdir()):
        raise AgencyError(
            "Production package already exists. Archive it before creating a new revision."
        )
    for shot in plan["shots"]:
        content = f"# {shot['id']}\n\nUniversal Melius production brief. No provider-specific syntax.\n"
        for key in SHOT_FIELDS:
            content += f"\n## {key.replace('_', ' ').capitalize()}\n\n{shot[key]}\n"
        content += f"\n## Duration\n\n{shot['duration_seconds']} seconds.\n"
        new_file(destination / "shots" / f"{shot['id']}.md", content)
    concept = latest(campaign, "concept")["choice"]
    header = (
        f"# Melius master production brief\n\nApproved concept {concept}.\n\n"
        "Mode: universal prose. This tool does not submit generations or translate undocumented API fields.\n\n"
        f"Duration: {plan['duration_seconds']} seconds. Aspect ratios: {', '.join(plan['aspect_ratios'])}.\n"
        f"Platform versions: {', '.join(plan['platform_versions'])}.\n\n"
        "## Approved creative context\n\n"
    )
    for rel in (
        f"04_concepts/concept-{concept}.md",
        "05_art-direction/art-direction.md",
        "06_storyboard/treatment.md",
        "06_storyboard/sound-plan.md",
        "07_copy/copy.md",
    ):
        header += f"### Source: {rel}\n\n{contained(campaign, rel).read_text()}\n\n"
    header += "## Shot briefs\n\n" + "\n".join(
        f"- [Open {s['id']}](shots/{s['id']}.md)" for s in plan["shots"]
    )
    header += "\n\n## Approval and spend\n\nAll four creative gates were current when this package was built. Copy is included for review. Confirm current Melius capabilities and credit cost in Melius before spending. The user controls generation.\n"
    new_file(destination / "master-production-brief.md", header)
    risk_order = {"high": 0, "medium": 1, "low": 2}
    ordered = sorted(
        plan["shots"],
        key=lambda s: (
            risk_order[s["risk"]],
            s["expected_generations"] * s["variants"],
        ),
    )
    text = "# Generation plan\n\nCredit cost: UNKNOWN. No credits spent or authorized by this document.\n\nTest one candidate for the first high-risk shot, review it, then continue only if its validation check passes. At equal risk, test the smaller planned batch first. This is a provisional order until actual Melius costs are known.\n\n| Order | Shot | Risk | Variants | Attempts per variant | Maximum planned attempts | Validation and fallback |\n|---|---|---|---|---|---|---|\n"
    for i, s in enumerate(ordered, 1):
        text += f"| {i} | {s['id']} | {s['risk']}: {s['risk_reason']} | {s['variants']} | {s['expected_generations']} | {s['variants'] * s['expected_generations']} | {s['validation_check']}; fallback: {s['fallback']} |\n"
    text += f"\nMaximum planned attempts: {sum(s['variants'] * s['expected_generations'] for s in ordered)}. This is a cap, not a success forecast. Stop at the cap or on repeated product/identity failure. Ask the user to revise the plan before additional attempts.\n"
    new_file(destination / "generation-plan.md", text)
    save_json(
        destination / "package-manifest.json",
        {
            "created_at": now(),
            "mode": "universal-prose",
            "input_hashes": fingerprint(campaign, "shot-list"),
            "copy_sha256": sha(campaign / "07_copy/copy.md"),
            "output_hashes": {
                str(p.relative_to(destination)): sha(p)
                for p in sorted(destination.rglob("*.md"))
            },
        },
    )
    print(f"Production package prepared: {destination}")


def handoff(campaign):
    rows = {r["shot_id"]: r for r in reviews(campaign, approved_only=True)}
    plan = shot_plan(campaign)
    text = "# Axis post-production handoff\n\nHuman-approved assets. Prepared as a document only; Axis has not been invoked.\n\n| Order | Shot | Approved file | SHA-256 | Edit duration |\n|---|---|---|---|---|\n"
    for i, s in enumerate(plan["shots"], 1):
        r = rows[s["id"]]
        text += f"| {i} | {s['id']} | 08_generations/{r['file']} | {r['sha256']} | {s['duration_seconds']}s |\n"
    text += f"\nOutput aspect ratios: {', '.join(plan['aspect_ratios'])}. Platform versions: {', '.join(plan['platform_versions'])}.\n\n"
    for rel in (
        "06_storyboard/treatment.md",
        "06_storyboard/shot-list.md",
        "06_storyboard/sound-plan.md",
        "05_art-direction/art-direction.md",
        "07_copy/copy.md",
    ):
        text += (
            f"## Approved source: {rel}\n\n{contained(campaign, rel).read_text()}\n\n"
        )
    destination = contained(campaign, "10_approved/post-production-handoff.md")
    if destination.exists():
        raise AgencyError(
            "Handoff already exists. Archive it before making a new revision."
        )
    new_file(destination, text)
    print(destination)


def approve(campaign, args):
    gate = args.gate
    require_gates(campaign, DEPS[gate])
    phase_ready(campaign, GATE_PHASE[gate])
    if gate == "opportunity":
        if args.choice not in {f"{i:02}" for i in range(1, 11)}:
            raise AgencyError("Choose one of opportunity 01 through 10.")
        for phase in ("intake", "research", "strategy"):
            phase_ready(campaign, phase)
    if gate == "concept":
        if args.choice not in {f"{i:02}" for i in range(1, 6)}:
            raise AgencyError("Choose one of concept 01 through 05.")
        for phase in ("intake", "research", "strategy", "brief"):
            phase_ready(campaign, phase)
    if gate in ("storyboard", "shot-list", "assets"):
        shot_plan(campaign)
    if gate == "assets":
        package_current(campaign)
        reviews(campaign, approved_only=True)
        phase_ready(campaign, "copy")
    message = Path(args.evidence_file).read_text().strip()
    if gate in ("opportunity", "concept"):
        phrase = f"APPROVE {gate.upper()} {args.choice}"
    else:
        phrase = "APPROVE " + gate.upper().replace("-", " ")
    if message.strip().upper().rstrip(".") != phrase:
        raise AgencyError(
            f"Approval evidence must be the explicit user decision: {phrase}"
        )
    event = {
        "id": now(),
        "gate": gate,
        "reviewer": args.by,
        "message": message,
        "choice": args.choice if gate in ("opportunity", "concept") else None,
        "hashes": fingerprint(campaign, gate),
        "dependencies": {dep: latest(campaign, dep)["id"] for dep in DEPS[gate]},
    }
    with contained(campaign, "approvals.jsonl").open("a") as stream:
        stream.write(json.dumps(event, ensure_ascii=False) + "\n")
    print(f"Recorded {gate} approval by {args.by}. Material edits will invalidate it.")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    sub = parser.add_subparsers(dest="command", required=True)
    create = sub.add_parser("create-client", aliases=["create-artist"])
    create.add_argument("client")
    create.add_argument("--name", required=True)
    create.add_argument("--type", choices=("brand", "artist", "label"))
    start = sub.add_parser("start-project", aliases=["start-campaign"])
    start.add_argument("client")
    start.add_argument("campaign")
    start.add_argument("--name", required=True)
    start.add_argument(
        "--type",
        choices=(
            "brand-campaign",
            "single",
            "ep",
            "album",
            "artist-platform",
            "label-project",
        ),
        default="brand-campaign",
    )
    start.add_argument("--mock", action="store_true")
    for command in ("prepare", "status", "approve", "learn"):
        p = sub.add_parser(command)
        p.add_argument("client")
        p.add_argument("campaign")
        if command == "prepare":
            p.add_argument("phase", choices=PHASES)
        if command == "approve":
            p.add_argument("gate", choices=GATE_PHASE)
            p.add_argument("--choice", default="")
            p.add_argument("--by", required=True)
            p.add_argument("--evidence-file", required=True)
        if command == "learn":
            p.add_argument("--file", type=Path, required=True)
    sub.add_parser("asset-hash").add_argument("file", type=Path)
    args = parser.parse_args(argv)
    root = args.root.resolve()
    try:
        if args.command == "asset-hash":
            print(sha(args.file))
            return 0
        client = client_path(root, args.client)
        if args.command in ("create-client", "create-artist"):
            if client.exists():
                raise AgencyError(
                    "Client already exists; existing files were preserved."
                )
            template = (
                (BUNDLE / "templates/client.yaml")
                .read_text()
                .replace("{{name}}", json.dumps(args.name))
                .replace(
                    "{{entity_type}}",
                    args.type
                    or ("artist" if args.command == "create-artist" else "brand"),
                )
            )
            new_file(client / "client.yaml", template)
            for folder in ("logos", "guidelines", "products", "assets", "references"):
                (client / "brand" / folder).mkdir(parents=True)
            for folder in ("audio", "visuals", "documents", "lyrics", "references"):
                (client / "source" / folder).mkdir(parents=True)
            for topic in (
                "identity",
                "catalogue",
                "releases",
                "audience",
                "positioning",
                "cultural-context",
                "competitors",
                "previous-work",
                "learnings",
            ):
                new_file(
                    client / "knowledge" / f"{topic}.md",
                    f"# {topic.capitalize()}\n\nUNKNOWN. No client evidence recorded yet.\n",
                )
            (client / "projects").mkdir()
            print(client)
        elif args.command in ("start-project", "start-campaign"):
            if not (client / "client.yaml").is_file():
                raise AgencyError("Create the client first.")
            campaign = contained(client, f"projects/{slug(args.campaign)}")
            if campaign.exists():
                raise AgencyError(
                    "Campaign already exists; existing files were preserved."
                )
            campaign.mkdir(parents=True)
            save_json(
                campaign / "campaign.json",
                {
                    "name": args.name,
                    "project_type": args.type,
                    "mock": args.mock,
                    "created_at": now(),
                },
            )
            for folder in [v[0] for v in PHASES.values()] + ["08_generations"]:
                (campaign / folder).mkdir(exist_ok=True)
            prepare(campaign, "intake")
        else:
            campaign = campaign_path(root, args.client, args.campaign)
            if args.command == "prepare":
                prepare(campaign, args.phase)
            elif args.command == "approve":
                approve(campaign, args)
            elif args.command == "status":
                states = {g: gate_status(campaign, g) for g in GATE_PHASE}
                print(
                    json.dumps(
                        {
                            "campaign": str(campaign),
                            "gates": states,
                            "production_ready": all(
                                states[g] == "APPROVED"
                                for g in (
                                    "concept",
                                    "art-direction",
                                    "storyboard",
                                    "shot-list",
                                )
                            ),
                            "human_decision": "First pending or stale gate requires an explicit human decision.",
                        },
                        indent=2,
                    )
                )
            elif args.command == "learn":
                content = args.file.read_text().strip()
                if not content:
                    raise AgencyError("Learning note is empty.")
                note_id = hashlib.sha256(
                    (args.campaign + "\n" + content).encode()
                ).hexdigest()
                destination = contained(client, "knowledge/learnings.md")
                if note_id in destination.read_text():
                    print("This learning note is already recorded.")
                else:
                    with destination.open("a") as stream:
                        stream.write(
                            f"\n## {now()} | {args.campaign}\n\n<!-- learning-id: {note_id} -->\n\n{content}\n"
                        )
                    print(destination)
        return 0
    except (AgencyError, OSError, KeyError, TypeError) as e:
        print(f"Agency: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
