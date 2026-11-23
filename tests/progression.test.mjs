import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {readLevel,restoreProgress,hintWorkerSource,complete,turn,normalize} from '../src/engine.js';
const raw=JSON.parse(readFileSync(new URL('../src/levels.json',import.meta.url),'utf8'));
const original=JSON.parse(readFileSync(new URL('./fixtures/original-levels.json',import.meta.url),'utf8'));
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
const fingerprints=new Set();
for(let i=0;i<raw.length;i++){
 const l=readLevel(raw[i],i);
 check(l.pieces.length<=9&&l.pieces.length>=3,'Levels fit the mobile tray capacity');
 const shapes=l.pieces.map(p=>[0,1,2,3].map(r=>JSON.stringify(turn(p.cells,r))).sort()[0]).sort();
 const fingerprint=JSON.stringify(shapes);if(!Number.isInteger(raw[i].legacyIndex))check(!fingerprints.has(fingerprint),'New puzzles have distinct piece sets');fingerprints.add(fingerprint);
 for(const p of l.pieces){
  const filled=new Set(p.cells.map(v=>v.join(',')));
  for(let y=-1;y<l.n;y++)for(let x=-1;x<l.n;x++){
   const bits=[[x,y],[x+1,y],[x,y+1],[x+1,y+1]].map(p=>filled.has(p.join(','))).join(',');
   check(bits!=='true,false,false,true'&&bits!=='false,true,true,false','Pieces have no pinched, ambiguous boundaries');
  }
 }
}
console.log(JSON.stringify({progression_checks:checks,status:'passed'}));
