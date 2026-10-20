/* Run: node --test tests/jay-contextual-answer.test.cjs */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('experiments/jay-ai/contextual-answer.js','utf8');
const sandbox={};sandbox.window=sandbox;vm.runInNewContext(source,sandbox);
const answer=(q,p={},state='fresh',lang='en-AU')=>sandbox.SCCJayContext.answer(q,p,{soc:82,voltage:13.21,solar:225},state,lang);
test('battery location comes only from profile',()=>{assert.match(answer('¿Dónde están las baterías?',{batteryLoc:'debajo de la cama'},'fresh','es-ES'),/debajo de la cama/);assert.match(answer('Where are batteries?'),/No battery location/)});
test('solar panel count never becomes solar power',()=>{const a=answer('¿Cuántos paneles solares?',{solarCount:'3'},'fresh','es-ES');assert.match(a,/3/);assert.doesNotMatch(a,/225 W/)});
test('unknown solar count is not guessed',()=>assert.match(answer('How many solar panels?'),/No valid solar-panel count/));
test('offline and stale telemetry remain labelled simulated',()=>{assert.match(answer('Battery voltage now',{},'offline'),/last simulated sample/);assert.match(answer('Battery voltage now',{},'stale'),/Old simulated sample/)});
test('heater presence is unknown until registered',()=>assert.match(answer('Do I have a diesel heater?'),/not been recorded/));
test('unknown request discloses absent AI backend',()=>assert.match(answer('Can you design my caravan?'),/No generative AI model/));
