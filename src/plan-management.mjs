const fields=['title','startsAt','project','agenda','link','captureMode','live','status','remindAt','meetingId','deletedAt'];
export function planVersion(plan){return JSON.stringify(fields.map(key=>plan?.[key]??null))}
function currentPlan(data,id,expected){const plan=data.plans?.find(p=>p.id===id);if(!plan||plan.deletedAt)throw Error('会议安排已删除，请关闭后重新查看');if(expected&&planVersion(plan)!==expected)throw Error('会议安排已更新，请关闭后重新打开，避免覆盖其他修改');return plan}
export function savePlan(data,draft,expected){
 const previous=draft.id?currentPlan(data,draft.id,expected):null;if(previous?.status==='已开始')throw Error('该安排已开始记录，不能重新安排；可编辑对应会议记录');
 if(typeof draft.title!=='string'||!draft.title.trim()||draft.title.trim().length>200)throw Error('请填写 1 至 200 字的会议名称');
 if(typeof draft.startsAt!=='string'||!Number.isFinite(Date.parse(draft.startsAt)))throw Error('请填写有效的会议日期和时间');
 if(!data.projects.some(p=>p.id===draft.project))throw Error('所属项目已不存在，请重新选择');
 if(typeof draft.agenda!=='string'||draft.agenda.length>20000)throw Error('议题内容过长');
 if(draft.link&&(typeof draft.link!=='string'||draft.link.length>4000||!/^https?:\/\//i.test(draft.link)))throw Error('会议链接须以 http:// 或 https:// 开头');
 if(!['microphone','system-microphone'].includes(draft.captureMode))throw Error('请选择有效采集方式');
 const startsAt=new Date(draft.startsAt).toISOString(),changedTime=previous&&Date.parse(previous.startsAt)!==Date.parse(startsAt);
 const plan={...previous,id:previous?.id||crypto.randomUUID(),title:draft.title.trim(),startsAt,project:draft.project,agenda:draft.agenda,link:draft.link||'',captureMode:draft.captureMode,live:draft.live!==false,status:!previous||changedTime||previous.status==='提醒中'?'已安排':previous.status,lastError:''};
 if(!previous||changedTime||previous.status==='提醒中')plan.remindAt=startsAt;
 if(previous&&previous.title!==plan.title)plan.autoTitle=false;
 if(previous?.source==='system-calendar')plan.localOverride=true;
 data.plans||=[];const index=data.plans.findIndex(p=>p.id===plan.id);if(index<0)data.plans.push(plan);else data.plans[index]=plan;return plan;
}
export function deletePlan(data,id,expected,now=new Date()){
 const plan=currentPlan(data,id,expected);plan.deletedStatus=plan.status;plan.deletedAt=now.toISOString();plan.status='已取消';plan.lastError='';return {id,deletedAt:plan.deletedAt};
}
export function restorePlan(data,token){const plan=data.plans?.find(p=>p.id===token.id);if(!plan?.deletedAt||plan.deletedAt!==token.deletedAt)throw Error('该安排已发生变化，无法撤销');plan.status=plan.deletedStatus==='提醒中'?'待确认':plan.deletedStatus||'已安排';delete plan.deletedAt;delete plan.deletedStatus;return plan}
