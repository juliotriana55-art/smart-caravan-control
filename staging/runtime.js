/* Shared validation used by browser and deterministic tests. No credentials. */
(function(root){
'use strict';
function usable(data){return !!data&&Object.entries(data).some(([key,value])=>key==='tanks'?Array.isArray(value)&&value.some(t=>Number.isFinite(t.percentage)&&t.percentage>=0&&t.percentage<=100):typeof value==='number'?Number.isFinite(value):key==='inverter'&&['on','off'].includes(value));}
function timestamp(value){if(typeof value!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(value))return null;const t=Date.parse(value);return Number.isFinite(t)&&t>0&&t<=Date.now()?new Date(t).toISOString():null;}
root.SCCRuntime={usable,timestamp};
if(typeof module!=='undefined')module.exports=root.SCCRuntime;
})(globalThis);
