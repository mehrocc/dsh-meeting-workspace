import {test} from 'node:test';import assert from 'node:assert/strict';import {EventEmitter} from 'node:events';import {PassThrough,Writable} from 'node:stream';import {mkdtemp,mkdir,writeFile,readFile,chmod,rm,symlink} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {MeetingStorage} from '../src/server/storage.mjs';import {NativeCaptureManager,NativeCaptureSession} from '../src/server/native-capture.mjs';import {createMeeting} from '../src/model.mjs';import {wav} from '../src/client/recorder.mjs';
import {ASRModels,X_ASR,SENSEVOICE} from '../src/server/asr-models.mjs';
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'mw-dual-'));t.after(()=>rm(root,{recursive:true,force:true}));const storage=new MeetingStorage(join(root,'meta'));await mkdir(join(root,'data'));await storage.choose(join(root,'data'));const state=await storage.read(),m=createMeeting('Dual source');state.data.meetings.push(m);await storage.write(state.data,0);const binary=join(root,'helper');await writeFile(binary,'fixture');await chmod(binary,0o700);return {root,storage,binary,m}}
function socket(directory,{audio=true,stopStats={},holdStart=false}={}){const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.commands=[];child.stdin=new Writable({write(bytes,_encoding,done){const c=JSON.parse(String(bytes)).command;child.commands.push(c);queueMicrotask(async()=>{if(c==='start'&&!holdStart)child.stdout.write(JSON.stringify({type:'started',system:true,microphone:true})+'\n');if(c==='pause'||c==='resume')child.stdout.write(JSON.stringify({type:'status',paused:c==='pause',seconds:6,microphoneFrames:96000,systemFrames:96000,microphoneLevel:.1,systemLevel:.2})+'\n');if(c==='stop'){if(audio)for(const name of ['mixed','system','microphone'])await writeFile(join(directory,name+'.m4a'),'fixture-audio');child.stdout.write(JSON.stringify({type:'stopped',seconds:6,microphoneFrames:96000,systemFrames:96000,...stopStats})+'\n');queueMicrotask(()=>child.emit('close',0))}});done()}});child.kill=()=>child.emit('close',1);queueMicrotask(()=>child.stdout.write('{"type":"ready"}\n'));return child}
const speech={status:()=>({ready:true}),async transcribe(){return {text:'讨论会议音频采集。'}}};
test('model preference is persisted and only affects the next native capture',async t=>{
 const f=await fixture(t),root=join(f.root,'meta');
 let manager,opened=0,received=0,calls=0,callbacks;
 const service={status:()=>({ready:true,supported:true}),transcribe:async()=>{calls++;return {text:'下一场会议使用分段识别。'}}};
 const models=new ASRModels({root,storage:f.storage,speech:service,nativeAvailable:async()=>true,
  createStream:(_path,handlers)=>{opened++;callbacks=handlers;return {ready:Promise.resolve(),audio(){received++},finish:async()=>{}}}});
 const assertUsable=models.assertUsable.bind(models);
 models.assertUsable=(id,language)=>id===X_ASR?Promise.resolve():assertUsable(id,language);
 manager=new NativeCaptureManager({...f,speech:service,models,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>socket(args[1])});
 t.after(()=>manager.dispose());
 assert.equal(await models.selected(),SENSEVOICE);
 await models.select(X_ASR);
 assert.equal(await models.selected(),X_ASR);
 const first=await manager.start({meetingId:f.m.id,confirmed:true,expectedModel:X_ASR});
 assert.equal(first.asrModel,X_ASR);
 await models.select(SENSEVOICE);
 assert.equal(await new ASRModels({root}).selected(),SENSEVOICE);
 const current=manager.get(first.id);
 current.receive({type:'pcm',data:'AAAA',seconds:0});
 callbacks.final({text:'这是第一场会议。',seconds:0,endSeconds:1});
 await current.chain;
 assert.equal(current.snapshot().asrModel,X_ASR);
 assert.equal(received,1);assert.equal(calls,0);assert.equal(opened,1);
 await current.control('stop');
 const other=createMeeting('第二场会议');
 await f.storage.mutate(data=>data.meetings.push(other));
 const second=await manager.start({meetingId:other.id,confirmed:true,expectedModel:SENSEVOICE});
 const session=manager.get(second.id),audio=Buffer.from(await wav(new Float32Array(16000).fill(.1),16000).arrayBuffer());
 session.receive({type:'audio',sequence:0,seconds:0,wav:audio.toString('base64')});
 await session.chain;
 assert.equal(session.snapshot().asrModel,SENSEVOICE);
 assert.equal(calls,1);assert.equal(opened,1);
 assert.equal((await f.storage.read()).data.meetings.find(m=>m.id===other.id).transcript[0].text,'下一场会议使用分段识别。');
 await session.control('stop');
});
test('native capture only starts after explicit confirmation, a valid meeting and supported runtime',async t=>{const f=await fixture(t);let calls=0;const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:()=>{calls++;assert.fail()}});await assert.rejects(manager.start({meetingId:f.m.id}),/主动确认/);await assert.rejects(manager.start({meetingId:'not-a-meeting',confirmed:true}),/来源会议/);assert.equal(calls,0);const unsupported=new NativeCaptureManager({...f,speech,platform:'linux',arch:'arm64'});assert(!await unsupported.available());await assert.rejects(unsupported.start({meetingId:f.m.id,confirmed:true}),/未提供/)});
test('both sources must acknowledge startup; pause/resume/stop persist one shared meeting and one mixed file',async t=>{const f=await fixture(t);let child;const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>child=socket(args[1])});t.after(()=>manager.dispose());const start=await manager.start({meetingId:f.m.id,confirmed:true,live:false});assert.equal(start.state,'recording');await assert.rejects(manager.start({meetingId:f.m.id,confirmed:true}),/已有录音/);const s=manager.get(start.id);await s.control('pause');await new Promise(r=>setImmediate(r));assert(s.snapshot().paused);await s.control('resume');await new Promise(r=>setImmediate(r));assert(!s.snapshot().paused);await Promise.all([s.control('stop'),s.control('stop')]);const saved=(await f.storage.read()).data.meetings[0];assert.equal(saved.audio.length,1);assert.equal(saved.duration,6);assert.equal(saved.source,'电脑声音＋麦克风');assert.equal(s.state,'saved');assert(child.commands.includes('pause')&&child.commands.includes('resume'));await s.control('stop');assert.equal((await f.storage.read()).data.meetings[0].audio.length,1)});
test('mixed PCM is transcribed through host speech and persisted before final file association',async t=>{const f=await fixture(t);let child;const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>child=socket(args[1])});const start=await manager.start({meetingId:f.m.id,confirmed:true,live:true});const s=manager.get(start.id),data=Buffer.from(await wav(new Float32Array(16000).fill(.1),16000).arrayBuffer());s.receive({type:'audio',sequence:0,seconds:12,wav:data.toString('base64')});await s.chain;const saved=(await f.storage.read()).data.meetings[0];assert.equal(saved.transcript.length,1);assert.equal(saved.transcript[0].time,'00:12');assert.equal(saved.transcript[0].text,'讨论会议音频采集。');await s.control('stop');assert(s.snapshot().events.some(e=>e.type==='transcript'))});
test('permissions/startup error rejects the attempt instead of silently switching to microphone',async t=>{const f=await fixture(t);const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>{const child=socket(args[1]);child.stdin=new Writable({write(_b,_e,done){queueMicrotask(()=>{child.stdout.write('{"type":"error","message":"屏幕录制未授权"}\n');child.emit('close',1)});done()}});return child}});await assert.rejects(manager.start({meetingId:f.m.id,confirmed:true}),/屏幕录制未授权/);await manager.dispose();assert(![...manager.sessions.values()].some(s=>s.state==='recording'))});
test('unexpected capture exit recovers completed PCM segments without deleting the sources',async t=>{const f=await fixture(t),directory=join(f.root,'capture');await mkdir(join(directory,'segments'),{recursive:true});const wave=Buffer.from(await wav(new Float32Array(1600).fill(.2),16000).arrayBuffer());await writeFile(join(directory,'segments','000000.wav'),wave);const manager={storage:f.storage,speech};const s=new NativeCaptureSession({id:'fixture',meetingId:f.m.id,language:'zh',live:false,directory,manager});s.started=true;await s.finalize(false);assert.equal(s.state,'failed');const saved=(await f.storage.read()).data.meetings[0];assert.equal(saved.audio.length,1);assert.equal(saved.audio[0].mime,'audio/wav');const recovered=await f.storage.audioRead(saved.audio[0].id);assert.equal(recovered.bytes.length,wave.length);assert.equal((await readFile(join(directory,'segments','000000.wav'))).length,wave.length)});
test('native audio adoption rejects symlinks and arbitrary filenames',async t=>{const f=await fixture(t),directory=join(f.root,'capture');await mkdir(directory);await writeFile(join(f.root,'secret'),'fixture');await symlink(join(f.root,'secret'),join(directory,'mixed.m4a'));await assert.rejects(f.storage.adoptCaptureFile(directory,'mixed.m4a','audio/mp4','unsafe'),/尚未保存/);await assert.rejects(f.storage.adoptCaptureFile(directory,'../secret','audio/mp4','unsafe'),/无效/)});

