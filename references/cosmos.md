# Cosmos visual-discovery provider

Cosmos MCP is an optional reference-research provider for Axis. It can search and inspect public material, find visually similar images and, when the user's account is connected, organise collections. It does not replace the project brief, original-source research, rights checks or human creative direction.

## Start with capability, not assumption

Call `cosmos_whoami` before any other Cosmos tool. Record whether the session is read-only or authenticated. If Cosmos is unavailable, continue with other research sources and leave any provider-specific gap visible. Never make an Axis phase depend on Cosmos alone.

Never put a Cosmos bearer token, cookie, user ID or credential file in this repository, a client folder, a board, a prompt or chat. Authentication belongs in the user's local Cosmos MCP credential store.

## Research sequence

1. Read the intake, supplied assets and existing client knowledge first.
2. Turn the brief into several concrete visual properties: subject, action, setting, framing, light, material, colour, movement and tension as relevant.
3. Before sending a query or other request to Cosmos, check whether it would disclose confidential or unreleased client material. Use generic visual terms drawn from the properties above in that case. Send a private artist, album, product, campaign or internal name to Cosmos only after the user explicitly authorises that disclosure; do not infer permission from access to the brief or a request for visual research.
4. Search one property or combination at a time with `cosmos_search`, `cosmos_search_clusters`, `cosmos_browse_boards` or `cosmos_spotlights`.
5. Inspect a small shortlist with `cosmos_view_images`. Captions and rankings do not substitute for looking.
6. Use `cosmos_similar_elements` only from a seed that genuinely fits. Re-seed when results become repetitive, generic or drift from the brief.
7. For a named subject that can be disclosed under step 3, favour exact search and reject visually similar but factually wrong results. For a mood or aesthetic, similar-image discovery can carry more weight, but still test it against the brief.
8. Present the reviewed shortlist to the user before developing concepts or finalising art direction.

## Reference record

For every retained reference, record:

- Cosmos element or collection URL and access date
- original source URL and creator when available
- `UNKNOWN` when creator, source or rights are missing
- the reference's job in the project
- the specific property to study
- what must not be copied
- whether the image itself was inspected

Cosmos is a discovery layer. Verify claims about people, releases, products, dates, audiences and culture against appropriate sources. Presence, popularity or save count on Cosmos is not evidence of a trend by itself.

## Account writes and privacy

Searching and inspecting public references are read-only. Do not create, save, reorganise, rename, follow, pin or delete anything in the user's Cosmos account without a matching request.

When the user asks for a collection:

- create it private by default
- save only the reviewed shortlist, not an unfiltered search dump
- report exactly what was created or changed
- require a separate explicit instruction before making a collection public
- require explicit confirmation immediately before permanent deletion

Cosmos uses an unofficial private API and can change or stop working. Treat access as current capability, not a permanent guarantee.
