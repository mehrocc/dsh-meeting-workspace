import {MAX_TEXT,parseTranscript} from './model.mjs';

export function needsSpeakerAnalysis(meeting){
 const retryOldLimit=meeting?.duration<=7200&&meeting.speakerAnalysisVersion!==2&&/30 分钟/.test(meeting.speakerStatus||'');
 return Boolean(meeting?.captureId&&meeting.audio.length&&(!meeting.speakerAutoAttempted||retryOldLimit)&&!meeting.speakerTranscript?.length
  &&!['录制中','录音中','准备录音','暂停中'].includes(meeting.status)
  &&meeting.transcript.some(row=>row.speaker==='发言人')
  &&!meeting.transcript.some(row=>/^发言人 \d+$/.test(row.speaker)));
}

export function editableTimeline(rows){
 return rows.map(row=>'['+row.time+'] '+row.speaker+'：'+row.text).join('\n\n');
}

export function editTimeline(value,previous){
 if(typeof value!=='string'||!value.trim()||value.length>MAX_TEXT)return parseTranscript(value);
 const rows=[];
 let row;
 for(const line of value.replace(/\r/g,'').split('\n')){
  const match=line.match(/^\[([^\]\n]+)\]\s*([^：:\n]+)[：:]\s?(.*)$/);
  if(match){
   row={time:match[1],speaker:match[2],text:match[3]};
   rows.push(row);
  }else if(row)row.text+='\n'+line;
  else if(line.trim())return parseTranscript(value);
 }
 if(!rows.length||rows.every(row=>!row.text.trim()))return parseTranscript('');
 return rows.filter(row=>row.text.trim()).map((row,index)=>{
  const original=previous[index];
  const sameTime=original?.time===row.time;
  return {...(sameTime?original:{id:crypto.randomUUID(),final:true}),...row,text:row.text.trim()};
 });
}
