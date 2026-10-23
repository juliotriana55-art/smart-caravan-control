/* Shared validation used by browser and deterministic tests. No credentials. */
(function(root){
'use strict';
function usable(data){return !!data&&typeof data==='object'&&['soc','voltage','current','solarWatts','dcPower','acLoadsWatts','batteryPower','waterPct'].some(k=>Number.isFinite(data[k]))||!!data&&(['on','off'].includes(data.inverter)||Array.isArray(data.tanks)&&data.tanks.some(t=>t&&Number.isFinite(t.percentage)&&t.percentage>=0&&t.percentage<=100));}
function timestamp(value){if(typeof value!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(value))return null;const t=Date.parse(value);return Number.isFinite(t)&&t>0&&t<=Date.now()?new Date(t).toISOString():null;}
root.SCCRuntime={usable,timestamp};
if(typeof module!=='undefined')module.exports=root.SCCRuntime;
})(globalThis);
