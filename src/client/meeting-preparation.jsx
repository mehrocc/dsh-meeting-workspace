import React,{useState,useEffect} from 'react';
import {MeetingPlanEditor} from './meeting-plan-editor.jsx';
import {planVersion} from '../plan-management.mjs';
import {CalendarPanel} from './calendar-panel.jsx';
export function MeetingPreparation({data,busy,recording,commit,run,start,api,refresh,createRequested,onCreateOpened,onDeleted}){
 const [draft,setDraft]=useState(null),[showAll,setShowAll]=useState(false);
 const plans=(data.plans||[]).filter(p=>!p.deletedAt&&(showAll||['已安排','提醒中','待确认'].includes(p.status))).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const open=p=>setDraft(p?{...p}:{});
 useEffect(()=>{if(createRequested){open();onCreateOpened?.()}},[createRequested]);
 const change=(original,fn)=>run(()=>commit(d=>{const p=d.plans.find(p=>p.id===original.id);if(!p||p.deletedAt||planVersion(p)!==planVersion(original))throw Error('会议安排已更新，请重新查看');fn(p)}));
 return <><section className="mw-heading"><div><h1>会议安排</h1><p>安排会议、准备议题，到时间确认是否开始记录。提醒需要 DSH 保持运行。</p></div><div className="actions"><button disabled={busy} onClick={()=>setDraft({fromInvitation:true})}>粘贴会议邀请</button><button className="primary" disabled={busy} onClick={()=>open()}>添加会议安排</button></div></section>
 <CalendarPanel data={data} busy={busy} run={run} commit={commit} api={api} refresh={refresh}/>
 <div className="mw-filter-row"><label className="mw-plan-filter"><input type="checkbox" checked={showAll} onChange={e=>setShowAll(e.target.checked)}/>显示已处理安排</label></div>
 <section className="mw-card">{plans.map(p=><article className="mw-plan" key={p.id}><header><h2>{p.title}</h2><span className="badge">{p.status}</span></header><p className="mw-plan-time">{new Date(p.startsAt).toLocaleString('zh-CN',{month:'long',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'})} · {data.projects.find(x=>x.id===p.project)?.name||'未分类'}</p>{p.agenda&&<p className="mw-plan-agenda">{p.agenda}</p>}{p.link&&/^https?:\/\//i.test(p.link)&&<a className="mw-plan-link" href={p.link} target="_blank" rel="noreferrer">打开会议链接 ↗</a>}{p.lastError&&<p role="alert" className="mw-capture-warning">{p.lastError}</p>}<div className="actions"><button className="primary" disabled={busy||recording||p.status==='已开始'} onClick={()=>start(p.id)}>开始记录</button><button disabled={busy} onClick={()=>open(p)} aria-label={'管理会议安排：'+p.title}>管理</button>{['提醒中','待确认'].includes(p.status)&&<button disabled={busy} onClick={()=>change(p,x=>{x.remindAt=new Date(Date.now()+5*60000).toISOString();x.status='已安排'})}>5 分钟后提醒</button>}{p.status!=='已取消'&&p.status!=='已开始'&&<button disabled={busy} onClick={()=>change(p,x=>x.status='已取消')}>取消安排</button>}</div></article>)}{!plans.length&&<div className="empty">暂无待参加的会议。添加会议安排后，将在约定时间提醒。</div>}</section>
 {draft&&<MeetingPlanEditor key={draft.id||(draft.fromInvitation?'invitation':'new')} plan={draft.id?draft:null} fromInvitation={draft.fromInvitation} data={data} commit={commit} onClose={()=>setDraft(null)} onDeleted={onDeleted}/>}</>;
}
