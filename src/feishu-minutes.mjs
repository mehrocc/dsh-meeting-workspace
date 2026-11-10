import {createMeeting,MAX_TEXT,parseTranscript} from './model.mjs';

export const FEISHU_MINUTES_SOURCE='飞书妙记';

export function parseMinutesLink(value){
 let url;
 try{url=new URL(typeof value==='string'?value.trim():'')}catch{}
 const token=url?.pathname.match(/^\/minutes\/([a-z0-9]{24})\/?$/)?.[1];
 if(!token||url.protocol!=='https:'||url.port||url.username||url.password||
    !/(^|\.)feishu\.cn$/.test(url.hostname))throw Error('请粘贴飞书妙记分享链接（以 /minutes/ 开头的页面）');
 return {token,url:url.origin+'/minutes/'+token};
}

export function parseMinutesTranscript(raw){
 const text=typeof raw==='string'?raw.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim():'';
 if(!text)throw Error('飞书尚未提供这条妙记的逐字稿');
 if(text.length>MAX_TEXT)throw Error('这份妙记逐字稿超出导入上限');
 const lines=text.split('\n');
 const header=lines[0].match(/^(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}(?:\s|$)/);
 const date=header?.[1]||'';
 if(header)lines.shift();
 const rows=[];
 const participants=new Set();
 let heading=null,body=[];
 function flush(){
  const content=body.join('\n').trim();
  if(content){
   if(heading){
    const [hours,minutes,seconds]=heading[2].replace(',','.').split(':').map(Number);
    const speaker=heading[1].trim();
    rows.push({id:crypto.randomUUID(),time:heading[2],startSeconds:hours*3600+minutes*60+seconds,speaker,text:content,final:true});
    if(!/^(?:speaker|发言人|说话人)\s*\d*$/i.test(speaker))participants.add(speaker);
   }else{
    rows.push(...parseTranscript(content));
   }
  }
  body=[];
 }
 for(const line of lines){
  const match=line.match(/^(.{1,120}?)\s+(\d{1,3}:[0-5]\d:[0-5]\d(?:[.,]\d{1,3})?)\s*$/);
  if(match){flush();heading=match;}else body.push(line);
 }
 flush();
 if(!rows.length)throw Error('飞书尚未提供这条妙记的逐字稿');
 if(rows.length>10000)throw Error('这份妙记逐字稿段落过多，请分段导入');
 return {date,rows,participants:[...participants]};
}

export function saveMinutesMeeting(data,preview,{title,project,date},id){
 const existing=data.meetings.find(meeting=>meeting.source===FEISHU_MINUTES_SOURCE&&meeting.sourceId===preview.token);
 if(existing)return {id:existing.id,duplicate:true};
 const meeting=createMeeting(title,project,'',date);
 Object.assign(meeting,{id,source:FEISHU_MINUTES_SOURCE,sourceId:preview.token,sourceUrl:preview.url,
  importedAt:new Date().toISOString(),transcript:preview.rows,participants:preview.participants,aiStatus:'等待整理'});
 data.meetings.unshift(meeting);
 return {id,duplicate:false};
}
