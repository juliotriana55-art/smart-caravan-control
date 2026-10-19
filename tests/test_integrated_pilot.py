import unittest
from pathlib import Path
class IntegratedPilot(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.app=Path('index.html').read_text(encoding='utf-8')
 def test_push_to_talk_present(self):
  self.assertIn('id="pushTalk"',self.app)
  self.assertIn("$('pushTalk').onclick",self.app)
 def test_tank_dashboard_support(self):
  self.assertIn('id="tankList"',self.app)
  self.assertIn("Array.isArray(json.data.tanks)",self.app)
  self.assertIn('tankRoot.replaceChildren()',self.app)
 def test_tanks_zero_is_valid(self):
  self.assertIn('t.percentage>=0',self.app)
 def test_no_canned_voice_enabled_speech(self):
  self.assertNotIn("speak(st.speechLang==='es-ES'?'Voz activada.':'Voice enabled.')",self.app)
 def test_readonly_telemetry(self):
  self.assertIn("'/telemetry'",self.app)
  self.assertIn("cache:'no-store'",self.app)
if __name__=='__main__':unittest.main()
