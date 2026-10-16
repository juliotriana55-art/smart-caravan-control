/** Smart Caravan Control v0.4.2 · read-only Cloudflare Worker.
 * Production secrets: VRM_TOKEN, APP_KEY.
 * Production variables: VRM_INSTALLATION_ID=1013398,
 * ALLOWED_ORIGIN=https://juliotriana55-art.github.io
 * Pilot-only authentication: replace shared APP_KEY before commercial deployment.
 */
const BASE='https://vrmapi.victronenergy.com/v2';
function answer(body,status=200,origin=''){
 const h={'content-type':'application/json; charset=utf-8','cache-control':'no-store','vary':'Origin','x-content-type-options':'nosniff'};
 if(origin){h['access-control-allow-origin']=origin;h['access-control-allow-methods']='GET, OPTIONS';h['access-control-allow-headers']='X-App-Key, Content-Type, Accept';}
 return new Response(JSON.stringify(body),{status,headers:h});
}
function same(a,b){if(!a||!b)return false;const x=new TextEncoder().encode(a),y=new TextEncoder().encode(b);let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0;}
async function getVRM(path,token){
 const res=await fetch(BASE+path,{headers:{'x-authorization':'Token '+token,'accept':'application/json'},signal:AbortSignal.timeout(14000)});
 const payload=await res.json().catch(()=>null);
 if(!res.ok||payload?.success===false)throw Error(res.status===401||res.status===403?'Victron token or installation permission rejected':`VRM HTTP ${res.status}`);
 return payload;
}
const num=v=>{if(typeof v==='number'&&Number.isFinite(v))return v;if(typeof v==='string'&&v.trim()&&/^[-+]?\d+(\.\d+)?$/.test(v.trim()))return Number(v);return null;};
function extract(diag){
 const records=Array.isArray(diag?.records)?diag.records:[];
 const get=(codes,pattern)=>{
  const matches=records.filter(r=>codes.includes(String(r.code||''))&&(pattern.test(String(r.description||''))||pattern.test(String(r.Device||''))));
  const r=matches.sort((a,b)=>(Number(b.timestamp)||0)-(Number(a.timestamp)||0))[0];
  return r?{value:num(r.rawValue),timestamp:num(r.timestamp)}:null;
 };
 // Explicit diagnostic codes and device descriptions, never guess missing readings.
 const soc=get(['SOC','bs'],/battery|system|state of charge|soc/i);
 const volts=get(['V','bv'],/battery|system|voltage/i);
 const amps=get(['I'],/battery|system/i);
 const pv=get(['P','ScW','PPV'],/solar charger|pv charger|solar power/i);
 const dc=get(['Pdc'],/dc system|dc loads|dc power/i);
 const sources=[soc,volts,amps,pv,dc].filter(x=>x&&x.timestamp);
 const newest=sources.length?Math.max(...sources.map(x=>x.timestamp)):null;
 return {data:{soc:soc?.value??null,voltage:volts?.value??null,current:amps?.value??null,solarWatts:pv?.value??null,dcPower:dc?.value??null,inverter:null,waterPct:null},updated:newest?new Date(newest*1000).toISOString():null};
}
export default {async fetch(request,env){
 const url=new URL(request.url),origin=request.headers.get('Origin')||'',expected=String(env.ALLOWED_ORIGIN||'').replace(/\/$/,'');
 const allowed=origin&&origin===expected?origin:'';
 if(request.method==='OPTIONS')return allowed?new Response(null,{status:204,headers:{'access-control-allow-origin':allowed,'access-control-allow-methods':'GET, OPTIONS','access-control-allow-headers':'X-App-Key, Content-Type, Accept','access-control-max-age':'600','vary':'Origin'}}):new Response(null,{status:403});
 if(request.method!=='GET')return answer({error:'Method not allowed'},405,allowed);
 if(url.pathname==='/'||url.pathname==='/health')return answer({app:'Smart Caravan Control',version:'0.4.2',status:'online',victron:env.VRM_TOKEN?'configured':'not_configured',note:'Token presence does not verify live connectivity.'},200,allowed);
 const routes={
  '/telemetry':'telemetry',
  '/api/victron/overview':'system-overview',
  '/api/victron/diagnostics':'diagnostics',
  '/api/victron/stats':'stats?type=venus'
 };
 if(!Object.hasOwn(routes,url.pathname))return answer({error:'Not found',paths:Object.keys(routes)},404,allowed);
 if(!env.APP_KEY)return answer({error:'APP_KEY missing'},503,allowed);
 if(!same(request.headers.get('X-App-Key')||'',env.APP_KEY))return answer({error:'Unauthorized: X-App-Key is missing or invalid'},401,allowed);
 const token=env.VRM_TOKEN||env.VRM_API_TOKEN||env.VICTRON_TOKEN;
 if(!token)return answer({error:'VRM_TOKEN missing'},503,allowed);
 const id=String(env.VRM_INSTALLATION_ID||env.VRM_SITE_ID||'1013398');
 if(!/^\d+$/.test(id))return answer({error:'Invalid installation ID'},500,allowed);
 try{
  const path=url.pathname==='/telemetry'?'diagnostics?count=1000':routes[url.pathname];
  const result=await getVRM(`/installations/${id}/${path}`,token);
  if(url.pathname==='/telemetry'){
   const values=extract(result);
   const nonempty=Object.values(values.data).some(v=>v!==null);
   if(!nonempty)return answer({error:'VRM returned no recognised telemetry fields. Inspect diagnostics field codes and device names.'},422,allowed);
   return answer({source:'vrm',installationId:id,...values,readOnly:true},200,allowed);
  }
  return answer({source:'Victron VRM',connected:true,installationId:id,retrievedAt:new Date().toISOString(),data:result},200,allowed);
 }catch(err){return answer({error:err.name==='TimeoutError'?'Victron API timed out':String(err.message||'VRM request failed').slice(0,160)},502,allowed);}
}};
