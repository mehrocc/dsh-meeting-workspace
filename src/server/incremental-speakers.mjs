import {fork} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
export const MAX_SPEAKER_SECONDS=2*60*60;
export function speakerModelsReady(root){return !!root&&['native/sherpa-onnx.node','speaker/segmentation.onnx','speaker/embedding.onnx'].every(p=>existsSync(join(root,p)))}
export class SpeakerWorker{
 constructor({root,directory,signal,spawn=fork}){
  this.closed=false;this.next=0;this.pending=new Map();
  this.ready=new Promise((resolve,reject)=>{this.readyResolve=resolve;this.readyReject=reject});this.ready.catch(()=>{});
  this.child=spawn(fileURLToPath(new URL('./speaker-worker.cjs',import.meta.url)),[root,directory],{execArgv:[],env:{...process.env,ELECTRON_RUN_AS_NODE:'1'},stdio:['ignore','ignore','ignore','ipc']});
  this.timer=setTimeout(()=>this.fail(Error('发言人模型初始化超时')),60000);this.timer.unref?.();
  this.child.on('message',m=>{if(m.ready){clearTimeout(this.timer);this.readyResolve();return}if(!m.id){if(m.error)this.fail(Error(m.error));return}const task=this.pending.get(m.id);if(!task)return;clearTimeout(task.timer);this.pending.delete(m.id);m.error?task.reject(Error(m.error)):task.resolve(m)});
  this.child.on('error',()=>this.fail(Error('本地发言人模型无法启动')));this.child.on('exit',()=>{if(!this.closed)this.fail(Error('发言人模型意外退出'))});
  this.abort=()=>this.fail(Error('发言人分析已取消'));this.signal=signal;signal?.addEventListener('abort',this.abort,{once:true});if(signal?.aborted)this.abort();
 }
 async analyze(files,offset,from){await this.ready;if(this.closed)throw Error('发言人分析已关闭');const id=++this.next;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>this.fail(Error('发言人分析窗口超时')),90000);timer.unref?.();this.pending.set(id,{resolve,reject,timer});this.child.send({id,files,offset,from},error=>{if(error)this.fail(Error('发言人分析连接已关闭'))})})}
 fail(error){if(this.closed)return;this.readyReject(error);for(const t of this.pending.values()){clearTimeout(t.timer);t.reject(error)}this.pending.clear();this.close()}
 close(){if(this.closed)return;this.closed=true;clearTimeout(this.timer);this.readyReject(Error('发言人分析已关闭'));for(const task of this.pending.values()){clearTimeout(task.timer);task.reject(Error('发言人分析已关闭'))}this.pending.clear();this.signal?.removeEventListener('abort',this.abort);this.child.kill()}
}
// Retain file indices and timestamp labels, never a whole meeting's PCM in RAM.
export class IncrementalSpeakers{
 constructor({root,directory,signal,onUpdate=()=>{},onError=()=>{},createWorker=options=>new SpeakerWorker(options),minWindowSeconds=6}){Object.assign(this,{root,directory,signal,onUpdate,onError,createWorker,minWindowSeconds});this.files=[];this.segments=[];this.processed=0;this.closed=false;this.failure=null;this.running=null;this.finishing=false;this.processedThrough=0}
 append(name,start,duration){if(this.closed||this.failure)return;if(!/^\d{6}\.wav$/.test(name)||!Number.isFinite(start)||!Number.isFinite(duration)||duration<=0||duration>10||start+duration>MAX_SPEAKER_SECONDS+1){this.fail(Error('当前发言人分析支持 2 小时以内的录音'));return}if(Number(name.slice(0,6))!==this.files.length){this.fail(Error('录音分段序号不连续'));return}const last=this.files.at(-1);if(Math.abs(start-(last?last.start+last.duration:0))>.01){this.fail(Error('录音时间索引不连续'));return}this.files.push({name,start,duration});this.schedule()}
 schedule(){if(this.closed||this.failure||this.running)return;const remaining=this.files.slice(this.processed).reduce((n,f)=>n+f.duration,0);if(!this.finishing&&remaining<this.minWindowSeconds)return;if(!remaining)return;this.running=this.drain().catch(e=>this.fail(e)).finally(()=>{this.running=null;if(!this.failure&&!this.closed)this.schedule()})}
 async drain(){
  this.worker??=this.createWorker({root:this.root,directory:this.directory,signal:this.signal});
  while(this.processed<this.files.length&&!this.closed){
   const remaining=this.files.slice(this.processed).reduce((n,f)=>n+f.duration,0);if(!this.finishing&&remaining<this.minWindowSeconds)break;
   const begin=this.processed;let end=begin,total=0;while(end<this.files.length&&total+this.files[end].duration<=30){total+=this.files[end++].duration}
   const first=Math.max(0,begin-1),window=this.files.slice(first,end);
   const result=await this.worker.analyze(window.map(f=>f.name),window[0].start,this.files[begin].start);
   if(this.closed)return;
   if(!Array.isArray(result.segments)||!Number.isFinite(result.processedThrough))throw Error('发言人模型返回了无效结果');
   const min=this.files[begin].start,max=this.files[end-1].start+this.files[end-1].duration;
   const valid=result.segments.filter(s=>Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.start>=min-.01&&s.end<=max+.01&&s.end>s.start&&Number.isInteger(s.speaker)&&s.speaker>=-1&&s.speaker<32);
   // -1 labels remain unknown. Local overlaps are kept so alignment can reject them.
   this.segments.push(...valid);this.processed=end;this.processedThrough=max;
   await this.onUpdate(this.segments,max);
  }
 }
 fail(error){if(this.failure)return;this.failure=error;this.worker?.close();this.onError(error)}
 async finish(){this.finishing=true;this.schedule();while(this.running){await this.running;this.schedule()}if(this.failure)throw this.failure;this.closed=true;this.worker?.close();return this.segments}
 close(){this.closed=true;this.worker?.close()}
}
