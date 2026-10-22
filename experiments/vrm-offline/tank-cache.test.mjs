import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeMetrics, snapshotFromVerifiedResponse, restoreSnapshot, assessReading} from './freshness.mjs';
const now=Date.parse('2026-10-22T11:00:00Z');
const updated=new Date(now-60000).toISOString();
const verified=data=>({source:'vrm',readOnly:true,installationId:'1013398',updated,data});
test('empty tank array is not telemetry',()=>{
 assert.equal(sanitizeMetrics({tanks:[]}),null);
 assert.equal(snapshotFromVerifiedResponse(verified({tanks:[]})),null);
 assert.equal(assessReading({data:{tanks:[]},updated,transportOk:true,now}).status,'waiting');
});
test('two water tanks at zero survive snapshot cache',()=>{
 const data={tanks:[{name:'Fresh Water 1',percentage:0,updated},{name:'Fresh Water 2',percentage:0,updated}]};
 const snap=snapshotFromVerifiedResponse(verified(data),now);
 assert.ok(snap);
 assert.deepEqual(snap.data.tanks.map(t=>t.percentage),[0,0]);
 const restored=restoreSnapshot(JSON.stringify(snap),'1013398');
 assert.deepEqual(restored.data.tanks,snap.data.tanks);
 assert.equal(assessReading({data:restored.data,updated,transportOk:false,now}).status,'offline');
});
test('invalid tank readings are rejected',()=>{
 assert.equal(sanitizeMetrics({tanks:[{name:'',percentage:0},{name:'Water 1',percentage:'0'},{name:'Water 2',percentage:101}]}),null);
});
test('AC power 0 is a real reading and strings are rejected',()=>{
 assert.equal(sanitizeMetrics({acLoadsWatts:0}).acLoadsWatts,0);
 assert.equal(sanitizeMetrics({acLoadsWatts:'42'}),null);
});
test('cache excludes unexpected fields and duplicate tank identities',()=>{
 const data=sanitizeMetrics({tanks:[{name:'Fresh Water 1',percentage:18,secret:'private'},{name:'fresh water 1',percentage:24}]});
 assert.equal(data.tanks.length,1);
 assert.equal(data.tanks[0].percentage,18);
 assert.equal(JSON.stringify(data).includes('private'),false);
});
test('old tank telemetry is stale',()=>{
 assert.equal(assessReading({data:{tanks:[{name:'Fresh Water 1',percentage:0}]},updated,transportOk:true,now:now+31*60000}).status,'stale');
});
