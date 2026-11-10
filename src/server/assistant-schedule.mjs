import {randomUUID} from 'node:crypto';
const zone='Asia/Shanghai';
export function scheduleTime(text,now=new Date()){
 if(typeof text!=='string'||!text.trim()||text.length>100)throw Error('请说明会议的日期和时间');text=text.trim();let time;
 if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(text)){const [y,m,d]=text.slice(0,10).split('-').map(Number);if(new Date(Date.UTC(y,m-1,d)).toISOString().slice(0,10)!==text.slice(0,10)||Number(text.slice(11,13))>23)throw Error('日期或时间不存在');time=new Date(text)}
 else{
  const day=new Intl.DateTimeFormat('sv-SE',{timeZone:zone}).format(now),base=new Date(day+'T00:00:00Z');let date;
  const relative=text.match(/^(今天|明天|后天)/),absolute=text.match(/^(\d{4})[-年/](\d{1,2})[-月/](\d{1,2})日?/);
  if(relative){base.setUTCDate(base.getUTCDate()+({今天:0,明天:1,后天:2})[relative[1]]);date=base.toISOString().slice(0,10);text=text.slice(relative[0].length)}
  else if(absolute){date=[absolute[1],absolute[2].padStart(2,'0'),absolute[3].padStart(2,'0')].join('-');text=text.slice(absolute[0].length)}else throw Error('日期不明确，请说明哪一天，例如明天上午10:00');
  const match=text.trim().match(/^(上午|下午|晚上|中午|早上|凌晨)?\s*(\d{1,2})(?::|：|点|时)(\d{1,2})?(?:分)?$/);
  if(!match)throw Error('时间不明确，请使用上午10:00或下午3点这样的时间');let hour=Number(match[2]),minute=Number(match[3]||0);if(minute>59||hour>23||['上午','早上','凌晨'].includes(match[1])&&hour>12)throw Error('会议时间无效');if(['下午','晚上'].includes(match[1])&&hour<12)hour+=12;if(match[1]==='中午'&&hour<11)hour+=12;if(['上午','早上','晚上'].includes(match[1])&&hour===12)throw Error('12点含义不明确，请说明中午12:00或凌晨00:00');if(match[1]==='凌晨'&&hour===12)hour=0;
  time=new Date(`${date}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00+08:00`);
  if(!Number.isFinite(time.getTime())||new Intl.DateTimeFormat('sv-SE',{timeZone:zone}).format(time)!==date)throw Error('日期不存在');
 }
 if(!Number.isFinite(time.getTime())||time<=now)throw Error('该时间已经过去或日期无效，请说明一个未来时间');return time.toISOString()
}
export async function manageSchedule(storage,args,now=new Date()){
 const state=await storage.read();if(!state.ready)throw Error('请先选择会议资料位置');const action=args.action||'list';
 const display=p=>({...p,localTime:new Intl.DateTimeFormat('sv-SE',{timeZone:zone,dateStyle:'short',timeStyle:'short'}).format(new Date(p.startsAt))});
 if(action==='list'){const offset=args.offset??0,limit=args.limit??30;if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>50)throw Error('安排分页无效');const plans=(state.data.plans||[]).filter(p=>!p.deletedAt&&p.status!=='已取消').sort((a,b)=>a.startsAt.localeCompare(b.startsAt));return {now:now.toISOString(),timeZone:zone,revision:state.revision,projects:state.data.projects,total:plans.length,nextOffset:offset+limit<plans.length?offset+limit:null,plans:plans.slice(offset,offset+limit).map(display)}};
 if(!['create','update','cancel'].includes(action))throw Error('会议安排操作无效');
 if(action!=='create'&&args.revision!==state.revision)throw Error('会议安排已更新，请先重新读取安排，再确认修改');
 const project=args.project?state.data.projects.find(p=>p.id===args.project||p.name===args.project):state.data.projects.find(p=>p.id==='default');if(!project)throw Error('项目不存在，请先读取项目列表');
 const startsAt=args.when?scheduleTime(args.when,now):null;if(action==='create'&&!startsAt)throw Error('请说明会议日期和时间');
 if(args.title!==undefined&&(typeof args.title!=='string'||!args.title.trim()||args.title.length>200))throw Error('会议名称无效');if(args.agenda!==undefined&&(typeof args.agenda!=='string'||args.agenda.length>20000))throw Error('议程过长或无效');
 const next=structuredClone(state.data);next.plans||=[];let plan;
 if(action==='create'){
  const title=args.title?.trim()||'会议';plan=next.plans.find(p=>p.title===title&&p.startsAt===startsAt&&p.project===project.id&&p.status!=='已取消');if(plan)return {saved:true,alreadyExists:true,plan:display(plan),timeZone:zone};
  plan={id:randomUUID(),title,startsAt,project:project.id,agenda:args.agenda||'',status:'已安排',live:true,captureMode:'system-microphone',createdBy:'meeting-assistant',autoTitle:title==='会议'};next.plans.push(plan);
 }else{
  plan=next.plans.find(p=>p.id===args.planId&&!p.deletedAt);if(!plan)throw Error('没有找到该会议安排，请先读取列表');if(['已开始','提醒中'].includes(plan.status))throw Error('该会议已开始或正在提醒，请在会议安排页操作');
  if(action==='cancel')plan.status='已取消';else{if(startsAt){plan.startsAt=startsAt;delete plan.remindAt;plan.status='已安排'}if(args.title){plan.title=args.title.trim();plan.autoTitle=plan.title==='会议'}if(args.agenda!==undefined)plan.agenda=args.agenda;if(args.project)plan.project=project.id;if(plan.source==='system-calendar')plan.localOverride=true}
 }
 await storage.write(next,state.revision);return {saved:true,action,plan:display(plan),timeZone:zone,notice:action==='cancel'?'已取消会议安排，未删除会议记录或录音。':'已保存到本地会议安排；提醒只询问是否录制，不会自动开始录音。'}
}