test('reopening after host exit restores finalized audio to the existing meeting exactly once',async t=>{const f=await fixture(t),id=crypto.randomUUID(),directory=join(f.root,'data','audio','captures',id);await mkdir(directory,{recursive:true});await writeFile(join(directory,'session.json'),JSON.stringify({id,meetingId:f.m.id,language:'zh'}));await writeFile(join(directory,'completed.json'),JSON.stringify({seconds:9,microphoneFrames:10000,systemFrames:10000}));for(const name of ['mixed','microphone','system'])await writeFile(join(directory,name+'.m4a'),'fixture-source');await f.storage.mutate(d=>{d.meetings[0].captureId=id;d.meetings[0].status='录制中'});const manager=new NativeCaptureManager({...f,speech});await manager.restore();await manager.restore();const saved=(await f.storage.read()).data.meetings[0];assert.equal(saved.audio.length,1);assert.equal(saved.status,'待转写');assert.equal(saved.duration,9);assert.equal(manager.active().length,0)});

test('unmounting the workbench detaches native polling without stopping the independent recording session',async()=>{const {NativeRecorder}=await import('../src/client/native-recorder.mjs');const calls=[];const recorder=new NativeRecorder({meetingId:'fixture-meeting',onState(){},onTranscript(){}});recorder.call=async(path,body)=>{calls.push({path,body});return {id:'capture',state:'recording',cursor:0,events:[],live:true}};await recorder.attach('capture');recorder.dispose();assert.equal(recorder.timer?true:false,true);assert.deepEqual(calls.map(c=>c.path),['/capture/events?id=capture&after=0']);assert(calls.every(c=>!c.path.includes('/control')));assert.equal(recorder.state.state,'recording')});

