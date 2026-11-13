import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,mkdir,writeFile,truncate,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {IncrementalSpeakers,MAX_SPEAKER_SECONDS} from '../src/server/incremental-speakers.mjs';
import {captureSegmentIndex,speakerLabels} from '../src/server/speaker-diarization.mjs';
const {SpeakerRegistry}=createRequire(import.meta.url)('../src/server/speaker-core.cjs');
test('voice prototypes match returning speakers; uncertain evidence and overlap remain unknown',()=>{
 const r=new SpeakerRegistry();assert.equal(r.match([1,0,0]),0);assert.equal(r.match([0,1,0]),1);assert.equal(r.match([.99,.02,0]),0);assert.equal(r.match([.60,.60,.529]),-1);assert.equal(r.profiles.length,2);
 assert.deepEqual([...speakerLabels([{id:'mixed',startSeconds:0,endSeconds:3}],[{start:0,end:3,speaker:0},{start:0,end:3,speaker:-1}])],[]);
});
test('two hours drain through one worker with bounded PCM windows and stable global labels',async()=>{
 let workers=0,peakWindow=0,calls=0,updates=0,closed=false;
 const s=new IncrementalSpeakers({createWorker:()=>{workers++;return {async analyze(files,offset,from){calls++;const end=(Number(files.at(-1).slice(0,6))+1)*6;peakWindow=Math.max(peakWindow,end-offset);return {segments:[{start:from,end,speaker:0}],processedThrough:end}},close(){closed=true}}},onUpdate:()=>{updates++}});
 for(let i=0;i<1200;i++)s.append(String(i).padStart(6,'0')+'.wav',i*6,6);
 const result=await s.finish();assert.equal(MAX_SPEAKER_SECONDS,7200);assert.equal(s.processedThrough,7200);assert.equal(s.processed,1200);assert.equal(workers,1);assert(peakWindow<=40);assert(calls>=240);assert.equal(updates,calls);assert(closed);assert(result.every(v=>v.speaker===0));
});
test('live results arrive before stop and the short tail is flushed on finish',async()=>{
 let updates=0;const s=new IncrementalSpeakers({minWindowSeconds:12,createWorker:()=>({async analyze(files,offset,from){const end=Number(files.at(-1).slice(0,6))*6+6;return {segments:[{start:from,end,speaker:1}],processedThrough:end}},close(){}}),onUpdate:()=>updates++});
 s.append('000000.wav',0,6);assert.equal(updates,0);s.append('000001.wav',6,6);await s.running;assert.equal(updates,1);assert.equal(s.closed,false);s.append('000002.wav',12,6);assert.equal(updates,1);await s.finish();assert.equal(updates,2);
});
test('bad ordering, model failure and cancellation cannot masquerade as valid labels',async()=>{
 let errors=0;const s=new IncrementalSpeakers({onError:()=>errors++});s.append('000002.wav',0,6);await assert.rejects(s.finish(),/不连续/);assert.equal(errors,1);
 const bad=new IncrementalSpeakers({createWorker:()=>({analyze:async()=>{throw Error('model failed')},close(){}})});bad.append('000000.wav',0,6);bad.append('000001.wav',6,6);await assert.rejects(bad.finish(),/model failed/);
 let called=0;const closed=new IncrementalSpeakers({createWorker:()=>{called++;throw Error('unexpected')}});closed.close();closed.append('000000.wav',0,6);assert.equal(called,0);
});
test('timestamp indexing accepts an exact two-hour recording and rejects longer audio',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'mw-speaker-2h-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 for(let i=0;i<1200;i++){const file=join(dir,String(i).padStart(6,'0')+'.wav');await writeFile(file,Buffer.alloc(44));await truncate(file,44+6*32000)}
 const index=await captureSegmentIndex(dir,7200);assert.equal(index.parts.length,1200);assert.equal(index.seconds,7200);assert.equal(index.ranges.get('119:54').startSeconds,7194);
 const extra=join(dir,'001200.wav');await writeFile(extra,Buffer.alloc(44));await truncate(extra,44+32000);await assert.rejects(captureSegmentIndex(dir,7201),/2 小时/);
});

