# Director's taste ledger

The ledger records why the director chose a route and why they rejected alternatives. It keeps their words, the date, reviewer, gate, choice and source project. It does not infer preferences or evaluate creative quality.

## Capture a decision

In conversation, give a decision and any reasons you want saved. Codex records the approval through the existing tool. Reasons are optional at every gate.

For manual operation, an evidence file can contain the explicit approval phrase followed by one `why:` line, one `rejected:` line, or both. This is a fictional format example, not an approval:

```text
APPROVE CONCEPT 02
why: The image carries the idea without explaining it in the headline.
rejected: 01 and 04 use neon that feels wrong for this artist.
```

Only use words the user supplied. Keep reasons on their labelled line. The CLI accepts blank lines and case differences in the labels. It rejects empty reasons, repeated labels, negated approval phrases and unlabelled text after the decision. It cannot authenticate the speaker.

After saving a real approval message, run the usual command:

```sh
python3 tools/agency.py --root /path/to/workspace approve example-artist new-single concept --choice 02 --by Director --evidence-file /path/to/actual-approval.txt
```

The approval record stores the full message and its reasons. The tool also appends the reasons to `<workspace>/director/taste.md`. A decision without reasons adds no taste entry. Rejected options remain feedback text; the tool does not infer their numbers or change their approval state.

## Read decisions before drafting

```sh
python3 tools/agency.py --root /path/to/workspace taste
```

The command returns the history across clients and projects in that workspace. Strategy, brief and concept preparation also returns it. Codex must read and apply relevant feedback while drafting; the Python tool creates files and records decisions, not creative work.

Keep each reason in its original context. Rejecting neon for one artist does not prohibit neon for another. Current instructions, the brief and project evidence take priority. A single decision is not evidence of a lasting preference. When describing a pattern, cite repeated decisions and label your interpretation as INFERENCE.

An entry records a past decision about the reviewed files. It does not prove that the direction remains approved after edits. Run status on the source project when current approval matters.

Use client learning for the client's preferences. Use director feedback for the director's decisions. Do not copy confidential client details into another client's deliverables.

## Correct a preference

Tell Codex what changed and which earlier decision it concerns. Codex appends your correction to `director/taste.md` with the date and original decision source. The original entry stays intact. Newer explicit corrections take priority over the affected older feedback.

Taste notes do not invalidate existing project approvals. Changes to the project material still make the relevant approvals stale.

## Recover a missing entry

The project approval record is the source for captured decision reasons. If the approval saves but the shared history write fails, run `taste`. It appends missing entries without repeating the approval or duplicating existing entries. It preserves existing history and corrections.

## Keep the history private

`director/` is excluded from Git and the skill package. The ledger is local to the chosen workspace, shared across its clients. Separate workspaces have separate histories. No model training, network request or automatic Notion sync runs through this feature.

For an external workspace, add `director/` to that workspace's ignore rules before tracking its files. Back up the workspace if you need to preserve its history.
