import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeStagingTelemetry} from './telemetry-adapter.mjs';
const now=1750000000;
const row=(code,description,rawValue,timestamp=now)=>({code,description,rawValue,timestamp});
const records=[row('SOC','Battery state of charge',83),row('V','Battery voltage',13.2),row('ScW','Solar charger power',244),row('Pdc','DC system power',41),row('Pac','AC loads',52),row('State','MultiPlus VE.Bus state',9),row('T','Fresh Water 1 level %',0),row('T','Fresh Water 2 level %',63)];
test('integrates batteries, solar, DC, AC, inverter and two water tanks',()=>{
 const a=normalizeStagingTelemetry({records},{nowSeconds:now});
 assert.equal(a.status,'fresh');assert.equal(a.data.soc,83);assert.equal(a.data.voltage,13.2);
 assert.equal(a.data.solarWatts,244);assert.equal(a.data.dcPower,41);assert.equal(a.data.acLoadsWatts,52);
 assert.equal(a.data.inverter,'on');assert.deepEqual(a.data.tanks.map(t=>t.percentage),[0,63]);
});
test('never presents stale or offline readings as live',()=>{
 const stale=normalizeStagingTelemetry({records:records.map(r=>({...r,timestamp:now-3600}))},{nowSeconds:now});
 assert.equal(stale.status,'stale');assert.equal(stale.data.soc,null);assert.deepEqual(stale.data.tanks,[]);
 const offline=normalizeStagingTelemetry({online:false,records},{nowSeconds:now});
 assert.equal(offline.status,'offline');assert.equal(offline.data.inverter,null);
});
test('unrecognized inverter states remain unknown',()=>{
 const a=normalizeStagingTelemetry({records:[row('State','MultiPlus VE.Bus state',3)]},{nowSeconds:now});
 assert.equal(a.data.inverter,null);assert.equal(a.status,'unknown');
});
test('ISO timestamp with timezone is supported',()=>{
 const iso=new Date(now*1000).toISOString();
 const a=normalizeStagingTelemetry({records:[row('SOC','Battery state of charge',0,iso)]},{nowSeconds:now});
 assert.equal(a.status,'fresh');assert.equal(a.data.soc,0);
});
