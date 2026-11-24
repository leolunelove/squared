import assert from 'node:assert/strict';
import {MOTION,grabAtPose,travelDuration,samePose,poseTransform} from '../src/motion.js';
import {liftedPose} from '../src/engine.js';
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
// Re-picking at any point of a return/snap must preserve the visible grabbed cell.
for(const scale of [.18,.35,.62,.82,1])for(const cell of [24,31,48,72])for(const shape of [{w:1,h:4},{w:4,h:2},{w:3,h:3}]){
 const pose={x:43.7,y:151.2,scale},point={x:pose.x+shape.w*.4*cell*scale,y:pose.y+shape.h*.6*cell*scale},grab=grabAtPose(point,pose,cell,shape);
 const start=liftedPose(point,grab,cell,pose.scale,42,0);
 check(Math.abs(start.x-pose.x)<1e-8&&Math.abs(start.y-pose.y)<1e-8,'An interrupted pickup starts at its rendered pose');
 const end=liftedPose(point,grab,cell,scale,42,1);
 check(Math.abs(end.x+grab.x*cell-point.x)<1e-8&&Math.abs(end.y+grab.y*cell-(point.y-42))<1e-8,'Touch lift retains the exact grabbed cell');
 check(!poseTransform(start).includes('NaN'),'Travel transforms stay finite at narrow phone cell sizes');
}
let previous=0;
for(const distance of [0,20,60,140,300,600,1200]){
 const duration=travelDuration({x:0,y:0,scale:.5},{x:distance,y:0,scale:1});
 check(duration>=MOTION.returnMin&&duration<=MOTION.returnMax&&duration>=previous,'Returns stay short and scale gently with travel distance');previous=duration;
}
check(travelDuration({x:0,y:0},{x:500,y:400},'snap')===MOTION.snap,'Successful snaps have a consistent short response');
check(samePose({x:1,y:1,scale:1},{x:1.1,y:1.1,scale:1}),'Subpixel movement does not start unnecessary travel');
check(!samePose({x:1,y:1,scale:.8},{x:1,y:1,scale:1}),'Growing from tray size is a meaningful move');
check(MOTION.completion>MOTION.snap&&MOTION.completion<700,'Completion waits for the landing without a long pause');
check(MOTION.reducedCompletion<100,'Reduced motion completes promptly without staged animation');
console.log(JSON.stringify({motion_checks:checks,status:'passed'}));
