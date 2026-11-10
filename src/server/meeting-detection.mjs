import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';import {promisify} from 'node:util';
import {OfflineVoiceWatcher} from './offline-voice.mjs';
import {createMeeting} from '../model.mjs';import {reminderPrompt} from './meeting-reminders.mjs';
const execute=promisify(execFile),NAMES={__proto__:null,tencent:'腾讯会议',feishu:'飞书',offline:'线下会议'};
export async function probeMeetingActivity(binary,signal){const {stdout}=await execute(binary,['--meeting-activity'],{signal,timeout:6000,maxBuffer:16384});const result=JSON.parse(stdout);if(typeof result.supported!=='boolean'||!Array.isArray(result.platforms))throw Error('会议检测组件响应无效');return result}
export class MeetingDetection{
 constructor({storage,capture,speech,probe=probeMeetingActivity,prompt=reminderPrompt,now=()=>Date.now(),promptBusy=()=>false,offlineWatcher}){Object.assign(this,{storage,capture,speech,probe,prompt,now,promptBusy});this.offline=offlineWatcher||new OfflineVoiceWatcher({binary:capture.binary,now});this.observations=new Map();this.current=[];this.supported=null;this.error='';this.lastCheckedAt=null;this.closed=false;this.controller=new AbortController();this.pending=null;this.started=false;this.dictations=new Map();this.consent=false;this.consentLoaded=false}
 config(data){return {enabled:data.meetingDetection?.enabled!==false,offlineEnabled:data.meetingDetection?.offlineEnabled===true&&this.consent,project:data.meetingDetection?.project||'default'}}
 snapshot(data){return {...this.config(data),supported:this.supported,platforms:this.current.map(p=>({id:p.id,name:NAMES[p.id]})),lastCheckedAt:this.lastCheckedAt,error:this.error,prompting:!!this.pending,offline:this.offline.snapshot()}}
 async loadConsent(){if(this.consentLoaded)return;try{this.consent=JSON.parse(await readFile(join(this.storage.metadata,'offline-consent.json'),'utf8')).enabled===true}catch(e){if(e.code!=='ENOENT')this.error='线下提醒授权记录不可读，请重新开启';this.consent=false}this.consentLoaded=true}
 async status(){await this.loadConsent();const state=await this.storage.read();return this.snapshot(state.data)}
 async configure({enabled,project,offlineEnabled}){
  await this.loadConsent();if(offlineEnabled!==undefined&&typeof offlineEnabled!=='boolean')throw Error('线下会议设置无效');if(typeof enabled!=='boolean')throw Error('会议检测设置无效');
  const state=await this.storage.read();if(!state.ready)throw Error('请先选择会议资料文件夹');if(typeof project!=='string'||!state.data.projects.some(p=>p.id===project))throw Error('请选择有效项目');
  // Opt-out releases the microphone immediately. Opt-in is effective only after both writes succeed.
  if(offlineEnabled===false){this.consent=false;await this.offline.stop('off');await this.storage.atomic(join(this.storage.metadata,'offline-consent.json'),JSON.stringify({enabled:false}))}
  await this.storage.mutate(d=>d.meetingDetection={enabled,project,offlineEnabled:offlineEnabled??d.meetingDetection?.offlineEnabled===true});
  if(offlineEnabled===true){await this.offline.stop('off');await this.storage.atomic(join(this.storage.metadata,'offline-consent.json'),JSON.stringify({enabled:true}));this.consent=true}
  await this.offline.reset();this.pending?.controller.abort();this.observations.clear();this.current=[];this.error='';return this.status()
 }
 async tick(){
  if(this.closed||this.ticking)return;this.ticking=true;
  try{
   await this.loadConsent();let state=await this.storage.read();const initial=this.config(state.data),dictating=[...this.dictations.values()].some(v=>v.expires>this.now()),recording=this.capture.active().length||this.capture.starting||state.data.meetings.some(m=>['录制中','准备录音'].includes(m.status));await this.offline.sync(state.ready&&initial.offlineEnabled,!!recording||dictating);if(dictating)return;if(!state.ready||!initial.enabled&&!initial.offlineEnabled){this.current=[];return}
   if(!await this.capture.available()){this.supported=false;this.error='当前设备未提供原生会议检测组件';return}
   const result=initial.enabled?await this.probe(this.capture.binary,this.controller.signal):{supported:true,platforms:[]};if(this.closed)return;
   this.supported=result.supported;this.lastCheckedAt=new Date(this.now()).toISOString();this.error=typeof result.error==='string'?result.error.slice(0,300):'';
   if((!this.supported||this.error)&&!initial.offlineEnabled){this.current=[];return}
   const config=this.config((await this.storage.read()).data);if(!config.enabled&&!config.offlineEnabled)return;
   const ids=[...new Set(result.platforms.filter(p=>NAMES[p.id]&&p.inputActive===true).map(p=>p.id))];if(config.offlineEnabled&&this.offline.confirmed())ids.push('offline');this.current=ids.map(id=>({id,name:NAMES[id]}));
   for(const [id,observation]of this.observations)if(!ids.includes(id)){if(this.now()-observation.lastSeen>=60000)this.observations.delete(id);else if(!observation.prompted){observation.seen=0;observation.firstAt=this.now()}}
   for(const id of ids){let observation=this.observations.get(id);if(!observation){observation={id,firstAt:this.now(),lastSeen:this.now(),seen:0,prompted:false,retryAt:0};this.observations.set(id,observation)}observation.seen++;observation.lastSeen=this.now()}
   state=await this.storage.read();
   if(this.capture.active().length||this.capture.starting||state.data.meetings.some(m=>['录制中','准备录音'].includes(m.status))){for(const id of ids)this.observations.get(id).prompted=true;return}if(this.pending||this.promptBusy())return;
   const candidate=ids.map(id=>this.observations.get(id)).find(o=>o.seen>=2&&this.now()-o.firstAt>=8000&&!o.prompted&&this.now()>=o.retryAt);
   if(candidate){for(const id of ids)this.observations.get(id).prompted=true;candidate.prompted=true;const controller=new AbortController(),job={id:candidate.id,observation:candidate,controller};this.pending=job;job.promise=this.notify(job,state).finally(()=>{if(this.pending===job)this.pending=null});job.promise.catch(()=>{})}
  }catch(e){if(!this.closed)this.error='会议检测暂不可用：'+e.message.slice(0,250)}finally{this.ticking=false}
 }
 async notify(job,state){
  const config=this.config(state.data),projectName=state.data.projects.find(p=>p.id===config.project)?.name||'未分类';
  const projects=state.data.projects.map(({id,name})=>({id,name}));
  try{const response=await this.prompt(this.capture.binary,{title:NAMES[job.id],platform:NAMES[job.id],detected:true,canStart:(await this.capture.liveSpeechAvailable?.()??this.speech.status().ready),projectName,project:config.project,projects,captureMode:job.id==='offline'?'microphone':'system-microphone',live:true},job.controller.signal);
   if(this.closed||job.controller.signal.aborted)return;
   const action=typeof response==='string'?response:response?.action,project=typeof response==='object'?response?.project:config.project;
   if(action==='start'){if(!projects.some(p=>p.id===project))throw Error('请选择有效的保存项目');await this.start(job.id,true,job.observation,config.project,project)}
   else if(action==='snooze'){job.observation.prompted=false;job.observation.retryAt=this.now()+300000}
  }catch(e){if(!this.closed&&!job.controller.signal.aborted)this.error=e.message.slice(0,300)}
 }
 async start(id,confirmed,observation=this.observations.get(id),expectedProject,selectedProject=expectedProject){
  if(confirmed!==true)throw Error('请主动确认开始录音和转写');if(this.closed||this.started)throw Error('会议录音正在启动');this.started=true;
  try{
   let state=await this.storage.read();const config=this.config(state.data);
   if(!(id==='offline'?config.offlineEnabled:config.enabled)||!observation||this.observations.get(id)!==observation||!NAMES[id])throw Error('会议检测状态已改变，请重新确认');
   if(expectedProject&&config.project!==expectedProject)throw Error('保存项目已改变，请从开始记录入口确认');
   if(this.capture.active().length||this.capture.starting||state.data.meetings.some(m=>['录制中','准备录音'].includes(m.status)))throw Error('已有录音，请先结束并保存');
   if(!(await this.capture.liveSpeechAvailable?.()??this.speech.status().ready))throw Error('请先在设置中准备当前语音模型，再开始录音和转写');
   const latest=id==='offline'?{supported:true,platforms:[{id:'offline',inputActive:true}]}:await this.probe(this.capture.binary,this.controller.signal);
   if(!latest.supported||latest.error||!latest.platforms.some(p=>p.id===id&&p.inputActive===true))throw Error('未再检测到该会议的麦克风活动，可从工作台手动开始记录');
   // Recheck after the asynchronous native probe, including disabling while a prompt is open.
   state=await this.storage.read();if(this.closed||!(id==='offline'?this.config(state.data).offlineEnabled:this.config(state.data).enabled)||this.config(state.data).project!==config.project)throw Error('会议检测设置已改变，未开始录音');
   const project=selectedProject??config.project;if(!state.data.projects.some(p=>p.id===project))throw Error('保存项目已不存在，请重新选择');
   const meeting=createMeeting(`${NAMES[id]} · ${new Date(this.now()).toLocaleDateString('sv-SE')}`,project);meeting.autoTitle=true;meeting.status='准备录音';meeting.detectedPlatform=id;
   await this.storage.mutate(d=>{if(!d.projects.some(p=>p.id===project))throw Error('保存项目已不存在，请重新选择');d.meetings.unshift(meeting)});
   try{const result=await this.capture.start({meetingId:meeting.id,confirmed:true,live:true,language:'auto',captureMode:id==='offline'?'microphone':'system-microphone'});this.error='';return result}
   catch(e){await this.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===meeting.id);if(m){m.status='录音启动失败';m.captureError=e.message}});throw e}
  }finally{this.started=false}
 }
 async dictation(sessionId,token){if(token){const lease=this.dictations.get(token);if(lease?.sessionId===sessionId)this.dictations.delete(token);return {released:true}}for(const [key,v]of this.dictations)if(v.expires<=this.now())this.dictations.delete(key);if(this.dictations.size>=10)throw Error('语音输入正在处理中');token=randomUUID();this.dictations.set(token,{sessionId,expires:this.now()+65000});await this.offline.stop('paused');return {token}}
 pauseForRecording(){return this.offline.stop('paused')}
 dispose(){this.offline.dispose();this.closed=true;this.controller.abort();this.pending?.controller.abort();this.pending=null;this.current=[]}
}
