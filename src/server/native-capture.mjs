import {StreamingSpeech,streamingAvailable} from './streaming-speech.mjs';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {stat,mkdir,writeFile,readdir,readFile,open} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {release} from 'node:os';
import {checkedTranscript} from './transcript-quality.mjs';
import {X_ASR,SENSEVOICE} from './asr-models.mjs';
const execute=promisify(execFile);
const terminal=new Set(['saved','failed']);
const timestamp=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(Math.floor(n%60)).padStart(2,'0');
function audible(wave){let sum=0;for(let i=44;i+1<wave.length;i+=2){const x=wave.readInt16LE(i)/32768;sum+=x*x}return Math.sqrt(sum/Math.max(1,(wave.length-44)/2))>=.001}
export class NativeCaptureManager{
 constructor({binary,storage,speech,ai,models,streamDirectory,onSaved=()=>{},onProgress=()=>{},beforeStart=async()=>{},spawnProcess=spawn,platform=process.platform,arch=process.arch,osRelease=release()}){Object.assign(this,{binary,storage,speech,ai,models,streamDirectory,onSaved,onProgress,beforeStart,spawnProcess,platform,arch,osRelease});this.sessions=new Map();this.starting=false}
 streamingReady(){return streamingAvailable(this.streamDirectory)}
 async available(){try{return this.platform==='darwin'&&this.arch==='arm64'&&Number.parseInt(this.osRelease)>=22&&!!((await stat(this.binary)).mode&0o111)}catch{return false}}
 async permissions(){if(!await this.available())return {available:false,system:false,microphone:false};const {stdout}=await execute(this.binary,['--permissions'],{timeout:10000,maxBuffer:8192});const value=JSON.parse(stdout.trim());return {available:true,system:value.system===true,microphone:value.microphone===true}}
 async liveSpeechAvailable(){const id=await this.models?.selected()||SENSEVOICE;try{await this.assertModel(id,'auto');return true}catch{return false}}
 async assertModel(id,language){if(this.models)return this.models.assertUsable(id,language);if(id===SENSEVOICE&&!this.speech.status().ready)throw Error('DSH 本地语音模型尚未就绪')}
 async start({meetingId,live=true,language='auto',captureMode='system-microphone',confirmed,expectedModel}){
  if(!['microphone','system-microphone'].includes(captureMode))throw Error('采集方式无效');if(!['auto','zh','en'].includes(language))throw Error('转写语言无效');if(confirmed!==true)throw Error('请主动确认开始双路录音');if(this.starting||[...this.sessions.values()].some(s=>!terminal.has(s.state)))throw Error('已有录音，请先结束并保存');this.starting=true;
  try{
   if(!await this.available())throw Error('当前系统未提供电脑声音采集组件');
   const asrModel=await this.models?.selected()||(this.streamingReady()&&language==='auto'?X_ASR:SENSEVOICE);
   if(expectedModel&&expectedModel!==asrModel)throw Error('默认转写模型已更新，请重新打开开始记录');
   if(live)await this.assertModel(asrModel,language);
   await this.beforeStart();for(const previous of this.sessions.values())if(terminal.has(previous.state))previous.send('close');const state=await this.storage.read();if(!state.ready||!state.data.meetings.some(m=>m.id===meetingId))throw Error('来源会议不存在');
   const id=randomUUID(),directory=join(state.location,'audio','captures',id);await mkdir(directory,{recursive:true,mode:0o700});
   const session=new NativeCaptureSession({id,meetingId,language,captureMode,asrModel,title:state.data.meetings.find(m=>m.id===meetingId).title,live:live!==false,directory,manager:this});this.sessions.set(id,session);
   // Retain a small number of completed sessions for retry/acknowledgement, without touching recordings.
   for(const [key,s] of this.sessions)if(this.sessions.size>8&&terminal.has(s.state))this.sessions.delete(key);
   await writeFile(join(directory,'session.json'),JSON.stringify({id,meetingId,language,captureMode,asrModel,live:session.live,startedAt:new Date().toISOString()}),{mode:0o600});
   try{if(session.live)await session.startStreaming();session.launch();await session.ready}catch(e){await session.finalize(false);throw e}
   await this.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===meetingId);if(m){m.source=captureMode==='microphone'?'麦克风':'电脑声音＋麦克风';m.captureMode=captureMode;m.captureId=id;m.asrModel=asrModel;m.status='录制中'}});
   return session.snapshot();
  }finally{this.starting=false}
 }
 get(id){const s=this.sessions.get(id);if(!s)throw Error('录音会话不存在，请重新读取会议资料');return s}
 active(){return [...this.sessions.values()].filter(s=>!terminal.has(s.state)).map(s=>({id:s.id,meetingId:s.meetingId,state:s.state,live:s.live,language:s.language,captureMode:s.captureMode,asrModel:s.asrModel}))}
 async restore(){const root=await this.storage.root();if(!root||this.restoredRoot===root)return;if(this.restoring)return this.restoring;
  this.restoring=(async()=>{const state=await this.storage.read();for(const meeting of state.data.meetings){const id=meeting.captureId;if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id)||this.sessions.has(id)||!['录制中','准备录音'].includes(meeting.status))continue;const directory=join(root,'audio','captures',id);
    try{const metadata=JSON.parse(await readFile(join(directory,'session.json'),'utf8'));if(metadata.id!==id||metadata.meetingId!==meeting.id)continue;const completion=await readFile(join(directory,'completed.json'),'utf8').then(JSON.parse).catch(()=>null);const session=new NativeCaptureSession({id,meetingId:meeting.id,language:metadata.language,captureMode:metadata.captureMode||'system-microphone',asrModel:metadata.asrModel,live:false,directory,manager:this});session.started=true;
     if(completion){for(const k of ['seconds','microphoneFrames','systemFrames','microphoneRecoveries','microphoneInterruptions','microphoneGapSeconds','microphoneRestartAttempts'])if(Number.isFinite(completion[k])&&completion[k]>=0)session.stats[k]=completion[k];if(completion.failed)session.error='上次录音异常结束，已恢复保留的音频'}
     const cached=await readFile(join(directory,'transcript.json'),'utf8').then(JSON.parse).catch(()=>[]);if(Array.isArray(cached))await this.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===meeting.id);if(!m)return;for(const row of cached){if(typeof row.id==='string'&&/^[a-f0-9-]{36}$/i.test(row.id)&&typeof row.text==='string'&&row.text.length<=20000&&typeof row.time==='string'&&typeof row.speaker==='string'&&!m.transcript.some(r=>r.id===row.id))m.transcript.push(row)}});
     await session.finalize(!!completion);this.sessions.set(id,session);
    }catch{await this.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===meeting.id);if(m){m.status='录音中断';m.captureError='上次录音文件未能恢复，请保留并检查资料目录中的 audio 文件夹'}})}
   }this.restoredRoot=root;
  })();try{await this.restoring}finally{this.restoring=null}
 }
 updatePreview(id,value){for(const s of this.sessions.values())if(s.meetingId===id)s.display(value)}
 async dispose(){await Promise.allSettled([...this.sessions.values()].filter(s=>!terminal.has(s.state)).map(s=>s.control('stop')));for(const s of this.sessions.values())s.send('close')}
}
export class NativeCaptureSession{
 constructor(options){Object.assign(this,options);this.state='starting';this.events=[];this.serial=0;this.audioSequence=0;this.pending=0;this.chain=Promise.resolve();this.rows=[];this.audio=[];this.questions=[];this.interim=[];this.stats={seconds:0,paused:false,microphoneLevel:0,systemLevel:0,microphoneFrames:0,systemFrames:0};this.error='';this.ready=new Promise((resolve,reject)=>{this.resolveReady=resolve;this.rejectReady=reject});this.ready.catch(()=>{});this.done=new Promise(resolve=>this.resolveDone=resolve)}
 emit(event){if(event.type==='warning')this.warnings=(this.warnings||0)+1;this.events.push({serial:++this.serial,...event});if(this.events.length>512)this.events.shift()}
 launch(){
  this.child=this.manager.spawnProcess(this.manager.binary,[this.captureMode==='microphone'?'--capture-microphone':'--capture',this.directory],{stdio:['pipe','pipe','pipe'],windowsHide:true});let buffer='';
  this.child.stdout.setEncoding?.('utf8');this.child.stdout.on('data',chunk=>{buffer+=chunk;if(buffer.length>1000000){this.error='采集组件响应过长，录音已中断';this.child.kill();return}let index;while((index=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,index);buffer=buffer.slice(index+1);try{this.receive(JSON.parse(line))}catch{this.error='采集组件响应无效';this.child.kill()}}});
  this.child.stderr.on('data',()=>{});this.child.stdin.on('error',()=>{});
  this.child.on('error',()=>{this.error='无法启动本机音频采集组件';this.rejectReady(Error(this.error));this.finalize(false)});
  this.child.on('close',()=>{clearTimeout(this.startTimer);clearTimeout(this.killTimer);if(!this.started){this.error||='双路录音未开始，请检查麦克风与屏幕录制权限';this.rejectReady(Error(this.error))}if(!this.finishTask)this.finalize(false)});
  this.startTimer=setTimeout(()=>{this.error='等待系统授权超时，请授权后重新开始记录';this.rejectReady(Error(this.error));this.child.kill()},150000);this.startTimer.unref?.();
 }
 send(command,value={}){if(this.child?.stdin.writable)this.child.stdin.write(JSON.stringify({command,...value})+'\n')}
 display(value={}){
  this.preview={...this.preview,...value};
  this.send('display',{...this.preview,partial:this.interim[0]?.text||'',transcript:this.rows.slice(-30).map(r=>`[${r.time}] ${r.text}`).join('\n\n').slice(-20000)});
 }
 async startStreaming(){
  if(this.asrModel!==X_ASR||this.stream)return;
  if(this.streamStarting)return this.streamStarting;
  const callbacks={
   partial:({text,seconds})=>{this.interim=text?[{id:'interim',time:timestamp(seconds),text}]:[];this.display()},
   final:({text,seconds,endSeconds})=>{
    this.interim=[];this.display();
    const clean=checkedTranscript(text);
    if(clean.trim())this.chain=this.chain.then(()=>this.persistTranscript(clean,seconds,endSeconds)).catch(()=>this.emit({type:'warning',message:'字幕保存未完成，录音已保留'}));
   },
   warning:message=>{this.interim=[];this.emit({type:'warning',message});this.display({status:message})}
  };
  this.streamStarting=(async()=>{
   if(this.manager.models)this.stream=await this.manager.models.openStream(callbacks);
   else{const stream=new StreamingSpeech(this.manager.streamDirectory,callbacks);await stream.ready;this.stream=stream}
  })();
  try{await this.streamStarting}finally{this.streamStarting=null}
 }
 async persistTranscript(text,seconds,endSeconds){
  const row={id:randomUUID(),time:timestamp(seconds),speaker:'发言人',text,final:true};
  if(Number.isFinite(endSeconds)&&endSeconds>seconds)Object.assign(row,{startSeconds:seconds,endSeconds});
  this.rows.push(row);
  await writeFile(join(this.directory,'transcript.json'),JSON.stringify(this.rows),{mode:0o600});
  await this.manager.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===this.meetingId);if(m&&!m.transcript.some(r=>r.id===row.id))m.transcript.push(row)});
  this.emit({type:'transcript',row});
  this.display({status:this.asrModel===X_ASR?'X-ASR · 本机流式转写':'SenseVoiceSmall · 本机分段转写'});
  if(!this.lastPreview||performance.now()-this.lastPreview>=45000){
   this.lastPreview=performance.now();
   Promise.resolve(this.manager.onProgress?.(this.meetingId)).catch(()=>{});
  }
 }
 async ask(text){
  if(this.questionBusy||!['recording','paused'].includes(this.state)||typeof text!=='string'||!text.trim()||text.length>4000)return;
  this.questionBusy=true;
  const history=()=>this.questions.map(row=>`你　${row.question}\n会议助手　${row.answer}`).join('\n\n').slice(-32000);
  this.display({questionDisplay:[history(),`你　${text}\n会议助手正在回答…`].filter(Boolean).join('\n\n'),questionBusy:true,questionError:false});
  try{
   const state=await this.manager.storage.read();
   const meeting=state.data.meetings.find(m=>m.id===this.meetingId);
   if(!meeting?.transcript.length)throw Error('还没有已确认的逐字稿，请稍后再问');
   if(!this.manager.ai?.status().configured)throw Error('请先在 DSH 中选择可用模型');
   let bytes=0;
   const transcript=[];
   for(let i=meeting.transcript.length-1;i>=0;i--){
    const row=meeting.transcript[i];bytes+=Buffer.byteLength(JSON.stringify(row));
    if(bytes>300000)break;
    transcript.unshift(row);
   }
   const context={question:text,recentQuestions:this.questions.slice(-3).map(row=>({question:row.question,answer:row.answer.slice(0,2400)})),truncated:transcript.length<meeting.transcript.length};
   const result=await this.manager.ai.generate(transcript,'question',AbortSignal.timeout(150000),0,context);
   const row={question:text,answer:result.answer};
   await this.manager.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===this.meetingId);if(m)m.liveQuestions=[...(m.liveQuestions||[]),row].slice(-24)});
   this.questions.push(row);this.questions=this.questions.slice(-24);
   this.display({questionDisplay:history(),questionError:false});
  }catch(error){
   this.display({questionDisplay:[history(),`你　${text}\n${error.message}`].filter(Boolean).join('\n\n'),questionError:true});
  }finally{
   this.questionBusy=false;this.display({questionBusy:false});
  }
 }
 receive(value){
  if(value.type==='ready'){this.send('start',{title:this.title||'会议记录',streamPCM:!!this.stream});if(this.live&&this.asrModel)this.display({status:this.asrModel===X_ASR?'X-ASR · 本机流式转写':'SenseVoiceSmall · 本机分段转写'});return}
  if(value.type==='question'){void this.ask(value.text);return}
  if(value.type==='pcm'){
   if(this.stream&&typeof value.data==='string'&&value.data.length<=16000&&Number.isFinite(value.seconds)&&value.seconds>=0)this.stream.audio(value.data,value.seconds);
   return;
  }
  if(value.type==='stream-boundary'){this.stream?.boundary();return}
  if(value.type==='started'){if((this.captureMode!=='microphone'&&value.system!==true)||value.microphone!==true){this.error='未能同时启动电脑声音和麦克风';this.send('stop');this.rejectReady(Error(this.error));return}clearTimeout(this.startTimer);this.started=true;this.state='recording';this.resolveReady();return}
  if(value.type==='status'){for(const k of ['seconds','microphoneLevel','systemLevel','microphoneFrames','systemFrames','droppedSamples','microphoneRecoveries','microphoneInterruptions','microphoneGapSeconds','microphoneRestartAttempts'])if(Number.isFinite(value[k])&&value[k]>=0)this.stats[k]=value[k];this.stats.paused=value.paused===true;this.stats.microphoneRecovering=value.microphoneRecovering===true;if(this.state!=='stopping')this.state=this.stats.paused?'paused':'recording';return}
  if(value.type==='audio'){
   if(!Number.isInteger(value.sequence)||value.sequence!==this.audioSequence++||typeof value.wav!=='string'||value.wav.length>400000)throw Error('Invalid audio packet');
   const wave=Buffer.from(value.wav,'base64');if(wave.length<44||wave.toString('ascii',0,4)!=='RIFF')throw Error('Invalid WAV');if(!this.live||this.asrModel===X_ASR||!audible(wave))return;
   if(this.pending>=3){this.emit({type:'warning',message:'识别速度落后，原音继续保存；结束后可补转'});return}
   this.pending++;const seconds=Number.isFinite(value.seconds)?Math.max(0,value.seconds):0;
   this.chain=this.chain.then(async()=>{try{const result=await this.manager.speech.transcribe(wave,this.language,AbortSignal.timeout(45000));const text=checkedTranscript(result.text);if(text.trim())await this.persistTranscript(text,seconds,seconds+(wave.length-44)/32000);
    }catch{this.emit({type:'warning',message:'本段转写未完成，原音已保留，可在会后补转'})}finally{this.pending--}});return;
  }
  if(value.type==='error'){this.error=String(value.message||'音频采集失败').slice(0,800);this.emit({type:'error',message:this.error});if(!this.started)this.rejectReady(Error(this.error));return}
  if(value.type==='stopped'){this.stats.microphoneRecovering=false;if(Number.isFinite(value.seconds))this.stats.seconds=value.seconds;for(const k of ['microphoneFrames','systemFrames','microphoneRecoveries','microphoneInterruptions','microphoneGapSeconds','microphoneRestartAttempts'])if(Number.isFinite(value[k])&&value[k]>=0)this.stats[k]=value[k];if(value.failed)this.error||='音频采集中断，已保留采集内容';this.finalize(true);return}
 }
 snapshot(after=0){if(!Number.isSafeInteger(after)||after<0)throw Error('录音事件游标无效');const behind=this.events.length&&after<this.events[0].serial-1;return {id:this.id,meetingId:this.meetingId,state:this.state,cursor:this.serial,events:this.events.filter(e=>e.serial>after),resync:!!behind,pending:this.pending,asrModel:this.asrModel,warnings:this.warnings||0,live:this.live,streaming:!!this.stream&&!this.stream.closed,interim:this.interim,...this.stats,error:this.error,audio:this.audio}}
 async control(action){if(!['pause','resume','stop','enable-transcription','show-window'].includes(action))throw Error('录音操作无效');if(action==='show-window'){this.send('show');return this.snapshot()}if(terminal.has(this.state))return this.snapshot();
  if(action==='enable-transcription'){if(this.live)return this.snapshot();await this.manager.assertModel(this.asrModel,this.language);await this.startStreaming();if(terminal.has(this.state)||this.state==='stopping'){this.stream?.close();throw Error('录音已结束')}this.live=true;if(this.stream)this.send('stream-pcm');return this.snapshot()}
  if(action==='stop'){if(this.finishTask){await this.done;return this.snapshot()}this.state='stopping';this.send('stop');if(!this.killTimer){this.killTimer=setTimeout(()=>{this.error||='采集组件停止超时，正在保留可恢复音频';this.child.kill()},12000);this.killTimer.unref?.()}await this.done;return this.snapshot()}
  this.send(action);return this.snapshot();
 }
 captureGapWarning(){return this.stats.microphoneRecoveries?'本次麦克风曾短暂断开并恢复，中断期间可能缺少麦克风声音，请回放核对。':this.stats.microphoneInterruptions?'本次麦克风曾断开，部分麦克风声音未采集，请回放核对。':this.started&&this.stats.seconds>2&&!this.stats.microphoneFrames?'本次未收到麦克风声音，请检查输入设备并回放核对。':''}
 async backfill(){
  if(this.live&&!this.warnings&&this.rows.length)return;
  await this.manager.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===this.meetingId);if(m){m.aiStatus='转写中';m.aiError=''}});
  try{if(!this.manager.speech.status().ready)throw Error('DSH 本地语音模型尚未就绪，请准备模型后补转');
   const files=(await readdir(join(this.directory,'segments'))).filter(n=>/^\d{6}\.wav$/.test(n)).sort(),rows=[];let seconds=0;
   for(const name of files){const wave=await readFile(join(this.directory,'segments',name));if(audible(wave)){const result=await this.manager.speech.transcribe(wave,this.language,AbortSignal.timeout(45000));const text=checkedTranscript(result.text);if(text.trim())rows.push({id:randomUUID(),time:timestamp(seconds),speaker:'发言人',text,final:true,startSeconds:seconds,endSeconds:seconds+(wave.length-44)/32000})}seconds+=(wave.length-44)/32000}
   if(rows.length){this.rows=rows;await this.manager.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===this.meetingId);if(m){m.transcript=rows;m.captureWarning=this.captureGapWarning();m.status='待整理'}});await writeFile(join(this.directory,'transcript.json'),JSON.stringify(rows),{mode:0o600});this.display({status:'会后转写已完成，正在 AI 整理…'})}
  }catch(e){await this.manager.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===this.meetingId);if(m){m.aiStatus='待补转';m.aiError='原音已保存，自动转写未完成：'+e.message;if(m.transcript.length&&!m.captureWarning?.includes('自动补转未完成'))m.captureWarning=[m.captureWarning,'自动补转未完成，保留已有逐字稿。'].filter(Boolean).join(' ')}});this.display({status:'原音已保存，转写需重试'});throw e}
 }
 async recover(){const files=(await readdir(join(this.directory,'segments')).catch(()=>[])).filter(n=>/^\d{6}\.wav$/.test(n)).sort();if(!files.length)return false;
  const out=await open(join(this.directory,'recovered.wav'),'w',0o600);let length=0;const header=Buffer.alloc(44);header.write('RIFF');header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(16000,24);header.writeUInt32LE(32000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);
  try{await out.write(header);for(const name of files){const bytes=await readFile(join(this.directory,'segments',name));if(bytes.length<44||bytes.toString('ascii',0,4)!=='RIFF')continue;await out.write(bytes.subarray(44));length+=bytes.length-44}header.writeUInt32LE(36+length,4);header.writeUInt32LE(length,40);await out.write(header,0,44,0)}finally{await out.close()}this.stats.seconds=Math.max(this.stats.seconds,length/32000);return length>0;
 }
 finalize(clean){if(this.finishTask)return this.finishTask;this.state='stopping';clearTimeout(this.startTimer);clearTimeout(this.killTimer);
  this.finishTask=(async()=>{try{
    const candidates=clean?[['mixed.m4a','audio/mp4','混合录音.m4a']]:await this.recover()?[['recovered.wav','audio/wav','恢复的混合录音.wav']]:[];
    for(const [filename,mime,name]of candidates){try{const audio=await this.manager.storage.adoptCaptureFile(this.directory,filename,mime,name);this.audio.push({...audio,source:filename.split('.')[0]})}catch{}}
    if(!clean)this.error||='双路采集意外中断，已保留可恢复音频';
    await this.stream?.finish();
    await this.chain;
    if(this.started&&!this.audio.length)this.error||='录音文件未完成保存，请保留资料目录中的 captures 文件夹';
    await this.manager.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===this.meetingId);if(!m)return;for(const audio of this.audio)if(!m.audio.some(a=>a.id===audio.id))m.audio.push(audio);m.duration=Math.floor(this.stats.seconds);m.status=this.error?'录音中断':this.warnings?'待补转':m.transcript.length?'待整理':'待转写';m.captureError=this.error;m.captureWarning=(this.captureGapWarning())+(this.warnings?'部分音频尚未完成转写，请根据混合录音补转或核对。':this.captureMode!=='microphone'&&this.started&&this.stats.seconds>2&&!this.stats.systemFrames?'本次未收到电脑声音，请核对会议播放情况。':'')});
   }catch(e){this.error='录音保留在资料目录中，会议关联保存未完成：'+e.message}
   finally{this.state=this.error?'failed':'saved';await writeFile(join(this.directory,'result.json'),JSON.stringify(this.snapshot()),{mode:0o600}).catch(()=>{});this.resolveDone();if(this.started)Promise.resolve(this.manager.onSaved?.(this.meetingId,this)).catch(()=>{})}
  })();return this.finishTask;
 }
}
