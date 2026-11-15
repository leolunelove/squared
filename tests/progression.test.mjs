import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {readLevel,restoreProgress,hintWorkerSource,complete,turn,normalize} from '../src/engine.js';
const raw=JSON.parse(readFileSync(new URL('../src/levels.json',import.meta.url),'utf8'));
const original=JSON.parse(readFileSync(new URL('./fixtures/original-levels.json',import.meta.url),'utf8'));
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
assert.deepEqual(raw.slice(0,12),original);checks++;
const oldSave={completed:Array.from({length:12},(_,i)=>i),current:11};
const restored=restoreProgress(oldSave,raw.length);
check(restored.unlocked===12&&restored.levelIndex===11&&restored.completed.size===12,'A completed old collection unlocks level 13 and preserves all earned progress');
check(restoreProgress({completed:[0,1,2],current:3},36).levelIndex===3,'An in-progress old save stays on its level');
check(restoreProgress({completed:[-1,99,'2',0],current:99},36).levelIndex===1,'Malformed and out-of-range entries do not skip the campaign');
check(restoreProgress({completed:Array.from({length:36},(_,i)=>i),current:35},36).unlocked===35,'A completed campaign remains on the final level');
const fingerprints=new Set();
for(let i=12;i<raw.length;i++){
 const l=readLevel(raw[i],i),expected=i<24?6:i<30?7:8;
 check(l.n===expected,'Board size grows in stages without reordering old levels');
 check(l.pieces.length<=9&&l.pieces.length>=7,'New levels fit the mobile tray capacity');
 const shapes=l.pieces.map(p=>[0,1,2,3].map(r=>JSON.stringify(turn(p.cells,r))).sort()[0]).sort();
 const fingerprint=JSON.stringify(shapes);check(!fingerprints.has(fingerprint),'Each new puzzle has a distinct piece set');fingerprints.add(fingerprint);
 for(const p of l.pieces){
  const filled=new Set(p.cells.map(v=>v.join(',')));
  for(let y=-1;y<l.n;y++)for(let x=-1;x<l.n;x++){
   const bits=[[x,y],[x+1,y],[x,y+1],[x+1,y+1]].map(p=>filled.has(p.join(','))).join(',');
   check(bits!=='true,false,false,true'&&bits!=='false,true,true,false','Pieces have no pinched, ambiguous boundaries');
  }
 }
}
// Execute the exact emitted worker program in isolation, including its message bridge.
// A rotated whole-board solution supplies a valid partial arrangement that differs
// from the authored orientation, so the hint must respect player choices.
for(const index of [12,23,29,35]){
 const l=readLevel(raw[index],index),piece=l.pieces[0],global=piece.cells.map(([x,y])=>[l.n-1-(y+piece.solution.y),x+piece.solution.x]);
 const p={x:Math.min(...global.map(v=>v[0])),y:Math.min(...global.map(v=>v[1])),r:1};
 const partial=l.pieces.map((_,i)=>i===0?p:null);let answer;
 const self={postMessage:value=>{answer=value;}};
 vm.runInNewContext(hintWorkerSource(),{self});self.onmessage({data:{level:l,placements:partial,limit:250000}});
 check(!!answer?.solution&&complete(l,answer.solution),'The worker can finish a valid alternative arrangement');
 check(JSON.stringify(answer.solution[0])===JSON.stringify(p),'The worker preserves the piece already placed by the player');
}
console.log(JSON.stringify({progression_checks:checks,status:'passed'}));
