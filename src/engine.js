export function normalize(cells) {
  const x=Math.min(...cells.map(p=>p[0])), y=Math.min(...cells.map(p=>p[1]));
  return cells.map(p=>[p[0]-x,p[1]-y]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
}
export function turn(cells,r=0) {
  let out=cells.map(p=>[...p]);
  for(let i=0;i<((r%4)+4)%4;i++)out=out.map(([x,y])=>[-y,x]);
  return normalize(out);
}
export function size(cells) {return {w:Math.max(...cells.map(p=>p[0]))+1,h:Math.max(...cells.map(p=>p[1]))+1};}
export function readLevel(data,index) {
  const letters=[...new Set(data.layout.join(''))].sort();
  const pieces=letters.map((letter,id)=>{
    const cells=[];data.layout.forEach((row,y)=>[...row].forEach((v,x)=>{if(v===letter)cells.push([x,y]);}));
    const x=Math.min(...cells.map(p=>p[0])),y=Math.min(...cells.map(p=>p[1]));
    return {id,cells:normalize(cells),solution:{x,y,r:0}};
  });
  return {...data,index,pieces};
}
export function restoreProgress(saved,count){
  const completed=new Set((Array.isArray(saved?.completed)?saved.completed:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<count));
  let unlocked=0;while(completed.has(unlocked)&&unlocked<count-1)unlocked++;
  const levelIndex=Math.min(unlocked,Math.max(0,Number.isInteger(saved?.current)?saved.current:0));
  return {completed,unlocked,levelIndex};
}
// Fixed orientations are part of the rules, including fresh, restarted and saved games.
export function restoreArrangement(level,saved=null){
  const fresh=()=>({placements:level.pieces.map((piece,id)=>level.index===0&&id<2?{...piece.solution}:null),rotations:level.pieces.map(()=>0),repaired:false});
  const result=fresh();
  if(!Array.isArray(saved?.placements)||saved.placements.length!==level.pieces.length)return result;
  const placements=saved.placements.map((p,id)=>{
    if(!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!Number.isInteger(p.r)||p.r<0||p.r>3)return null;
    // Symmetric old turns can stay in place; other turned pieces return to the tray.
    if(JSON.stringify(turn(level.pieces[id].cells,p.r))!==JSON.stringify(level.pieces[id].cells))return null;
    return {x:p.x,y:p.y,r:0};
  });
  const migrated=saved.version!==2;
  if(placements.some((p,id)=>p&&!canPlace(level,placements,id,p)))return {...result,repaired:true};
  // A partial tiling from the rotating rules may be a dead end under fixed rules.
  if(migrated&&placements.some(Boolean)&&!solve(level,placements).solution)return {...result,repaired:true};
  return {placements,rotations:level.pieces.map(()=>0),repaired:migrated&&(saved.rotations?.some(r=>r!==0)||saved.placements.some((p,id)=>p&&!placements[id]))};
}
export function canPlace(level,placements,id,placement) {
  if(!placement||!Number.isInteger(placement.x)||!Number.isInteger(placement.y)||!Number.isInteger(placement.r)||placement.r<0||placement.r>3||(!level.rotate&&placement.r!==0))return false;
  const occupied=new Set();
  placements.forEach((p,i)=>{if(p&&i!==id&&level.pieces[i])turn(level.pieces[i].cells,p.r).forEach(([x,y])=>occupied.add(`${x+p.x},${y+p.y}`));});
  return turn(level.pieces[id].cells,placement.r).every(([x,y])=>x+placement.x>=0&&y+placement.y>=0&&x+placement.x<level.n&&y+placement.y<level.n&&!occupied.has(`${x+placement.x},${y+placement.y}`));
}
export function complete(level,placements) {
  return placements.length===level.pieces.length&&level.pieces.reduce((a,p)=>a+p.cells.length,0)===level.n**2&&placements.every((p,id)=>p&&canPlace(level,placements,id,p));
}
// A tiny attraction at the edge of a legal cell, never through an occupied cell.
export function magneticPlacement(level,placements,id,origin,r,radius=.58) {
  const nearest={x:Math.round(origin.x),y:Math.round(origin.y),r};
  if(canPlace(level,placements,id,nearest))return nearest;
  let best=null,distance=radius;
  for(let y=nearest.y-1;y<=nearest.y+1;y++)for(let x=nearest.x-1;x<=nearest.x+1;x++){
    const d=Math.hypot(x-origin.x,y-origin.y),p={x,y,r};
    if(d<=distance&&canPlace(level,placements,id,p)){best=p;distance=d;}
  }
  return best;
}
export function liftedPose(point,grab,cell,fromScale,lift,progress) {
  const t=1-(1-Math.max(0,Math.min(1,progress)))**3;
  const scale=fromScale+(1-fromScale)*t;
  return {x:point.x-grab.x*cell*scale,y:point.y-grab.y*cell*scale-lift*t,scale};
}
export function optionsFor(level) {
  const out=level.pieces.map(()=>[]);
  level.pieces.forEach((piece,id)=>{
    const seen=new Set();
    for(let r=0;r<(level.rotate?4:1);r++){
      const cells=turn(piece.cells,r),key=JSON.stringify(cells);if(seen.has(key))continue;seen.add(key);
      const {w,h}=size(cells);
      for(let y=0;y<=level.n-h;y++)for(let x=0;x<=level.n-w;x++){
        const indexes=cells.map(([cx,cy])=>(cy+y)*level.n+cx+x);
        out[id].push({id,x,y,r,mask:indexes.reduce((m,i)=>m|(1n<<BigInt(i)),0n),indexes});
      }
    }
  });return out;
}
export function solve(level,placements=[],limit=250000) {
  const options=level.options??optionsFor(level),full=(1n<<BigInt(level.n**2))-1n;
  const byCell=Array.from({length:level.n**2},()=>[]);
  for(const group of options)for(const p of group)for(const cell of p.indexes)byCell[cell].push(p);
  let occupied=0n,remaining=(1<<level.pieces.length)-1,nodes=0,exhausted=false;
  const answer=Array(level.pieces.length).fill(null),memo=new Set();
  for(let id=0;id<level.pieces.length;id++)if(placements[id]){
    const p=placements[id];if(!canPlace(level,placements,id,p))return {solution:null,nodes,exhausted};
    const cells=turn(level.pieces[id].cells,p.r),mask=cells.reduce((m,[x,y])=>m|(1n<<BigInt((y+p.y)*level.n+x+p.x)),0n);
    occupied|=mask;remaining&=~(1<<id);answer[id]={...p};
  }
  function visit(board,left){
    if(++nodes>limit){exhausted=true;return false;}if(!left)return board===full;
    const key=`${board}:${left}`;if(memo.has(key))return false;
    let best=null;
    for(let cell=0;cell<level.n**2;cell++)if(!(board&(1n<<BigInt(cell)))){
      const choices=[];
      for(const p of byCell[cell])if((left&(1<<p.id))&&!(p.mask&board))choices.push(p);
      if(!choices.length)return false;if(best===null||choices.length<best.length)best=choices;if(best.length===1)break;
    }
    for(const p of best??[]){answer[p.id]={x:p.x,y:p.y,r:p.r};if(visit(board|p.mask,left&~(1<<p.id)))return true;if(exhausted)return false;answer[p.id]=null;}
    memo.add(key);return false;
  }
  return {solution:visit(occupied,remaining)?answer:null,nodes,exhausted};
}
export function hintWorkerSource(){
  return [normalize,turn,size,canPlace,optionsFor,solve].map(fn=>fn.toString()).join('\n')+'\nself.onmessage=({data})=>{try{self.postMessage(solve(data.level,data.placements,data.limit));}catch(error){self.postMessage({unavailable:true});}};';
}
// Trace cell edges once, then soften every outside and inside corner.
export function outline(cells) {
  const filled=new Set(cells.map(([x,y])=>`${x},${y}`)),edges=new Map();
  for(const [x,y]of cells){
    if(!filled.has(`${x},${y-1}`))edges.set(`${x},${y}`,[x+1,y]);
    if(!filled.has(`${x+1},${y}`))edges.set(`${x+1},${y}`,[x+1,y+1]);
    if(!filled.has(`${x},${y+1}`))edges.set(`${x+1},${y+1}`,[x,y+1]);
    if(!filled.has(`${x-1},${y}`))edges.set(`${x},${y+1}`,[x,y]);
  }
  const loops=[];
  while(edges.size){const first=edges.keys().next().value;let key=first,points=[];
    do{points.push(key.split(',').map(Number));const next=edges.get(key);edges.delete(key);key=next.join(',');}while(key!==first&&edges.has(key));
    const simplified=points.filter((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
    if(simplified.length<3)continue;
    const near=(p,q)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);return [p[0]+(q[0]-p[0])*.075/d,p[1]+(q[1]-p[1])*.075/d];};
    const n=simplified.length,start=near(simplified[0],simplified[n-1]);let d=`M${start}`;
    simplified.forEach((p,i)=>{const before=near(p,simplified[(i+n-1)%n]),after=near(p,simplified[(i+1)%n]);d+=`${i?'L'+before:''}Q${p} ${after}`;});
    d+='Z';loops.push(d);
  }return loops.join('');
}
