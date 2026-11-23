import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {readLevel,restoreArrangement,restoreProgress,turn,canPlace,complete,optionsFor,solve,hintWorkerSource} from '../src/engine.js';
const raw=JSON.parse(readFileSync(new URL('../src/levels.json',import.meta.url),'utf8'));
const reports=[];
for(const [index,data] of raw.entries()){
 const l=readLevel(data,index),fresh=restoreArrangement(l);
 assert.equal(l.rotate,false,`Level ${index+1} uses fixed orientations`);
 assert.ok(fresh.rotations.every(r=>r===0),'Fresh and restarted pieces face their fitting orientation');
 const canonical=l.pieces.map(p=>({...p.solution}));
 assert.ok(complete(l,canonical),'Displayed orientations can fill the entire square');
 assert.ok(optionsFor(l).flat().every(p=>p.r===0),'The solver never offers an inaccessible turn');
 const answer=solve(l,fresh.placements);
 assert.ok(answer.solution&&complete(l,answer.solution),'Fresh level is independently solvable with actual starting pieces');
 assert.ok(answer.solution.every(p=>p.r===0));
 assert.equal(canPlace(l,[],0,{...l.pieces[0].solution,r:1}),false,'Turned placements cannot bypass fixed rules');
 // Reproduce old saves: pieces in the tray were seeded at assorted angles.
 const old={version:1,current:index,completed:Array.from({length:index},(_,i)=>i),placements:l.pieces.map(()=>null),rotations:l.pieces.map((_,i)=>(index+i*3)%4)};
 old.placements[0]={...canonical[0]};
 const migrated=restoreArrangement(l,old);
 assert.ok(migrated.rotations.every(r=>r===0));
 assert.deepEqual(migrated.placements[0],canonical[0],'Compatible placed pieces stay in place');
 assert.ok(solve(l,migrated.placements).solution,'Migrated board can still be finished');
 assert.equal(restoreProgress(old,100).completed.size,index,'Earned completion count is preserved');
 assert.equal(restoreProgress(old,100).levelIndex,index,'Current level is preserved');
 // Old globally rotated boards must not strand pieces at unavailable angles.
 const rotated=l.pieces.map(piece=>{
  const cells=piece.cells.map(([x,y])=>[l.n-1-y-piece.solution.y,x+piece.solution.x]);
  return {x:Math.min(...cells.map(p=>p[0])),y:Math.min(...cells.map(p=>p[1])),r:1};
 });
 const repaired=restoreArrangement(l,{...old,placements:rotated,rotations:l.pieces.map(()=>1)});
 assert.ok(repaired.rotations.every(r=>r===0));
 assert.ok(solve(l,repaired.placements).solution,'Rotated old arrangements are repaired into a finishable board');
 const partial=answer.solution.map((p,id)=>id%2?p:null);let message;
 const self={postMessage:value=>message=value};
 vm.runInNewContext(hintWorkerSource(),{self});self.onmessage({data:{level:l,placements:partial,limit:250000}});
 assert.ok(message?.solution&&complete(l,message.solution),'Actual hint worker completes a fixed partial board');
 assert.ok(message.solution.every(p=>p.r===0),'Hints never ask for rotation');
 assert.ok(partial.every((p,id)=>!p||JSON.stringify(p)===JSON.stringify(message.solution[id])),'Hints retain existing placements');
 assert.deepEqual(restoreArrangement(l,{version:2,placements:partial,rotations:fresh.rotations}).placements,partial,'New-format partial progress survives reload');
 reports.push({level:index+1,solvableWithoutRotation:true,saveMigration:true,workerHint:true,solverNodes:answer.nodes});
}
// A legitimate new-rules dead end should survive reload for Undo/Hint to resolve.
const l=readLevel(raw[0],0),deadEnd=[{x:0,y:1,r:0},{x:2,y:0,r:0},null];
assert.equal(solve(l,deadEnd).solution,null);
assert.deepEqual(restoreArrangement(l,{version:2,placements:deadEnd}).placements,deadEnd);
assert.ok(solve(l,restoreArrangement(l,{version:1,placements:deadEnd}).placements).solution,'Legacy dead ends are refreshed during the rules migration');
console.log(JSON.stringify({fixed_orientation_levels:reports,status:'passed'},null,2));
