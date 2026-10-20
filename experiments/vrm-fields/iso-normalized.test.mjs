import test from 'node:test';
import assert from 'node:assert/strict';
import { extractNormalizedSnapshot } from './iso-normalized.mjs';
const nowSeconds = 1792459805;
const row = (code, description, rawValue, timestamp) => ({code,description,rawValue,timestamp});
const read = (records, extra={}) => extractNormalizedSnapshot({records,...extra},{nowSeconds});

test('ISO UTC fresh DC zero is retained',()=>{
 const x=read([row('Pdc','DC system power',0,'2026-10-20T01:30:00Z')]);
 assert.equal(x.status,'fresh');assert.equal(x.dcPower,0);
});
test('offset timestamps preserve two distinct zero-percent tanks',()=>{
 const x=read([row('T','Fresh Water 1 level %',0,'2026-10-20T12:30:00+11:00'),row('T','Fresh Water 2 level %',0,'2026-10-20T12:30:01+11:00')]);
 assert.equal(x.status,'fresh');assert.deepEqual(x.tanks.map(t=>t.percentage),[0,0]);
});
test('stale inverter is not revived by fresh DC',()=>{
 const x=read([row('State','VE.Bus state',9,'2026-10-20T00:00:00Z'),row('Pdc','DC system power',42,'2026-10-20T01:30:00Z')]);
 assert.equal(x.status,'fresh');assert.equal(x.inverter,null);assert.equal(x.dcPower,42);
});
test('explicit offline suppresses data',()=>{
 const x=read([row('Pdc','DC system power',42,'2026-10-20T01:30:00Z')],{online:false});
 assert.equal(x.status,'offline');assert.equal(x.dcPower,null);
});
test('timezone-less timestamp is not assumed local',()=>{
 const x=read([row('Pdc','DC system power',42,'2026-10-20T01:30:00')]);
 assert.equal(x.status,'unknown');assert.equal(x.dcPower,null);
});
test('input diagnostics are not mutated',()=>{
 const d={records:[row('Pdc','DC system power',42,'2026-10-20T01:30:00Z')]};
 extractNormalizedSnapshot(d,{nowSeconds});
 assert.equal(d.records[0].timestamp,'2026-10-20T01:30:00Z');
});
