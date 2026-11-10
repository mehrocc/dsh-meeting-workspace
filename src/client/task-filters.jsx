import React,{useEffect,useId,useRef,useState} from 'react';
import {AnchoredPopover} from './anchored-popover.jsx';

function TaskFilter({label,ariaLabel,value,onChange,options,active}){
 const [open,setOpen]=useState(false),[index,setIndex]=useState(0);
 const anchor=useRef(null),list=useRef(null),id=useId();
 const selectedIndex=Math.max(0,options.findIndex(([key])=>key===value));
 const currentIndex=Math.min(index,options.length-1);
 const title=options[selectedIndex][1];

 useEffect(()=>{
  if(!open)return;
  const frame=requestAnimationFrame(()=>list.current?.focus({preventScroll:true}));
  return()=>cancelAnimationFrame(frame);
 },[open]);
 useEffect(()=>{
  if(open)list.current?.children[currentIndex]?.scrollIntoView({block:'nearest'});
 },[open,currentIndex]);

 function show(){
  setIndex(selectedIndex);
  setOpen(true);
 }
 function choose(key){
  onChange(key);
  setOpen(false);
  anchor.current?.focus();
 }
 function move(event){
  if(event.key==='Tab'){
   setOpen(false);
   anchor.current?.focus();
   return;
  }
  if(event.key==='ArrowDown')setIndex(Math.min(currentIndex+1,options.length-1));
  else if(event.key==='ArrowUp')setIndex(Math.max(currentIndex-1,0));
  else if(event.key==='Home')setIndex(0);
  else if(event.key==='End')setIndex(options.length-1);
  else if(event.key==='Enter'||event.key===' ')choose(options[currentIndex][0]);
  else return;
  event.preventDefault();
 }

 return <>
  <button ref={anchor} type="button" className={'mw-task-filter'+(active?' is-active':'')}
   aria-label={ariaLabel+'：'+title} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?id:undefined}
   title={title} onClick={()=>open?setOpen(false):show()}
   onKeyDown={event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();show();}
   }}>
   <span className="mw-task-filter-label">{label}</span>
   <span className="mw-task-filter-value">{title}</span>
   <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
  {open&&<AnchoredPopover anchor={anchor} onClose={()=>setOpen(false)} role="presentation"
   width={Math.max(196,anchor.current?.offsetWidth||0)} preferredHeight={Math.min(250,options.length*34+12)} className="mw-task-filter-menu">
   <div ref={list} id={id} className="mw-task-filter-options" role="listbox" aria-label={ariaLabel}
    aria-activedescendant={id+'-'+currentIndex} tabIndex={0} onKeyDown={move}>
    {options.map(([key,name],position)=><button key={key} id={id+'-'+position} type="button" role="option" tabIndex={-1}
     aria-selected={key===value} className={currentIndex===position?'is-focused':''} onClick={()=>choose(key)}>
     <span>{name}</span>
     {key===value&&<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>)}
   </div>
  </AnchoredPopover>}
 </>;
}

export function TaskFilters({projects,people,filter,project,owner,due,sort,onFilter,onProject,onOwner,onDue,onSort,onReset}){
 const modified=filter!=='open'||!!project||!!owner||due!=='all'||sort!=='date';
 return <div className="mw-task-filters" role="group" aria-label="筛选和排序任务">
  <div className="mw-task-filter-controls">
   <TaskFilter label="状态" ariaLabel="任务完成状态" value={filter} onChange={onFilter} active={filter!=='open'}
    options={[['open','待完成'],['done','已完成'],['all','全部任务']]}/>
   <TaskFilter label="项目" ariaLabel="任务项目筛选" value={project} onChange={onProject} active={!!project}
    options={[['','全部项目'],...projects.map(p=>[p.id,p.name])]}/>
   <TaskFilter label="负责人" ariaLabel="负责人筛选" value={owner} onChange={onOwner} active={!!owner}
    options={[['','全部负责人'],...people.map(name=>[name,name])]}/>
   <TaskFilter label="截止日期" ariaLabel="截止日期筛选" value={due} onChange={onDue} active={due!=='all'}
    options={[['all','不限日期'],['overdue','已逾期'],['week','未来 7 天'],['unset','未设截止日期']]}/>
   <TaskFilter label="排序" ariaLabel="任务排序" value={sort} onChange={onSort} active={sort!=='date'}
    options={[['date','截止日期'],['title','任务名称']]}/>
  </div>
  {modified&&<button className="link mw-task-filter-reset" type="button" onClick={onReset}>重置筛选</button>}
 </div>;
}
