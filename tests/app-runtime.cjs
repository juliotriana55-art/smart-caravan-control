const assert=require('node:assert/strict');const {boot}=require('./app-harness.cjs');const {run,ctx,elements,memory,events,spoken,sessions}=boot();
(async()=>{
assert.equal(run('st.mode'),'vrm');run("st.data={soc:null,tanks:[]}");assert.equal(run('freshness()'),'unknown');
run("st.data={soc:50};st.sourceTimestamp=new Date(Date.now()-1000).toISOString()");assert.equal(run('freshness()'),'fresh');run("st.error='network';st.connection='offline'");assert.equal(run('freshness()'),'error');run("st.error='';st.connection='available';st.sourceTimestamp='2020-01-01T00:00:00Z'");assert.equal(run('freshness()'),'stale');
for(const mode of ['both','voice','text']){run(`st.responseMode='${mode}';answer('battery voltage')`)}assert.equal(spoken.length,2);assert.equal(run('chatHistory.length'),3);
run("$('batteryLoc').value='Under bed';$('solarLoc').value='Roof front';$('inverterSpecs').value='Victron 3000';readProfile();answer('Where are solar panels?')");assert.match(elements.get('reply').textContent,/Roof front/);assert.match(memory.get('scc_v041'),/Victron 3000/);
run("$('pushTalk').onclick()");sessions.at(-1).onresult({resultIndex:0,results:[[{transcript:'Battery voltage'}]]});run("$('pushTalk').onclick()");sessions.at(-1).onresult({resultIndex:0,results:[[{transcript:'Battery state of charge'}]]});assert.equal(sessions.length,2);assert.equal(run('recognizer'),null);assert.equal(run('recognizing'),false);
run("$('pushTalk').onclick()");sessions.at(-1).onerror({error:'not-allowed'});assert.equal(run('recognizer'),null);
run("show('twin');renderTwin()");assert.equal(elements.get('componentList').children.length,8);
run("st.endpoint='https://example.invalid';st.access='test-not-secret';st.mode='vrm';st.data=null");ctx.fetch=async()=>({ok:true,json:async()=>({source:'Victron VRM',data:{records:[]},installationId:'1013398'})});await run('connect()');assert.match(run('st.error'),/No usable/);assert.equal(run('st.busy'),false);
ctx.fetch=async()=>({ok:true,json:async()=>({source:'Victron VRM',data:{records:[{code:'SOC',description:'Battery state of charge',rawValue:0,timestamp:Date.now()/1000},{code:'T',description:'Fresh water 1 level %',rawValue:0,timestamp:Date.now()/1000}]},installationId:'1013398'})});await run('connect()');assert.equal(run('st.data.tanks[0].percentage'),0);assert.equal(run('freshness()'),'fresh');ctx.fetch=async()=>{throw Error('lost internet')};await run('connect()');assert.equal(run('freshness()'),'error');assert.equal(run('st.data.soc'),0);
run("$('clearHistory').onclick()");assert.equal(run('chatHistory.length'),0);
// Regression: latest canonical preference survives legacy stale versions.
run("st.mode='vrm';st.connection='available';st.error='';$('panels').value='0';readProfile();answer('How many solar panels?')");assert.match(elements.get('reply').textContent,/0 solar panels/);
run("$('name').value='Test Jay';readProfile()");assert.equal(JSON.parse(memory.get('scc_v041')).name,'Test Jay');
console.log('PASS: runtime integration scenarios (fresh/stale/offline, modes, repeated speech, permission recovery, profile, twin, empty telemetry, zero tanks, reconnection, history). Browser APIs mocked; not physical Safari validation.');
})().catch(e=>{console.error(e);process.exitCode=1});
