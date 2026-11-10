import React,{useState,useRef,useEffect} from 'react';
import {taskOwners,peopleFor,validPerson} from '../task-editing.mjs';
import {WorkspaceIcon} from './workspace-icon.jsx';
import {AnchoredPopover} from './anchored-popover.jsx';

export function PeoplePicker({value,people,archived=[],onRosterChange,onSave,label='负责人',disabled=false}){
 const [open,setOpen]=useState(false),[chosen,setChosen]=useState([]),[query,setQuery]=useState('');
 const [managing,setManaging]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const anchor=useRef(null),input=useRef(null),pending=useRef(false),original=useRef(value);
 const name=query.trim(),matches=person=>person.toLowerCase().includes(name.toLowerCase());
 const candidates=(managing?people:people.filter(person=>!chosen.includes(person))).filter(matches);
 const removed=managing?archived.filter(matches):[];
 const canAdd=!managing&&validPerson(name)&&!people.includes(name)&&!chosen.includes(name)&&chosen.length<30;
 useEffect(()=>{if(open)input.current?.focus()},[open,managing]);

 function close(restoreFocus=false){
  if(pending.current)return;
  setOpen(false);
  if(restoreFocus)requestAnimationFrame(()=>anchor.current?.focus());
 }
 function toggle(){
  if(open){close();return;}
  original.current=[...value];
  setChosen([...value]);setQuery('');setError('');setManaging(false);setOpen(true);
 }
 function add(person){
  setChosen(previous=>previous.length>=30||previous.includes(person)?previous:[...previous,person]);
  setQuery('');
  input.current?.focus();
 }
 async function save(){
  if(pending.current)return;
  pending.current=true;setSaving(true);setError('');
  try{await onSave(chosen,original.current);setOpen(false);requestAnimationFrame(()=>anchor.current?.focus());}
  catch(e){setError(e.message);}
  finally{pending.current=false;setSaving(false);}
 }
 async function changeRoster(person,available){
  if(pending.current)return;
  pending.current=true;setSaving(true);setError('');
  try{await onRosterChange(person,available);requestAnimationFrame(()=>input.current?.focus());}
  catch(e){setError(e.message);}
  finally{pending.current=false;setSaving(false);}
 }
 return <div className="mw-people-picker">
  <button ref={anchor} type="button" className="mw-cell-trigger mw-people-trigger" aria-label={label}
   aria-expanded={open} aria-haspopup="dialog" disabled={disabled} onClick={toggle}>
   {value.length?value.map(person=><span className="mw-person-chip" key={person}>{person}</span>):<span className="muted">未分配</span>}
   <span className="mw-cell-caret" aria-hidden="true">⌄</span>
  </button>
  {open&&<AnchoredPopover anchor={anchor} label="选择负责人" onClose={()=>close()} className="mw-people-popover">
   <header>
    <strong>{managing?'候选名单':'负责人'}</strong>
    {onRosterChange&&<button type="button" className="link mw-people-manage" disabled={saving}
     onClick={()=>{setManaging(!managing);setQuery('');setError('');}}>{managing?'返回选择':'管理名单'}</button>}
    <button type="button" className="link" aria-label="关闭负责人选择" disabled={saving} onClick={()=>close(true)}>×</button>
   </header>
   {managing?<p className="mw-people-help">移出的人会从候选中隐藏，已有任务的负责人记录会保留。</p>:
    <div className="mw-people-selected" aria-label="已选负责人">
     {chosen.length?chosen.map(person=><button type="button" className="mw-people-chip-remove" key={person}
      aria-label={'从当前任务移除 '+person} disabled={saving}
      onClick={()=>{setChosen(previous=>previous.filter(n=>n!==person));input.current?.focus();}}>
      <span>{person}</span><span aria-hidden="true">×</span>
     </button>):<span className="muted">未分配</span>}
    </div>}
   <label className="mw-people-search"><WorkspaceIcon name="search" size={14}/>
    <input ref={input} aria-label={managing?'搜索候选名单':'搜索或新增负责人'} placeholder={managing?'搜索负责人':'搜索或新增负责人'}
     maxLength={80} value={query} disabled={saving} onChange={e=>setQuery(e.target.value)}
     onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();if(canAdd)add(name);}}}/>
   </label>
   <div className="mw-people-options">
    {candidates.map(person=>managing?<div className="mw-people-roster-row" key={person}>
     <span>{person}</span><button type="button" className="link" aria-label={'从候选名单移出 '+person} disabled={saving} onClick={()=>changeRoster(person,false)}>移出</button>
    </div>:<button type="button" className="mw-people-option" key={person} disabled={saving||chosen.length>=30}
     aria-label={'选择 '+person} onClick={()=>add(person)}><span>{person}</span><span aria-hidden="true">＋</span></button>)}
    {removed.length>0&&<div className="mw-people-archived">已移出</div>}
    {removed.map(person=><div className="mw-people-roster-row" key={person}>
     <span>{person}</span><button type="button" className="link" aria-label={'恢复候选负责人 '+person} disabled={saving} onClick={()=>changeRoster(person,true)}>恢复</button>
    </div>)}
    {!candidates.length&&!removed.length&&!canAdd&&<p className="muted small">{name?'未找到负责人':'没有其他负责人'}</p>}
   </div>
   {canAdd&&<button type="button" className="mw-add-person" disabled={saving} onClick={()=>add(name)}>＋ 添加「{name}」</button>}
   {error&&<p className="mw-inline-error" role="alert">{error}</p>}
   {!managing&&<footer>
    <button type="button" className="link" disabled={saving||!chosen.length} onClick={()=>setChosen([])}>清空</button>
    <span>{chosen.length} 人</span><button type="button" disabled={saving} onClick={()=>close(true)}>取消</button>
    <button type="button" className="primary" disabled={saving} onClick={save}>{saving?'保存中…':'保存负责人'}</button>
   </footer>}
  </AnchoredPopover>}
 </div>;
}
function TitleCell({task,onSave}){
 const [editing,setEditing]=useState(false),[text,setText]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false);const input=useRef(null),pending=useRef(false),cancelled=useRef(false),original=useRef(task.title);
 useEffect(()=>{if(editing){input.current?.focus();input.current?.setSelectionRange(text.length,text.length)}},[editing]);
 async function save(){if(cancelled.current||pending.current)return;if(text.trim()===original.current){setEditing(false);return}pending.current=true;setSaving(true);setError('');try{await onSave('title',text,{title:original.current});setEditing(false)}catch(e){setError(e.message);input.current?.focus()}finally{pending.current=false;setSaving(false)}}
 return editing?<div className="mw-inline-title"><textarea ref={input} aria-label="修改任务内容" rows={3} maxLength={1000} value={text} disabled={saving} onChange={e=>setText(e.target.value)} onBlur={save} onKeyDown={e=>{if(e.isComposing||e.nativeEvent.isComposing)return;if(e.key==='Escape'){e.preventDefault();cancelled.current=true;setEditing(false)}if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();save()}}}/><small>{saving?'保存中…':'Enter 保存 · Shift+Enter 换行 · Esc 取消'}</small>{error&&<span className="mw-inline-error" role="alert">{error}</span>}</div>:<button type="button" className={'mw-cell-trigger mw-title-trigger'+(task.done?' done':'')} aria-label={'编辑任务内容：'+task.title} onClick={()=>{original.current=task.title;cancelled.current=false;setText(task.title);setError('');setEditing(true)}}>{task.title}<span className="mw-edit-hint" aria-hidden="true">✎</span></button>
}
function TaskRow({task,global,projects,people,archived,today,onPatch,onRosterChange,onToggle,onMeeting,onDelete}){
 const [saving,setSaving]=useState(false),[error,setError]=useState('');
 const save=async(field,value,expected)=>{setError('');setSaving(true);try{await onPatch(task,{[field]:value},expected)}catch(e){setError(e.message);throw e}finally{setSaving(false)}};
 const quiet=(field,value,expected)=>save(field,value,expected).catch(()=>{});
 return <tr><td data-label="任务内容"><div className="mw-task-title-cell"><input type="checkbox" aria-label={'完成 '+task.title} checked={task.done} disabled={saving} onChange={()=>onToggle(task)}/><TitleCell task={task} onSave={save}/></div>{error&&<p className="mw-inline-error" role="alert">{error}</p>}</td><td data-label="负责人"><PeoplePicker value={taskOwners(task)} people={people} archived={archived} onRosterChange={onRosterChange} disabled={saving} label={'编辑负责人：'+task.title} onSave={(owners,previous)=>save('owners',owners,{owners:previous})}/></td><td data-label="截止日期"><div className={'mw-date-cell'+(!task.done&&task.due&&task.due<today?' overdue':'')}><input type="date" min="1000-01-01" max="9999-12-31" aria-label={'截止日期：'+task.title} value={task.due} disabled={saving} onClick={e=>{try{e.currentTarget.showPicker?.()}catch{}}} onChange={e=>quiet('due',e.target.value,{due:task.due})}/>{task.due&&<button type="button" className="link" aria-label={'清除截止日期：'+task.title} disabled={saving} onClick={()=>quiet('due','',{due:task.due})}>×</button>}</div></td>{global&&<td data-label="来源会议"><button className="link mw-task-source" onClick={()=>onMeeting(task.meetingId)}>{task.meetingTitle}</button></td>}<td data-label="项目"><select className="mw-project-cell" aria-label={'任务项目：'+task.title} value={task.project} disabled={saving} onChange={e=>quiet('project',e.target.value,{project:task.project})}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td data-label="操作"><button className="link danger" disabled={saving} onClick={()=>onDelete(task)}>删除</button></td></tr>
}
export function TaskTable({items,data,global=false,today,onPatch,onRosterChange,onToggle,onMeeting,onDelete}){
 const people=peopleFor(data,{assignableOnly:true});
 return <div className={'mw-table mw-editable-tasks'+(global?' mw-global-tasks':'')}><table><thead><tr><th>任务内容</th><th>负责人</th><th>截止日期</th>{global&&<th>来源会议</th>}<th>项目</th><th>操作</th></tr></thead><tbody>{items.map(task=><TaskRow key={task.id} {...{task,global,projects:data.projects,people,archived:data.archivedTaskPeople,today,onPatch,onRosterChange,onToggle,onMeeting,onDelete}}/>)}</tbody></table>{!items.length&&<p className="empty">没有符合条件的任务</p>}</div>
}
