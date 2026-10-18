// Exterior 3D static regression checks. Run: node tools/check-exterior-3d.mjs
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../exterior-3d.html',import.meta.url),'utf8');
const failures=[];
if(src.includes("const vx=sign<0?"))failures.push('Unverified vent still appears next to entrance');
if(src.includes("for(const x of [-l*.28,l*.27])"))failures.push('Decorative dummy hatches still visible');
if(src.includes('id="glbFile"')&&!src.includes('id="devTools" hidden'))failures.push('GLB import is visible to customers');
if(src.includes("(-.34+(k+.5)*(.68/accessN))*l")){
 // The current default two-hatch layout: front hatch intrudes on the entry door.
 const length=7.2,door=length*.08,doorHalf=.82/2;
 const x=(-.34+(1+.5)*(.68/2))*length;
 const overlap=Math.abs(x-door)<(doorHalf+.73/2+.20);
 if(overlap)failures.push('Default access hatch overlaps entrance clearance');
}
if(!src.includes("touchmove"))failures.push('iPhone touch rotation handler missing');
if(failures.length){console.error('Exterior 3D QA FAILED:\n- '+failures.join('\n- '));process.exitCode=1}
else console.log('Exterior 3D static QA passed. Visual review still required.');
