// Regression guard: pilot must define the photo renderer called after upload.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'pilot-5.html'), 'utf8');
assert.match(html, /function showStage\(item\)/, 'Photo renderer must exist');
assert.match(html, /showStage\(saved\[saved.length-1\]\)/, 'Photo upload must open saved photo');
assert.match(html, /choose.onclick=\(\)=>showStage\(item\)/, 'Gallery must open selected photo');
assert.match(html, /SCCEquipmentPins\.move\(/, 'Selected pin must be movable');
assert.match(html, /SCCEquipmentPins\.remove\(/, 'Selected pin must be removable');
console.log('pilot photo renderer integration guards passed');
