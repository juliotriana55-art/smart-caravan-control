import test from 'node:test';import assert from 'node:assert/strict';import {extractExtended} from './parser.mjs';
const row=(code,description,rawValue,timestamp=1000,other={})=>({code,description,rawValue,timestamp,...other});
test('fresh water zero is a valid reading, not missing',()=>{let a=extractExtended({records:[row('T','Fresh Water 1 level %',0),row('T','Fresh Water 2 level %',0)]});assert.equal(a.tanks.length,2);assert.deepEqual(a.tanks.map(t=>t.percentage),[0,0])});
test('unconfigured sensors with dashes are omitted',()=>{let a=extractExtended({records:[row('T','Fresh Water 1 level %','--'),row('T','Waste Water 1 level %',null)]});assert.equal(a.tanks.length,0)});
test('take newest tank reading',()=>{let a=extractExtended({records:[row('T','Fresh Water 1 level %',24,100),row('T','Fresh Water 1 level %',0,300)]});assert.equal(a.tanks[0].percentage,0)});
test('do not interpret non-level tank metrics as fill',()=>{assert.equal(extractExtended({records:[row('volume','Fresh Water 1 capacity',95)]}).tanks.length,0)});
test('read DC power and AC loads if diagnostic codes and labels agree',()=>{let a=extractExtended({records:[row('Pdc','DC system power',150),row('Pac','AC loads',42)]});assert.equal(a.dcPower,150);assert.equal(a.acLoadsWatts,42)});
test('MultiPlus inverting state maps to on',()=>{assert.equal(extractExtended({records:[row('State','MultiPlus VE.Bus state',9)]}).inverter,'on')});
test('unknown inverter modes are not guessed as off',()=>{assert.equal(extractExtended({records:[row('State','MultiPlus VE.Bus state',3)]}).inverter,null)});
test('do not invent telemetry from empty diagnostics',()=>{let a=extractExtended({records:[]});assert.equal(a.inverter,null);assert.equal(a.dcPower,null);assert.equal(a.tanks.length,0)});

test('generic label is not a positive state',()=>assert.equal(extractExtended({records:[row('State','Inverter status','Inverter disabled')]}).inverter,null));
