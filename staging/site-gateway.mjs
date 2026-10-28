import {createJayGateway} from './jay-ai-gateway.mjs';
const upstream='https://smart-caravan-api.juliotriana55.workers.dev';
const errorHeaders={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-type':'application/json; charset=utf-8'};
function problem(code,status,details={}){return new Response(JSON.stringify({error:{code,stage:'staging-bridge',...details}}),{status,headers:errorHeaders})}
function upstreamProblem(status,json){
 const message=typeof json?.error==='string'?json.error:'';
 let code=status===401?'APP_KEY_REJECTED':status===403?'WORKER_ACCESS_DENIED':'WORKER_HTTP_ERROR';
 if(/VRM_TOKEN missing/.test(message))code='VRM_NOT_CONFIGURED';
 else if(/APP_KEY missing/.test(message))code='WORKER_NOT_CONFIGURED';
 else if(/Victron token or installation permission rejected/.test(message))code='VRM_ACCESS_DENIED';
 else if(/Victron API timed out/.test(message))code='VRM_TIMEOUT';
 else if(/VRM returned no recognised telemetry/.test(message))code='NO_RECOGNISED_DATA';
 else if(/^VRM HTTP \d{3}$/.test(message))code='VRM_UPSTREAM_HTTP_ERROR';
 const match=message.match(/^VRM HTTP (\d{3})$/);return {code,stage:'production-worker',httpStatus:status,...(match?{upstreamStatus:Number(match[1])}:{})};
}
export function createGateway(assets){const jay=createJayGateway();return {async fetch(request,env={}){
 const ai=await jay(request,env);if(ai)return ai;
 const u=new URL(request.url);const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
 if(request.method!=='GET')return new Response('Read only',{status:405,headers});
 const routes={'/staging-vrm/telemetry':'/telemetry','/staging-vrm/api/victron/diagnostics':'/api/victron/diagnostics'};
 if(Object.hasOwn(routes,u.pathname)){
  const origin=request.headers.get('Origin');if(origin&&origin!==u.origin)return problem('BROWSER_ORIGIN_REJECTED',403);
  const key=request.headers.get('X-App-Key');if(!key||key.length>512)return problem('APP_KEY_REQUIRED',401);
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),14000);
  try{
   // Workers supports manual/follow, but NOT redirect:error. Never follow with a private header.
   const r=await fetch(upstream+routes[u.pathname],{headers:{'X-App-Key':key,'Accept':'application/json','Origin':'https://juliotriana55-art.github.io'},signal:controller.signal,redirect:'manual'});
   if(r.status>=300&&r.status<400){console.warn(JSON.stringify({event:'scc_bridge_failure',code:'UPSTREAM_REDIRECT_BLOCKED',status:r.status}));return problem('UPSTREAM_REDIRECT_BLOCKED',502,{upstreamStatus:r.status})}
   if(!r.ok){const json=await r.json().catch(()=>null);const error=upstreamProblem(r.status,json);console.warn(JSON.stringify({event:'scc_bridge_failure',...error}));return new Response(JSON.stringify({error}),{status:r.status,headers:errorHeaders})}
   return new Response(r.body,{status:r.status,headers:{...headers,'content-type':'application/json'}});
  }catch(e){const code=controller.signal.aborted?'BRIDGE_TIMEOUT':'WORKER_UNREACHABLE';console.warn(JSON.stringify({event:'scc_bridge_failure',code,stage:'staging-bridge'}));return problem(code,502)}finally{clearTimeout(timeout)}
 }
 const path=u.pathname==='/'?'/index.html':u.pathname;if(!Object.hasOwn(assets,path))return new Response('Not found',{status:404,headers});
 return new Response(assets[path],{headers:{...headers,'content-type':path.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8'}});
}};}
export default createGateway({"/index.html":"Integrated frontend"});
