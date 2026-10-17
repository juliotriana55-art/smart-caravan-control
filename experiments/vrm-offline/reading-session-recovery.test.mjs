import test from 'node:test';
import assert from 'node:assert/strict';
import { nextTelemetryState } from './reading-session.mjs';
const now=Date.parse('2026-10-19T08:00:00Z');
const response={source:'vrm',readOnly:true,installationId:'1013398',data:{soc:82},updated:new Date(now-60000).toISOString()};
const poll=(args={})=>nextTelemetryState({installationId:'1013398',now,transportOk:true,response,...args});
test('fresh',()=>assert.equal(poll().status,'fresh'));
test('offline',()=>assert.equal(poll({previous:poll().snapshot,transportOk:false}).status,'offline'));
