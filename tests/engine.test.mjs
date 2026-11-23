import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readLevel,turn,normalize,canPlace,complete,solve,outline,optionsFor} from '../src/engine.js';
const raw=JSON.parse(readFileSync(new URL('../src/levels.json',import.meta.url),'utf8'));
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++;};
const reports=[];
check(raw.length===100,'One hundred levels');
for(const [index,data]of raw.entries()){
  const level=readLevel(data,index);level.options=optionsFor(level);
  const canonical=level.pieces.map(p=>p.solution);
  check(complete(level,canonical),`Level ${index+1} canonical solution fills square`);
  check(!complete(level,canonical.map((p,i)=>i? p:null)),'Missing a piece cannot win');
  const start=performance.now(),result=solve(level);
  check(!!result.solution,`Level ${index+1} solver finds solution`);
  check(complete(level,result.solution),'Solver result meets independent placement rules');
  const partial=result.solution.map((p,i)=>i%2?p:null),hint=solve(level,partial);
  check(!!hint.solution&&complete(level,hint.solution),'Hint respects current partial arrangement');
  check(partial.every((p,i)=>!p||JSON.stringify(p)===JSON.stringify(hint.solution[i])),'Hint preserves already placed pieces');
  for(const piece of level.pieces){
    const connected=new Set([piece.cells[0].join(',')]);
    for(let iteration=0;iteration<piece.cells.length;iteration++)for(const [x,y]of piece.cells)if([[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(p=>connected.has(p.join(','))))connected.add(`${x},${y}`);
    check(connected.size===piece.cells.length,'Piece is orthogonally connected');
    check(JSON.stringify(turn(piece.cells,4))===JSON.stringify(normalize(piece.cells)),'Four turns restore shape');
    check(!canPlace(level,[],piece.id,{x:-1,y:0,r:0}),'Left overflow rejected');
    check(!canPlace(level,[],piece.id,{x:0,y:-1,r:0}),'Top overflow rejected');
    check(!canPlace(level,[],piece.id,{x:level.n,y:0,r:0}),'Right overflow rejected');
    check(!canPlace(level,[],piece.id,{x:0,y:level.n,r:0}),'Bottom overflow rejected');
    check(!canPlace(level,[],piece.id,{x:.5,y:0,r:0}),'Off-grid placement rejected');
    const path=outline(piece.cells);check(path.startsWith('M')&&path.endsWith('Z')&&!path.includes('NaN'),'Piece contour is finite and closed');
  }
  const overlap=canonical.map(p=>({...p}));overlap[1]={...overlap[0]};check(!complete(level,overlap),'Overlaps cannot complete square');
  reports.push({level:index+1,cells:level.n**2,pieces:level.pieces.length,solverNodes:result.nodes,milliseconds:Math.round(performance.now()-start)});
}
const l=readLevel(raw[0],0);
check(!canPlace(l,[],0,null),'Null placement rejected');
check(!canPlace(l,[],0,{x:NaN,y:0,r:0}),'Invalid numbers rejected');
// This occupies legal cells while leaving a region that cannot be filled.
const bad=[{x:0,y:1,r:0},{x:2,y:0,r:0},null];
check(canPlace(l,bad,0,bad[0])&&canPlace(l,bad,1,bad[1]),'Dead-end test is locally legal');
check(!solve(l,bad).solution,'Solver identifies a legal but impossible partial arrangement');
console.log(JSON.stringify({checks,levels:reports},null,2));
