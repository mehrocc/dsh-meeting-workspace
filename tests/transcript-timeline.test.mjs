import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createMeeting,meetingTranscript,markdown} from '../src/model.mjs';
import {editTimeline,editableTimeline,needsSpeakerAnalysis} from '../src/transcript-timeline.mjs';
import {transcriptText} from '../src/bulk-meetings.mjs';

test('one visible and exported transcript keeps the earlier row available for existing citations',()=>{
 const meeting=createMeeting('会议','default','原有引用片段');
 meeting.speakerTranscript=[{id:'cached',time:'00:00:55.260',speaker:'发言人 1',startSeconds:55.26,text:'新版显示的原文',final:true}];
 assert.equal(meetingTranscript(meeting),meeting.speakerTranscript);
 assert.match(transcriptText(meeting,'未分类'),/发言人 1：新版显示的原文/);
 assert.match(markdown(meeting,'未分类'),/发言人 1：新版显示的原文/);
 assert.doesNotMatch(transcriptText(meeting,'未分类'),/原有引用片段/);
 assert.equal(meeting.transcript[0].text,'原有引用片段');
});

test('opening an eligible saved recording requests automatic analysis only when useful',()=>{
 const recording={...createMeeting('会议','default','原文'),captureId:'capture',audio:[{id:'audio'}]};
 assert.equal(needsSpeakerAnalysis(recording),true);
 for(const fields of [{status:'录制中'},{speakerAutoAttempted:true},{speakerTranscript:[{}]},{captureId:null},{audio:[]}]){
  assert.equal(needsSpeakerAnalysis({...recording,...fields}),false);
 }
 assert.equal(needsSpeakerAnalysis({...recording,transcript:[{speaker:'发言人 1'}]}),false);
});

test('editing the displayed transcript preserves original timing and multiline content',()=>{
 const rows=[{id:'one',time:'00:00:55.260',speaker:'发言人 1',text:'第一行\n下一行',startSeconds:55.26,final:true},
  {id:'two',time:'段落 2',speaker:'发言人',text:'第二段',final:true}];
 const edited=editTimeline(editableTimeline(rows).replace('第一行','修订后'),rows);
 assert.deepEqual(edited,[{...rows[0],text:'修订后\n下一行'},rows[1]]);
 assert.throws(()=>editTimeline('[00:01] 发言人：',rows),/不能为空/);
});