test('microphone reconnect keeps the same session, transcribes later audio, and persists a gap warning with one mixed file',async t=>{
 const f=await fixture(t);const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>socket(args[1])});t.after(()=>manager.dispose());
 const start=await manager.start({meetingId:f.m.id,confirmed:true,live:true});const s=manager.get(start.id);
 s.receive({type:'status',seconds:.5,microphoneFrames:0,systemFrames:8000,microphoneRecovering:true,microphoneRestartAttempts:1});
 assert.equal(s.state,'recording');assert(s.snapshot().microphoneRecovering);assert(!s.error);assert.equal(s.warnings||0,0);
 s.receive({type:'status',seconds:4,microphoneFrames:16000,systemFrames:64000,microphoneRecovering:false,microphoneRecoveries:1,microphoneGapSeconds:2.6});
 const wave=Buffer.from(await wav(new Float32Array(16000).fill(.1),16000).arrayBuffer());s.receive({type:'audio',sequence:0,seconds:4,wav:wave.toString('base64')});await s.chain;await s.control('stop');
 const saved=(await f.storage.read()).data.meetings[0];assert.equal(saved.audio.length,1);assert.equal(saved.transcript.length,1);assert.equal(saved.captureError,'');assert.match(saved.captureWarning,/断开并恢复/);assert.equal(s.state,'saved');
 const result=JSON.parse(await readFile(join(s.directory,'result.json'),'utf8'));assert.equal(result.microphoneRecoveries,1);assert.equal(result.microphoneGapSeconds,2.6);
});
test('terminal native failure preserves mixed audio even if no separate error event arrived',async t=>{
 const f=await fixture(t),directory=join(f.root,'capture');await mkdir(directory);await writeFile(join(directory,'mixed.m4a'),'fixture-mixed');
 const s=new NativeCaptureSession({id:'fixture',meetingId:f.m.id,language:'auto',live:false,directory,manager:{storage:f.storage,speech}});s.started=true;
 s.receive({type:'stopped',failed:true,seconds:3,microphoneFrames:0,systemFrames:48000,microphoneRestartAttempts:3});await s.done;
 assert.equal(s.state,'failed');const saved=(await f.storage.read()).data.meetings[0];assert.equal(saved.audio.length,1);assert.equal(saved.status,'录音中断');assert.match(saved.captureError,/采集中断/);assert.equal(s.snapshot().microphoneRestartAttempts,3);
});
test('client shows microphone reconnection without a false stop and clears it after actual recovery',async()=>{
 const {NativeRecorder}=await import('../src/client/native-recorder.mjs');let view;
 const recorder=new NativeRecorder({meetingId:'fixture',onState:s=>view=s,onTranscript(){}});recorder.live=true;
 recorder.apply({state:'recording',cursor:0,events:[],seconds:.5,microphoneRecovering:true});assert.match(view.status,/重连/);assert.equal(view.ended,false);assert(view.microphoneRecovering);
 recorder.apply({state:'recording',cursor:0,events:[],seconds:4,microphoneRecovering:false,microphoneFrames:16000});assert(!view.microphoneRecovering);assert(!view.status.includes('重连'));assert.equal(view.ended,false);
 recorder.dispose();
});
test('stopping during microphone reconnection keeps an explicit incomplete-input warning',async t=>{
 const f=await fixture(t),directory=join(f.root,'capture');await mkdir(directory);await writeFile(join(directory,'mixed.m4a'),'fixture-mixed');
 const s=new NativeCaptureSession({id:'fixture',meetingId:f.m.id,language:'auto',live:false,directory,manager:{storage:f.storage,speech}});s.started=true;
 s.receive({type:'status',seconds:2,microphoneRecovering:true,microphoneInterruptions:1});
 s.receive({type:'stopped',seconds:2,microphoneInterruptions:1});await s.done;
 assert.equal(s.state,'saved');assert.equal(s.snapshot().microphoneRecovering,false);assert.match((await f.storage.read()).data.meetings[0].captureWarning,/未采集/);
});