test('two-hour final alignment corrects provisional labels, preserves manual names and original references',async t=>{
 const {MeetingStorage}=await import('../src/server/storage.mjs');const {createMeeting}=await import('../src/model.mjs');const {diarizeRecording}=await import('../src/server/speaker-diarization.mjs');
 const dir=await mkdtemp(join(tmpdir(),'mw-speaker-final-'));t.after(()=>rm(dir,{recursive:true,force:true}));await mkdir(join(dir,'data'));
 const storage=new MeetingStorage(join(dir,'meta'));await storage.choose(join(dir,'data'));const m=createMeeting('长会议验证'),captureId=crypto.randomUUID();Object.assign(m,{captureId,duration:7200});
 m.transcript=[{id:crypto.randomUUID(),text:'开场',time:'00:00',startSeconds:0,endSeconds:3,speaker:'发言人 9',speakerAutomatic:'live'},{id:crypto.randomUUID(),text:'人工标签',time:'00:06',startSeconds:6,endSeconds:9,speaker:'王老师'},{id:crypto.randomUUID(),text:'结束',time:'119:54',startSeconds:7194,endSeconds:7197,speaker:'发言人'}];
 m.tasks=[{id:crypto.randomUUID(),title:'保持关联',owner:'',due:'',done:false,ref:0}];await storage.mutate(d=>d.meetings.push(m));
 const capture=join(dir,'data','audio','captures',captureId),parts=join(capture,'segments'),root=join(dir,'models');await mkdir(parts,{recursive:true});
 for(const name of ['native/sherpa-onnx.node','speaker/segmentation.onnx','speaker/embedding.onnx']){const {dirname}=await import('node:path');await mkdir(dirname(join(root,name)),{recursive:true});await writeFile(join(root,name),'fixture')}
 for(let i=0;i<1200;i++){const file=join(parts,String(i).padStart(6,'0')+'.wav');await writeFile(file,Buffer.alloc(44));await truncate(file,44+6*32000)}
 await writeFile(join(capture,'session.json'),JSON.stringify({id:captureId,meetingId:m.id,asrModel:'sensevoice-local'}));await writeFile(join(capture,'transcript.json'),JSON.stringify(m.transcript));
 const beforeIds=m.transcript.map(r=>r.id);
 const result=await diarizeRecording({meetingId:m.id,captureId,location:join(dir,'data'),root,storage,signal:new AbortController().signal,readSegments:async()=>[{start:0,end:3,speaker:0},{start:6,end:9,speaker:1},{start:7194,end:7197,speaker:0}]});
 const saved=(await storage.read()).data.meetings.find(x=>x.id===m.id);assert.equal(result.count,1);assert.deepEqual(saved.transcript.map(r=>r.speaker),['发言人 1','王老师','发言人 1']);assert.deepEqual(saved.transcript.map(r=>r.id),beforeIds);assert.equal(saved.tasks[0].ref,0);assert.equal(saved.transcript[0].speakerAutomatic,'final');assert.equal(saved.speakerAutoAttempted,true);
});


test('recordings rejected by the former 30-minute limit can automatically retry once after upgrade',async()=>{
 const {needsSpeakerAnalysis}=await import('../src/transcript-timeline.mjs');
 const m={captureId:'capture',audio:[{}],duration:5400,status:'待整理',speakerAutoAttempted:true,speakerStatus:'发言人区分未完成：当前支持区分 30 分钟以内的录音',transcript:[{speaker:'发言人'}]};
 assert(needsSpeakerAnalysis(m));assert(!needsSpeakerAnalysis({...m,speakerAnalysisVersion:2}));assert(!needsSpeakerAnalysis({...m,duration:8000}));assert(!needsSpeakerAnalysis({...m,status:'录制中'}));
});
