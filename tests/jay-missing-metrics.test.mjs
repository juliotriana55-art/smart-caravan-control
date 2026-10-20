import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync('experiments/jay-ai/contextual-answer.js','utf8');
const sandbox={};sandbox.window=sandbox;vm.runInNewContext(source,sandbox);
test('missing simulated metrics never appear as zero',()=>{
 const a=sandbox.SCCJayContext.answer('Battery voltage now',{}, {soc:null,voltage:null,solar:null},'offline','en-AU');
 assert.doesNotMatch(a,/0%|0\.00 V|0 W/);
 assert.match(a,/last simulated sample/);
});