test('the floating question uses this meeting only and persists the completed answer',async t=>{
 const f=await fixture(t);
 await f.storage.mutate(data=>{
  data.meetings[0].transcript=createMeeting('本场','default','00:03 发言人：周五验收接口。').transcript;
  data.meetings.push(createMeeting('其他场次','default','00:08 发言人：下个月公布预算。'));
 });
 const ai={status:()=>({configured:true}),async generate(rows,kind,_signal,_attempt,context){
  assert.equal(kind,'question');assert.equal(context.question,'什么时候验收？');
  assert.match(rows[0].text,/周五验收/);assert.equal(rows.length,1);
  return {answer:'周五验收接口 [00:03]'};
 }};
 const session=new NativeCaptureSession({meetingId:f.m.id,manager:{storage:f.storage,ai}});
 session.state='recording';
 await session.ask('什么时候验收？');
 const meeting=(await f.storage.read()).data.meetings[0];
 assert.deepEqual(meeting.liveQuestions,[{question:'什么时候验收？',answer:'周五验收接口 [00:03]'}]);
 assert.equal(session.preview.questionBusy,false);
 assert.match(session.preview.questionDisplay,/周五验收接口/);
});


test('a prolonged microphone outage keeps system transcription and one mixed recording, with no false recovery',async t=>{
 const f=await fixture(t);let child;
 const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>child=socket(args[1],{stopStats:{seconds:90,microphoneFrames:0,systemFrames:1440000}})});t.after(()=>manager.dispose());
 const start=await manager.start({meetingId:f.m.id,confirmed:true,live:true}),s=manager.get(start.id);
 const notice='麦克风重连中，电脑声音继续保存；暂未采集麦克风声音…';
 s.receive({type:'status',seconds:90,microphoneFrames:0,systemFrames:1440000,microphoneRecovering:true,microphoneInterruptions:1,microphoneRestartAttempts:9,microphoneStatus:notice});
 s.display({status:'本机分段转写'});
 assert.equal(s.snapshot().state,'recording');assert.equal(s.error,'');assert(!child.commands.includes('stop'));
 assert.equal(s.snapshot().microphoneStatus,notice);assert.match(s.captureGapWarning(),/未收到麦克风/);
 const wave=Buffer.from(await wav(new Float32Array(16000).fill(.1),16000).arrayBuffer());
 s.receive({type:'audio',sequence:0,seconds:84,wav:wave.toString('base64')});await s.chain;
 await s.control('stop');
 const saved=(await f.storage.read()).data.meetings[0];
 assert.equal(s.state,'saved');assert.equal(saved.captureError,'');assert.equal(saved.audio.length,1);assert.equal(saved.transcript.length,1);assert.match(saved.captureWarning,/未收到麦克风/);
});

