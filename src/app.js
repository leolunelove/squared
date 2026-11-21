const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const icons={
  sound:'<path d="M11 4 6 8H3v8h3l5 4V4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted:'<path d="M11 4 6 8H3v8h3l5 4V4Z"/><path d="m16 9 6 6m0-6-6 6"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .65-1.5 1-1.5 2.5M12 17h.01"/>',
  undo:'<path d="m8 4-5 5 5 5M3 9h11a6 6 0 0 1 0 12h-3"/>',
  hint:'<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
  restart:'<path d="M3 4v6h6M3.5 10a8.5 8.5 0 1 1 .6 7"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  next:'<path d="M3 12h18m-7-7 7 7-7 7"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
const colors=[['#7caaa0','#5c9187','#507e73','sage'],['#e5ba79','#d5a35d','#b98b4a','honey'],['#e7a18a','#d7866e','#bb705c','peach'],['#9ca9cc','#7e8fb6','#6d7fa3','periwinkle'],['#bac18b','#9eaa72','#87945b','olive'],['#c5a9bd','#ae8fa7','#997a93','mauve'],['#82aeb9','#6595a2','#56818b','blue'],['#d79cb0','#bb788e','#9d6074','rose'],['#b3b6aa','#929b8b','#7b8874','stone']];
const levels=LEVEL_DATA.map(readLevel);
const tierFor=index=>levels[index].tier??(index<6?'First steps':'Finding flow');
const playerSaveKey='squared-save-v1';
// Session-only release playtests start from a copy and never write player progress.
const playtest=new URLSearchParams(location.search).get('playtest')==='1';
const key=playtest?'squared-playtest-v1':playerSaveKey,gameStorage=()=>playtest?sessionStorage:localStorage;let saved={};
try{saved=JSON.parse(gameStorage().getItem(key)||(playtest?localStorage.getItem(playerSaveKey):null)||'{}')??{};}catch{}
let {completed,unlocked,levelIndex}=restoreProgress(saved,levels.length);
let sound=saved.sound!==false,level,placements=[],rotations=[],history=[],selected=null,drag=null,geometry=null,keyboardTarget=null,hintTarget=null,solved=false,finishTimer=null,audio=null,storageOkay=true,trayIds=[],dragFrame=0,hintSerial=0,hintTask=null;
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion=()=>motionPreference.matches;
const nodes=[],stage=$('#stage'),board=$('#board'),preview=$('#preview'),hintGhost=$('#hint-ghost');
$('#sound').innerHTML=icon(sound?'sound':'muted');$('#help').innerHTML=icon('help');
$('#undo').innerHTML=icon('undo')+'Undo';$('#hint').innerHTML=icon('hint')+'Hint';$('#restart').innerHTML=icon('restart')+'Restart';
$$('.close-dialog.icon-button').forEach(b=>b.innerHTML=icon('close'));
function persist(){
  try{gameStorage().setItem(key,JSON.stringify({current:levelIndex,completed:[...completed],placements,rotations,sound,version:2}));}
  catch{storageOkay=false;}
}
function say(text){$('#status').textContent=text;}
function haptic(pattern){try{navigator.vibrate?.(pattern);}catch{}}
function wakeAudio(){
  if(!sound)return;
  try{if(!audio){const C=window.AudioContext||window.webkitAudioContext;if(C)audio=new C();}if(audio?.state==='suspended')audio.resume().catch(()=>{});}catch{}
}
function tone(kind='place'){
  if(!sound||!audio||audio.state!=='running')return;
  const now=audio.currentTime;
  const notes=kind==='finish'?[392,493.88,587.33,783.99]:kind==='pick'?[320]:kind==='miss'?[155]:[440,220];
  notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=now+i*(kind==='finish'?.09:.022);o.type='sine';o.frequency.setValueAtTime(f,t);if(kind==='place')o.frequency.exponentialRampToValueAtTime(f*.7,t+.1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind==='finish'?.055:.035,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+(kind==='finish'?.65:.16));o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.8);});
}
function snapshot(){return {placements:placements.map(p=>p?{...p}:null),rotations:[...rotations]};}
function remember(){history.push(snapshot());if(history.length>80)history.shift();}
function restore(state){placements=state.placements.map(p=>p?{...p}:null);rotations=[...state.rotations];}
function pieceCells(id){return turn(level.pieces[id].cells,rotations[id]);}
function svgPiece(id,cells,ghost=false){
  const {w,h}=size(cells),d=outline(cells),c=colors[id%colors.length],uid=`p${id}-${rotations[id]}`;
  if(ghost)return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}"/></svg>`;
  const hit=placements[id]?0:Math.max(.14,46/(geometry.cell*geometry.homes[id].scale)-Math.min(w,h));
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><linearGradient id="${uid}" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><path d="${d}" fill="${c[2]}" transform="translate(0 .028)"/><path class="surface" d="${d}" fill="url(#${uid})" stroke="${c[2]}"/><path d="${d}" fill="none" stroke="#ffffff" stroke-opacity=".29" stroke-width=".025" transform="translate(.009 -.012)" pointer-events="none"/><path d="${d}" fill="transparent" stroke="transparent" stroke-width="${hit}" pointer-events="all" style="cursor:grab"/></svg>`;
}
function paint(id){
  const cells=pieceCells(id),s=size(cells),el=nodes[id];
  const paintKey=`${rotations[id]}:${!!placements[id]}:${geometry.cell.toFixed(2)}:${geometry.homes[id].scale.toFixed(3)}`;
  if(el.dataset.paintKey!==paintKey){el.innerHTML=svgPiece(id,cells);el.dataset.paintKey=paintKey;}
  el.style.width=s.w*geometry.cell+'px';el.style.height=s.h*geometry.cell+'px';
  el.setAttribute('aria-label',`${colors[id][3]} piece, ${level.pieces[id].cells.length} squares${placements[id]?', on board':', in tray'}. Select to move.`);
}
function position(id,x,y,scale=1){nodes[id].style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;}
function layout(){
  if(!level)return;const {width,height}=stage.getBoundingClientRect(),rows=level.pieces.length>3?2:1;
  const wide=width>480&&height<320;
  const boardSize=Math.floor(wide?Math.min(height-22,300,width*.43):Math.min(width-42,320,height*(rows===2?.55:.62)));
  const cell=boardSize/level.n,bx=wide?(width*.45-boardSize)/2:(width-boardSize)/2,by=wide?8:12;
  const trayX=wide?width*.46+12:0,trayWidth=wide?width-trayX-8:width;
  const trayTop=wide?44:by+boardSize+48,trayHeight=Math.max(50,height-trayTop-8);
  const ids=trayIds;
  const cols=ids.length>8?5:ids.length>6?4:ids.length>4?3:ids.length===4?2:Math.max(1,ids.length),actualRows=Math.ceil(ids.length/cols)||1;
  const slotW=trayWidth/cols,slotH=trayHeight/actualRows;
  geometry={width,height,boardSize,cell,bx,by,trayTop,homes:[]};
  Object.assign(board.style,{left:bx+'px',top:by+'px',width:boardSize+'px',height:boardSize+'px'});
  const gridKey=`${level.n}:${boardSize}`;
  if(board.dataset.grid!==gridKey){board.innerHTML=Array.from({length:level.n**2},(_,i)=>`<span class="board-cell" style="left:${(i%level.n)*cell+3}px;top:${Math.floor(i/level.n)*cell+3}px;width:${cell-6}px;height:${cell-6}px"></span>`).join('');board.dataset.grid=gridKey;}
  board.setAttribute('aria-label',`${level.n} by ${level.n} square board`);
  Object.assign($('#tray-label').style,{top:(wide?12:by+boardSize+18)+'px',left:(wide?trayX:8)+'px'});
  ids.forEach((id,i)=>{
    const {w,h}=size(pieceCells(id)),maxdim=Math.max(w,h);
    const scale=Math.min(.82,(slotW-18)/(maxdim*cell),(slotH-12)/(maxdim*cell));
    const row=Math.floor(i/cols),rowCount=Math.min(cols,ids.length-row*cols),rowOffset=(trayWidth-rowCount*slotW)/2;
    geometry.homes[id]={x:trayX+rowOffset+(i%cols)*slotW+(slotW-w*cell*scale)/2,y:trayTop+row*slotH+(slotH-h*cell*scale)/2,scale};
  });
  level.pieces.forEach(({id})=>{
    paint(id);nodes[id].classList.toggle('placed',!!placements[id]);
    if(drag?.id===id&&drag.active)return;
    if(placements[id])position(id,bx+placements[id].x*cell,by+placements[id].y*cell);
    else {const p=geometry.homes[id];position(id,p.x,p.y,p.scale);}
  });
  if(hintTarget)showGhost(hintGhost,hintTarget.id,hintTarget.p);
  updateControls();
}
function setHintBusy(busy){$('#hint').disabled=busy;$('#hint').setAttribute('aria-busy',String(busy));}
function clearHint(){hintSerial++;hintTask?.cancel();setHintBusy(false);hintTarget=null;hintGhost.classList.remove('visible');nodes.forEach(n=>n.classList.remove('hinted'));}
function choose(id){
  selected=id;keyboardTarget=null;nodes.forEach((n,i)=>{n.classList.toggle('selected',i===id);n.setAttribute('aria-pressed',String(i===id));});
  if(id!==null&&!solved)say('Drag into the square, or tap the board to place.');
}
function updateControls(){
  const left=placements.filter(p=>!p).length;$('#piece-count').textContent=left?`${left} to go`:'A perfect fit';
  $('#undo').disabled=!history.length;
  $('#hint').innerHTML=icon(solved?'next':'hint')+(solved?'Next':'Hint');
  $('#hint').setAttribute('aria-label',solved?'Continue after this square':'Show a helpful placement');
  $('#restart').disabled=false;
}
function load(index,restored=null){
  cancelDrag();clearTimeout(finishTimer);closeSuccess();clearHint();levelIndex=index;level=levels[index];solved=false;selected=null;keyboardTarget=null;history=[];board.classList.remove('complete');
  // Every piece keeps its own home throughout the puzzle, including after a reload.
  trayIds=index===0?[0,2,1]:level.pieces.map(p=>p.id);
  const arrangement=restoreArrangement(level,restored);({placements,rotations}=arrangement);
  $('#level-num').textContent=String(index+1).padStart(2,'0');$('#level-total').textContent=`/ ${levels.length}`;$('#dimension').textContent=`${level.n} × ${level.n}`;$('#level-eyebrow').textContent=index<12?'A LITTLE PIECE OF CALM':`${tierFor(index).toUpperCase()} SQUARE`;
  $('#pieces').innerHTML='';nodes.length=0;
  level.pieces.forEach(({id})=>{const el=document.createElement('button');el.type='button';el.className='piece';el.dataset.piece=id;el.setAttribute('aria-pressed','false');el.addEventListener('pointerdown',e=>pointerDown(e,id));el.addEventListener('click',e=>{if(e.detail===0&&!solved){wakeAudio();choose(id);}});$('#pieces').append(el);nodes.push(el);});
  say(index===0?'One last piece. Make it a square.':`${level.title}. Take your time.`);
  if(arrangement.repaired)say('Pieces refreshed for drag-only play. Your completed squares are saved.');
  layout();persist();checkComplete(false);
}
function stagePoint(e){const r=stage.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function pointerDown(e,id){
  if(e.button!==0||drag||solved)return;e.preventDefault();wakeAudio();clearHint();
  nodes[id].getAnimations().forEach(a=>a.finish());nodes[id].querySelector('svg')?.getAnimations().forEach(a=>a.finish());
  const point=stagePoint(e),rect=nodes[id].getBoundingClientRect(),cells=pieceCells(id),{w,h}=size(cells);
  choose(id);
  drag={id,pointerId:e.pointerId,start:point,point,active:false,before:snapshot(),touch:e.pointerType==='touch',fromScale:rect.width/(w*geometry.cell),grab:{x:Math.max(0,Math.min(w,(e.clientX-rect.left)/(rect.width/w))),y:Math.max(0,Math.min(h,(e.clientY-rect.top)/(rect.height/h)))},lift:e.pointerType==='touch'?Math.min(48,geometry.cell*.85):0,p:null,overTray:false,lastSnapKey:null,lastFeedback:0};
  try{stage.setPointerCapture(e.pointerId);}catch{}
}
function pointerMove(e){
  if(!drag||drag.pointerId!==e.pointerId)return;e.preventDefault();const p=stagePoint(e);
  if(!drag.active&&Math.hypot(p.x-drag.start.x,p.y-drag.start.y)<(drag.touch?7:4))return;
  drag.point=p;
  if(!drag.active){drag.active=true;drag.started=performance.now();placements[drag.id]=null;nodes[drag.id].classList.add('dragging');nodes[drag.id].classList.remove('placed');tone('pick');haptic(5);}
  if(!dragFrame)dragFrame=requestAnimationFrame(renderDrag);
}
function dragTarget(){
  const {cell,bx,by,boardSize,trayTop}=geometry;
  const {x,y}=liftedPose(drag.point,drag.grab,cell,drag.fromScale,drag.lift,1);
  const origin={x:(x-bx)/cell,y:(y-by)/cell};
  const candidate={x:Math.round(origin.x),y:Math.round(origin.y),r:rotations[drag.id]};
  const {w,h}=size(pieceCells(drag.id));const near=x+w*cell>bx&&x<bx+boardSize&&y+h*cell>by&&y<by+boardSize;
  drag.p=near?magneticPlacement(level,placements,drag.id,origin,rotations[drag.id]):null;
  drag.overTray=drag.point.y>trayTop-12;
  if(near){showGhost(preview,drag.id,drag.p??candidate,!drag.p);const snapKey=drag.p?`${drag.p.x}:${drag.p.y}`:null;
    if(drag.touch&&snapKey&&snapKey!==drag.lastSnapKey&&performance.now()-drag.lastFeedback>90){haptic(3);drag.lastFeedback=performance.now();}drag.lastSnapKey=snapKey;
  }else preview.classList.remove('visible');
}
function renderDrag(time){
  dragFrame=0;if(!drag?.active)return;
  const progress=reducedMotion()?1:(time-drag.started)/135;
  const pose=liftedPose(drag.point,drag.grab,geometry.cell,drag.fromScale,drag.lift,progress);
  position(drag.id,pose.x,pose.y,pose.scale);dragTarget();
  if(progress<1)dragFrame=requestAnimationFrame(renderDrag);
}
function showGhost(el,id,p,invalid=false){
  const cells=turn(level.pieces[id].cells,p.r),{w,h}=size(cells),shapeKey=`${id}:${p.r}`;
  if(el.dataset.shape!==shapeKey){el.innerHTML=svgPiece(id,cells,true);el.dataset.shape=shapeKey;}
  el.style.setProperty('--piece-tint',colors[id][1]);Object.assign(el.style,{width:w*geometry.cell+'px',height:h*geometry.cell+'px',transform:`translate3d(${geometry.bx+p.x*geometry.cell}px,${geometry.by+p.y*geometry.cell}px,0)`});el.classList.add('visible');el.classList.toggle('invalid',invalid);
}
function endDrag(e,cancel=false){
  if(!drag||(e&&e.pointerId!==drag.pointerId))return;
  cancelAnimationFrame(dragFrame);dragFrame=0;
  // Pointer-up can arrive before the next animation frame or the last pointer-move.
  if(drag.active&&!cancel){if(e)drag.point=stagePoint(e);dragTarget();}
  const d=drag;drag=null;preview.classList.remove('visible');nodes[d.id]?.classList.remove('dragging');
  // Pointer-up releases capture automatically. Explicit release is only needed
  // when cancelling; otherwise a late lost-capture event can race the next pickup.
  if(cancel||!e)try{stage.releasePointerCapture(d.pointerId);}catch{}
  if(cancel){restore(d.before);layout();return;}
  if(!d.active){choose(d.id);return;}
  if(d.p){history.push(d.before);placements[d.id]=d.p;clearHint();tone('place');haptic(8);choose(null);say(['A little closer.','That feels right.','Finding its place.'][Math.floor(Math.random()*3)]);}
  else if(d.overTray&&d.before.placements[d.id]){history.push(d.before);placements[d.id]=null;say('A little room to try again.');}
  else{restore(d.before);tone('miss');say('Almost. Try a little more space.');}
  layout();if(d.p)settlePiece(d.id);persist();checkComplete();
}
function cancelDrag(){if(drag)endDrag(null,true);}
function settlePiece(id){
  if(reducedMotion())return;
  nodes[id].querySelector('svg')?.animate([{transform:'scale(1.025) translateY(-1px)'},{transform:'scale(.992) translateY(1px)',offset:.65},{transform:'none'}],{duration:220,easing:'cubic-bezier(.2,.8,.2,1)'});
}
function placeSelected(p){
  if(selected===null||solved)return;const id=selected;
  if(canPlace(level,placements,id,p)){remember();placements[id]={...p};rotations[id]=p.r;clearHint();choose(null);tone('place');haptic(8);layout();settlePiece(id);persist();checkComplete();if(!solved)say('That feels right. Keep going.');}
  else{tone('miss');say('That space is taken, or the piece is outside the square.');}
}
stage.addEventListener('pointermove',pointerMove);
stage.addEventListener('pointerup',e=>endDrag(e));stage.addEventListener('pointercancel',e=>endDrag(e,true));stage.addEventListener('lostpointercapture',e=>{if(drag&&e.pointerId===drag.pointerId&&!stage.hasPointerCapture(e.pointerId))endDrag(e,true);});
board.addEventListener('pointerdown',e=>{
  if(selected===null||solved||drag)return;e.preventDefault();wakeAudio();const p=stagePoint(e);
  // Tap placement uses the top-left cell; drag placement uses the exact grab point.
  placeSelected({x:Math.floor((p.x-geometry.bx)/geometry.cell),y:Math.floor((p.y-geometry.by)/geometry.cell),r:rotations[selected]});
});
$('#undo').addEventListener('click',()=>{
  if(!history.length)return;cancelDrag();clearTimeout(finishTimer);closeSuccess();clearHint();solved=false;board.classList.remove('complete');restore(history.pop());choose(null);layout();persist();say('Back a little. Try another way.');
});
$('#restart').addEventListener('click',()=>{
  cancelDrag();clearTimeout(finishTimer);closeSuccess();remember();clearHint();solved=false;board.classList.remove('complete');({placements,rotations}=restoreArrangement(level));choose(null);layout();persist();say('A fresh little start.');
});
function requestHintSearch(){
  return new Promise(resolve=>{
    let worker=null,url=null,timer=null;
    const task={cancel:()=>finish({cancelled:true})};hintTask=task;
    function finish(result){
      if(hintTask!==task)return;
      hintTask=null;clearTimeout(timer);worker?.terminate();if(url)URL.revokeObjectURL(url);resolve(result);
    }
    try{
      url=URL.createObjectURL(new Blob([hintWorkerSource()],{type:'text/javascript'}));worker=new Worker(url);
      worker.onmessage=e=>finish(e.data);worker.onerror=()=>finish({unavailable:true});
      timer=setTimeout(()=>finish({exhausted:true}),2500);
      worker.postMessage({level:{n:level.n,rotate:level.rotate,pieces:level.pieces},placements:placements.map(p=>p?{...p}:null),limit:250000});
    }catch{finish({unavailable:true});}
  });
}
function matchesOriginal(id,p){const target=level.pieces[id].solution;return !p||(p.x===target.x&&p.y===target.y&&JSON.stringify(pieceCells(id))===JSON.stringify(level.pieces[id].cells));}
$('#hint').addEventListener('click',async()=>{
  if(solved){openSuccess();return;}cancelDrag();wakeAudio();clearHint();const ticket=hintSerial;
  let result;
  if(placements.every((p,id)=>matchesOriginal(id,p)))result={solution:level.pieces.map(p=>({...p.solution}))};
  else{setHintBusy(true);say('Finding a little opening…');result=await requestHintSearch();if(ticket!==hintSerial||result.cancelled)return;setHintBusy(false);}
  let target;
  if(result.solution){const id=placements.findIndex(p=>!p);target={id,p:result.solution[id]};}
  else{
    const move=placements.findIndex((p,i)=>p&&!matchesOriginal(i,p));
    if(move!==null&&move>=0){nodes[move].classList.add('hinted');choose(move);say(`Make a little room. Try moving the ${colors[move][3]} piece back to the tray.`);}
    else say('Try taking a piece back out, then ask for another hint.');return;
  }
  hintTarget=target;showGhost(hintGhost,target.id,target.p);nodes[target.id].classList.add('hinted');choose(target.id);
  say(`Try the ${colors[target.id][3]} piece in the dotted space.`);tone('pick');
});
function checkComplete(celebrate=true){
  if(!complete(level,placements))return;solved=true;choose(null);clearHint();board.classList.add('complete');completed.add(levelIndex);while(completed.has(unlocked)&&unlocked<levels.length-1)unlocked++;persist();updateControls();say('Every piece, exactly where it belongs.');
  if(celebrate){tone('finish');haptic([10,60,16]);sparkle();}finishTimer=setTimeout(openSuccess,celebrate?1000:550);
}
function sparkle(){
  const holder=$('#sparkles');holder.innerHTML='';if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(let i=0;i<22;i++){const el=document.createElement('i');el.className='spark';const angle=i/22*Math.PI*2,x=geometry.bx+geometry.boardSize/2+Math.cos(angle)*geometry.boardSize*.48,y=geometry.by+geometry.boardSize/2+Math.sin(angle)*geometry.boardSize*.48;el.style.cssText=`background:${colors[i%colors.length][0]};--x:${x}px;--y:${y}px;--dx:${Math.cos(angle)*(25+Math.random()*35)}px;--dy:${Math.sin(angle)*40-15}px;--spin:${Math.random()*240}deg;animation-delay:${Math.random()*.1}s`;holder.append(el);}setTimeout(()=>holder.innerHTML='',1300);
}
function openSuccess(){
  if(!solved)return;const last=levelIndex===levels.length-1;$('#success-kicker').textContent=last?'EVERY SQUARE, COMPLETE':'EVERY PIECE BELONGS';$('#success-title').textContent=last?'A lovely little collection.':'All squared away.';$('#success-text').textContent=last?`All ${levels.length} squares complete. Come back any time.`:'A little mess. A perfect fit.';$('#next').innerHTML=last?'Your collection <span aria-hidden="true">↗</span>':'Next square <span aria-hidden="true">→</span>';$('#success').classList.add('show');$('#success').setAttribute('aria-hidden','false');$('#success').setAttribute('role','dialog');$('#success').setAttribute('aria-modal','true');$('.app').inert=true;$('#next').focus({preventScroll:true});
}
function closeSuccess(){$('#success').classList.remove('show');$('#success').setAttribute('aria-hidden','true');$('#success').removeAttribute('aria-modal');$('.app').inert=false;}
$('#next').addEventListener('click',()=>{wakeAudio();if(levelIndex===levels.length-1){closeSuccess();openLevels();}else{load(levelIndex+1);nodes.find((_,i)=>!placements[i])?.focus({preventScroll:true});}});
$('#replay').addEventListener('click',()=>{clearTimeout(finishTimer);closeSuccess();say('All squared away. Tap Next when you’re ready.');$('#hint').focus({preventScroll:true});});
function openLevels(){
  cancelDrag();clearTimeout(finishTimer);$('#collection-progress').textContent=`${completed.size} of ${levels.length} squares complete. A little more room to play.`;
  $('#level-grid').innerHTML=levels.map((l,i)=>`${i===0||tierFor(i)!==tierFor(i-1)?`<h3 class="level-section-title">${tierFor(i)}<small>${i+1}–${Math.min(i+6,levels.length)}</small></h3>`:''}<button class="level-tile ${i===levelIndex?'current':''}" data-level="${i}" ${i>unlocked?'disabled':''} aria-label="Level ${i+1}, ${l.n} by ${l.n}${completed.has(i)?', complete':i>unlocked?', locked':''}" ${i===levelIndex?'aria-current="true"':''}>${String(i+1).padStart(2,'0')} ${completed.has(i)?'<span class="check" aria-hidden="true">✓</span>':''}<small>${i>unlocked?'LOCKED':`${l.n} × ${l.n}`}</small></button>`).join('');
  $('#levels-dialog .dialog-footer').textContent=storageOkay?'Your progress is saved on this device.':'Progress could not be saved in this browser.';$('#levels-dialog').showModal();requestAnimationFrame(()=>$('#level-grid [aria-current="true"]')?.scrollIntoView({block:'center'}));
}
$('#level-button').addEventListener('click',openLevels);$('.brand').addEventListener('click',e=>{e.preventDefault();openLevels();});
$('#level-grid').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(!b||b.disabled)return;$('#levels-dialog').close();load(Number(b.dataset.level));});
$('#help').addEventListener('click',()=>{cancelDrag();clearTimeout(finishTimer);$('#help-dialog').showModal();});
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').innerHTML=icon(sound?'sound':'muted');$('#sound').setAttribute('aria-label',sound?'Turn sound off':'Turn sound on');$('#sound').setAttribute('aria-pressed',String(sound));if(sound){wakeAudio();tone('pick');}persist();});
document.addEventListener('keydown',e=>{
  if($('#success').classList.contains('show')){if(e.key==='Escape')$('#replay').click();if(e.key==='Tab'){e.preventDefault();($('#next')===document.activeElement?$('#replay'):$('#next')).focus();}return;}
  if($$('dialog[open]').length)return;
  if(e.key==='Escape'){cancelDrag();preview.classList.remove('visible');choose(null);say('Take your time. Every piece has a place.');return;}
  if(selected===null||solved)return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
    e.preventDefault();const p=keyboardTarget??(placements[selected]?{...placements[selected]}:{x:0,y:0,r:rotations[selected]});p.x+=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;p.y+=e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0;const {w,h}=size(pieceCells(selected));p.x=Math.max(0,Math.min(level.n-w,p.x));p.y=Math.max(0,Math.min(level.n-h,p.y));keyboardTarget=p;showGhost(preview,selected,p,!canPlace(level,placements,selected,p));say(`${colors[selected][3]} piece. Column ${p.x+1}, row ${p.y+1}. Enter to place.`);
  }
  if(e.key==='Enter'&&keyboardTarget){e.preventDefault();preview.classList.remove('visible');placeSelected(keyboardTarget);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelDrag();audio?.suspend().catch(()=>{});}});
window.addEventListener('pagehide',()=>{cancelDrag();persist();});
let resizeFrame;new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;if(geometry&&Math.abs(width-geometry.width)<1&&Math.abs(height-geometry.height)<1)return;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{nodes.forEach(n=>n.classList.add('resizing'));cancelDrag();layout();requestAnimationFrame(()=>nodes.forEach(n=>n.classList.remove('resizing')));});}).observe(stage);
$('#sound').setAttribute('aria-label',sound?'Turn sound off':'Turn sound on');$('#sound').setAttribute('aria-pressed',String(sound));
load(levelIndex,saved.current===levelIndex?saved:null);
