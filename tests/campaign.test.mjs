import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readLevel,PHASES,restoreCampaign,campaignSave,restoreArrangement,restoreHistory,canPlace,placementIssue,placementMessage,optionsFor,turn} from '../src/engine.js';
const raw=JSON.parse(readFileSync(new URL('../src/levels.json',import.meta.url),'utf8'));
const legacy=JSON.parse(readFileSync(new URL('./fixtures/legacy-36.json',import.meta.url),'utf8'));
const levels=raw.map(readLevel),byId=id=>levels.findIndex(l=>l.id===id);
assert.equal(levels.length,100);assert.equal(new Set(levels.map(l=>l.id)).size,100);assert.equal(PHASES.length,5);
for(const phase of PHASES){const group=levels.filter(l=>l.phase===phase.id);assert.equal(group.length,20);assert.ok(levels.slice(phase.start,phase.end+1).every(l=>l.phase===phase.id));}
for(let i=0;i<36;i++){
 const current=levels.find(l=>l.legacyIndex===i);assert.equal(current.id,`square-${String(i+1).padStart(3,'0')}`);assert.deepEqual(current.layout,legacy[i].layout,'Existing puzzle shapes and solutions retain their stable identity');
}
assert.equal(levels[0].legacyIndex,0);assert.equal(levels[1].legacyIndex,1);
for(let count=0;count<=36;count++)for(const version of [1,2]){
 const current=Math.min(count,35),l=levels.find(l=>l.legacyIndex===current);
 const old={version,completed:Array.from({length:count},(_,i)=>i),current,placements:l.pieces.map(()=>null),rotations:l.pieces.map(()=>version===1?1:0),sound:false};
 const migrated=restoreCampaign(old,levels);assert.equal(migrated.completed.size,count);assert.equal(levels[migrated.levelIndex].id,l.id);
 assert.ok([...migrated.completed].every(i=>levels[i].legacyIndex<count));assert.ok(migrated.unlocked>=migrated.levelIndex);
 const encoded=campaignSave(levels,{...migrated,sound:false}),reloaded=restoreCampaign(JSON.parse(JSON.stringify(encoded)),levels);
 assert.deepEqual(reloaded.completed,migrated.completed);assert.equal(reloaded.levelIndex,migrated.levelIndex);assert.equal(reloaded.unlocked,migrated.unlocked);
}
// Two independent unfinished boards and both Undo histories round-trip in one save.
const first=levels[1],second=levels[2];
const blank=l=>({placements:l.pieces.map(()=>null),rotations:l.pieces.map(()=>0)});
const partial=l=>({...blank(l),placements:l.pieces.map((p,id)=>id===0?{...p.solution}:null)});
const boards={[first.id]:{version:2,...partial(first),history:[blank(first)]},[second.id]:{version:2,...partial(second),history:[blank(second)]}};
const state={levelIndex:2,unlocked:2,completed:new Set([0]),boards,sound:true};
const reload=restoreCampaign(JSON.parse(JSON.stringify(campaignSave(levels,state))),levels);
for(const l of [first,second]){assert.deepEqual(restoreArrangement(l,reload.boards[l.id]).placements,partial(l).placements);assert.deepEqual(restoreHistory(l,reload.boards[l.id]),[blank(l)]);}
assert.deepEqual(restoreHistory(first,{history:[{placements:[{x:-99,y:0,r:0}]}]}),[],'Bad history cannot restore an invalid board');
// Reordering a future campaign retains identities, earned marks and saved boards.
const reordered=[...levels];[reordered[1],reordered[2]]=[reordered[2],reordered[1]];
const moved=restoreCampaign(campaignSave(levels,state),reordered);assert.equal(reordered[moved.levelIndex].id,second.id);assert.ok(moved.boards[first.id]);
const malformed=restoreCampaign({version:3,completedIds:['unknown',null],currentId:'unknown',unlockedId:'unknown',boards:null},levels);assert.equal(malformed.completed.size,0);assert.equal(malformed.levelIndex,0);
for(const l of levels){assert.ok(l.pieces.length<=9);assert.equal(l.rotate,false);assert.ok(optionsFor(l).flat().every(p=>p.r===0));}
const l=first,p=l.pieces[0].solution,occupied=l.pieces.map(piece=>({...piece.solution}));
assert.equal(placementIssue(l,[],0,{x:-1,y:0,r:0}),'outside');assert.equal(placementIssue(l,occupied,0,{...p,x:1}),'overlap');assert.equal(placementIssue(l,[],0,p),null);
assert.match(placementMessage('outside'),/inside/);assert.match(placementMessage('overlap'),/taken/);
console.log(JSON.stringify({campaign_levels:100,legacy_save_round_trips:74,independent_board_and_history_round_trip:true,phase_sizes:PHASES.map(()=>20),status:'passed'}));
