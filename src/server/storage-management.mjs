import {lstat,readdir,readFile,mkdir,rename,unlink,rmdir} from 'node:fs/promises';
import {join,relative,dirname} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {validateData} from '../model.mjs';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const DAY=86400000;
const conflict=message=>Object.assign(Error(message),{status:409});
export const RETENTION_DAYS=[0,7,30,90,180,365];
// The scan never follows symlinks, including the audio root. Unknown files are counted, never selected for deletion.
async function inventory(root){
 const base=join(root,'audio'),files=[],links=[];let count=0;
 async function walk(path){let info;try{info=await lstat(path)}catch(e){if(e.code==='ENOENT')return;throw e}
  if(++count>200000)throw Error('录音目录文件过多，请先检查资料目录');
  const name=relative(base,path);if(info.isSymbolicLink()){links.push(name||'.');return}
  if(info.isDirectory()){for(const child of await readdir(path))await walk(join(path,child))}
  else if(info.isFile())files.push({path:name,bytes:info.size,mtime:info.mtimeMs,ino:info.ino});
 }
 await walk(base);return {base,files,links};
}
function fingerprint(files){return createHash('sha256').update(JSON.stringify(files.map(f=>[f.path,f.bytes,f.mtime,f.ino]).sort((a,b)=>a[0].localeCompare(b[0])))).digest('hex')}
export class StorageManagement{
 constructor(storage,{blocked=()=>[],now=()=>Date.now(),remove=unlink}={}){this.storage=storage;this.blocked=blocked;this.now=now;this.remove=remove;this.previews=new Map()}
 async report(){return this.storage.transaction(async current=>this.inspect(current))}
 async inspect(current){
  const {data,location:root,revision}=current,scan=await inventory(root),files=new Map(scan.files.map(f=>[f.path,f]));
  const references=new Map();for(const m of data.meetings)for(const a of m.audio){const owners=references.get(a.id)||new Set();owners.add(m.id);references.set(a.id,owners)}
  const captureCounts=new Map();for(const m of data.meetings)if(m.captureId)captureCounts.set(m.captureId,(captureCounts.get(m.captureId)||0)+1);
  const policy=data.storagePolicy?.retentionDays||0,blocked=new Set(this.blocked()),owned=new Set(),rows=[],internals=new Map();
  for(const m of data.meetings){
   const paths=new Set(),problems=[];let missing=0;
   for(const a of m.audio){if(!UUID.test(a.id)){missing++;continue}if(references.get(a.id).size>1){problems.push('录音被多场会议引用');continue}if(files.has(a.id))paths.add(a.id);else{missing++;if(scan.links.includes(a.id))problems.push('录音文件是外部链接')}}
   const prefix=UUID.test(m.captureId||'')?'captures/'+m.captureId+'/':null;
   if(prefix){const cache=scan.files.filter(f=>f.path.startsWith(prefix));if(cache.length){let meta;try{meta=JSON.parse(await readFile(join(scan.base,prefix,'session.json'),'utf8'))}catch{}
     if(meta?.id===m.captureId&&meta?.meetingId===m.id&&captureCounts.get(m.captureId)===1){for(const f of cache)paths.add(f.path)}else problems.push('采集缓存关联待核对')
    }if(scan.links.some(p=>p===prefix.slice(0,-1)||p.startsWith(prefix)))problems.push('采集缓存包含外部链接')}
   if(scan.links.includes('.')||scan.links.includes('captures')&&prefix)problems.push('录音目录包含外部链接');
   const list=[...paths].map(p=>files.get(p)),bytes=list.reduce((n,f)=>n+f.bytes,0),cacheBytes=list.filter(f=>f.path.startsWith('captures/')).reduce((n,f)=>n+f.bytes,0);
   for(const path of paths)owned.add(path);
   const lastSaved=list.length?Math.max(...list.map(f=>f.mtime)):null;
   const expired=!!(policy&&lastSaved&&this.now()-lastSaved>=policy*DAY&&!m.audioKeepForever);
   const processing=blocked.has('*')||blocked.has(m.id)||['录制中','准备录音'].includes(m.status)||m.aiStatus==='转写中';
   const reason=processing?'录音或转写进行中':m.audioKeepForever?'已设为长期保留':problems[0]||(!list.length?'没有可清理的录音':'');
   const row={id:m.id,title:m.title,date:m.date,project:m.project,bytes,cacheBytes,files:list.length,missing,lastSaved,expired,keep:!!m.audioKeepForever,canClean:!reason,reason};
   rows.push(row);internals.set(m.id,list);
  }
  const totalBytes=scan.files.reduce((n,f)=>n+f.bytes,0),associatedBytes=scan.files.filter(f=>owned.has(f.path)).reduce((n,f)=>n+f.bytes,0);
  return {revision,retentionDays:policy,totalBytes,associatedBytes,otherBytes:totalBytes-associatedBytes,hasExternalLinks:!!scan.links.length,rows,internals,base:scan.base};
 }
 publicReport(report){const {internals,base,...out}=report;return out}
 async status(){return this.publicReport(await this.report())}
 async setPolicy(retentionDays){if(!RETENTION_DAYS.includes(retentionDays))throw Error('录音保留期限无效');await this.storage.mutate(data=>{data.storagePolicy={retentionDays}});return this.status()}
 async keep(meetingId,value){if(typeof value!=='boolean')throw Error('长期保留状态无效');await this.storage.mutate(data=>{const m=data.meetings.find(m=>m.id===meetingId);if(!m)throw Error('会议不存在');m.audioKeepForever=value});return this.status()}
 async preview(ids){
  if(!Array.isArray(ids)||!ids.length||ids.length>5000||ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)throw Error('请选择需要清理的会议');
  const report=await this.report(),rows=ids.map(id=>report.rows.find(m=>m.id===id));if(rows.some(m=>!m))throw Error('所选会议已不存在');
  for(const row of rows)if(!row.canClean)throw Error(row.title+'：'+row.reason);
  const token=randomUUID(),files=ids.flatMap(id=>report.internals.get(id));
  for(const [key,value]of this.previews)if(this.now()-value.at>300000)this.previews.delete(key);
  while(this.previews.size>=20)this.previews.delete(this.previews.keys().next().value);
  this.previews.set(token,{ids,revision:report.revision,location:dirname(report.base),hash:fingerprint(files),at:this.now()});
  return {token,rows,bytes:files.reduce((n,f)=>n+f.bytes,0),files:files.length};
 }
 async cleanup(token,confirmed){
  if(confirmed!==true)throw Error('请确认删除录音');const preview=this.previews.get(token);if(!preview||this.now()-preview.at>300000)throw conflict('清理确认已过期，请重新选择');
  const result=await this.storage.transaction(async current=>{
   if(current.location!==preview.location||current.revision!==preview.revision)throw conflict('会议资料已更新，请重新确认清理');
   const report=await this.inspect(current),rows=preview.ids.map(id=>report.rows.find(m=>m.id===id));
   if(rows.some(row=>!row?.canClean))throw conflict('录音状态已改变，请重新选择');
   const files=preview.ids.flatMap(id=>report.internals.get(id));if(fingerprint(files)!==preview.hash)throw conflict('录音文件已更新，请重新确认');
   const staging=join(report.base,'.cleanup-'+randomUUID()),moved=[];await mkdir(staging,{mode:0o700});
   try{
    for(const [i,file]of files.entries()){const original=join(report.base,file.path),stage=join(staging,String(i));let parent=dirname(original);while(true){const info=await lstat(parent);if(!info.isDirectory()||info.isSymbolicLink())throw conflict('录音目录已改变，请重新确认');if(parent===report.base)break;parent=dirname(parent)}const info=await lstat(original);if(!info.isFile()||info.isSymbolicLink()||info.ino!==file.ino||info.size!==file.bytes||info.mtimeMs!==file.mtime)throw conflict('录音文件已更新，请重新确认');await rename(original,stage);moved.push({original,stage,...file})}
    const data=structuredClone(current.data);for(const m of data.meetings)if(preview.ids.includes(m.id)){m.audio=[];delete m.captureId;m.audioClearedAt=new Date(this.now()).toISOString()}
    validateData(data);await this.storage.atomic(join(current.location,'dsh-meetings.json'),JSON.stringify({revision:current.revision+1,data},null,2));
   }catch(e){const rollback=await Promise.allSettled(moved.map(f=>rename(f.stage,f.original)));await rmdir(staging).catch(()=>{});if(rollback.some(x=>x.status==='rejected'))throw Error('清理未完成，部分录音暂存在 audio/.cleanup 目录，请保留并检查资料目录');throw e}
   // After the metadata commit, failed removals remain visible as unassociated storage; never report them as freed.
   let removedBytes=0,failedFiles=0;for(const file of moved){try{await this.remove(file.stage);removedBytes+=file.bytes}catch{failedFiles++}}
   const dirs=[...new Set(moved.flatMap(f=>{const result=[];let path=dirname(f.original);while(path!==report.base){result.push(path);path=dirname(path)}return result}))].sort((a,b)=>b.length-a.length);
   for(const dir of dirs)await rmdir(dir).catch(()=>{});await rmdir(staging).catch(()=>{});
   return {meetings:rows.length,removedBytes,failedFiles};
  });this.previews.delete(token);return {...result,storage:await this.status()};
 }
}
