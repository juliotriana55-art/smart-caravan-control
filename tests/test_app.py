"""Non-deploying smoke checks for the GitHub Pages application."""
import pathlib
import unittest
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]

class ElementScanner(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "script":
            self.scripts.append(attrs)

class AppSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.doc = ElementScanner()
        cls.doc.feed(cls.html)

    def test_html_document(self):
        self.assertIn("<!doctype html>", self.html.lower())
        self.assertIn("<html", self.html.lower())
        self.assertIn("</html>", self.html.lower())

    def test_critical_sections_exist(self):
        expected = {"dashboard", "caravan", "assistant", "maintenance", "settings"}
        self.assertTrue(expected.issubset(self.doc.ids),
                        f"Missing sections: {expected - self.doc.ids}")

    def test_user_controls_exist(self):
        expected = {"refresh", "saveCaravan"}
        self.assertTrue(expected.issubset(self.doc.ids),
                        f"Missing controls: {expected - self.doc.ids}")

    def test_page_title(self):
        self.assertIn("Smart Caravan Control", self.html)

if __name__ == "__main__":
    unittest.main()
