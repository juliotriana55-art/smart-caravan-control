(function(root){
'use strict';
function failure(message,kind){const e=new Error(message);e.kind=kind;return e;}
async function read({endpoint,access,hostname,origin,fetch:request,signal}){
 const base=new URL(endpoint);if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw failure('HTTPS Worker URL required','unavailable');if(!access)throw failure('APP_KEY required','unavailable');
 const headers={'X-App-Key':access,'Accept':'application/json'};
 function url(path){if(hostname==='smart-caravan-staging-oct22.ivorysiren17.chatgpt.site'&&base.origin==='https://smart-caravan-api.juliotriana55.workers.dev')return origin+'/staging-vrm'+path;return base.href.replace(/\/$/,'')+path;}
 async function get(path){const r=await request(url(path),{headers,cache:'no-store',signal});const json=await r.json().catch(()=>null);return {r,json};}
 // Diagnostics first: old /telemetry rejects installations containing only inverter/tanks.
 const diagnostic=await get('/api/victron/diagnostics');
 if(diagnostic.r.ok){const body=diagnostic.json;if(!body||body.source!=='Victron VRM'||!body.data||!Array.isArray(body.data.records))throw failure('Invalid diagnostics response','unavailable');if(body.installationId&&String(body.installationId)!=='1013398')throw failure('Unexpected VRM installation','unavailable');return {...root.SCCTelemetry.normalize(body.data),mapping:'diagnostics'};}
 if(![404,405].includes(diagnostic.r.status))throw failure('VRM HTTP '+diagnostic.r.status,'unavailable');
 const {r,json}=await get('/telemetry');if(!r.ok)throw failure('VRM HTTP '+r.status,'unavailable');if(json?.source!=='vrm'||!json.data||Array.isArray(json.data))throw failure('Unexpected Worker response','unavailable');if(json.installationId&&String(json.installationId)!=='1013398')throw failure('Unexpected VRM installation','unavailable');const data=root.SCCTelemetry.sanitize(json.data);return {data,lastData:data,fieldTimes:{},updated:json.updated,status:'legacy',mapping:'legacy-summary'};
}
root.SCCTelemetryClient={read};if(typeof module!=='undefined')module.exports=root.SCCTelemetryClient;
})(globalThis);
