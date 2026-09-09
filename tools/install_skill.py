#!/usr/bin/env python3
"""Install this repository as a self-contained Codex skill without overwriting existing skills."""

import argparse
import os
import shutil
import sys
from pathlib import Path

from package_skill import ROOT, files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dest",
        type=Path,
        default=Path(os.environ.get("CODEX_HOME", str(Path.home() / ".codex")))
        / "skills"
        / "axis-creative-agency",
    )
    args = parser.parse_args()
    dest = args.dest.expanduser()
    if dest.exists() or dest.is_symlink():
        print(f"Destination already exists; preserved: {dest}", file=sys.stderr)
        return 2
    dest.mkdir(parents=True)
    for source in files():
        target = dest / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    print(
        f"Installed {dest}. Available on the next Codex turn. Client files belong in your agency workspace."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
