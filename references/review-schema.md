# Asset review record

In `09_review/asset-reviews.json`, use an `assets` array. Each item has `file`, `shot_id`, `sha256`, `classification`, `selected`, `inspection_notes`, verified `duration_seconds`, `scores` and `corrections`. File paths are relative to `08_generations/`. `selected` is a boolean set only from the human's selection.

The scores object uses `concept_fidelity`, `art_direction`, `brand_fit`, `product_accuracy`, `composition`, `camera`, `lighting`, `continuity`, `performance`, `emotion`, `believability`, `ai_artifacts`, `stopping_power`, `message_clarity` and `platform_suitability`. Scores are 1-10 with 10 strongest. `ai_artifacts` measures cleanliness, so 10 means none observed. Use `NOT_ASSESSED` when unavailable. A selected PASS asset needs all criteria assessed.

Inspection notes identify the actual viewed file and timestamps or frame numbers. Watch temporal criteria such as continuity and motion; still frames alone cannot establish them. If the environment cannot play the asset, inspect available evidence, record the limitation and request the necessary review. Never populate invented scores to make validation pass.

Correction format: shot/file | time/frame | observed fault | consequence | change | preserve | acceptance check. A weak first second is a creative assessment until measured against audience data.
