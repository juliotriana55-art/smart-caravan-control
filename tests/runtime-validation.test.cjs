const {test}=require('node:test');const assert=require('node:assert/strict');const R=require('../staging/runtime.js');
test('empty object and empty tanks are unavailable',()=>{assert.equal(R.usable({}),false);assert.equal(R.usable({soc:null,tanks:[]}),false)});
test('zero tanks and zero solar are real values',()=>{assert.equal(R.usable({tanks:[{percentage:0}]}),true);assert.equal(R.usable({solarWatts:0}),true)});
test('nonfinite numbers rejected',()=>{assert.equal(R.usable({soc:NaN,voltage:Infinity}),false)});
test('unknown timestamp and future timestamp rejected',()=>{for(const t of [null,'2026-10-22 10:00','bad','2099-01-01T00:00:00Z'])assert.equal(R.timestamp(t),null)});
test('explicit UTC timestamp accepted',()=>assert.equal(R.timestamp('2026-01-01T00:00:00Z'),'2026-01-01T00:00:00.000Z'));
