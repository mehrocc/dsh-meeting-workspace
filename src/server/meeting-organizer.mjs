import {applySummary} from '../model.mjs';
// Automatic work belongs to a saved meeting, independent of which panel is open.
export class MeetingOrganizer{
 constructor({storage,ai,onPreview=()=>{}}){Object.assign(this,{storage,ai,onPreview});this.jobs=new Map();this.previews=new Map();this.preparing=new Set();this.resuming=false;this.closed=false;this.controller=new AbortController()}
 async preview(id){
  if(this.closed||this.previews.has(id)||this.jobs.has(id))return;
  const job=(async()=>{const state=await this.storage.read(),m=state.data.meetings.find(m=>m.id===id);if(!m?.transcript.length)return;
   if(!this.ai.status().configured){this.onPreview(id,{status:'尚未在 DSH 选择 AI 模型'});return}
   this.onPreview(id,{status:'正在更新 AI 摘要…'});
   try{const result=await this.ai.generate(m.transcript,'preview',this.controller.signal);if(typeof result.summary!=='string')throw Error('AI 未返回有效摘要');this.onPreview(id,{summary:result.summary,status:'AI 实时摘要 · 待核对'})}catch(e){this.onPreview(id,{status:'AI 摘要暂未更新：'+e.message})}
  })();this.previews.set(id,job);try{await job}finally{this.previews.delete(id)}
 }
 async afterCapture(id,prepare){
  if(this.closed||this.preparing.has(id))return;
  this.preparing.add(id);
  try{
   await this.queue(id);
   // Backfill reports its own error. A usable transcript can still be summarized.
   try{await prepare?.()}catch{}
   if(!this.closed)await this.organize(id);
  }finally{this.preparing.delete(id)}
 }
 async queue(id){
  await this.storage.mutate(d=>{
   const m=d.meetings.find(x=>x.id===id);
   if(m?.transcript.length&&!m.summary)m.aiStatus='等待整理';
  });
 }
 async resumePending(){
  if(this.closed||this.resuming||this.jobs.size||this.preparing.size||!this.ai.status().configured)return;
  this.resuming=true;
  try{
   const {data}=await this.storage.read();
   const m=data.meetings.find(x=>{
    if(x.summary||!x.transcript.length||['录制中','准备录音','暂停中','录音中'].includes(x.status))return false;
    if(['等待整理','等待 AI 模型','整理中'].includes(x.aiStatus))return true;
    return x.captureId&&!x.aiAutoAttempted&&['待整理','待补转','录音中断'].includes(x.status)&&
     (!x.aiStatus||['待整理','待补转','转写中'].includes(x.aiStatus)||x.aiStatus==='整理失败'&&/TRANSPORT/.test(x.aiError||''));
   });
   if(m&&!this.preparing.has(m.id))await this.organize(m.id);
  }finally{this.resuming=false}
 }
 async organize(id){
  if(this.closed)return;if(this.jobs.has(id))return this.jobs.get(id);
  const task=this.run(id);this.jobs.set(id,task);try{return await task}finally{this.jobs.delete(id)}
 }
 async run(id){
  await this.previews.get(id);
  const state=await this.storage.read(),m=state.data.meetings.find(m=>m.id===id);if(!m)throw Error('会议不存在');
  if(!m.transcript.length){await this.storage.mutate(d=>{const x=d.meetings.find(x=>x.id===id);if(x&&x.aiStatus!=='待补转')x.aiStatus='待转写'});return}
  if(!this.ai.status().configured){
   await this.storage.mutate(d=>{const x=d.meetings.find(x=>x.id===id);if(x){x.aiStatus='等待 AI 模型';x.aiError=''}});
   return;
  }
  const originalSummary=m.summary,originalTitle=m.title,originalTranscript=JSON.stringify(m.transcript);
  await this.storage.mutate(d=>{const x=d.meetings.find(x=>x.id===id);if(x){x.aiStatus='整理中';x.aiError='';x.aiAutoAttempted=true}});
  try{
   const result=await this.ai.generate(m.transcript,'meeting',this.controller.signal);
   const next=applySummary(m,{...result,decisions:[],source:'DSH AI 生成'});
   let saved=false;
   await this.storage.mutate(d=>{const x=d.meetings.find(x=>x.id===id);if(!x)return;if(JSON.stringify(x.transcript)!==originalTranscript){x.aiStatus=x.summary?'待核对':'等待整理';return;}
    if(x.summary!==originalSummary){x.generatedSummary=next.summary;x.aiStatus='待核对';x.aiError='整理期间摘要已有修改，AI 结果已另存，未覆盖人工内容';return}
    const merged=applySummary(x,{...result,decisions:[],source:'DSH AI 生成'});Object.assign(x,merged,{aiStatus:'已整理',aiError:''});
    saved=true;
    if(x.autoTitle&&x.title===originalTitle&&typeof result.title==='string'&&result.title.trim()){x.title=result.title.trim();x.titleStatus='已生成'}
   });if(saved)this.onPreview(id,{summary:next.summary,status:'AI 会议摘要已保存'});return saved?next:undefined;
  }catch(e){if(this.closed)return;await this.storage.mutate(d=>{const x=d.meetings.find(x=>x.id===id);if(x){x.aiStatus='整理失败';x.aiError=e.message;if(x.autoTitle)x.titleStatus='待生成'}});this.onPreview(id,{status:'AI 整理失败：'+e.message});throw e}
 }
 dispose(){this.closed=true;this.controller.abort(Error('工作台已停止'))}
}
