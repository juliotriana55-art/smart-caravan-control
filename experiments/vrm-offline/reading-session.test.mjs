import test from 'node:test';
import assert from 'node:assert/strict';
import { nextTelemetryState } from './reading-session.mjs';
test('failed poll cannot be fresh', () => { const x = nextTelemetryState({transportOk:false,installationId:'1013398'}); assert.equal(x.status,'error'); });
