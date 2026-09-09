#!/usr/bin/env python3
"""Fetch the pinned AdKit Meta skill for local internal use; never bundle it."""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

COMMIT = "9bb3f878a73e01c65a1fc105010985ba32b9afa7"
ENTRY = """---
name: axis-meta-context
description: Consult locally installed AdKit Meta creative context for Axis format, placement and diagnostic questions. Internal use only; no account execution.
---

# Meta creative context

Read only 5-creative.md for creative/placement questions, 8-results.md for diagnostics or 4-copy.md for copy. Use the existing agency brief. Verify current platform facts against official Meta documentation.

Do not configure accounts, pixels or budgets; do not launch, publish or call AdKit. The agency user controls decisions and Melius is production. Upstream lifecycle/execution instructions are outside scope.

Internal-only adaptation of AdKit, https://github.com/adkit/ads-skills. Retain LICENSE. Redistribution is restricted. Original entry retained as upstream-SKILL.md.
"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    dest = args.root / ".local/skills/axis-meta-context"
    if dest.exists() or dest.is_symlink():
        print(f"Existing local installation preserved: {dest}")
        return 0
    with tempfile.TemporaryDirectory(prefix="axis-meta-") as temp:
        repo = Path(temp) / "source"
        subprocess.run(
            [
                "git",
                "clone",
                "--no-checkout",
                "https://github.com/adkit/ads-skills.git",
                str(repo),
            ],
            check=True,
        )
        subprocess.run(
            ["git", "-C", str(repo), "checkout", "--detach", COMMIT], check=True
        )
        source = repo / "skills/meta-ads-strategy"
        shutil.copytree(source, dest)
        shutil.copy2(repo / "LICENSE", dest / "LICENSE")
        (dest / "SKILL.md").rename(dest / "upstream-SKILL.md")
        (dest / "SKILL.md").write_text(ENTRY)
    print(
        f"Installed internal-only Meta context: {dest}. Exclude .local from distribution."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
