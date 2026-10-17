import test from 'node:test';
import assert from 'node:assert/strict';
import {parseWakeCommand} from '../voice/wake-parser.mjs';
test('default phrase',()=>assert.equal(parseWakeCommand('Jay AI hello').command,'hello'));
test('custom name',()=>assert.equal(parseWakeCommand('Charlie hello','Charlie').command,'hello'));
test('renamed assistant does not respond to Jay',()=>assert.equal(parseWakeCommand('Jay hello','Charlie').activated,false));
