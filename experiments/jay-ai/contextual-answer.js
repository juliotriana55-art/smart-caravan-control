/* Deterministic Jay AI pilot responses. No network, no model, no live VRM. */
(function(root){
 'use strict';
 function answer(question, profile, telemetry, state, lang){
  const q=String(question||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const p=profile||{},d=telemetry||{},es=lang==='es-ES';
  const battery=/(battery|batteries|bateria|baterias|batt)/.test(q);
  const solar=/(solar|panel|placas)/.test(q);
  const heater=/(heater|calefactor|calefaccion|diesel)/.test(q);
  const location=/(where|ubic|donde|locat|sitio|lugar|installed|instalad)/.test(q);
  const count=/(how many|cuant|numero|number|cantidad)/.test(q);
  const reading=/(soc|volt|power|potencia|consum|charge|carga|estado|nivel|lectura|read|current|actual|ahora|today|hoy|energia|energy|electric)/.test(q);
  const trust=/(internet|connection|conexi|offline|online|fiable|trust|fresh|actual|ahora|vivo|live)/.test(q);
  const status=state==='offline'?(es?'Sin conexión: es el último valor simulado guardado; no puedo confirmar el estado actual.':'Offline: this is the last simulated sample; current conditions are unknown.'):state==='stale'?(es?'Muestra simulada antigua; no es una lectura actual.':'Old simulated sample; not a current reading.'):(es?'Muestra reciente únicamente en el simulador; NO es una lectura del Cerbo GX.':'Recent within the simulator only; NOT a Cerbo GX reading.');
  const n=Number(p.solarCount), validCount=String(p.solarCount||'').trim()!==''&&Number.isInteger(n)&&n>=0&&n<=50;
  if(battery&&location)return p.batteryLoc?(es?'Ubicación registrada de baterías: ':'Recorded battery location: ')+p.batteryLoc:(es?'No hay ubicación de baterías registrada.':'No battery location is recorded.');
  if(heater)return p.heaterLoc?(es?'Ubicación registrada del calefactor: ':'Recorded heater location: ')+p.heaterLoc:(es?'No se ha registrado si existe calefactor ni su ubicación.':'Heater presence and location have not been recorded.');
  if(solar&&(count||!reading&&!trust))return validCount?(es?'Paneles solares registrados: ':'Recorded solar panels: ')+n+'.':(es?'No se ha registrado una cantidad válida de paneles solares.':'No valid solar-panel count is recorded.');
  if(solar||battery||reading||trust){
   const soc=Number(d.soc),volts=Number(d.voltage),watts=Number(d.solar);
   const parts=[];
   if(solar)parts.push(Number.isFinite(watts)?(es?'Solar simulado: ':'Simulated solar: ')+watts.toFixed(0)+' W':'');
   else parts.push(Number.isFinite(soc)&&Number.isFinite(volts)?(es?'Batería simulada: ':'Simulated battery: ')+soc.toFixed(0)+'% · '+volts.toFixed(2)+' V':'');
   parts.push(status);
   return parts.filter(Boolean).join(' ');
  }
  return es?'No hay un modelo de IA generativa conectado. Puedo consultar ubicaciones registradas, paneles solares y telemetría simulada.':'No generative AI model is connected. I can answer about recorded equipment, solar panels and simulated telemetry.';
 }
 root.SCCJayContext=Object.freeze({answer});
})(typeof window!=='undefined'?window:globalThis);
