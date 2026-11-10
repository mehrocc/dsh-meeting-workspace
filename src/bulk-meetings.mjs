import {meetingTranscript} from './model.mjs';
// Shared bulk-operation rules. No disk audio or host conversations are deleted.
export function selectMeetings(data,ids){
 const wanted=new Set(ids);if(!wanted.size)throw Error('请先选择会议');
 const meetings=data.meetings.filter(m=>wanted.has(m.id));
 if(meetings.length!==wanted.size)throw Error('部分会议已变化，请重新选择');
 return meetings;
}
export function removeMeetings(data,ids,protectedIds=[]){
 const meetings=selectMeetings(data,ids),blocked=new Set(protectedIds);
 if(meetings.some(m=>blocked.has(m.id)))throw Error('请先结束并保存所选会议的录音');
 const removed=new Set(meetings.map(m=>m.id));
 data.meetings=data.meetings.filter(m=>!removed.has(m.id));
 for(const [key,value] of Object.entries(data.assistant||{}))if(!key.startsWith('session:')&&(removed.has(value?.meetingId)||key.startsWith('meeting:')&&removed.has(key.slice(8)))){
  // Keep historical chat readable, with its now-missing range failing closed.
  if(value?.sessionId)data.assistant['session:'+value.sessionId]||={...value};delete data.assistant[key];
 }
 return meetings.length;
}
export function transcriptText(meeting,project,format='txt'){
 const meta=`${meeting.date} · ${project||'未分类'}`;
 const body=meetingTranscript(meeting).map(r=>`[${r.time}] ${r.speaker}：${r.text}`).join('\n\n');
 return (format==='md'?`# ${meeting.title}\n\n${meta}\n\n## 逐字稿\n\n`:`${meeting.title}\n${meta}\n\n`)+body+'\n';
}
const encoder=new TextEncoder();
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
const record=size=>{const bytes=new Uint8Array(size);return {bytes,view:new DataView(bytes.buffer)}};
// Stored ZIP with UTF-8 paths, also used by the Word document package.
export function storedZip(entries){
 const local=[],central=[];let offset=0;
 for(const {path,content} of entries){
  const name=encoder.encode(path);
  const crc=crc32(content),head=record(30);head.view.setUint32(0,0x04034b50,true);head.view.setUint16(4,20,true);head.view.setUint16(6,0x800,true);head.view.setUint32(14,crc,true);head.view.setUint32(18,content.length,true);head.view.setUint32(22,content.length,true);head.view.setUint16(26,name.length,true);
  // The date is DOS 1980-01-01, and timestamps within each transcript remain unchanged.
  head.view.setUint16(12,33,true);
  const directory=record(46);directory.view.setUint32(0,0x02014b50,true);directory.view.setUint16(4,20,true);directory.view.setUint16(6,20,true);directory.view.setUint16(8,0x800,true);directory.view.setUint16(14,33,true);directory.view.setUint32(16,crc,true);directory.view.setUint32(20,content.length,true);directory.view.setUint32(24,content.length,true);directory.view.setUint16(28,name.length,true);directory.view.setUint32(42,offset,true);
  local.push(head.bytes,name,content);central.push(directory.bytes,name);offset+=30+name.length+content.length;
 }
 const centralSize=central.reduce((n,x)=>n+x.length,0),end=record(22);end.view.setUint32(0,0x06054b50,true);end.view.setUint16(8,entries.length,true);end.view.setUint16(10,entries.length,true);end.view.setUint32(12,centralSize,true);end.view.setUint32(16,offset,true);
 const bytes=new Uint8Array(offset+centralSize+22);let at=0;for(const chunk of [...local,...central,end.bytes]){bytes.set(chunk,at);at+=chunk.length}
 return bytes;
}
export function transcriptArchive(data,ids,format='txt'){
 if(!['txt','md'].includes(format))throw Error('不支持的逐字稿格式');
 const selected=selectMeetings(data,ids),meetings=selected.filter(m=>meetingTranscript(m).some(r=>r.text.trim()));
 if(!meetings.length)throw Error('所选会议暂无可导出的逐字稿');
 const safe=s=>String(s||'').replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g,'-').replace(/^\.+/,'').trim().slice(0,80)||'会议';
 let total=0;
 const entries=meetings.map(m=>{
  const path=`${safe(m.date)}_${safe(m.title)}_${safe(m.id)}.${format}`;
  const content=encoder.encode('\ufeff'+transcriptText(m,data.projects.find(p=>p.id===m.project)?.name,format));
  total+=content.length;
  if(total>100*1024*1024)throw Error('逐字稿总量超过 100 MB，请分批导出');
  return {path,content};
 });
 return {bytes:storedZip(entries),count:meetings.length,skipped:selected.length-meetings.length};
}
