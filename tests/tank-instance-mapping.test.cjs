const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('../staging/telemetry-core.js');
const now=1800000000;
const row=(code,description,rawValue,instance=20,timestamp=now)=>({code,description,rawValue,instance,timestamp});
const tank=(instance,value=0)=>[row('tf','Tank fluid type',1,instance,now-86400),row('tl','Tank level',value,instance),row('ts','Tank status',0,instance)];
const norm=records=>T.normalize({records},{nowSeconds:now});
test('real VRM field shapes keep two distinct empty tanks and signed DC system power',()=>{const x=norm([...tank(20),...tank(21),row('dc','DC System',-14.508,0),row('aliP','Input power',0,288)]);assert.equal(x.data.dcPower,-14.508);assert.deepEqual(x.data.tanks.map(t=>t.percentage),[0,0]);assert.notEqual(x.data.tanks[0].name,x.data.tanks[1].name)});
test('tank config and disconnected sensors without level never turn into empty tanks',()=>{const x=norm([row('tf','Tank fluid type',1),row('tc','Tank capacity',0.2),row('ts','Tank status',1)]);assert.deepEqual(x.data.tanks,[])});
test('tank status errors suppress zero readings',()=>{for(const value of [1,2,3,4,null])assert.deepEqual(norm([...tank(20).filter(r=>r.code!=='ts'),row('ts','Tank status',value)]).data.tanks,[])});
test('missing latest tank level does not revive earlier zero',()=>assert.deepEqual(norm([...tank(20),row('tl','Tank level',null,20,now+0.1)].map(r=>({...r,timestamp:r.timestamp-1}))).data.tanks,[]));
test('fresh water panel does not guess fuel, wastewater or unspecified types',()=>{for(const fluid of [0,2,5,null])assert.deepEqual(norm([row('tf','Tank fluid type',fluid),row('tl','Tank level',0)]).data.tanks,[])});
test('stale tanks preserve their age without becoming current',()=>{const x=norm(tank(20).map(r=>({...r,timestamp:now-1000})));assert.deepEqual(x.data.tanks,[]);assert.equal(x.lastData.tanks[0].percentage,0);assert.equal(x.status,'stale')});
test('explicit reported fresh water names are retained',()=>assert.equal(norm([...tank(20),row('tcn','Tank custom name','FRESH WATER 1')]).data.tanks[0].name,'FRESH WATER 1'));
test('DC Anderson input and DC-coupled PV cannot populate DC system power',()=>{const x=norm([row('aliP','Input power',200,288),row('Pdc','PV - DC-coupled',300,0)]);assert.equal(x.data.dcPower,null)});

test('a numbered device label does not duplicate an instance tank',()=>{const x=norm(tank(20).map(r=>({...r,Device:'Tank Fresh water 1'})));assert.equal(x.data.tanks.length,1);assert.equal(x.data.tanks[0].name,'Fresh water 1')});