test('fallback device status survives snapshots and a saved capture without changing ASR or losing the gap warning',async t=>{
 const f=await fixture(t);const directory=join(f.root,'capture');await mkdir(directory);await writeFile(join(directory,'mixed.m4a'),'fixture-mixed');
 const s=new NativeCaptureSession({id:'fixture',meetingId:f.m.id,language:'auto',live:false,directory,manager:{storage:f.storage,speech}});s.started=true;
 const notice='已改用 Mac 内置麦克风；中断期间可能缺少麦克风声音';
 s.receive({type:'status',seconds:14,microphoneFrames:32000,systemFrames:224000,microphoneRecovering:false,microphoneRecoveries:1,microphoneInterruptions:1,microphoneFallback:true,microphoneDevice:'Built-in microphone',microphoneAuthorized:true,microphoneStatus:notice});
 assert.equal(s.snapshot().microphoneFallback,true);assert.equal(s.snapshot().microphoneDevice,'Built-in microphone');
 s.receive({type:'stopped',failed:false,seconds:15,microphoneFrames:48000,systemFrames:240000,microphoneGapSeconds:12,microphoneFallback:true});await s.done;
 const saved=(await f.storage.read()).data.meetings[0],result=JSON.parse(await readFile(join(directory,'result.json'),'utf8'));
 assert.equal(s.state,'saved');assert.match(saved.captureWarning,/断开并恢复/);assert.equal(result.microphoneFallback,true);assert.equal(result.microphoneGapSeconds,12);assert.equal(result.microphoneStatus,'');
});

