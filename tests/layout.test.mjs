import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stageLayout,overTrayAtPoint} from '../src/layout.js';
import {readLevel,size} from '../src/engine.js';
const levels=JSON.parse(readFileSync(new URL('../src/levels.json',import.meta.url))).map(readLevel);
let checks=0;
const check=(ok,message)=>{assert.ok(ok,message);checks++;};
const near=(a,b)=>Math.abs(a-b)<1e-7;
// Recorded mobile geometry remains stable, including the short landscape branch.
for(const [input,expected] of [
  [[319,432,3],{boardSize:267,bx:26,by:12,trayX:0,trayTop:327,cols:3}],
  [[284,350,9],{boardSize:192,bx:46,by:12,trayX:0,trayTop:252,cols:5}],
  [[794,208,9],{boardSize:186,bx:85.65,by:8,trayX:377.24,trayTop:44,cols:5}]
]){
  const result=stageLayout(...input);
  for(const [key,value] of Object.entries(expected))check(near(result[key],value),`Existing mobile ${key} is preserved`);
}
// Exercise every campaign shape on compact laptops, desktop and large screens.
for(const [width,height] of [[604,400],[644,503],[816,336],[936,456],[1160,636],[1160,816]])for(const level of levels){
  const g=stageLayout(width,height,level.pieces.length,true),cell=g.boardSize/level.n;
  check(g.boardSize>280,'Desktop uses the available space for a substantial square');
  check(g.bx>=0&&g.by>=0&&g.bx+g.boardSize<=g.trayX-24,'Board and tray are separated');
  check(g.by+g.boardSize<=height,'The board remains inside the stage');
  check(!overTrayAtPoint({x:g.bx+g.boardSize/2,y:g.by+g.boardSize/2},{...g,sideTray:g.wide}),'An invalid board drop is not mistaken for returning to the side tray');
  check(overTrayAtPoint({x:g.trayX+g.trayWidth/2,y:g.trayTop+20},{...g,sideTray:g.wide}),'Dragging a placed piece back to the side tray removes it from the board');
  const rectangles=[];
  level.pieces.forEach(({cells},i)=>{
    const {w,h}=size(cells),maxdim=Math.max(w,h);
    const scale=Math.min(.82,(g.slotW-18)/(maxdim*cell),(g.slotH-12)/(maxdim*cell));
    const row=Math.floor(i/g.cols),count=Math.min(g.cols,level.pieces.length-row*g.cols),offset=(g.trayWidth-count*g.slotW)/2;
    const x=g.trayX+offset+(i%g.cols)*g.slotW+(g.slotW-w*cell*scale)/2;
    const y=g.trayTop+row*g.slotH+(g.slotH-h*cell*scale)/2;
    const rect={x,y,w:w*cell*scale,h:h*cell*scale};
    check(scale>0&&scale<=.82,'Every piece has a usable finite scale');
    check(x>=g.trayX&&x+rect.w<=width&&y>=g.labelTop+32&&y+rect.h<=height,'Pieces fit below the tray label and inside the stage');
    for(const other of rectangles)check(x>=other.x+other.w||other.x>=x+rect.w||y>=other.y+other.h||other.y>=y+rect.h,'Tray pieces never overlap');
    rectangles.push(rect);
  });
}
check(!overTrayAtPoint({x:100,y:180},{sideTray:false,trayTop:300}),'The mobile board is outside the bottom tray');
check(overTrayAtPoint({x:100,y:400},{sideTray:false,trayTop:300}),'The mobile tray keeps its vertical boundary');
console.log(JSON.stringify({responsive_layout_checks:checks,campaign_levels:levels.length,status:'passed'}));
