#!/usr/bin/env python3
"""Check agency contracts, source notices and package boundaries."""

import json
import re
import sys
from pathlib import Path

from agency import PHASES
from package_skill import files

ROOT = Path(__file__).resolve().parents[1]


def main():
    errors = []
    skills = [
        ROOT / "SKILL.md",
        *sorted((ROOT / "skills").glob("*/SKILL.md")),
        *sorted((ROOT / ".agents/skills").glob("*/SKILL.md")),
    ]
    for path in skills:
        content = path.read_text()
        match = re.match(r"---\nname: ([a-z0-9-]+)\ndescription: ([^\n]+)\n", content)
        if not match:
            errors.append(f"Bad skill frontmatter: {path}")
        elif path.parent != ROOT and match[1] != path.parent.name:
            errors.append(f"Skill name differs from folder: {path}")
    for _, mapping in PHASES.values():
        for template in mapping.values():
            if not (ROOT / "templates" / template).is_file():
                errors.append(f"Missing template: {template}")
    source_manifest = json.loads((ROOT / "references/skill-sources.json").read_text())
    for source in source_manifest["skills"]:
        if source["distribution"] == "bundled":
            folder = ROOT / "skills" / source["name"]
            for name in ("LICENSE", "SKILL.md", "upstream-SKILL.md"):
                if not (folder / name).is_file():
                    errors.append(f"Missing source material: {folder / name}")
            if source["license"] == "CC-BY-4.0" and not (folder / "NOTICE").is_file():
                errors.append(f"Missing attribution notice: {folder}")
    for path in files():
        rel = path.relative_to(ROOT)
        if (
            ".local" in rel.parts
            or rel.parts[0] == "clients"
            or "axis-meta-context" in rel.parts
        ):
            errors.append(f"Private material enters package: {rel}")
    # Check maintained Markdown links, excluding unchanged upstream reference documents.
    maintained = [ROOT / "README.md", ROOT / "SKILL.md", *ROOT.glob("workflows/*/*.md")]
    for path in maintained:
        for target in re.findall(r"\]\(([^)]+)\)", path.read_text()):
            if "://" in target or target.startswith("#"):
                continue
            if not (path.parent / target.split("#")[0]).exists():
                errors.append(f"Broken maintained link in {path}: {target}")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(
        f"Validated {len(skills)} skill entry points, templates, notices, links and distribution boundaries."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
