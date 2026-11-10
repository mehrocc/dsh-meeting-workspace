import React from 'react';
import {WorkspaceIcon} from './workspace-icon.jsx';
function Folder(){return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>}
export function MeetingRecords({data,rows,project,onProject,busy,onManageProjects,onNewProject,onImport,toolbar,renderMeetings}){
 const counts=new Map(data.projects.map(p=>[p.id,0]));for(const m of data.meetings)counts.set(m.project,(counts.get(m.project)||0)+1);
 const groups=data.projects.filter(p=>!project||p.id===project).map(p=>({...p,meetings:rows.filter(m=>m.project===p.id)})).filter(p=>project||p.meetings.length);
 return <>
  <section className="mw-heading mw-records-heading"><div><h1>会议记录</h1><p>按项目查看会议纪要、逐字稿与录音。</p></div><div className="actions"><button disabled={busy} onClick={onManageProjects}>项目管理</button><button className="primary mw-action-icon" disabled={busy} onClick={onImport}><WorkspaceIcon name="import"/>导入会议</button></div></section>
  <section className="mw-project-collections" aria-label="会议项目分类">
   <button className={'mw-project-folder'+(!project?' is-active':'')} aria-pressed={!project} onClick={()=>onProject('')}><Folder/><span><strong>全部会议</strong><small aria-label={data.meetings.length+' 场会议'}>{data.meetings.length}</small></span></button>
   {data.projects.map(p=><button key={p.id} className={'mw-project-folder'+(project===p.id?' is-active':'')} aria-pressed={project===p.id} onClick={()=>onProject(p.id)}><Folder/><span><strong>{p.name}</strong><small aria-label={(counts.get(p.id)||0)+' 场会议'}>{counts.get(p.id)||0}</small></span></button>)}
   <button className="mw-project-folder mw-project-folder-new" disabled={busy} onClick={onNewProject}><span className="mw-folder-plus" aria-hidden="true">＋</span><strong>新建项目</strong></button>
  </section>
  <p className="mw-records-count">{project?data.projects.find(p=>p.id===project)?.name:'全部项目'} · {rows.length} 场会议</p>
  <div className="mw-records-list">{toolbar}{groups.map(group=><section className="mw-card mw-project-meetings" key={group.id} aria-label={group.name+'的会议'}><header className="mw-card-head"><div><Folder/><h2>{group.name}</h2><small>{group.meetings.length} 场会议</small></div></header>{renderMeetings(group.meetings)}{!group.meetings.length&&<p className="empty">{counts.get(group.id)?'没有符合当前筛选条件的会议。':'这个项目还没有会议。可导入会议，或在首页开始记录。'}</p>}</section>)}{!groups.length&&<section className="mw-card"><p className="empty">{data.meetings.length?'没有符合当前筛选条件的会议。':'还没有会议记录。录制或导入会议后，会按所属项目收纳。'}</p></section>}</div>
 </>;
}
