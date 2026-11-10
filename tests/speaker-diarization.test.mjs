import assert from 'node:assert/strict';
import {test} from 'node:test';
import {recoverSpeakerRows,speakerLabels} from '../src/server/speaker-diarization.mjs';

test('same voice keeps the same label across turns and ambiguous overlap stays unassigned',()=>{
 const rows=[{id:'a',startSeconds:0.5,endSeconds:2},{id:'b',startSeconds:3.2,endSeconds:4.8},
  {id:'mixed',startSeconds:5.1,endSeconds:6.8},{id:'a2',startSeconds:8.1,endSeconds:9.5},{id:'legacy',time:'00:01'}];
 const segments=[{start:0,end:2.4,speaker:7},{start:3,end:5,speaker:3},
  {start:5,end:7,speaker:3},{start:5,end:7,speaker:7},{start:8,end:10,speaker:7}];
 assert.deepEqual([...speakerLabels(rows,segments)],[['a','发言人 1'],['b','发言人 2'],['a2','发言人 1']]);
});


test('historical SenseVoice rows recover their exact capture ranges without replacing edited paragraphs',()=>{
 const cached=[
  {id:'00000000-0000-0000-0000-000000000001',time:'00:06',speaker:'发言人',text:'第一段'},
  {id:'00000000-0000-0000-0000-000000000002',time:'00:12',speaker:'发言人',text:'第二段'},
 ];
 const range={startSeconds:6.2,endSeconds:12.2};
 const ranges=new Map([['00:06',range],['00:12',null]]);
 const edited={...cached[1],text:'人工改过'};
 assert.deepEqual(recoverSpeakerRows([cached[0],edited],cached,ranges,true),{
  rows:[{...cached[0],...range},edited],alternate:false,
 });
 const untimed=[{id:'old',time:'段落 1',speaker:'发言人',text:'原来的逐字稿'}];
 assert.deepEqual(recoverSpeakerRows(untimed,cached,ranges,true),{
  rows:[{...cached[0],...range}],alternate:true,
 });
 assert.deepEqual(recoverSpeakerRows(untimed,cached,ranges,false),{rows:[],alternate:true});
 assert.equal(untimed[0].time,'段落 1');
});
