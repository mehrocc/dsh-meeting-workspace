import React from 'react';
import {dashboardItems} from '../dashboard.mjs';

function AgendaTime({value}){
 const date=new Date(value);
 return <time dateTime={value} className="mw-agenda-time">
  <strong>{date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</strong>
  <span>{date.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',weekday:'short'})}</span>
 </time>;
}

export function Dashboard({data,project,today,busy,recording,onPlans,onAddPlan,onStart,onManagePlan,onTasks,onAddTask,onToggleTask,onMeeting}){
 const {plans,planCount,tasks,taskCount}=dashboardItems(data,project);
 return <section className="mw-dashboard" aria-label="会议安排与待办">
  <section className="mw-card mw-overview-card">
   <header><h2>会议安排 <small>{planCount}</small></h2><button className="link" onClick={onPlans}>查看全部</button></header>
   <div className="mw-overview-list">
    {plans.map(p=>{
     const waiting=['提醒中','待确认'].includes(p.status);
     return <article className="mw-overview-plan" key={p.id}>
      <AgendaTime value={p.startsAt}/>
      <div className="mw-agenda-entry">
       <strong>{p.title}</strong>
       <div className="mw-agenda-entry-actions">
        <span className={'badge'+(waiting?' mw-state-pending':'')}>{waiting?'待确认':Date.parse(p.startsAt)<=Date.now()?'待开始':'已安排'}</span>
        <button className="link" disabled={busy} aria-label={'管理会议安排 '+p.title} onClick={()=>onManagePlan(p.id)}>管理</button>
        <button className="link" disabled={busy||recording} onClick={()=>onStart(p.id)}>开始记录</button>
       </div>
      </div>
     </article>;
    })}
    {!plans.length&&<p className="mw-overview-empty">暂无待参加的会议</p>}
   </div>
   <footer><button onClick={onAddPlan}>＋ 添加会议安排</button></footer>
  </section>
  <section className="mw-card mw-overview-card">
   <header><h2>任务安排 <small>{taskCount}</small></h2><button className="link" onClick={onTasks}>查看全部</button></header>
   <div className="mw-overview-list">
    {tasks.map(t=>{
     const overdue=t.due&&t.due<today;
     return <article className="mw-overview-task" key={t.id}>
      <label><input type="checkbox" aria-label={'完成 '+t.title} checked={false} disabled={busy} onChange={()=>onToggleTask(t)}/><strong>{t.title}</strong></label>
      <div>
       <span className={overdue?'overdue':''}>{t.owner||'未分配'}{t.due&&('　'+t.due)}{overdue?'　已逾期':''}</span>
       <button className="link" onClick={()=>onMeeting(t.meetingId)}>{t.meetingTitle}</button>
      </div>
     </article>;
    })}
    {!tasks.length&&<p className="mw-overview-empty">暂无待跟进任务</p>}
   </div>
   <footer><button onClick={onAddTask}>＋ 新建任务</button></footer>
  </section>
 </section>;
}
