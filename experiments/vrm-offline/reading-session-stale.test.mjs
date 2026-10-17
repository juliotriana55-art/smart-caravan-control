import test from 'node:test';
import assert from 'node:assert/strict';
import { nextTelemetryState } from './reading-session.mjs';
const now=Date.parse('2026-10-19T08:00:00Z');
const response={source:'vrm',readOnly:true,installationId:'1013398',data:{soc:82},updated:new Date(now-60000).toISOString()};
const poll=(args={})=>nextTelemetryState({installationId:'1013398',now,transportOk:true,response,...args});
test('stale after 31 minutes',()=>assert.equal(poll({previous:poll().snapshot,now:now+31*60000}).status,'stale'));
test('recovers with new reading',()=>assert.equal(poll({previous:poll().snapshot,now:now+31*60000,response:{...response,updated:new Date(now+30*60000).toISOString()}}).status,'fresh'));
