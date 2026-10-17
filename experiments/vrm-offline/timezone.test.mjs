import test from 'node:test';
import assert from 'node:assert/strict';
import { assessReading, snapshotFromVerifiedResponse, restoreSnapshot } from './freshness.mjs';
const now=Date.parse('2026-10-19T08:00:00Z');
const metrics={soc:82};
const assess=(updated,transportOk=true)=>assessReading({data:metrics,updated,transportOk,now});
test('no timezone cannot be fresh',()=>assert.equal(assess('2026-10-19T07:59:00').status,'unknown'));
test('space-separated local timestamp cannot be fresh',()=>assert.equal(assess('2026-10-19 07:59:00').status,'unknown'));
test('UTC timestamp is fresh',()=>assert.equal(assess('2026-10-19T07:59:00Z').status,'fresh'));
test('explicit Australian offset is fresh',()=>assert.equal(assess('2026-10-19T18:59:00+11:00').status,'fresh'));
test('ambiguous timestamp is not cached as valid',()=>{
const snap=snapshotFromVerifiedResponse({source:'vrm',readOnly:true,installationId:'1013398',data:metrics,updated:'2026-10-19T07:59:00'},now);
assert.equal(snap.updated,null);
assert.equal(restoreSnapshot(snap,'1013398').updated,null);
});
test('connection failure is offline even with ambiguous source timestamp',()=>assert.equal(assess('2026-10-19T07:59:00',false).status,'offline'));
