"""Synthetic fixtures exercise workflow invariants; none are human campaign approvals."""

import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import agency
import package_skill


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="ci-test-")
        self.root = Path(self.temp.name).resolve()
        self.run_cli(
            "create-client",
            "mock",
            "--name",
            "Synthetic artist fixture",
            "--type",
            "artist",
        )
        self.run_cli(
            "start-project",
            "mock",
            "launch",
            "--name",
            "Fixture release",
            "--type",
            "single",
            "--mock",
        )
        self.campaign = self.root / "clients/mock/projects/launch"

    def tearDown(self):
        self.temp.cleanup()

    def run_cli(self, *args):
        with (
            contextlib.redirect_stdout(io.StringIO()),
            contextlib.redirect_stderr(io.StringIO()),
        ):
            return agency.main(["--root", str(self.root), *args])

    def complete(self, phase):
        with contextlib.redirect_stdout(io.StringIO()):
            agency.prepare(self.campaign, phase)
        folder, mapping = agency.PHASES[phase]
        for name in mapping:
            if name.endswith(".md"):
                path = self.campaign / folder / name
                path.write_text(
                    path.read_text()
                    .replace("status: DRAFT", "status: READY_FOR_REVIEW")
                    .replace(
                        "TO_COMPLETE",
                        "Synthetic fixture content used only for a workflow test. No real-world claim.",
                    )
                )
        if phase == "storyboard":
            plan = {
                "duration_seconds": 3,
                "aspect_ratios": ["9:16"],
                "platform_versions": ["Meta fixture"],
                "shots": [
                    {
                        "id": "shot-01",
                        "duration_seconds": 3,
                        **{
                            key: "Synthetic physical direction for test only."
                            for key in agency.SHOT_FIELDS
                        },
                        "risk": "high",
                        "risk_reason": "Synthetic identity risk",
                        "validation_check": "Inspect shape",
                        "fallback": "Static shot",
                        "variants": 1,
                        "expected_generations": 2,
                    }
                ],
            }
            agency.save_json(self.campaign / "06_storyboard/shot-plan.json", plan)

    def approval(self, gate, choice=""):
        evidence = self.root / "synthetic-evidence.txt"
        phrase = (
            f"APPROVE {gate.upper()} {choice}"
            if gate in ("opportunity", "concept")
            else "APPROVE " + gate.upper().replace("-", " ")
        )
        evidence.write_text(phrase)
        with contextlib.redirect_stdout(io.StringIO()):
            agency.approve(
                self.campaign,
                SimpleNamespace(
                    gate=gate,
                    choice=choice,
                    by="SYNTHETIC TEST",
                    evidence_file=str(evidence),
                ),
            )

    def concepts(self):
        for phase in ("intake", "research", "strategy"):
            self.complete(phase)
        self.approval("opportunity", "03")
        for phase in ("brief", "concepts"):
            self.complete(phase)

    def production(self):
        self.concepts()
        self.approval("concept", "03")
        self.complete("art-direction")
        self.approval("art-direction")
        self.complete("storyboard")
        self.approval("storyboard")
        self.approval("shot-list")
        self.complete("copy")
        with contextlib.redirect_stdout(io.StringIO()):
            agency.prepare(self.campaign, "production")

    def reviewed_asset(self):
        self.production()
        asset = self.campaign / "08_generations/shot-01-take-01.test"
        asset.write_bytes(b"SYNTHETIC NON-MEDIA FIXTURE")
        self.complete("review")
        row = {
            "file": asset.name,
            "shot_id": "shot-01",
            "duration_seconds": 3,
            "sha256": agency.sha(asset),
            "classification": "PASS",
            "selected": True,
            "inspection_notes": "Synthetic fixture at frame 0, not a real media review.",
            "scores": {key: 7 for key in agency.CRITERIA},
            "corrections": [],
        }
        agency.save_json(
            self.campaign / "09_review/asset-reviews.json", {"assets": [row]}
        )
        return asset, row

    def test_duplicate_client_preserves_original(self):
        original = (self.root / "clients/mock/client.yaml").read_text()
        self.assertEqual(
            self.run_cli("create-client", "mock", "--name", "Overwrite"), 2
        )
        self.assertEqual(original, (self.root / "clients/mock/client.yaml").read_text())

    def test_artist_client_has_source_and_identity_memory(self):
        client = self.root / "clients/mock"
        self.assertIn("entity_type: artist", (client / "client.yaml").read_text())
        self.assertTrue((client / "source/audio").is_dir())
        self.assertTrue((client / "source/lyrics").is_dir())
        self.assertTrue((client / "knowledge/catalogue.md").is_file())
        self.assertEqual(
            "single", agency.read_json(self.campaign / "campaign.json")["project_type"]
        )

    def test_traversal_slug_rejected(self):
        self.assertEqual(self.run_cli("create-client", "../../bad", "--name", "Bad"), 2)

    def test_symlink_escape_rejected(self):
        (self.root / "clients/escape").symlink_to(
            self.root.parent, target_is_directory=True
        )
        self.assertEqual(
            self.run_cli("start-campaign", "escape", "bad", "--name", "Bad"), 2
        )

    def test_research_requires_filled_intake(self):
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "research")

    def test_ready_flag_cannot_replace_content(self):
        path = self.campaign / "01_intake/intake.md"
        path.write_text(
            path.read_text().replace("status: DRAFT", "status: READY_FOR_REVIEW")
        )
        with self.assertRaises(agency.AgencyError):
            agency.phase_ready(self.campaign, "intake")

    def test_missing_required_section_rejected(self):
        self.complete("intake")
        path = self.campaign / "01_intake/intake.md"
        path.write_text(
            path.read_text().replace(
                "## Music, product, offer or release", "## Removed"
            )
        )
        with self.assertRaises(agency.AgencyError):
            agency.phase_ready(self.campaign, "intake")

    def test_concepts_do_not_approve_themselves(self):
        self.concepts()
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "PENDING")
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "art-direction")

    def test_concepts_require_opportunity_approval(self):
        for phase in ("intake", "research", "strategy"):
            self.complete(phase)
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "brief")
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "concepts")

    def test_signal_change_stales_opportunity_approval(self):
        for phase in ("intake", "research", "strategy"):
            self.complete(phase)
        self.approval("opportunity", "03")
        self.assertEqual(agency.gate_status(self.campaign, "opportunity"), "APPROVED")
        path = self.campaign / "02_research/signals.md"
        path.write_text(path.read_text() + "\nChanged signal.\n")
        self.assertEqual(agency.gate_status(self.campaign, "opportunity"), "STALE")

    def test_negated_approval_not_accepted(self):
        self.concepts()
        evidence = self.root / "no.txt"
        evidence.write_text("DO NOT APPROVE CONCEPT 03")
        with self.assertRaises(agency.AgencyError):
            agency.approve(
                self.campaign,
                SimpleNamespace(
                    gate="concept", choice="03", by="Test", evidence_file=str(evidence)
                ),
            )

    def test_approval_hashes_bind_concept(self):
        self.concepts()
        self.approval("concept", "03")
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "APPROVED")
        path = self.campaign / "04_concepts/concept-03.md"
        path.write_text(path.read_text() + "\nMaterial change.\n")
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "STALE")

    def feedback_approval(self, message, gate="concept", choice="03"):
        evidence = self.root / "synthetic-feedback.txt"
        evidence.write_text(message)
        return self.run_cli(
            "approve",
            "mock",
            "launch",
            gate,
            "--choice",
            choice,
            "--by",
            "SYNTHETIC TEST",
            "--evidence-file",
            str(evidence),
        )

    def test_feedback_is_verbatim_linked_and_keeps_approval_current(self):
        self.concepts()
        message = (
            "APPROVE CONCEPT 03\n"
            "why: The image carries the idea.\n"
            "rejected: 01 and 04 use neon that feels wrong for this artist."
        )
        self.assertEqual(self.feedback_approval(message), 0)
        event = agency.latest(self.campaign, "concept")
        self.assertEqual(event["message"], message)
        self.assertEqual(event["feedback"]["why"], "The image carries the idea.")
        history = (self.root / "director/taste.md").read_text()
        self.assertIn(event["feedback"]["why"], history)
        self.assertIn(event["feedback"]["rejected"], history)
        self.assertIn("clients/mock/projects/launch/approvals.jsonl", history)
        self.assertIn(event["id"], history)
        self.assertIn("SYNTHETIC TEST", history)
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "APPROVED")
        # New taste notes do not change the already-reviewed project material.
        with (self.root / "director/taste.md").open("a") as stream:
            stream.write("\n## Dated correction\nA later explicit preference.\n")
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "APPROVED")
        material = self.campaign / "04_concepts/concept-03.md"
        material.write_text(material.read_text() + "\nMaterial edit.\n")
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "STALE")
        self.assertIn(
            event["feedback"]["why"], (self.root / "director/taste.md").read_text()
        )

    def test_plain_approval_does_not_invent_feedback(self):
        self.concepts()
        self.approval("concept", "03")
        self.assertNotIn("feedback", agency.latest(self.campaign, "concept"))
        self.assertFalse((self.root / "director").exists())

    def test_invalid_feedback_cannot_create_an_approval_or_taste_entry(self):
        self.concepts()
        before = (self.campaign / "approvals.jsonl").read_text()
        for message in (
            "DO NOT APPROVE CONCEPT 03\nwhy: Test reason.",
            "APPROVE CONCEPT 03\nActually, do not approve this.",
            "APPROVE CONCEPT 03\nwhy:",
            "APPROVE CONCEPT 03\nwhy: First reason.\nwhy: Other reason.",
        ):
            with self.subTest(message=message):
                self.assertEqual(self.feedback_approval(message), 2)
                self.assertEqual(
                    before, (self.campaign / "approvals.jsonl").read_text()
                )
                self.assertFalse((self.root / "director").exists())

    def test_feedback_still_requires_current_gates(self):
        self.assertEqual(
            self.feedback_approval("APPROVE CONCEPT 03\nwhy: Test reason."), 2
        )
        self.assertFalse((self.root / "director").exists())

    def test_taste_history_appends_across_clients_without_reimporting(self):
        self.concepts()
        self.assertEqual(
            self.feedback_approval("APPROVE CONCEPT 03\nwhy: First reason."), 0
        )
        history = self.root / "director/taste.md"
        before = history.read_text()
        # Simulate another project's saved decision, with the same timestamp.
        self.run_cli("create-client", "second", "--name", "Synthetic second client")
        self.run_cli("start-project", "second", "other", "--name", "Fixture", "--mock")
        other = self.root / "clients/second/projects/other"
        event = agency.latest(self.campaign, "concept").copy()
        event["feedback"] = {"rejected": "Second project's explicit reason."}
        (other / "approvals.jsonl").write_text(json.dumps(event) + "\n")
        self.assertEqual(self.run_cli("taste"), 0)
        after = history.read_text()
        self.assertTrue(after.startswith(before))
        self.assertIn("Second project's explicit reason.", after)
        self.assertIn("clients/second/projects/other/approvals.jsonl", after)
        self.run_cli("taste")
        self.assertEqual(after, history.read_text())

    def test_prepare_surfaces_existing_director_feedback(self):
        self.concepts()
        self.feedback_approval("APPROVE CONCEPT 03\nwhy: A distinctive image.")
        for phase in ("strategy", "brief", "concepts"):
            with (
                self.subTest(phase=phase),
                contextlib.redirect_stdout(io.StringIO()) as out,
            ):
                agency.prepare(self.campaign, phase)
                self.assertIn("A distinctive image.", out.getvalue())
                self.assertIn("director/taste.md", out.getvalue())

    def test_feedback_works_for_unnumbered_gate(self):
        self.concepts()
        self.approval("concept", "03")
        self.complete("art-direction")
        self.assertEqual(
            self.feedback_approval(
                "APPROVE ART DIRECTION\nrejected: Glossy materials lose the idea.",
                gate="art-direction",
                choice="",
            ),
            0,
        )
        self.assertIsNone(agency.latest(self.campaign, "art-direction")["choice"])
        self.assertIn("Glossy materials", (self.root / "director/taste.md").read_text())

    def test_unsafe_taste_path_is_rejected_before_approval(self):
        self.concepts()
        before = (self.campaign / "approvals.jsonl").read_text()
        outside = self.root / "outside"
        outside.mkdir()
        (self.root / "director").symlink_to(outside, target_is_directory=True)
        self.assertEqual(
            self.feedback_approval("APPROVE CONCEPT 03\nwhy: Test reason."), 2
        )
        self.assertEqual(before, (self.campaign / "approvals.jsonl").read_text())
        self.assertFalse((outside / "taste.md").exists())

    def test_failed_taste_write_preserves_feedback_for_recovery(self):
        self.concepts()
        with patch.object(agency, "append_taste", side_effect=OSError("Write failed")):
            self.assertEqual(
                self.feedback_approval("APPROVE CONCEPT 03\nwhy: Recover this reason."),
                2,
            )
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "APPROVED")
        count = len(agency.events(self.campaign))
        self.assertEqual(self.run_cli("taste"), 0)
        self.assertIn(
            "Recover this reason.", (self.root / "director/taste.md").read_text()
        )
        self.assertEqual(len(agency.events(self.campaign)), count)

    def test_taste_recovers_an_incomplete_append_and_preserves_corrections(self):
        self.concepts()
        with patch.object(agency, "append_taste", side_effect=OSError("Interrupted")):
            self.feedback_approval("APPROVE CONCEPT 03\nwhy: Complete reason.")
        history = self.root / "director/taste.md"
        history.parent.mkdir()
        partial = (
            "# Director's taste ledger\n\n## Explicit dated correction\nKeep this.\n"
        )
        partial += "\n## Interrupted entry\nWhy chosen:\n\n> Complete"
        history.write_text(partial)
        self.assertEqual(self.run_cli("taste"), 0)
        recovered = history.read_text()
        self.assertTrue(recovered.startswith(partial))
        self.assertIn("> Complete reason.", recovered)
        self.run_cli("taste")
        self.assertEqual(recovered, history.read_text())

    def test_new_brand_input_invalidates_approval(self):
        self.concepts()
        self.approval("concept", "03")
        (self.root / "clients/mock/brand/products/new-spec.md").write_text(
            "Changed product shape"
        )
        self.assertEqual(agency.gate_status(self.campaign, "concept"), "STALE")

    def test_storyboard_requires_art_approval(self):
        self.concepts()
        self.approval("concept", "03")
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "storyboard")

    def test_production_requires_each_gate(self):
        self.concepts()
        self.approval("concept", "03")
        self.complete("art-direction")
        self.approval("art-direction")
        self.complete("storyboard")
        self.approval("storyboard")
        self.complete("copy")
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "production")
        self.assertFalse(any((self.campaign / "07_melius").iterdir()))

    def test_duration_mismatch_rejected(self):
        path = self.campaign / "06_storyboard/shot-plan.json"
        self.production()
        data = agency.read_json(path)
        data["duration_seconds"] = 9
        agency.save_json(path, data)
        with self.assertRaises(agency.AgencyError):
            agency.shot_plan(self.campaign)

    def test_invalid_nonfinite_duration_rejected(self):
        self.production()
        path = self.campaign / "06_storyboard/shot-plan.json"
        data = agency.read_json(path)
        data["shots"][0]["duration_seconds"] = float("nan")
        agency.save_json(path, data)
        with self.assertRaises(agency.AgencyError):
            agency.shot_plan(self.campaign)

    def test_production_package_has_complete_shot_and_attempt_cap(self):
        self.production()
        shot = (self.campaign / "07_melius/shots/shot-01.md").read_text()
        self.assertIn("Starting frame", shot)
        self.assertIn("Negative constraints", shot)
        self.assertIn(
            "Maximum planned attempts: 2",
            (self.campaign / "07_melius/generation-plan.md").read_text(),
        )
        self.assertFalse(any((self.campaign / "08_generations").iterdir()))

    def test_package_does_not_overwrite_manual_work(self):
        self.production()
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "production")

    def test_copy_change_stales_production_package(self):
        self.production()
        path = self.campaign / "07_copy/copy.md"
        path.write_text(path.read_text() + "\nNew claim.\n")
        with self.assertRaises(agency.AgencyError):
            agency.package_current(self.campaign)

    def test_missing_generation_not_reviewable(self):
        self.production()
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "review")

    def test_changed_asset_rejected(self):
        asset, _ = self.reviewed_asset()
        asset.write_bytes(b"A different take")
        with self.assertRaises(agency.AgencyError):
            agency.reviews(self.campaign, approved_only=True)

    def test_not_assessed_cannot_pass_final_selection(self):
        _, row = self.reviewed_asset()
        row["scores"]["continuity"] = "NOT_ASSESSED"
        agency.save_json(
            self.campaign / "09_review/asset-reviews.json", {"assets": [row]}
        )
        with self.assertRaises(agency.AgencyError):
            agency.reviews(self.campaign, approved_only=True)

    def test_pass_with_changes_cannot_enter_handoff(self):
        _, row = self.reviewed_asset()
        row["classification"] = "PASS WITH CHANGES"
        agency.save_json(
            self.campaign / "09_review/asset-reviews.json", {"assets": [row]}
        )
        with self.assertRaises(agency.AgencyError):
            self.approval("assets")

    def test_handoff_needs_final_human_approval(self):
        self.reviewed_asset()
        with self.assertRaises(agency.AgencyError):
            agency.prepare(self.campaign, "handoff")

    def test_synthetic_handoff_contains_selected_files_and_copy(self):
        self.reviewed_asset()
        self.approval("assets")
        agency.prepare(self.campaign, "handoff")
        text = (self.campaign / "10_approved/post-production-handoff.md").read_text()
        self.assertIn("shot-01-take-01.test", text)
        self.assertIn("07_copy/copy.md", text)
        self.assertIn("9:16", text)

    def test_learning_append_preserves_history_and_deduplicates(self):
        note = self.root / "note.md"
        note.write_text(
            "Client feedback: prefer simple props. CTR: UNKNOWN; no live campaign."
        )
        history = self.root / "clients/mock/knowledge/learnings.md"
        before = history.read_text()
        self.assertEqual(
            self.run_cli("learn", "mock", "launch", "--file", str(note)), 0
        )
        after = history.read_text()
        self.assertTrue(after.startswith(before))
        self.run_cli("learn", "mock", "launch", "--file", str(note))
        self.assertEqual(after, history.read_text())

    def test_package_excludes_clients_and_restricted_source(self):
        paths = [p.relative_to(package_skill.ROOT).parts for p in package_skill.files()]
        self.assertTrue(paths)
        self.assertFalse(
            any(
                p[0] in ("clients", "director")
                or ".local" in p
                or "ci-meta-context" in p
                for p in paths
            )
        )

    def test_package_excludes_a_populated_director_history(self):
        (self.root / "director").mkdir()
        (self.root / "director/taste.md").write_text("PRIVATE SYNTHETIC FEEDBACK")
        (self.root / "README.md").write_text("Public documentation")
        with patch.object(package_skill, "ROOT", self.root):
            paths = [p.relative_to(self.root).as_posix() for p in package_skill.files()]
        self.assertEqual(paths, ["README.md"])


if __name__ == "__main__":
    unittest.main()
