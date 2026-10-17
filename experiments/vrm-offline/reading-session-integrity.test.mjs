import test from 'node:test';
import assert from 'node:assert/strict';
import { nextTelemetryState } from './reading-session.mjs';
const now=Date.parse('2026-10-19T08:00:00Z');
const response={source:'vrm',readOnly:true,installationId:'1013398',data:{soc:82},updated:new Date(now-60000).toISOString()};
const poll=(args={})=>nextTelemetryState({installationId:'1013398',now,transportOk:true,response,...args});
test('timestamp regression is rejected',()=>{const r=poll({previous:poll().snapshot,response:{...response,updated:new Date(now-5*60000).toISOString(),data:{soc:2}}});assert.equal(r.status,'stale');assert.equal(r.snapshot.data.soc,82)});
