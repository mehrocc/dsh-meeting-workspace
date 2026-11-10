export function taskOwners(task){return Array.isArray(task.owners)?[...task.owners]:task.owner?.trim()?[task.owner.trim()]:[]}
export function peopleFor(data,{assignableOnly=false}={}){
 const archived=new Set(data.archivedTaskPeople);
 return [...new Set([...(data.taskPeople||[]),...data.meetings.flatMap(m=>m.tasks.flatMap(taskOwners))])]
  .filter(name=>!assignableOnly||!archived.has(name))
  .sort((a,b)=>a.localeCompare(b,'zh-CN'));
}

export function setTaskPersonAvailable(data,name,available){
 if(!validPerson(name))throw Error('负责人姓名无效');
 const archived=new Set(data.archivedTaskPeople),people=new Set(data.taskPeople);
 if(available){archived.delete(name);people.add(name);}
 else{people.delete(name);archived.add(name);}
 if(archived.size>1000||people.size>1000)throw Error('负责人名单已达 1000 人上限');
 data.taskPeople=[...people];
 data.archivedTaskPeople=[...archived];
}
export function validPerson(name){return typeof name==='string'&&name.trim()===name&&!!name&&name.length<=80&&!/[\r\n\t]/.test(name)}
export function validTaskDate(value){if(value==='')return true;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value+'T12:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value&&Number(value.slice(0,4))>=1000}
export function patchTask(data,meetingId,taskId,patch,expected={}){
 const meeting=data.meetings.find(m=>m.id===meetingId),task=meeting?.tasks.find(t=>t.id===taskId);if(!task)throw Error('任务已删除，请重新加载');
 const allowed=['title','owners','due','project','done'];if(!patch||!Object.keys(patch).length||Object.keys(patch).some(k=>!allowed.includes(k)))throw Error('任务修改字段无效');
 const current=k=>k==='owners'?taskOwners(task):k==='project'?(task.project||meeting.project):task[k];
 for(const [key,value] of Object.entries(expected))if(JSON.stringify(current(key))!==JSON.stringify(value))throw Error('该内容已在其他窗口修改，请重新核对后保存');
 if('title'in patch&&(typeof patch.title!=='string'||!patch.title.trim()||patch.title.trim().length>1000))throw Error('请输入 1 至 1000 字的任务内容');
 if('owners'in patch&&(!Array.isArray(patch.owners)||patch.owners.length>30||patch.owners.some(n=>!validPerson(n))||new Set(patch.owners).size!==patch.owners.length))throw Error('请选择有效负责人，每项任务最多 30 人');
 if('due'in patch&&!validTaskDate(patch.due))throw Error('请选择有效截止日期');
 if('project'in patch&&!data.projects.some(p=>p.id===patch.project))throw Error('项目已不存在，请重新选择');
 if('done'in patch&&typeof patch.done!=='boolean')throw Error('任务状态无效');
 if('title'in patch)task.title=patch.title.trim();
 if('owners'in patch){
  const archived=new Set(data.archivedTaskPeople);
  const people=new Set([...(data.taskPeople||[]),...patch.owners.filter(name=>!archived.has(name))]);
  if(people.size>1000)throw Error('负责人名单已达 1000 人上限');
  task.owners=[...patch.owners];task.owner=patch.owners.join('、');data.taskPeople=[...people];
 }
 for(const key of ['due','project','done'])if(key in patch)task[key]=patch[key];
 return task;
}
export function removeProject(data,id){if(id==='default')throw Error('未分类项目不能删除');for(const m of data.meetings){if(m.project===id)m.project='default';for(const task of m.tasks)if(task.project===id)task.project='default'}for(const plan of data.plans||[])if(plan.project===id)plan.project='default';if(data.meetingDetection?.project===id)data.meetingDetection.project='default';if(data.calendarConfig?.project===id)data.calendarConfig.project='default';data.projects=data.projects.filter(p=>p.id!==id)}
