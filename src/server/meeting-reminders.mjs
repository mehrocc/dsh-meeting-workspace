import {spawn} from 'node:child_process';
import {createMeeting} from '../model.mjs';
export function reminderPrompt(binary,plan,signal){return new Promise((resolve,reject)=>{
 const child=spawn(binary,['--remind'],{stdio:['pipe','pipe','pipe'],signal}),chunks=[];let size=0;
 const timer=setTimeout(()=>{child.kill();resolve('dismiss')},10*60*1000);timer.unref?.();
 child.stdout.on('data',chunk=>{size+=chunk.length;if(size>8192){child.kill();return}chunks.push(chunk)});child.stderr.on('data',()=>{});child.stdin.on('error',()=>{});
 child.on('error',e=>{clearTimeout(timer);reject(e)});child.on('close',()=>{clearTimeout(timer);try{const value=JSON.parse(Buffer.concat(chunks).toString());const action=['start','snooze','dismiss'].includes(value.action)?value.action:'dismiss';resolve(action==='start'&&typeof value.project==='string'?{action,project:value.project}:action)}catch{reject(Error('会议提醒窗口未能打开'))}});
 child.stdin.end(JSON.stringify({title:plan.title,startsAt:plan.startsAt,captureMode:plan.captureMode||'system-microphone',live:plan.live!==false,project:plan.project,projects:plan.projects,projectName:plan.projectName,canStart:plan.canStart,...(plan.detected?{detected:true,platform:plan.platform}:{} )}));
})}
export class MeetingReminders{
 constructor({storage,capture,speech,prompt=reminderPrompt,now=()=>Date.now()}){Object.assign(this,{storage,capture,speech,prompt,now});this.pending=new Set();this.starting=new Set();this.closed=false;this.controllers=new Map()}
 async tick(){if(this.closed||this.ticking)return;this.ticking=true;try{const state=await this.storage.read();if(!state.ready)return;this.reconcile(state.data);for(const plan of state.data.plans||[]){if(plan.deletedAt||!['已安排','提醒中'].includes(plan.status)||this.pending.has(plan.id)||Date.parse(plan.remindAt||plan.startsAt)>this.now())continue;
   if(this.now()-Date.parse(plan.startsAt)>24*3600000){await this.change(plan.id,p=>p.status='已错过');continue}
   this.pending.add(plan.id);this.notify(plan).finally(()=>this.pending.delete(plan.id)).catch(()=>{});
  }}finally{this.ticking=false}}
 async change(id,fn){await this.storage.mutate(d=>{const p=d.plans?.find(p=>p.id===id);if(p&&!p.deletedAt)fn(p)})}
 async notify(plan){const controller=new AbortController();this.controllers.set(plan.id,controller);await this.change(plan.id,p=>p.status='提醒中');try{
  if(!await this.capture.available()){await this.change(plan.id,p=>{p.status='待确认';p.lastError='请在会议准备中确认是否开始记录'});return}
  const state=await this.storage.read(),projects=state.data.projects.map(({id,name})=>({id,name}));
  const response=await this.prompt(this.capture.binary,{...plan,projects,projectName:projects.find(p=>p.id===plan.project)?.name,canStart:plan.live===false||(await this.capture.liveSpeechAvailable?.()??this.speech.status().ready)},controller.signal);if(this.closed)return;
  const action=typeof response==='string'?response:response?.action,project=typeof response==='object'?response?.project:plan.project;
  const latest=(await this.storage.read()).data.plans?.find(p=>p.id===plan.id);if(!latest||latest.deletedAt||latest.status!=='提醒中')return;
  if(action==='start'){if(!projects.some(p=>p.id===project))throw Error('请选择有效的保存项目');await this.start(plan.id,true,project)}
  else if(action==='snooze')await this.change(plan.id,p=>{p.status='已安排';p.remindAt=new Date(this.now()+5*60000).toISOString()});
  else await this.change(plan.id,p=>p.status='已忽略');
 }catch(e){if(!this.closed&&!controller.signal.aborted)await this.change(plan.id,p=>{p.status='待确认';p.lastError=e.message})}finally{this.controllers.delete(plan.id)}}
 async start(id,confirmed,selectedProject){if(confirmed!==true)throw Error('请确认开始记录');if(this.starting.has(id))throw Error('会议正在启动');this.starting.add(id);try{
  const state=await this.storage.read(),plan=state.data.plans?.find(p=>p.id===id);if(!plan||plan.deletedAt)throw Error('会议安排不存在或已删除');if(plan.status==='已开始')throw Error('这场会议已开始记录');
  if(this.capture.active().length||this.capture.starting)throw Error('请先结束并保存当前录音');if(!await this.capture.available())throw Error('当前原生录音组件不可用，请从开始记录入口操作');if(plan.live!==false&&!(await this.capture.liveSpeechAvailable?.()??this.speech.status().ready))throw Error('请先在设置中准备当前语音转写模型');
  const project=selectedProject??plan.project;if(!state.data.projects.some(p=>p.id===project))throw Error('保存项目已不存在，请重新选择');
  const meeting=createMeeting(plan.title,project,'',new Date(plan.startsAt).toLocaleDateString('sv-SE'));meeting.autoTitle=plan.autoTitle===true;meeting.status='准备录音';meeting.preparation=plan.agenda||'';
  await this.storage.mutate(d=>{if(!d.projects.some(p=>p.id===project))throw Error('保存项目已不存在，请重新选择');const latest=d.plans?.find(p=>p.id===id);if(!latest||latest.deletedAt||!['已安排','提醒中','待确认','已忽略','已错过'].includes(latest.status))throw Error('会议安排状态已改变，请重新确认');latest.project=project;d.meetings.unshift(meeting)});
  try{const result=await this.capture.start({meetingId:meeting.id,confirmed:true,language:'auto',captureMode:plan.captureMode||'system-microphone',live:plan.live!==false});await this.change(id,p=>{p.status='已开始';p.meetingId=meeting.id;p.lastError=''});return result}
  catch(e){await this.storage.mutate(d=>{const m=d.meetings.find(m=>m.id===meeting.id);if(m)m.status='录音启动失败'});await this.change(id,p=>p.lastError=e.message);throw e}
 }finally{this.starting.delete(id)}}
 reconcile(data){for(const [id,controller]of this.controllers){const plan=data.plans?.find(p=>p.id===id);if(!plan||plan.deletedAt||plan.status!=='提醒中')controller.abort()}}
 dispose(){this.closed=true;for(const c of this.controllers.values())c.abort();this.controllers.clear()}
}
