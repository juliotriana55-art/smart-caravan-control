/* Experimental pure marker operations; no browser APIs, VRM calls, or writes. */
(function(root){
'use strict';
function clamp(v){return Math.max(0,Math.min(100,Number(v)))}
function point(x,y){if(!Number.isFinite(Number(x))||!Number.isFinite(Number(y)))throw Error('Invalid marker coordinates');return {x:clamp(x),y:clamp(y)}}
function list(pins){return Array.isArray(pins)?pins.filter(p=>p&&typeof p.label==='string'&&Number.isFinite(Number(p.x))&&Number.isFinite(Number(p.y))).map(p=>({label:p.label,...point(p.x,p.y)})):[]}
function add(pins,label,x,y){if(typeof label!=='string'||!label.trim())throw Error('Equipment label required');return [...list(pins),{label:label.trim().slice(0,100),...point(x,y)}]}
function move(pins,index,x,y){const copy=list(pins);if(!Number.isInteger(index)||index<0||index>=copy.length)throw Error('Marker not found');copy[index]={...copy[index],...point(x,y)};return copy}
function remove(pins,index){const copy=list(pins);if(!Number.isInteger(index)||index<0||index>=copy.length)throw Error('Marker not found');copy.splice(index,1);return copy}
root.SCCEquipmentPins=Object.freeze({list,add,move,remove});
})(typeof window!=='undefined'?window:globalThis);
