// Staging-only pure adapter. Never contacts Victron or controls hardware.
import {extractNormalizedSnapshot} from '../experiments/vrm-fields/iso-normalized.mjs';
import {parseSourceSeconds} from '../experiments/vrm-fields/iso-time.mjs';
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:typeof v==='string'&&v.trim()&&/^[-+]?\d+(?:\.\d+)?$/.test(v.trim())?Number(v):null;
function latest(rows,codes,pattern){
 const found=rows.filter(r=>codes.includes(String(r.code??''))&&pattern.test([r.description,r.Device,r.deviceName,r.name].filter(v=>typeof v==='string').join(' ')));
 found.sort((a,b)=>(parseSourceSeconds(b.timestamp)??0)-(parseSourceSeconds(a.timestamp)??0));
 return found.length?num(found[0].rawValue??found[0].value):null;
}
export function normalizeStagingTelemetry(diag,{nowSeconds=Date.now()/1000,maxAgeSeconds=900}={}){
 const ext=extractNormalizedSnapshot(diag,{nowSeconds,maxAgeSeconds});
 const blank={soc:null,voltage:null,current:null,solarWatts:null,dcPower:null,acLoadsWatts:null,inverter:null,waterPct:null,tanks:[]};
 if(ext.status!=='fresh')return {status:ext.status,updated:ext.lastUpdated,data:blank};
 const rows=(Array.isArray(diag?.records)?diag.records:[]).filter(r=>{
  const t=parseSourceSeconds(r.timestamp);
  return t!==null&&t>0&&t<=nowSeconds&&nowSeconds-t<=maxAgeSeconds;
 });
 const data={
  soc:latest(rows,['SOC','bs'],/battery|system|state of charge|soc/i),
  voltage:latest(rows,['V','bv'],/battery|system|voltage/i),
  current:latest(rows,['I'],/battery|system/i),
  solarWatts:latest(rows,['P','ScW','PPV'],/solar charger|pv charger|solar power/i),
  dcPower:ext.dcPower,acLoadsWatts:ext.acLoadsWatts,inverter:ext.inverter,
  waterPct:null,tanks:ext.tanks
 };
 const usable=Object.entries(data).some(([key,value])=>key==='tanks'?value.length>0:value!==null);
 return {status:usable?'fresh':'unknown',updated:ext.lastUpdated,data};
}
