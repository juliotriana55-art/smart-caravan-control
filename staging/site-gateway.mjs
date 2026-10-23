const upstream='https://smart-caravan-api.juliotriana55.workers.dev';
export function createGateway(assets){return {async fetch(request){
 const u=new URL(request.url);const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
 if(request.method!=='GET')return new Response('Read only',{status:405,headers});
 const routes={'/staging-vrm/telemetry':'/telemetry','/staging-vrm/api/victron/diagnostics':'/api/victron/diagnostics'};
 if(Object.hasOwn(routes,u.pathname)){
  const origin=request.headers.get('Origin');if(origin&&origin!==u.origin)return new Response('Origin rejected',{status:403,headers});
  const key=request.headers.get('X-App-Key');if(!key||key.length>512)return new Response('APP_KEY required',{status:401,headers});
  try{const r=await fetch(upstream+routes[u.pathname],{headers:{'X-App-Key':key,'Accept':'application/json','Origin':'https://juliotriana55-art.github.io'},signal:AbortSignal.timeout(14000),redirect:'error'});return new Response(r.body,{status:r.status,headers:{...headers,'content-type':'application/json'}})}catch{return new Response(JSON.stringify({error:'Read-only gateway unavailable'}),{status:502,headers:{...headers,'content-type':'application/json'}})}
 }
 const path=u.pathname==='/'?'/index.html':u.pathname;if(!Object.hasOwn(assets,path))return new Response('Not found',{status:404,headers});
 return new Response(assets[path],{headers:{...headers,'content-type':path.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8'}});
}};}
export default createGateway({"/index.html":"Integrated frontend"});
