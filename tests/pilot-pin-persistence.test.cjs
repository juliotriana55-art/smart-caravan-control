// Mock IndexedDB regression for the experimental pilot. No browser, network or VRM required.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync('experiments/jay-ai/safari-speech-session.js','utf8');
const records=new Map([['guided-view-0',{id:'guided-view-0',name:'Front',blob:'image-data',guidedView:0,pins:[]}]]);
const context={window:{},SCCEquipmentPins:{list:a=>a.map(p=>({...p}))}};
vm.createContext(context);
vm.runInContext("let activePhoto={id:'guided-view-0'};let pins=[];function transaction(mode,fn){const store={get:id=>({result:records.get(id)}),put:obj=>{records.set(obj.id,obj);return {result:obj}}};return Promise.resolve(fn(store).result)}",context);
context.records=records;
vm.runInContext(script,context);
(async()=>{
 vm.runInContext("pins=[{label:'Battery',x:20,y:30}]",context);
 await context.window.persistPins();
 assert.equal(records.get('guided-view-0').pins.length,1);
 assert.equal(records.get('guided-view-0').blob,'image-data');
 assert.equal(records.get('guided-view-0').guidedView,0);
 vm.runInContext("pins=[{label:'Battery',x:70,y:80}]",context);
 await context.window.persistPins();
 assert.equal(records.get('guided-view-0').pins[0].x,70);
 vm.runInContext("pins=[]",context);
 await context.window.persistPins();
 assert.equal(records.get('guided-view-0').pins.length,0);
 records.delete('guided-view-0');
 await assert.rejects(context.window.persistPins(),/Photo was removed/);
 console.log('PASS: equipment pins add, move, delete and photo preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
