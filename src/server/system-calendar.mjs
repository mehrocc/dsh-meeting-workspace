import {execFile} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {mkdtemp,readFile,rm,stat,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {promisify} from 'node:util';

const launch=promisify(execFile);
export function mergeCalendarEvents(data,events,config,window){
 data.plans||=[];const selected=new Set(config.ids),seen=new Set();let added=0,updated=0;
 for(const event of events){if(!selected.has(event.calendarId)||typeof event.id!=='string'||typeof event.title!=='string'||!event.title.trim()||!Number.isFinite(Date.parse(event.startsAt)))continue;
  const key=createHash('sha256').update(event.calendarId+'\n'+event.id+'\n'+event.startsAt).digest('hex');seen.add(key);const previous=data.plans.find(p=>p.sourceKey===key);
  const fields={title:event.title.slice(0,200),startsAt:event.startsAt,agenda:String(event.agenda||'').slice(0,20000),link:/^https?:\/\//i.test(event.link)?event.link:'',source:'system-calendar',sourceKey:key,sourceCalendar:event.calendarId,sourceCalendarTitle:event.calendarTitle||'系统日历'};
  if(previous){if(!previous.deletedAt&&!previous.localOverride&&['已安排','待确认','提醒中'].includes(previous.status)){Object.assign(previous,fields);updated++}}
  else {data.plans.push({...fields,id:randomUUID(),project:config.project||'default',status:'已安排',remindAt:event.startsAt,captureMode:'system-microphone',live:true});added++}
 }
 for(const plan of data.plans)if(plan.source==='system-calendar'&&selected.has(plan.sourceCalendar)&&['已安排','提醒中','待确认'].includes(plan.status)&&plan.startsAt>=window.from&&plan.startsAt<=window.until&&!seen.has(plan.sourceKey))plan.status='已取消';
 return {added,updated};
}
export class SystemCalendar{
 constructor({storage,capture,execute}){Object.assign(this,{storage,capture});this.execute=execute||((command,input)=>this.run(command,input));this.running=false;this.requests=new AbortController()}
 async run(command,input){
  if(!await this.capture.available())throw Error('当前系统未提供原生日历组件');
  const directory=await mkdtemp(join(tmpdir(),'dsh-meeting-calendar-'));
  const request=join(directory,'request.json'),reply=join(directory,'reply.json');
  try{
   await writeFile(request,JSON.stringify(input||{}),{mode:0o600});
   await writeFile(reply,'',{mode:0o600});
   // Launch Services makes the signed calendar helper the identity macOS authorizes.
   const app=resolve(this.capture.binary,'../../..');
   const args=['-n','-W','-a',app,'--stdin',request,'--stdout',reply,'--args',command];
   if(command!=='--calendar-connect')args.unshift('-g');
   try{
    await launch('/usr/bin/open',args,{timeout:150000,signal:this.requests.signal});
   }catch(error){
    if(error.name==='AbortError')throw error;
    throw Error(error.killed?'等待日历授权或读取超时':'无法打开系统日历组件，请重新连接');
   }
   const {size}=await stat(reply);
   if(!size)throw Error('日历组件未返回结果，请重新连接并确认系统授权');
   if(size>10*1024*1024)throw Error('日历数据过大，请减少同步范围');
   const value=JSON.parse(await readFile(reply,'utf8'));
   if(value.error)throw Error(value.error);
   return value;
  }finally{await rm(directory,{recursive:true,force:true})}
 }
 dispose(){this.requests.abort()}
 async connect(){return this.execute('--calendar-connect')}
 async sync(config){if(this.running)throw Error('日历正在同步');this.running=true;try{const state=await this.storage.read();const settings=config||state.data.calendarConfig;if(!settings?.enabled||!Array.isArray(settings.ids)||!settings.ids.length)throw Error('请选择要同步的日历');if(!state.data.projects.some(p=>p.id===(settings.project||'default')))throw Error('同步项目不存在');const response=await this.execute('--calendar-sync',{ids:settings.ids});if(!Array.isArray(response.events)||!response.from||!response.until)throw Error('日历返回内容无效');let result;await this.storage.mutate(d=>{result=mergeCalendarEvents(d,response.events,settings,response);d.calendarConfig={enabled:true,ids:settings.ids,project:settings.project||'default',lastSync:new Date().toISOString(),lastAttempt:new Date().toISOString(),lastError:''}});return result}catch(e){if(!config)await this.storage.mutate(d=>{if(d.calendarConfig){d.calendarConfig.lastError=e.message;d.calendarConfig.lastAttempt=new Date().toISOString()}}).catch(()=>{});throw e}finally{this.running=false}}
 async tick(){const state=await this.storage.read();if(!state.ready||!state.data.calendarConfig?.enabled)return;if(Date.now()-Date.parse(state.data.calendarConfig.lastAttempt||state.data.calendarConfig.lastSync||0)<600000)return;await this.sync()}
}
