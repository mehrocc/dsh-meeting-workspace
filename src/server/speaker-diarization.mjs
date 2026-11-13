import {IncrementalSpeakers,MAX_SPEAKER_SECONDS,speakerModelsReady} from './incremental-speakers.mjs';
import {readFile,readdir,lstat} from 'node:fs/promises';
import {join} from 'node:path';

export function speakerLabels(rows, segments) {
 const valid = segments.filter(s=>Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.start>=0&&s.end>s.start&&Number.isInteger(s.speaker));
 const labels = new Map(), updates = new Map();
 for(const segment of [...valid].sort((a,b)=>a.start-b.start)){
  if(segment.speaker>=0&&!labels.has(segment.speaker)) labels.set(segment.speaker,'发言人 '+(labels.size+1));
 }
 for(const row of rows){
  if(!Number.isFinite(row.startSeconds)||!Number.isFinite(row.endSeconds)||row.endSeconds<=row.startSeconds)continue;
  const overlap = new Map();
  for(const segment of valid){
   const seconds=Math.max(0,Math.min(segment.end,row.endSeconds)-Math.max(segment.start,row.startSeconds));
   if(seconds)overlap.set(segment.speaker,(overlap.get(segment.speaker)||0)+seconds);
  }
  const ranked=[...overlap].sort((a,b)=>b[1]-a[1]);
  const best=ranked[0];
  if(best&&best[0]>=0&&best[1]>=0.35&&best[1]>=(row.endSeconds-row.startSeconds)*0.50&&(!ranked[1]||ranked[1][1]<=best[1]*0.25))updates.set(row.id,labels.get(best[0]));
 }
 return updates;
}


const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const timed=row=>Number.isFinite(row.startSeconds)&&Number.isFinite(row.endSeconds)&&row.startSeconds>=0&&row.endSeconds>row.startSeconds;
const MAX_SECONDS=MAX_SPEAKER_SECONDS;

export async function captureSegmentIndex(directory,duration) {
 const files=(await readdir(directory)).filter(name=>/^\d{6}\.wav$/.test(name)).sort();
 const ranges=new Map(),parts=[];
 let seconds=0;
 if(!files.length||files.length>MAX_SECONDS+1)throw Error('找不到完整的原始录音分段');
 for(const [index,name] of files.entries()){
  if(Number(name.slice(0,6))!==index)throw Error('原始录音分段不完整');
  const file=await lstat(join(directory,name));
  const length=(file.size-44)/32000;
  if(!file.isFile()||length<=0||length>10||(file.size-44)%2)throw Error('原始录音分段格式无效');
  const start=Math.floor(seconds);
  const stamp=String(Math.floor(start/60)).padStart(2,'0')+':'+String(start%60).padStart(2,'0');
  // Short chunks near pauses can share the same display time. Such rows cannot be aligned safely.
  ranges.set(stamp,ranges.has(stamp)?null:{startSeconds:seconds,endSeconds:seconds+length});
  parts.push({name,start:seconds,duration:length});
  seconds+=length;
 }
 if(seconds>MAX_SECONDS)throw Error('当前支持区分 2 小时以内的录音');
 if(duration>0&&Math.abs(seconds-duration)>1.1)throw Error('录音分段与已保存录音时长不一致');
 return {ranges,parts,seconds};
}

export function recoverSpeakerRows(transcript,cached,ranges,segmented) {
 const original=cached.filter(row=>row&&uuid.test(row.id)&&typeof row.text==='string'&&row.text.trim()&&row.text.length<=20000&&typeof row.time==='string'&&typeof row.speaker==='string');
 const byId=new Map(original.map(row=>[row.id,row]));
 const withTime=row=>{
  if(timed(row)||!segmented)return row;
  const range=ranges.get(row.time);
  return range?{...row,...range}:row;
 };
 const aligned=transcript.map(row=>{
  const match=byId.get(row.id);
  return match?.text===row.text&&match.time===row.time?withTime(row):row;
 });
 if(aligned.some(timed))return {rows:aligned,alternate:false};
 return {rows:original.map(withTime).filter(timed),alternate:true};
}

