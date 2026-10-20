"""Static regression checks for the non-production Smart Caravan Control pilot."""
from pathlib import Path
from html.parser import HTMLParser
import unittest

PAGE = Path(__file__).resolve().parents[1] / "pilot-5.html"

class IDs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
    def handle_starttag(self, tag, attrs):
        self.ids.extend(value for key, value in attrs if key == "id")

class Pilot5Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = PAGE.read_text(encoding="utf-8")
        cls.parser = IDs()
        cls.parser.feed(cls.html)

    def test_unique_ids(self):
        self.assertEqual(len(cls_ids := self.parser.ids), len(set(cls_ids)))

    def test_key_controls(self):
        required = {"talk", "question", "voiceStatus", "gallery", "stage", "captureList",
                    "capacity", "manualSoc", "manualLoad", "estimate", "status", "sampleTime"}
        self.assertFalse(required - set(self.parser.ids))

    def test_simulation_clearly_labelled(self):
        self.assertIn("SIMULATED DATA", self.html)
        self.assertIn("NOT CERBO GX LIVE", self.html)
        self.assertIn("not automated 3D reconstruction", self.html)

    def test_photo_and_marker_storage(self):
        self.assertIn("indexedDB.open", self.html)
        self.assertIn("persistPins()", self.html)
        speech = (PAGE.parent / "experiments/jay-ai/safari-speech-session.js").read_text(encoding="utf-8")
        self.assertIn("root.persistPins=async function()", speech)
        self.assertIn("pins:SCCEquipmentPins.list(pins)", speech)
        self.assertIn("src=\"experiments/jay-ai/safari-speech-session.js\"", self.html)

    def test_no_provider_or_control_calls(self):
        self.assertNotIn("api.openai.com", self.html)
        self.assertNotIn("OPENAI_API_KEY", self.html)

if __name__ == "__main__":
    unittest.main()
