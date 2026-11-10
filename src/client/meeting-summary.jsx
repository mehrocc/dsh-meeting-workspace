import React from 'react';

function inline(line) {
 return line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part,i)=>part.startsWith('**')&&part.endsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part.startsWith('`')&&part.endsWith('`')?<code key={i}>{part.slice(1,-1)}</code>:part);
}

export function SummaryText({text}) {
 const blocks=[];
 const lines=text.split(/\r?\n/);
 for(let i=0;i<lines.length;){
  const line=lines[i++].trim();
  if(!line)continue;
  if(/^#{1,6}\s/.test(line)){blocks.push(<h3 key={i}>{inline(line.replace(/^#+\s+/,''))}</h3>);continue}
  const parts=value=>value.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim());
  if(line.includes('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i]||'')){
   const header=parts(line),rows=[],key=i++;
   while(lines[i]?.trim().includes('|'))rows.push(parts(lines[i++]));
   blocks.push(<div className="mw-summary-table" key={key}><table><thead><tr>{header.map((s,j)=><th key={j}>{inline(s)}</th>)}</tr></thead><tbody>{rows.map((row,j)=><tr key={j}>{header.map((_,k)=><td key={k}>{inline(row[k]||'')}</td>)}</tr>)}</tbody></table></div>);
   continue;
  }
  const pattern=/^(?:[-*•]\s+|\d+[.)、]\s*)/;
  if(pattern.test(line)){
   const key=i,items=[line.replace(pattern,'')];
   while(pattern.test(lines[i]?.trim()||''))items.push(lines[i++].trim().replace(pattern,''));
   const Tag=/^\d/.test(line)?'ol':'ul';
   blocks.push(<Tag key={key}>{items.map((item,j)=><li key={j}>{inline(item)}</li>)}</Tag>);
   continue;
  }
  const label=line.match(/^(主题|背景|进展|结论|待确认)[：:]\s*(.*)$/);
  blocks.push(label?<p key={i}><strong>{label[1]}　</strong>{inline(label[2])}</p>:<p key={i}>{inline(line)}</p>);
 }
 return <div className="mw-summary-text">{blocks}</div>;
}

export function MeetingSummary({meeting,onLocate}) {
 const diagram=meeting.summaryDiagram;
 const pending=meeting.aiStatus==='等待 AI 模型'?'在 DSH 选择模型后会自动整理。':
  ['等待整理','整理中','转写中'].includes(meeting.aiStatus)?'正在准备会议摘要…':
  meeting.aiStatus==='整理失败'?'摘要生成未完成，详情见上方提示。':
  meeting.transcript.length?'会后自动生成会议摘要。':'识别出逐字稿后会自动整理。';
 return <div className="mw-summary-reader">
  {meeting.summary?<SummaryText text={meeting.summary}/>:<p className="muted">{pending}</p>}
  {Array.isArray(diagram?.steps)&&diagram.steps.length>1&&<details className="mw-summary-diagram"><summary>{diagram.title} · {diagram.type==='flow'?'流程图':diagram.type==='timeline'?'时间线':'议题结构'}</summary><ol className={'mw-diagram-steps '+(diagram.type==='topics'?'topics':'ordered')}>{diagram.steps.map((step,i)=>{
   const index=meeting.transcript.findIndex(r=>r.id===step.paragraphId);
   return <li key={i}><span className="mw-diagram-number">{i+1}</span><div><strong>{step.title}</strong><p>{step.detail}</p>{index>=0&&<button className="link" onClick={()=>onLocate(index)}>查看原文 · {meeting.transcript[index].time}</button>}</div></li>;
  })}</ol></details>}
 </div>;
}
