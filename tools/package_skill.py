#!/usr/bin/env python3
"""Build a self-contained skill archive without client data or local dependencies."""

import argparse
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INCLUDED = (
    "SKILL.md",
    "AGENTS.md",
    "README.md",
    "THIRD_PARTY_NOTICES.md",
    "requirements-dev.txt",
    "agents",
    ".agents/skills",
    "skills",
    "tools",
    "tests",
    "workflows",
    "templates",
    "references",
    "docs",
    "examples",
)


def files():
    for name in INCLUDED:
        source = ROOT / name
        for path in sorted(source.rglob("*") if source.is_dir() else [source]):
            if path.is_symlink():
                raise ValueError(f"Refusing symlink in package: {path}")
            if (
                path.is_file()
                and "__pycache__" not in path.parts
                and path.suffix not in (".pyc", ".pyo")
            ):
                yield path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out", type=Path, default=ROOT / "dist/axis-creative-agency.zip"
    )
    args = parser.parse_args()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    inventory = {}
    with zipfile.ZipFile(args.out, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in files():
            relative = str(path.relative_to(ROOT))
            archive.write(path, "axis-creative-agency/" + relative)
            inventory[relative] = hashlib.sha256(path.read_bytes()).hexdigest()
    manifest = args.out.with_suffix(".manifest.json")
    manifest.write_text(json.dumps(inventory, indent=2) + "\n")
    print(
        f"{args.out}: {len(inventory)} files; client data and AdKit content excluded."
    )


if __name__ == "__main__":
    main()
