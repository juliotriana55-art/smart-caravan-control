/* Deterministic read-only diagnostics interpretation shared by browser and tests. */
(function(root){
'use strict';
const keys=['soc','voltage','current','solarWatts','dcPower','acLoadsWatts','batteryPower','inverter','waterPct'];
const blank=()=>Object.assign(Object.fromEntries(keys.map(k=>[k,null])),{tanks:[]});
function number(v){if(typeof v==='number')return Number.isFinite(v)?v:null;if(typeof v!=='string'||!/^[-+]?\d+(?:\.\d+)?$/.test(v.trim()))return null;return Number(v);}
function seconds(v){const n=number(v);if(n!==null)return n>1e11?n/1000:n;if(typeof v==='string'&&/(Z|[+-]\d{2}:\d{2})$/.test(v)){const t=Date.parse(v);if(Number.isFinite(t))return t/1000}return null;}
function label(r){return [r.description,r.Device,r.deviceName,r.name].filter(x=>typeof x==='string').join(' ');}
function normalize(diag,{nowSeconds=Date.now()/1000,maxAgeSeconds=900}={}){
 const rows=(Array.isArray(diag?.records)?diag.records:[]).filter(r=>r&&typeof r==='object').map(r=>({...r,_time:seconds(r.timestamp)})).filter(r=>r._time>0&&r._time<=nowSeconds);
 const lastData=blank(),fieldTimes={};const selected=[];
 function pick(key,codes,pattern,valid=()=>true){const candidates=rows.filter(r=>codes.includes(String(r.code??''))&&pattern.test(label(r))).sort((a,b)=>b._time-a._time);const row=candidates[0];if(!row)return;const value=number(row.rawValue??row.value);if(value===null||!valid(value))return;lastData[key]=value;fieldTimes[key]=new Date(row._time*1000).toISOString();selected.push(row._time);}
 pick('soc',['SOC','bs'],/battery|system|state of charge|soc/i,v=>v>=0&&v<=100);
 pick('voltage',['V','bv'],/battery|system|voltage/i,v=>v>=0);
 pick('current',['I'],/battery|system/i);
 pick('solarWatts',['P','ScW','PPV'],/solar charger|pv charger|solar power/i,v=>v>=0);
 pick('dcPower',['Pdc','dcPower'],/dc\s*(system|loads|power)/i);
 pick('acLoadsWatts',['P','Pac','acPower','acLoad'],/ac\s*loads?|ac\s*power|consumption/i,v=>v>=0);
 const modes=rows.filter(r=>['State','state','MODE','Mode','mode','S'].includes(String(r.code??''))&&/multiplus|quattro|ve[.\s-]*bus|inverter|charger/i.test(label(r))).sort((a,b)=>b._time-a._time);const mode=modes[0];
 if(mode){const raw=number(mode.rawValue);const text=String(mode.formattedValue??mode.textValue??mode.value??mode.rawValue??'').trim();const v=/multiplus|quattro|ve[.\s-]*bus/i.test(label(mode))&&raw!==null?(raw===9?'on':raw===0?'off':null):/^(inverting|inverter\s+on)$/i.test(text)?'on':/^(off|inverter\s+off)$/i.test(text)?'off':null;if(v){lastData.inverter=v;fieldTimes.inverter=new Date(mode._time*1000).toISOString();selected.push(mode._time)}}
 const tanks=new Map();
 for(const r of rows){const desc=label(r);const match=desc.match(/(?:fresh\s*water|waste\s*water|gr[ea]y\s*water|black\s*water)\s*\d+|(?:water\s*)?tank\s*[12]\b/i);if(!match||!/^(T|TL|level|tankLevel|tank_level|percentage|Percent)$/i.test(String(r.code??''))&&!/level|percentage|percent|%/i.test(desc))continue;const value=number(r.rawValue??r.value);const name=match[0].replace(/\s+/g,' ').trim(),key=name.toLowerCase();if(!tanks.has(key)||r._time>tanks.get(key)._time)tanks.set(key,{name,percentage:value,updated:new Date(r._time*1000).toISOString(),_time:r._time});}
 lastData.tanks=[...tanks.values()].filter(t=>t.percentage!==null&&t.percentage>=0&&t.percentage<=100).sort((a,b)=>a.name.localeCompare(b.name)).map(({_time,...t})=>{selected.push(_time);fieldTimes['tank:'+t.name]=t.updated;return t});
 if(lastData.voltage!==null&&lastData.current!==null&&Math.abs(seconds(fieldTimes.voltage)-seconds(fieldTimes.current))<=60){lastData.batteryPower=lastData.voltage*lastData.current;fieldTimes.batteryPower=new Date(Math.min(seconds(fieldTimes.voltage),seconds(fieldTimes.current))*1000).toISOString();}
 const updated=selected.length?new Date(Math.max(...selected)*1000).toISOString():null;
 const fresh=(time)=>time&&nowSeconds-seconds(time)<=maxAgeSeconds;
 const data=blank();for(const key of keys)if(fresh(fieldTimes[key]))data[key]=lastData[key];data.tanks=lastData.tanks.filter(t=>fresh(t.updated));
 const usable=d=>keys.some(k=>d[k]!==null)||d.tanks.length>0;
 const offline=diag?.online===false||String(diag?.status??'').toLowerCase()==='offline';
 const status=offline?'offline':usable(data)?'fresh':usable(lastData)?'stale':'unknown';
 return {status,updated,data:offline?blank():data,lastData,fieldTimes,batteryPowerDerived:lastData.batteryPower!==null};
}
function sanitize(data){const out=blank();if(!data||typeof data!=='object'||Array.isArray(data))return out;for(const k of keys){if(k==='inverter'){out[k]=['on','off'].includes(data[k])?data[k]:null;continue;}const n=typeof data[k]==='number'&&Number.isFinite(data[k])?data[k]:null;out[k]=n;if(['soc','waterPct'].includes(k)&&(n<0||n>100))out[k]=null;if(['voltage','solarWatts','acLoadsWatts'].includes(k)&&n<0)out[k]=null;}
 out.tanks=Array.isArray(data.tanks)?data.tanks.filter(t=>t&&typeof t.name==='string'&&t.name.length<=80&&Number.isFinite(t.percentage)&&t.percentage>=0&&t.percentage<=100).slice(0,12).map(t=>({name:t.name,percentage:t.percentage,updated:typeof t.updated==='string'?t.updated:null})):[];return out;}
function current(data,fieldTimes,nowSeconds=Date.now()/1000,maxAgeSeconds=900){const out=sanitize(data);if(!fieldTimes||!Object.keys(fieldTimes).length)return out;for(const key of keys){const t=seconds(fieldTimes[key]);if(!t||t>nowSeconds||nowSeconds-t>maxAgeSeconds)out[key]=null;}out.tanks=out.tanks.filter(t=>{const n=seconds(t.updated||fieldTimes['tank:'+t.name]);return n&&n<=nowSeconds&&nowSeconds-n<=maxAgeSeconds});return out;}
root.SCCTelemetry={normalize,sanitize,current,seconds,blank};if(typeof module!=='undefined')module.exports=root.SCCTelemetry;
})(globalThis);
