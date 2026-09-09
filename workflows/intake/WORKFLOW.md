# Client and artist intake

For a new artist, run `create-client <slug> --name <name> --type artist`, then `start-project <client> <project> --name <name> --type <single|ep|album|artist-platform>`. Brand and label work use their matching types.

Save untouched originals under `source/`: audio, user-supplied lyrics, visuals, documents and references. Preserve filenames where possible. Record usage or confidentiality restrictions. Do not fetch lyrics.

Read existing `client.yaml` and `knowledge/` before asking questions. Gather only missing answers that change the work, such as the actual music or product, objective, audience action, deliverables, deadline, budget, rights, current identity and decision makers. Never invent biography, credits, collaborators, release dates or commercial claims.

Fill `01_intake/intake.md`. Attribute client and artist statements. Use UNKNOWN with a reason where information is missing. Set `status: READY_FOR_REVIEW` when the intake is sufficient to begin research without hiding important gaps.
