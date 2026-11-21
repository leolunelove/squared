import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readLevel,canPlace,magneticPlacement,liftedPose,turn,size} from '../src/engine.js';
const raw=JSON.parse(readFileSync(new URL('../src/levels.json',import.meta.url),'utf8'));
let checks=0;const check=(condition,message)=>{assert.ok(condition,message);checks++;};
const close=(a,b)=>Math.abs(a-b)<1e-8;
for(const fromScale of [.2,.55,1])for(const lift of [0,34,48]){
  const point={x:180,y:360},grab={x:1.5,y:.5},cell=48;
  const start=liftedPose(point,grab,cell,fromScale,lift,0),end=liftedPose(point,grab,cell,fromScale,lift,1);
  check(close(start.x+grab.x*cell*start.scale,point.x)&&close(start.y+grab.y*cell*start.scale,point.y),'Lift starts at the actual grab point without jumping');
  check(close(end.scale,1)&&close(end.y+grab.y*cell,point.y-lift),'Full-size piece finishes above a touch finger and directly under a mouse');
  let last=fromScale;
  for(let t=0;t<=1;t+=.05){const pose=liftedPose(point,grab,cell,fromScale,lift,t);check(pose.scale>=last&&pose.scale<=1,'Lift grows continuously without overshoot');last=pose.scale;}
  check(close(liftedPose(point,grab,cell,fromScale,lift,2).scale,1),'Late frames clamp to final size');
}
for(const [index,data]of raw.entries()){
  const l=readLevel(data,index),placed=l.pieces.map(p=>({...p.solution}));
  for(const piece of l.pieces){
    const p=piece.solution;
    const others=placed.map((v,id)=>id===piece.id?null:v);
    for(const [dx,dy]of [[0,0],[.3,.2],[-.3,.2],[.1,-.3]]){
      const snap=magneticPlacement(l,others,piece.id,{x:p.x+dx,y:p.y+dy},0);
      check(!!snap&&canPlace(l,others,piece.id,snap),'A near miss settles into the legal square');
      check(snap.x===p.x&&snap.y===p.y,'Near-complete arrangements retain the intended cell');
    }
    check(magneticPlacement(l,others,piece.id,{x:-3,y:-3},0)===null,'No remote jumps onto the board');

  }
}
const l=readLevel(raw[1],1),blank=l.pieces.map(()=>null);
check(magneticPlacement(l,blank,0,{x:-.55,y:0},0)?.x===0,'Edge attraction catches a slight overshoot');
check(magneticPlacement(l,blank,0,{x:-.7,y:0},0)===null,'Magnetism stops beyond the small edge allowance');
console.log(JSON.stringify({mobile_geometry_checks:checks,status:'passed'}));
