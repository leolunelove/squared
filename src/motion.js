export const MOTION={pickup:120,snap:150,returnMin:180,returnMax:260,completion:520,restoredCompletion:180,reducedCompletion:80,ease:'cubic-bezier(.18,.8,.22,1)'};
// Read the visible pose before interrupting motion, so the grabbed cell stays put.
export function grabAtPose(point,pose,cell,shape){
  return {x:Math.max(0,Math.min(shape.w,(point.x-pose.x)/(cell*pose.scale))),y:Math.max(0,Math.min(shape.h,(point.y-pose.y)/(cell*pose.scale)))};
}
export function poseTransform(pose){return `translate3d(${pose.x}px,${pose.y}px,0) scale(${pose.scale})`;}
export function travelDuration(from,to,kind='return'){
  if(kind==='snap')return MOTION.snap;
  const distance=Math.hypot(to.x-from.x,to.y-from.y);
  return Math.round(Math.max(MOTION.returnMin,Math.min(MOTION.returnMax,MOTION.returnMin+distance*.12)));
}
export function samePose(a,b){return Math.abs(a.x-b.x)<.25&&Math.abs(a.y-b.y)<.25&&Math.abs(a.scale-b.scale)<.001;}
