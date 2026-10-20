// Deterministic mock regression test: run with node tests/safari-speech-session.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('experiments/jay-ai/safari-speech-session.js','utf8');
const instances=[],messages=[],heard=[];
class MockRecognition{
 constructor(){instances.push(this)}
 start(){}
 stop(){}
 abort(){}
}
const context={window:{SpeechRecognition:MockRecognition},setTimeout:()=>1,clearTimeout:()=>{}};
vm.runInNewContext(source,context);
const session=context.window.createSpeechSession(t=>heard.push(t),s=>messages.push(s),()=> 'en-AU');
assert.equal(session.start(),true);
instances[0].onresult({results:[[{transcript:'Where are my batteries?'}]]});
assert.deepEqual(heard,['Where are my batteries?']);
assert.equal(session.isListening(),false);
assert.equal(session.start(),true);
instances[1].onerror({error:'not-allowed'});
assert.equal(session.isListening(),false);
assert.equal(session.start(),true);
session.stop();
assert.equal(session.isListening(),false);
console.log('PASS: consecutive recognition, error recovery, stop');
