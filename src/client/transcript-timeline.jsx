import React,{useState} from 'react';

const speakerNumber=/^(?:speaker|发言人|说话人)\s*(\d+)$/i;
const unknown=/^(?:speaker|发言人|说话人)?$/i;
function speakerIdentity(speaker){
 const value=speaker.trim();
 if(unknown.test(value))return {label:'未标注发言人',avatar:'?',tone:0};
 const numbered=value.match(speakerNumber)?.[1];
 if(numbered)return {label:'发言人 '+numbered,avatar:numbered,tone:(Number(numbered)-1)%6+1};
 let tone=0;
 for(const character of value)tone=(tone+character.codePointAt(0))%6;
 return {label:value,avatar:[...value][0],tone:tone+1};
}
function displayTime(time){
 const parts=time.match(/^(\d{2,}:)?(\d{2}:\d{2})(?:[.,]\d+)?$/);
 return parts?(parts[1]&&parts[1]!=='00:'?parts[1]:'')+parts[2]:time;
}
function Icon({name}){
 return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  {name==='search'?<><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 4 4"/></>:<><path d="M4 20h16M5 15l-1 3 3-1L19 5l-2-2L5 15Z"/><path d="m14.5 5.5 2 2"/></>}
 </svg>;
}
function highlightText(text,query){
 const index=query?text.toLowerCase().indexOf(query):-1;
 if(index<0)return text;
 return <>{text.slice(0,index)}<mark>{text.slice(index,index+query.length)}</mark>{text.slice(index+query.length)}</>;
}
export function TranscriptRows({rows,query='',activeId,onAnchor}){
 return <div className="mw-transcript-timeline">
  {rows.map(row=>{
   const speaker=speakerIdentity(row.speaker);
   return <article key={row.id} ref={onAnchor?el=>onAnchor(row.id,el):undefined} className={activeId===row.id?'highlight':''}>
    <span className="mw-transcript-avatar" data-tone={speaker.tone} aria-hidden="true">{speaker.avatar}</span>
    <div>
     <header><strong>{speaker.label}</strong>{row.speakerAutomatic==='live'&&<span>暂定</span>}<span title={row.time}>{displayTime(row.time)}</span></header>
     <p>{highlightText(row.text,query)}</p>
    </div>
   </article>;
  })}
 </div>;
}
export function TranscriptTimeline({rows,busy,onEdit,canEdit}){
 const [showSearch,setShowSearch]=useState(false),[search,setSearch]=useState('');
 const query=showSearch?search.trim().toLowerCase():'';
 const matches=query?rows.filter(row=>row.text.toLowerCase().includes(query)||speakerIdentity(row.speaker).label.toLowerCase().includes(query)):rows;
 return <section className="mw-full-transcript" aria-label="文字记录">
  <div className="mw-transcript-heading">
   <div><h2>文字记录</h2><span>{rows.length} 段</span></div>
   <div className="actions">
    <button type="button" className="mw-transcript-icon" title="搜索逐字稿" aria-label="搜索逐字稿" aria-expanded={showSearch} onClick={()=>setShowSearch(!showSearch)}><Icon name="search"/></button>
    <button type="button" className="mw-transcript-icon" title="编辑逐字稿" aria-label="编辑逐字稿" disabled={!canEdit} onClick={onEdit}><Icon name="edit"/></button>
   </div>
  </div>
  {showSearch&&<label className="mw-transcript-search">
   <input autoFocus aria-label="搜索发言人或原文" placeholder="搜索发言人或原文" value={search} onChange={e=>setSearch(e.target.value)}/>
   <span role="status">{matches.length} 段</span>
  </label>}
  {busy&&<p className="small muted" role="status">正在自动标注发言人…</p>}
  {matches.length?<TranscriptRows rows={matches} query={query}/>:<p className="empty">{query?'没有匹配的发言':'暂无逐字稿'}</p>}
 </section>;
}
