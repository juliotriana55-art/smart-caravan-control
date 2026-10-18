// Apply targeted exterior-3D QA corrections locally before committing.
import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('../exterior-3d.html',import.meta.url);
let src=readFileSync(file,'utf8');
const replace=(before,after)=>{
 if(!src.includes(before))throw Error('Missing expected source: '+before.slice(0,65));
 src=src.replace(before,after);
};
const start=src.indexOf("  const accessN=Math.max(0,Math.min(4,Number($('accessDoors').value)||0));");
const end=src.indexOf("  for(const x of [-l*.40,0,l*.40])",start);
if(start<0||end<start)throw Error('Accessory section not found');
src=src.slice(0,start)+`
  // Access hatches must never overlap the entrance.
  const accessN=Math.max(0,Math.min(4,Number($('accessDoors').value)||0));
  const slots=[],chosen=[],doorCenter=l*.08;
  for(let x=left+.75;x<=right-.70;x+=.08){
   if(sign<0&&Math.abs(x-doorCenter)<.975)continue;
   slots.push(x);
  }
  for(let k=0;k<accessN;k++){
   let best=null,score=-Infinity;
   for(const x of slots){
    if(chosen.some(y=>Math.abs(x-y)<.88))continue;
    const distance=chosen.length?Math.min(...chosen.map(y=>Math.abs(x-y))):-x;
    if(distance>score){score=distance;best=x}
   }
   if(best===null)break;chosen.push(best);
  }
  for(const x of chosen){
   box(.73,.53,.032,x,base+.89,outer-sign*.014,hatch);
   box(.65,.45,.038,x,base+.89,outer+sign*.013,trim);
   box(.11,.045,.047,x,base+1.085,outer+sign*.044,silver);
  }
  // No unverified generic vent.
`+src.slice(end);
replace("  for(const x of [-l*.28,l*.27]){box(.55,.32,.055,x,base+.44,z+(z>0?.08:-.08),trim)}","  // Removed fake decorative hatches.");
replace('<section class="panel"><div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px"><label style="font-weight:650">Modelo 3D profesional (.glb)','<section class="panel"><div id="devTools" hidden><div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px"><label style="font-weight:650">Modelo 3D profesional (.glb)');
replace('no se sube a ningún servidor.</p><div id="view"','no se sube a ningún servidor.</p></div><div id="view"');
replace('button,input{font:inherit;','[hidden]{display:none!important}button,input{font:inherit;');
replace("const $=id=>document.getElementById(id),status=$('status');","const $=id=>document.getElementById(id),status=$('status');\n$('devTools').hidden=new URLSearchParams(location.search).get('dev')!=='1';");
writeFileSync(file,src,'utf8');
console.log('3D layout patch applied; run node tools/check-exterior-3d.mjs');