async function identifySpeakers(root,directory,signal) {
 const {parts}=await captureSegmentIndex(directory,0);
 const worker=new IncrementalSpeakers({root,directory,signal,minWindowSeconds:30});
 try{for(const part of parts)worker.append(part.name,part.start,part.duration);return await worker.finish()}
 finally{worker.close()}
}

export async function diarizeRecording({meetingId,captureId,location,root,storage,signal,readSegments=identifySpeakers}) {
 const state=await storage.read();
 const meeting=state.data.meetings.find(item=>item.id===meetingId);
 if(state.location!==location||!meeting||meeting.captureId!==captureId||!uuid.test(captureId))throw Error('找不到这场会议的原始录音');
 const original=JSON.stringify(meeting.transcript);
 const save=change=>storage.mutate(data=>{
  const current=data.meetings.find(item=>item.id===meetingId);
  if(storage.location!==location||current?.captureId!==captureId||JSON.stringify(current.transcript)!==original)throw Error('处理期间会议资料已变更，请重新尝试');
  change(current);
 });
 try{
  if(!speakerModelsReady(root))throw Error('本机发言人模型未就绪');
  if(meeting.duration>MAX_SECONDS)throw Error('当前支持区分 2 小时以内的录音');
  const audio=join(location,'audio');
  const captures=join(audio,'captures');
  const capture=join(captures,captureId);
  const directory=join(capture,'segments');
  for(const path of [audio,captures,capture,directory]){
   if(!(await lstat(path).catch(()=>null))?.isDirectory())throw Error('原始录音分段不可用');
  }
  const session=JSON.parse(await readFile(join(capture,'session.json'),'utf8').catch(()=>{throw Error('原始录音分段不可用')}));
  if(session.id!==captureId||session.meetingId!==meetingId)throw Error('录音与会议的关联不一致');
  const {ranges}=await captureSegmentIndex(directory,meeting.duration).catch(error=>{if(error.code==='ENOENT')throw Error('原始录音分段不可用');throw error});
  const cached=await readFile(join(capture,'transcript.json'),'utf8').then(JSON.parse).catch(()=>[]);
  const {rows,alternate}=recoverSpeakerRows(meeting.transcript,Array.isArray(cached)?cached:[],ranges,session.asrModel==='sensevoice-local');
  if(!rows.some(timed))throw Error('这份逐字稿缺少可核对的录音时间');
  await save(current=>{current.speakerStatus='正在区分发言人…'});
  const segments=await readSegments(root,directory,signal);
  const labels=speakerLabels(rows,segments);
  let changed=0;
  const output=rows.map(row=>{
   const label=labels.get(row.id);
   if(label&&(row.speaker==='发言人'||row.speakerAutomatic&&/^发言人 \d+$/.test(row.speaker))){changed++;return {...row,speaker:label,speakerAutomatic:'final'}}
   if(row.speakerAutomatic==='live'&&/^发言人 \d+$/.test(row.speaker))return {...row,speaker:'发言人',speakerAutomatic:undefined};
   return alternate?{...row}:row;
  });
  if(alternate){
   const numbered=new Map();
   for(const row of output){
    if(!/^发言人 \d+$/.test(row.speaker))continue;
    if(!numbered.has(row.speaker))numbered.set(row.speaker,'发言人 '+(numbered.size+1));
    row.speaker=numbered.get(row.speaker);
   }
  }
  const count=new Set(output.map(row=>row.speaker).filter(label=>/^发言人 \d+$/.test(label))).size;
  await save(current=>{
   if(alternate){if(count)current.speakerTranscript=output;}
   else current.transcript=output;
   current.speakerAutoAttempted=true;current.speakerAnalysisVersion=2;
   current.speakerStatus=count
    ? '模型估计 '+count+' 个发言组 · 重叠或不确定的段落保留原标签'
    : '未得到可靠的发言人标签，逐字稿已保留';
  });
  return {count,changed,alternate};
 }catch(error){
  if(!signal?.aborted)await save(current=>{current.speakerAutoAttempted=true;current.speakerAnalysisVersion=2;current.speakerStatus='发言人区分未完成：'+error.message}).catch(()=>{});
  throw error;
 }
}
