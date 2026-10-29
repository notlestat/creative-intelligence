# Campaign reference library

An attributed campaign-card collection for pattern comparison and originality review. The index and grouping files describe the bundled cards; their contents are reference material, not independently verified campaign evidence.

## Index files

| File | Grouping |
| --- | --- |
| [MOC-index.md](MOC-index.md) | Year |
| [MOC-pattern.md](MOC-pattern.md) | Creative mechanism |
| [MOC-emotion.md](MOC-emotion.md) | Emotion tier |
| [MOC-format.md](MOC-format.md) | Format |
| [MOC-industry.md](MOC-industry.md) | Industry |
| [MOC-budget.md](MOC-budget.md) | Budget |

`cards/` contains the individual Markdown records. [The tag schema](../tag-schema.md) defines their frontmatter. To obtain the card count for this checkout, run from this directory:

```sh
python3 -c 'from pathlib import Path; print(sum(1 for _ in Path("cards").glob("*.md")))'
```

## Evidence labels

Cards contain frontmatter and sections for insight, execution, interpretation, pattern reuse, and related records. Confidence and quality labels distinguish fuller records from inferred or minimal entries. Those labels do not establish independent verification.

The inherited library marks its source URLs as unverified. Check the original campaign source before citing a record in client work. Treat explanations of why a campaign worked as interpretations unless supported by evidence. Pattern frequency in this collection does not establish market-wide saturation or a measured originality score.

## Maintenance scripts

The specialist's `scripts/` directory contains schema validation, index generation, and related-link generation. The scripts declare Python 3.11+ and PyYAML. With those dependencies installed, run from this specialist's root directory:

```sh
python3 scripts/validate_schema.py
```

Index and related-link regeneration modify the bundled reference records. Inspect and review those changes separately from a documentation edit.

Author: Serge Shima, [sergeshima.com](https://sergeshima.com), [aimasters.me](https://aimasters.me). License: CC BY 4.0, attribution required. Source: [smixs/creative-director-skill](https://github.com/smixs/creative-director-skill).
