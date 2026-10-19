// Experimental parser for Victron VRM diagnostics, not wired to production Worker.
// Assumes diagnostics records include descriptive labels; logs no token or customer data.
const n=x=>typeof x==='number'&&Number.isFinite(x)?x:typeof x==='string'&&x.trim()!==''&&/^[-+]?\d+(?:\.\d+)?$/.test(x.trim())?Number(x):null;
const stamp=r=>{const t=n(r.timestamp);return t===null?0:t>1e11?t/1000:t};
const label=r=>[r.description,r.Device,r.deviceName,r.name].filter(x=>typeof x==='string').join(' ');
const codeOf=r=>String(r.code??'');
function find(records,codes,pattern){return records.filter(r=>codes.includes(codeOf(r))&&pattern.test(label(r))).sort((a,b)=>stamp(b)-stamp(a))[0]??null;}
function val(r){return r?n(r.rawValue??r.value):null;}
function isTank(r){return /(?:fresh\s*water|tank\s*(?:level|1|2)|water\s*tank|waste\s*water)/i.test(label(r));}
function tankName(r){const full=label(r);const m=full.match(/(?:fresh\s*water|waste\s*water|grey\s*water)\s*\d+/i);return m?m[0].replace(/\s+/g,' ').trim():null;}
export function extractExtended(diag){
 const records=Array.isArray(diag?.records)?diag.records:[];
 if(diag?.online===false||String(diag?.status??'').toLowerCase()==='offline')return {dcPower:null,acLoadsWatts:null,inverter:null,tanks:[]};
 const dc=find(records,['Pdc','dcPower'],/dc\s*(system|loads|power)|dc power/i);
 const ac=find(records,['P','Pac','acPower','acLoad'],/ac\s*loads?|ac\s*power|consumption/i);
 const mode=find(records,['State','state','MODE','Mode','mode','S'],/multiplus|ve[.\s-]*bus|inverter|charger/i);
 const status=mode?String(mode.formattedValue??mode.textValue??mode.value??mode.rawValue??'').trim():'';
 // In VE.Bus state 9 means inverting; 0 means off. Other states must not be called "off".
 const stateValue=mode?n(mode.rawValue):null;
 // A label such as "Inverter disabled" must not be interpreted as "on".
 // Numeric VE.Bus state codes are only meaningful for identifiable VE.Bus devices.
 const veBus=mode&&/(?:multiplus|quattro|ve[.\s-]*bus)/i.test(label(mode));
 const inverter=!mode?null:veBus&&stateValue!==null?(stateValue===9?'on':stateValue===0?'off':null):/^(?:inverting|inverter\s+on)$/i.test(status)?'on':/^(?:off|inverter\s+off)$/i.test(status)?'off':null;
 // Tank records are not standardised by description or diagnostic code across setups.
 // Admit only percent-level records with a specific individual tank identity, never infer from '0' alone.
 const tanks=new Map();
 for(const r of records){
  if(!isTank(r))continue;const name=tankName(r);
  if(!name)continue;
  const nameLower=name.toLowerCase();if(!nameLower.includes('water'))continue;
  const code=codeOf(r),desc=label(r);
  if(!(/^(?:T|TL|level|Level|tankLevel|tank_level|percentage|Percent)$/i.test(code)||/level|percentage|percent|%/i.test(desc)))continue;
  const raw=val(r);if(raw===null||raw<0||raw>100)continue;
  const key=nameLower.replace(/\s+/g,' ');
  if(!tanks.has(key)||stamp(r)>stamp(tanks.get(key)._timestamp))
    tanks.set(key,{name,percentage:raw,updated:stamp(r)>0?new Date(stamp(r)*1000).toISOString():null,_timestamp:stamp(r)});
 }
 return {dcPower:val(dc),acLoadsWatts:val(ac),inverter,
  tanks:[...tanks.values()].map(({_timestamp,...rest})=>rest).sort((a,b)=>a.name.localeCompare(b.name))};
}

/** Experimental freshness filter. Old or undated records are never shown as live. */
export function extractFreshSnapshot(diag,{nowSeconds=Date.now()/1000,maxAgeSeconds=300}={}){
 const rows=Array.isArray(diag?.records)?diag.records:[];
 const dated=rows.map(r=>({r,t:stamp(r)})).filter(x=>x.t>0&&x.t<=nowSeconds);
 const last=dated.reduce((v,x)=>Math.max(v,x.t),0);
 const lastUpdated=last?new Date(last*1000).toISOString():null;
 const blank=()=>extractExtended({records:[]});
 if(diag?.online===false||String(diag?.status??'').toLowerCase()==='offline')
  return {status:'offline',lastUpdated,...blank()};
 const fresh=dated.filter(x=>nowSeconds-x.t<=maxAgeSeconds).map(x=>x.r);
 if(!fresh.length)return {status:dated.length?'stale':'unknown',lastUpdated,...blank()};
 return {status:'fresh',lastUpdated,...extractExtended({...diag,records:fresh})};
}
