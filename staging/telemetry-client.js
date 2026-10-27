(function(root){
'use strict';
const messages={
 APP_KEY_REQUIRED:['Enter your private APP_KEY and select Save & connect. Do not enter a VRM token.','Introduce tu APP_KEY y pulsa Guardar y conectar. No introduzcas el token VRM.'],
 APP_KEY_REJECTED:['The existing Worker rejected the APP_KEY. Verify that it is the same private pilot key configured there.','El Worker existente rechazó la APP_KEY. Comprueba que sea la misma clave privada configurada allí.'],
 WORKER_ACCESS_DENIED:['The existing Worker denied access. No caravan connection state can be inferred.','El Worker existente denegó el acceso. Esto no indica si la caravana tiene internet.'],
 VRM_NOT_CONFIGURED:['The existing Worker has no VRM token configured.','El Worker existente no tiene un token VRM configurado.'],
 WORKER_NOT_CONFIGURED:['The existing Worker has no APP_KEY configured.','El Worker existente no tiene una APP_KEY configurada.'],
 VRM_ACCESS_DENIED:['Victron rejected the server token or installation permissions. This does not mean the Cerbo is offline.','Victron rechazó el token del servidor o los permisos de la instalación. Esto no significa que el Cerbo esté sin internet.'],
 VRM_TIMEOUT:['The existing Worker could not get a response from Victron before its timeout.','El Worker existente agotó el tiempo de espera de Victron.'],
 BRIDGE_TIMEOUT:['The staging bridge timed out contacting the existing Worker.','El puente de pruebas agotó el tiempo de conexión con el Worker existente.'],
 WORKER_UNREACHABLE:['The staging bridge could not reach the existing Worker. Cerbo connectivity is not yet known.','El puente de pruebas no pudo contactar al Worker existente. Aún no se conoce la conexión del Cerbo.'],
 UPSTREAM_REDIRECT_BLOCKED:['The existing Worker redirected the request. The private key was not forwarded to the new address.','El Worker existente redirigió la solicitud. La clave privada no se envió a otra dirección.'],
 BROWSER_ORIGIN_REJECTED:['The request came from an unexpected browser origin. Reopen the official staging link.','La solicitud llegó desde un origen inesperado. Abre de nuevo el enlace oficial de pruebas.'],
 VRM_UPSTREAM_HTTP_ERROR:['The existing Worker reported an error from Victron.','El Worker existente informó de un error de Victron.'],
 WORKER_HTTP_ERROR:['The existing Worker returned an error. The caravan connection state is not verified.','El Worker existente devolvió un error. La conexión de la caravana no está verificada.'],
 NO_RECOGNISED_DATA:['The source returned no recognized readings. Missing data is not zero.','La fuente no devolvió lecturas reconocidas. Los datos faltantes no equivalen a cero.']
};
function failure(message,kind,code){const e=new Error(message);e.kind=kind;e.code=code;e.safe=true;return e;}
function responseFailure(r,json){
 const proposed=json?.error&&typeof json.error==='object'?json.error.code:null;
 let code=Object.hasOwn(messages,proposed||'')?proposed:r.status===401?'APP_KEY_REJECTED':r.status===403?'WORKER_ACCESS_DENIED':'WORKER_HTTP_ERROR';
 const raw=typeof json?.error==='string'?json.error:'';
 if(/Victron token or installation permission rejected/.test(raw))code='VRM_ACCESS_DENIED';else if(raw==='VRM_TOKEN missing')code='VRM_NOT_CONFIGURED';else if(raw==='APP_KEY missing')code='WORKER_NOT_CONFIGURED';else if(raw==='Victron API timed out')code='VRM_TIMEOUT';else if(/^VRM HTTP \d{3}$/.test(raw))code='VRM_UPSTREAM_HTTP_ERROR';
 const e=failure('VRM HTTP '+r.status+' ('+code+')','unavailable',code);e.httpStatus=r.status;e.stage=['staging-bridge','production-worker'].includes(json?.error?.stage)?json.error.stage:'worker-response';
 if(Number.isInteger(json?.error?.upstreamStatus)&&json.error.upstreamStatus>=100&&json.error.upstreamStatus<=599)e.upstreamStatus=json.error.upstreamStatus;return e;
}
function describe(e,lang='en'){const m=messages[e?.code];if(m)return m[lang==='es'?1:0];if(e?.safe)return e.message;return lang==='es'?(e?.name==='AbortError'?'Se agotó el tiempo de conexión. Vuelve a probar.':'No se pudo completar la conexión. Comprueba internet y vuelve a probar.'):(e?.name==='AbortError'?'Connection timed out. Try again.':'The connection could not be completed. Check internet and retry.');}

async function read({endpoint,access,hostname,origin,fetch:request,signal}){
 let base;try{base=new URL(endpoint)}catch{throw failure('HTTPS Worker URL required','unavailable')}if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw failure('HTTPS Worker URL required','unavailable');if(!access)throw failure('APP_KEY required','unavailable','APP_KEY_REQUIRED');
 const headers={'X-App-Key':access,'Accept':'application/json'};
 function url(path){if(hostname==='smart-caravan-staging-oct22.ivorysiren17.chatgpt.site'&&base.origin==='https://smart-caravan-api.juliotriana55.workers.dev')return origin+'/staging-vrm'+path;return base.href.replace(/\/$/,'')+path;}
 async function get(path){const r=await request(url(path),{headers,cache:'no-store',signal});const json=await r.json().catch(()=>null);return {r,json};}
 // Diagnostics first: old /telemetry rejects installations containing only inverter/tanks.
 const diagnostic=await get('/api/victron/diagnostics');
 if(diagnostic.r.ok){const body=diagnostic.json;if(!body||body.source!=='Victron VRM'||!body.data||!Array.isArray(body.data.records))throw failure('Invalid diagnostics response','unavailable');if(body.installationId&&String(body.installationId)!=='1013398')throw failure('Unexpected VRM installation','unavailable');return {...root.SCCTelemetry.normalize(body.data),mapping:'diagnostics'};}
 if(![404,405].includes(diagnostic.r.status))throw responseFailure(diagnostic.r,diagnostic.json);
 const {r,json}=await get('/telemetry');if(!r.ok)throw responseFailure(r,json);if(json?.source!=='vrm'||!json.data||Array.isArray(json.data))throw failure('Unexpected Worker response','unavailable');if(json.installationId&&String(json.installationId)!=='1013398')throw failure('Unexpected VRM installation','unavailable');const data=root.SCCTelemetry.sanitize(json.data);return {data,lastData:data,fieldTimes:{},updated:json.updated,status:'legacy',mapping:'legacy-summary'};
}
root.SCCTelemetryClient={read,describe};if(typeof module!=='undefined')module.exports=root.SCCTelemetryClient;
})(globalThis);
