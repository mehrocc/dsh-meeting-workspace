import {allTasks} from './model.mjs';
export function dashboardItems(data,project=''){
 const pendingPlans=(data.plans||[]).filter(p=>!p.deletedAt&&['已安排','提醒中','待确认'].includes(p.status)&&(!project||p.project===project)).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const pendingTasks=allTasks(data).filter(t=>!t.done&&(!project||t.project===project)).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')||a.title.localeCompare(b.title));
 return {plans:pendingPlans,planCount:pendingPlans.length,tasks:pendingTasks,taskCount:pendingTasks.length};
}