test('client prioritizes missing microphone and fallback notices over ASR warnings, then clears after stop',async()=>{
 const {NativeRecorder}=await import('../src/client/native-recorder.mjs');let view;
 const recorder=new NativeRecorder({meetingId:'fixture',onState:s=>view=s,onTranscript(){}});recorder.live=true;
 recorder.apply({state:'recording',cursor:1,events:[{serial:1,type:'warning',message:'识别速度落后'}],seconds:90,microphoneRecovering:true,microphoneStatus:'麦克风权限已关闭，电脑声音继续保存'});
 assert.match(view.status,/麦克风权限已关闭/);assert.equal(view.ended,false);
 recorder.apply({state:'recording',cursor:1,events:[],seconds:93,microphoneFallback:true,microphoneDevice:'Built-in',microphoneStatus:'已改用 Mac 内置麦克风'});
 assert.match(view.status,/已改用/);assert.equal(view.microphoneDevice,'Built-in');assert(view.microphoneFallback);
 recorder.apply({state:'saved',cursor:1,events:[],seconds:95,microphoneStatus:''});assert.equal(view.ended,true);assert(!view.status.includes('改用'));
 recorder.dispose();
});

test('live speaker patches update existing rows and the floating view without duplicating or changing original text',async t=>{
 const f=await fixture(t),directory=join(f.root,'capture');await mkdir(directory);
 const s=new NativeCaptureSession({id:'fixture',meetingId:f.m.id,language:'auto',live:true,directory,manager:{storage:f.storage,speech}});s.state='recording';
 s.speakers={segments:[]};await s.persistTranscript('第一位发言',0,3);await s.persistTranscript('第二位发言',3,6);
 s.speakers.segments=[{start:0,end:3,speaker:0},{start:3,end:6,speaker:1}];await s.refreshSpeakerLabels();
 const m=(await f.storage.read()).data.meetings[0];assert.equal(m.transcript.length,2);assert.deepEqual(m.transcript.map(r=>r.speaker),['发言人 1','发言人 2']);assert.equal(m.transcript[0].text,'第一位发言');assert(s.events.some(e=>e.type==='speaker-labels'&&e.rows.length===2));
 // Explicitly named speakers must survive subsequent automatic analysis.
 await f.storage.mutate(d=>d.meetings[0].transcript[0].speaker='人工命名');await s.refreshSpeakerLabels();assert.equal((await f.storage.read()).data.meetings[0].transcript[0].speaker,'人工命名');
});
test('the client applies speaker patches to the same transcript row instead of dropping them as seen',async()=>{
 const {NativeRecorder}=await import('../src/client/native-recorder.mjs');const rows=new Map();
 const r=new NativeRecorder({onState(){},onTranscript:row=>rows.set(row.id,row)});
 r.apply({state:'recording',cursor:1,events:[{serial:1,type:'transcript',row:{id:'a',speaker:'发言人',text:'hello'}}]});
 r.apply({state:'recording',cursor:2,events:[{serial:2,type:'speaker-labels',rows:[{id:'a',speaker:'发言人 1',text:'hello'}]}]});assert.equal(rows.size,1);assert.equal(rows.get('a').speaker,'发言人 1');r.dispose();
});

test('the floating question accepts greetings with no transcript and keeps failed attempts out of saved answers',async t=>{
 const f=await fixture(t);let called=false;
 const s=new NativeCaptureSession({meetingId:f.m.id,manager:{storage:f.storage,ai:{status:()=>({configured:true}),async generate(rows){called=true;assert.equal(rows.length,0);return {answer:'你好，可以询问本场会议。'}}}}});s.state='recording';await s.ask('你好');assert(called);assert.equal((await f.storage.read()).data.meetings[0].liveQuestions.length,1);
 s.manager.ai.generate=async()=>{throw new SyntaxError('Expected , in JSON at position 29')};await s.ask('什么时候验收？');assert(s.preview.questionError);assert.match(s.preview.questionDisplay,/重试/);assert(!s.preview.questionDisplay.includes('position'));assert.equal(s.preview.questionBusy,false);assert.equal((await f.storage.read()).data.meetings[0].liveQuestions.length,1);
});

