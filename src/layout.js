// Presentation geometry only. Mobile keeps its established board and tray sizing.
export const DESKTOP_QUERY='(min-width: 960px) and (min-height: 600px)';
export function stageLayout(width,height,pieceCount,desktop=false){
  const rows=pieceCount>3?2:1,wide=desktop||(width>480&&height<320);
  const boardColumn=width*.54;
  const boardSize=Math.floor(desktop?Math.min(520,boardColumn-32,height-32):wide?Math.min(height-22,300,width*.43):Math.min(width-42,320,height*(rows===2?.55:.62)));
  const bx=desktop?(boardColumn-boardSize)/2:wide?(width*.45-boardSize)/2:(width-boardSize)/2;
  const by=desktop?(height-boardSize)/2:wide?8:12;
  const trayX=desktop?boardColumn+32:wide?width*.46+12:0;
  const trayWidth=wide?width-trayX-8:width;
  const labelTop=desktop?16:wide?12:by+boardSize+18;
  const trayTop=desktop?64:wide?44:by+boardSize+48;
  const trayHeight=Math.max(50,height-trayTop-(desktop?16:8));
  const cols=desktop?(pieceCount<=3?1:pieceCount<=6?2:3):pieceCount>8?5:pieceCount>6?4:pieceCount>4?3:pieceCount===4?2:Math.max(1,pieceCount);
  const actualRows=Math.ceil(pieceCount/cols)||1;
  return {wide,boardSize,bx,by,trayX,trayWidth,trayTop,trayHeight,cols,actualRows,slotW:trayWidth/cols,slotH:trayHeight/actualRows,labelTop,labelLeft:wide?trayX:8};
}
export function overTrayAtPoint(point,geometry){
  return geometry.sideTray?point.x>geometry.trayX-12:point.y>geometry.trayTop-12;
}