test('background recording startup returns before native acknowledgement and reports stages through polling',async t=>{
 const f=await fixture(t);let child;const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>child=socket(args[1],{holdStart:true})});t.after(()=>manager.dispose());
 let timer;const start=await Promise.race([manager.start({meetingId:f.m.id,confirmed:true,live:false,background:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('startup blocked')),1000)})]);clearTimeout(timer);
 const s=manager.get(start.id);assert.equal(start.state,'starting');assert.equal(s.started,undefined);assert.equal((await f.storage.read()).data.meetings[0].captureId,start.id);
 s.receive({type:'stage',message:'正在启动电脑声音采集…'});assert.match(s.snapshot().startupStatus,/电脑声音/);
 s.receive({type:'started',microphone:true,system:true});await s.boot;assert.equal(s.state,'recording');assert.equal((await f.storage.read()).data.meetings[0].status,'录制中');await s.control('stop');
});
test('cancelling startup during model preparation cannot launch a recorder later',async t=>{
 const f=await fixture(t);let prepared,spawned=0,closed=0;
 const gate=new Promise(resolve=>prepared=resolve);const models={selected:async()=>X_ASR,assertUsable:async()=>{},openStream:async()=>{await gate;return {close(){closed++},finish:async()=>{}}}};
 const manager=new NativeCaptureManager({...f,speech,models,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:()=>{spawned++;throw Error('must not launch')}});
 const start=await manager.start({meetingId:f.m.id,confirmed:true,live:true,background:true}),s=manager.get(start.id);await s.control('stop');prepared();await s.boot;
 assert.equal(spawned,0);assert.equal(closed,1);assert.equal(s.state,'failed');assert.match(s.error,/取消/);assert.equal(manager.active().length,0);
});
test('the client requests background startup and does not misreport a failed startup as saved audio',async()=>{
 const {NativeRecorder}=await import('../src/client/native-recorder.mjs');let request,view;const r=new NativeRecorder({meetingId:'fixture',onState:s=>view=s,onTranscript(){}});
 r.call=async(_p,body)=>{request=body;return {id:'id',state:'starting',events:[],cursor:0,startupStatus:'正在启动电脑声音采集…'}};
 await r.start(false);assert.equal(request.background,true);assert(view.starting);assert.match(view.status,/电脑声音/);r.dispose();
 r.apply({state:'failed',error:'电脑声音采集启动没有响应',events:[],cursor:0});assert(view.ended);assert.equal(view.error,'电脑声音采集启动没有响应');assert(!view.status.includes('已保存'));
});

test('background stop responds while transcription drains, without losing the saved mixed recording',async t=>{
 const f=await fixture(t);const manager=new NativeCaptureManager({...f,speech,platform:'darwin',arch:'arm64',osRelease:'23',spawnProcess:(_p,args)=>socket(args[1])});t.after(()=>manager.dispose());const start=await manager.start({meetingId:f.m.id,confirmed:true,live:false}),s=manager.get(start.id);
 let release;s.chain=new Promise(resolve=>release=resolve);const stopping=await s.control('stop',{background:true});assert.equal(stopping.state,'stopping');release();await s.done;assert.equal(s.state,'saved');assert.equal((await f.storage.read()).data.meetings[0].audio.length,1);
});
test('client stop polls short status requests while a recording finishes asynchronously',async()=>{
 const {NativeRecorder}=await import('../src/client/native-recorder.mjs');const calls=[];const r=new NativeRecorder({onState(){},onTranscript(){}});r.id='id';r.state={state:'recording'};r.call=async(path,body)=>{calls.push({path,body});return {state:path==='/capture/control'?'stopping':'saved',cursor:0,events:[]}};
 const saved=await r.stop();assert.equal(saved.state,'saved');assert.equal(calls[0].body.background,true);assert(calls[1].path.includes('/capture/events'));r.dispose();
});


test('a late native start acknowledgement cannot reactivate a cancelled recording',()=>{
 const s=new NativeCaptureSession({id:'cancelled'});s.state='stopping';s.cancelRequested=true;
 s.receive({type:'started',microphone:true,system:true});assert.equal(s.state,'stopping');assert.equal(s.started,undefined);
});
