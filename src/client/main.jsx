import {WorkspaceIcon} from './workspace-icon.jsx';
import {TranscriptRows,TranscriptTimeline} from './transcript-timeline.jsx';
import {needsSpeakerAnalysis,editTimeline,editableTimeline} from '../transcript-timeline.mjs';
import {FeishuMinutesImport} from './feishu-minutes-import.jsx';
import {saveMinutesMeeting} from '../feishu-minutes.mjs';
import {minutesFile} from '../minutes-export.mjs';
import {MeetingSummary,SummaryText} from './meeting-summary.jsx';
import React,{useState,useEffect,useRef,useSyncExternalStore} from 'react';
import css from './style.css';
import {scopeKey,scopeBinding,scopeFromBinding,selectedMeetings} from '../assistant-context.mjs';
import {TaskFilters} from './task-filters.jsx';
import {TaskTable,PeoplePicker} from './task-table.jsx';
import {patchTask,taskOwners,peopleFor,removeProject,setTaskPersonAvailable} from '../task-editing.mjs';
import assistantTheme from './assistant-theme.css';
import {emptyData,createMeeting,meetingTranscript,parseTranscript,validateData,allTasks,meetingAudio,taskMatchesDue,duplicateTranscript} from '../model.mjs';
import {removeMeetings,transcriptArchive} from '../bulk-meetings.mjs';
import {resolveRecordingModel} from './recording-mode.mjs';
import {BrowserRecorder,speechWav,speechParts} from './recorder.mjs';
import {NativeRecorder} from './native-recorder.mjs';
import {MeetingPlanEditor} from './meeting-plan-editor.jsx';
import {restorePlan} from '../plan-management.mjs';
import {MeetingPreparation} from './meeting-preparation.jsx';
import {AssistantPanel} from './assistant-panel.jsx';
import {Dashboard} from './dashboard.jsx';
import {MeetingDetectionSettings} from './meeting-detection-settings.jsx';
import {StorageManagement} from './storage-management.jsx';
import {MeetingRecords} from './meeting-records.jsx';
import {workbenchService} from './workbench-service.mjs';
import {SpeechConfiguration,RecordingModelInfo} from './speech-configuration.jsx';
const API='/api/meeting-workspace';
const today=()=>new Date().toLocaleDateString('sv-SE');
const captureBadges=new Set(['准备录音','录制中','录音中','暂停中','录音中断','录音启动失败']);
const time=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
async function request(path,body,opts={}){const response=await fetch(API+path,{cache:'no-store',...opts,...(body!==undefined?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const result=await response.json();if(!response.ok)throw Object.assign(Error(result.error||`请求失败 ${response.status}`),{status:response.status});return result}
function download(value,name,type='application/json'){const a=document.createElement('a');a.href=URL.createObjectURL(value instanceof Blob?value:new Blob([value],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function Modal({title,children,onClose,onSave,saveLabel='保存',busy=false,error=''}){return <div className="mw-overlay" data-dsh-no-drag><form className="mw-dialog" role="dialog" aria-modal="true" aria-label={title} onSubmit={e=>{e.preventDefault();onSave?.(new FormData(e.currentTarget))}}><header><h2>{title}</h2><button type="button" aria-label="关闭" disabled={busy} onClick={onClose}>×</button></header>{children}{error&&<p role="alert" className="mw-capture-warning">{error}</p>}<footer><button type="button" disabled={busy} onClick={onClose}>取消</button>{onSave&&<button className="primary" disabled={busy}>{busy?'处理中…':saveLabel}</button>}</footer></form></div>}
export function MeetingWorkspace({service,entry,conversation,active=true,host}){
 const [snapshot,setSnapshot]=useState({ready:false,data:emptyData(),revision:0,capabilities:{}}),ref=useRef(snapshot);const data=snapshot.data;
 const [tab,setTab]=useState('meetings'),[selected,setSelected]=useState(''),[search,setSearch]=useState(''),[project,setProject]=useState(''),[taskFilter,setTaskFilter]=useState('open'),[owner,setOwner]=useState(''),[sort,setSort]=useState('date'),[taskDue,setTaskDue]=useState('all'),[detailTab,setDetailTab]=useState('notes'),[highlight,setHighlight]=useState(null),[modal,setModal]=useState(null),[draft,setDraft]=useState({}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[conversationOpen,setConversationOpen]=useState(false),[recording,setRecording]=useState(null),[recState,setRecState]=useState({seconds:0}),[playURL,setPlayURL]=useState(''),[newProject,setNewProject]=useState(null);
 const [sourceHit,setSourceHit]=useState('');
 const [planToManage,setPlanToManage]=useState(null),[deletedPlan,setDeletedPlan]=useState(null);
 const [createPlan,setCreatePlan]=useState(false),[taskProject,setTaskProject]=useState('');
 const [assistantOpening,setAssistantOpening]=useState(false),[assistantSources,setAssistantSources]=useState([]);
 const assistantTicket=useRef(0),assistantActive=useRef(active),assistantTrigger=useRef(null);
 assistantActive.current=active;
 const [picked,setPicked]=useState([]),[exportFormat,setExportFormat]=useState('txt');
 const contentRef=useRef(null);
 const saveQueue=useRef(Promise.resolve()),recorder=useRef(null),recordId=useRef(null),recordLines=useRef([]),finalBlob=useRef(null),nativeFinishing=useRef(false),anchorRefs=useRef({});
 useSyncExternalStore(service.subscribe,service.getSnapshot,()=>null);
 const currentSession=useSyncExternalStore(service.subscribeSessions,service.currentSession,()=>null);
 const hostSession=active?currentSession:null;
 const chatSession=hostSession&&service.ownsSession(hostSession)?hostSession:null;
 const assistantBinding=data.assistant?.['session:'+chatSession]||Object.values(data.assistant||{}).find(value=>value?.sessionId===chatSession);
 const assistantScope=scopeFromBinding(assistantBinding);
 const setState=s=>{ref.current=s;setSnapshot(s)};
 const refresh=async()=>setState(await request('/state'));
 useEffect(()=>{refresh().catch(e=>setError(e.message));return()=>{recorder.current?.dispose();if(playURL)URL.revokeObjectURL(playURL)}},[]);
 useEffect(()=>{contentRef.current?.scrollTo({top:0,left:0})},[tab,selected]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(t)},[notice]);
 useEffect(()=>{const before=e=>{if(recordId.current&&!recorder.current?.isNative){e.preventDefault();e.returnValue='录音尚未保存'}};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before)},[]);

 useEffect(()=>{const activeCapture=snapshot.nativeCaptures?.[0];if(!activeCapture||recordId.current)return;const meeting=snapshot.data.meetings.find(m=>m.id===activeCapture.meetingId);if(!meeting)return;recordId.current=meeting.id;recordLines.current=[...meeting.transcript];const engine=new NativeRecorder({meetingId:meeting.id,language:activeCapture.language,captureMode:activeCapture.captureMode,onState:setRecState,onTranscript:row=>{if(!recordLines.current.some(r=>r.id===row.id))recordLines.current.push(row);refresh().catch(e=>setError(e.message))}});recorder.current=engine;setRecording({id:meeting.id,title:meeting.title,live:activeCapture.live,captureMode:activeCapture.captureMode,native:true,asrModel:activeCapture.asrModel});engine.attach(activeCapture.id).catch(e=>setError(e.message))},[snapshot.nativeCaptures?.[0]?.id]);
 useEffect(()=>{if(!snapshot.ready)return;const timer=setInterval(()=>refresh().catch(()=>{}),5000);return()=>clearInterval(timer)},[snapshot.ready]);
 const run=async fn=>{setError('');setBusy(true);try{return await fn()}catch(e){setError(e.message)}finally{setBusy(false)}};
 const commit=change=>{const pending=saveQueue.current.then(async()=>{for(let attempt=0;attempt<2;attempt++){const next=structuredClone(ref.current.data);change(next);validateData(next);const response=await fetch(API+'/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:ref.current.revision,data:next})});const result=await response.json();if(response.status===409&&attempt===0){await refresh();continue}if(!response.ok)throw Error(result.error||'保存失败');setState(result);return result}});saveQueue.current=pending.catch(()=>{});return pending};
 const updateMeeting=(id,change)=>commit(d=>{const m=d.meetings.find(m=>m.id===id);if(!m)throw Error('来源会议不存在');change(m)});
 const m=data.meetings.find(x=>x.id===selected);
 const pname=id=>data.projects.find(p=>p.id===id)?.name||'未分类';
 const ready=async()=>{if(ref.current.ready)return true;const path=await host.pickDirectory();if(!path)return false;setState(await request('/location',{path}));return true};
 const openModal=(kind,values={})=>{setNewProject(null);setDraft(values);setModal(kind)};
 const chooseLocation=()=>run(async()=>{if(recording)throw Error('请先结束录音再更换资料位置');const path=await host.pickDirectory();if(path)setState(await request('/location',{path}))});
 const goto=id=>{setPicked([]);setSelected(id);setTab('records');setDetailTab('notes');setHighlight(null);setSourceHit('');setPlayURL('')};
 const locate=index=>{setSourceHit('');setHighlight(index);setDetailTab(value=>value==='full'?'notes':value);};
 const editMeeting=()=>openModal('meeting',{...m,participants:m.participants.join('、')});
 const openImport=()=>run(async()=>{if(!await ready())return;openModal('import',{title:'',project:(tab==='records'&&project)||'default',date:today(),text:'',file:null})});
 async function importFile(file){if(!file)return;if(file.size>25*1024*1024){setError('单个文件上限 25 MB');return}if(/\.(txt|md|srt|vtt)$/i.test(file.name)){const text=await file.text();setDraft(d=>({...d,file:null,text,title:d.title||file.name.replace(/\.[^.]+$/,'')}))}else if(/^(audio|video)\//.test(file.type)||/\.(wav|mp3|m4a|mp4|webm|caf|mov)$/i.test(file.name)){setDraft(d=>({...d,file,title:d.title||file.name.replace(/\.[^.]+$/,'')}))}else{setError('请选择 TXT、Markdown、SRT、VTT 或音视频文件')}}
 async function uploadAudio(id,blob,name){const response=await fetch(API+`/audio?meeting=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`,{method:'POST',headers:{'Content-Type':blob.type||'application/octet-stream'},body:blob});const result=await response.json();if(!response.ok)throw Error(result.error||'音频保存失败');return result}
 async function transcribe(blob,ext='wav',language='auto'){const parts=await speechParts(await speechWav(blob)),results=[];for(const part of parts){const response=await fetch(API+`/transcribe?language=${language}`,{method:'POST',headers:{'Content-Type':'audio/wav'},body:part});const result=await response.json();if(!response.ok)throw Error(result.error||'转写失败');if(typeof result.text!=='string')throw Error('语音模型未返回有效文字');results.push(result.text)}return results.join('\n')}
 async function organizeMeeting(id){await request('/organize',{meetingId:id});await refresh();setNotice('会议已保存，AI 正在整理')}

 const ensureRecordingMode=(live,id)=>resolveRecordingModel({live,id,readModels:()=>request('/asr/models'),prepare:async model=>{setNotice('正在准备本地转写，请稍候…');const result=await request('/asr/models',{action:'prepare',id:model});if(result.restartRequired)throw Error('语音输入已启用，请重启 Harness 后准备模型')}});
 async function saveModal(form){const values={...draft,...Object.fromEntries(form?.entries?.()||[])};await run(async()=>{
  if(modal==='project'){const name=values.name?.trim();if(!name)throw Error('请输入项目名称');const projectId=values.id||crypto.randomUUID();await commit(d=>{if(d.projects.some(p=>p.name===name&&p.id!==values.id))throw Error('已存在同名项目');if(values.id)d.projects.find(p=>p.id===values.id).name=name;else d.projects.push({id:projectId,name})});if(values.returnToRecords){setProject(projectId);setModal(null)}else setModal('projects');return}
  if(modal==='meeting'){if(!values.title?.trim())throw Error('请输入会议名称');await updateMeeting(values.id,item=>{item.title=values.title.trim();item.autoTitle=false;item.project=values.project;item.date=values.date;item.participants=values.participants.split(/[、,，]/).map(s=>s.trim()).filter(Boolean)});setModal(null);return}
  if(modal==='import'&&values.importMode==='minutes'){
   if(!values.minutesPreview)throw Error('请先读取飞书妙记');
   const title=values.minutesTitle.trim();
   if(!title)throw Error('请输入会议名称');
   const id=crypto.randomUUID();
   let result;
   await commit(data=>{
    result=saveMinutesMeeting(data,values.minutesPreview,{title,project:values.project,date:values.minutesDate},id);
   });
   goto(result.id);setModal(null);
   if(result.duplicate){setNotice('这条妙记已导入，已打开原会议');return;}
   await organizeMeeting(result.id);
   return;
  }
  if(modal==='import'){if(!values.title?.trim())throw Error('请输入会议名称');if(!values.text?.trim()&&!values.file)throw Error('请选择文件或粘贴逐字稿');const item=createMeeting(values.title,values.project,values.text,values.date);item.source=values.file?'音视频导入':'逐字稿导入';const existing=!values.file&&duplicateTranscript(ref.current.data,item);if(existing){goto(existing.id);setModal(null);setNotice('这份逐字稿已经导入，已打开原会议');return}await commit(d=>d.meetings.unshift(item));goto(item.id);if(values.file){const file=values.file;const audio=await uploadAudio(item.id,file,file.name);await updateMeeting(item.id,x=>{x.audio.push(audio);x.status='待转写'});setModal(null);if(snapshot.capabilities.asrConfigured){try{const text=await transcribe(file,file.name.split('.').at(-1));if(!text.trim())throw Error('本次未识别出逐字稿，可保存原音后更换模型重试');await updateMeeting(item.id,x=>{x.transcript=parseTranscript(text);x.status='待整理';x.aiStatus='等待整理'})}catch(e){throw Error('原始文件已保存，'+e.message)}await organizeMeeting(item.id)}else setNotice('原始文件已保存；尚未配置本地转写服务，可稍后转写');return}setModal(null);await organizeMeeting(item.id);return}
  if(modal==='task'){await commit(d=>{const meeting=d.meetings.find(m=>m.id===values.meetingId);if(!meeting)throw Error('来源会议不存在');let task=meeting.tasks.find(t=>t.id===values.id);if(!task){task={id:values.id||crypto.randomUUID(),title:'新任务',owner:'',due:'',done:false,ref:null};meeting.tasks.push(task)}patchTask(d,meeting.id,task.id,{title:values.title,owners:values.owners||taskOwners(values),due:values.due||'',project:values.project||meeting.project,done:!!values.done});task.ref=values.ref===''||values.ref==null?null:Number(values.ref)});setModal(null);return}
  if(modal==='transcript'){
   let legacy=false;
   await updateMeeting(selected,meeting=>{
    const rows=editTimeline(values.text,meetingTranscript(meeting));
    legacy=!!meeting.speakerTranscript?.length;
    if(legacy)meeting.speakerTranscript=rows;
    else {
     meeting.transcript=rows;meeting.summaryDiagram=null;
     meeting.decisions=meeting.decisions.map(d=>({...d,ref:null}));
     meeting.tasks=meeting.tasks.map(t=>({...t,ref:null}));
    }
    meeting.speakerAutoAttempted=true;
   });
   setNotice(legacy?'逐字稿已保存':'逐字稿已保存，旧引用已解除，请重新核对关联');
   setModal(null);if(!m?.summary)await organizeMeeting(selected);return;
  }
  if(modal==='record'){
   const native=!!ref.current.capabilities.systemAudio;
   if(native&&!ref.current.capabilities.systemAudio)throw Error('当前宿主尚未加载电脑声音采集组件');
   const choice=await ensureRecordingMode(values.live).catch(e=>{throw Error('本次未开始录音：'+e.message)});
   const {live,asrModel}=choice,language=choice.language||values.language||'auto';
   const item=createMeeting(values.title?.trim()||'会议 · '+today(),values.project);item.autoTitle=!values.title?.trim();item.asrModel=asrModel;item.status='准备录音';item.source=native?(values.captureMode==='microphone'?'麦克风':'电脑声音＋麦克风'):'浏览器麦克风';
   await commit(d=>d.meetings.unshift(item));goto(item.id);
   const onTranscript=row=>{const index=recordLines.current.findIndex(r=>r.id===row.id);if(index<0)recordLines.current.push(row);else recordLines.current[index]=row;if(native)refresh().catch(e=>setError(e.message));else updateMeeting(item.id,x=>{x.transcript=[...recordLines.current]}).catch(e=>setError(e.message))};
   const engine=native?new NativeRecorder({meetingId:item.id,onState:setRecState,onTranscript,captureMode:values.captureMode,language,expectedModel:asrModel}):new BrowserRecorder({onState:setRecState,onTranscript,transcribe:blob=>transcribe(blob,'wav',language),language});
   recorder.current=engine;recordLines.current=[];recordId.current=item.id;finalBlob.current=null;
   try{await engine.start(live);if(native)await refresh();setRecording({id:item.id,title:item.title,language,captureMode:values.captureMode,live,native,asrModel});if(!native)await updateMeeting(item.id,x=>x.status='录制中');setModal(null)}catch(e){recordId.current=null;recorder.current=null;await refresh();await updateMeeting(item.id,x=>x.status='录音启动失败');throw Error('录音未开始：'+e.message)}return
  }
 })}
 async function stopRecording(){await run(async()=>{const id=recordId.current;if(!id)return;
  if(recorder.current?.isNative){nativeFinishing.current=true;try{const result=await recorder.current.stop();await refresh();recordId.current=null;recorder.current=null;setRecording(null);if(result.error)setError(result.error);else if(result.warnings)setNotice('录音已保存，部分逐字稿需补转');else setNotice(result.live?'双路录音已保存，请核对逐字稿':'双路录音已保存');}finally{nativeFinishing.current=false};return}
  const blob=finalBlob.current||await recorder.current.stop();finalBlob.current=blob;if(blob.size>25*1024*1024)throw Error('录音超过 25 MB，请先下载本机音频；分段后导入保存');const audio=await uploadAudio(id,blob,'会议录音.'+(blob.type.includes('mp4')?'m4a':'webm'));await updateMeeting(id,x=>{x.audio.push(audio);x.duration=recorder.current.seconds;x.transcript=[...recordLines.current];x.status=x.transcript.length?'待整理':'待转写'});recordId.current=null;recorder.current=null;setRecording(null);setNotice(recordLines.current.length?'录音和逐字稿已保存':'录音已保存，本次尚未识别出逐字稿');if(!recordLines.current.length&&ref.current.capabilities.asrConfigured){
   await updateMeeting(id,x=>x.aiStatus='转写中');
   try{
    const text=await transcribe(blob);
    if(!text.trim())throw Error('本次未识别出文字');
    await updateMeeting(id,x=>{x.transcript=parseTranscript(text);x.status='待整理';x.aiStatus='等待整理'});
   }catch(error){
    await updateMeeting(id,x=>{x.aiStatus='待补转';x.aiError='原音已保存，自动转写未完成：'+error.message});
    return;
   }
  }
  await organizeMeeting(id)
 })}
 useEffect(()=>{if(recState.native&&recState.ended&&recording?.native&&!nativeFinishing.current){const id=recordId.current;recordId.current=null;recorder.current=null;setRecording(null);refresh().catch(e=>setError(e.message));setNotice('录音已结束并保存')}},[recState.ended,recording?.id]);
 const enableLive=()=>run(async()=>{await ensureRecordingMode(true,recording.asrModel);await recorder.current.enableTranscription();setRecording(r=>({...r,live:true}));setNotice('本场同步转写已开启')});
 const prepareSpeech=()=>run(async()=>{const state=await request('/asr/models',{action:'prepare',id:snapshot.capabilities.transcription?.selected});await refresh();setNotice(state.ready?'模型已就绪':state.restartRequired?'语音输入已启用，重启 Harness 后准备模型':'模型正在准备，请在设置查看进度')});
 const editPeopleRoster=(name,available)=>commit(d=>setTaskPersonAvailable(d,name,available));
 const editTaskCell=(t,patch,expected)=>commit(d=>patchTask(d,t.meetingId||selected,t.id,patch,expected));
 const toggleTask=t=>run(()=>editTaskCell(t,{done:!t.done},{done:t.done}));
 const taskEdit=t=>openModal('task',{...t,owners:taskOwners(t),project:t.project||data.meetings.find(m=>m.id===(t.meetingId||selected))?.project||'default',meetingId:t.meetingId||selected,ref:t.ref??''});
 async function generateTitle(){
  await run(async()=>{
   const previous=m.title,{title}=await request('/title',{transcript:m.transcript});
   await updateMeeting(m.id,x=>{if(x.title===previous&&x.autoTitle){x.title=title.trim();x.titleStatus='已生成'}});
  });
 }
 function exportMinutes(format){
  const item=ref.current.data.meetings.find(x=>x.id===draft.meetingId);
  if(!item){setError('会议已移除，无法导出');return}
  const file=minutesFile(item,pname(item.project),format);
  download(file.content,file.name,file.type);
  setModal(null);
 }


 async function openAssistant(fresh=false,desired=assistantScope,specificId){
  const ticket=++assistantTicket.current;
  setAssistantOpening(true);
  setError('');
  try{
   if(!await ready()||ticket!==assistantTicket.current||!assistantActive.current)return;
   const {capabilities,data,location}=ref.current;
   if(!capabilities.assistantAvailable)throw Error('会议检索服务尚未加载');
   if(!specificId)selectedMeetings(data,desired);
   const key=scopeKey(desired),saved=data.assistant?.[key]?.sessionId;
   const previous=specificId||(!fresh&&saved&&service.ownsSession(saved)?saved:null);
   if(specificId&&!service.ownsSession(specificId))throw Error('该对话不属于会议工作台');
   const sessionId=previous?await service.ensureSession({sessionId:previous}):await service.ensureSession({folder:location});
   if(!sessionId||ticket!==assistantTicket.current||!assistantActive.current)return;
   if(!service.ownsSession(sessionId))throw Error('对话归属尚未确认，请重试');
   await commit(next=>{
    if(ref.current.location!==location)throw Error('会议资料位置已改变，请重新打开对话');
    if(!specificId)selectedMeetings(next,desired);
    next.assistant||={};
    for(const [oldKey,old] of Object.entries(next.assistant)){
     if(old?.sessionId&&!oldKey.startsWith('session:'))next.assistant['session:'+old.sessionId]||={...old};
    }
    const value={sessionId,...scopeBinding(desired)};
    next.assistant[key]=value;
    next.assistant['session:'+sessionId]=value;
    next.assistant.recent=value;
   });
   return sessionId;
  }catch(e){if(ticket===assistantTicket.current)setError(e.message)}
  finally{if(ticket===assistantTicket.current)setAssistantOpening(false)}
 }
 function showAssistant(){
  setConversationOpen(true);
  if(chatSession||assistantOpening)return;
  const recent=data.assistant?.recent;
  if(recent?.sessionId&&service.ownsSession(recent.sessionId))openAssistant(false,scopeFromBinding(recent),recent.sessionId);
 }
 function hideAssistant(){
  setConversationOpen(false);
  requestAnimationFrame(()=>assistantTrigger.current?.focus());
 }
 useEffect(()=>{
  if(!active){assistantTicket.current++;setAssistantOpening(false)}
 },[active]);
 useEffect(()=>{
  setAssistantSources([]);
  if(!conversationOpen||!chatSession||!active)return;
  const controller=new AbortController();
  let reading=false;
  async function poll(){
   if(reading)return;
   reading=true;
   try{
    const value=await request('/assistant/sources?sessionId='+encodeURIComponent(chatSession),undefined,{signal:controller.signal});
    if(!controller.signal.aborted)setAssistantSources(value.sources||[]);
   }catch{}finally{reading=false}
  }
  poll();
  const timer=setInterval(poll,2000);
  return()=>{controller.abort();clearInterval(timer)};
 },[active,conversationOpen,chatSession,snapshot.location]);
 const openAssistantSource=source=>run(async()=>{await refresh();const meeting=ref.current.data.meetings.find(x=>x.id===source.meetingId);if(!meeting)throw Error('来源会议已删除');goto(meeting.id);if(source.paragraphId){const index=meeting.transcript.findIndex(r=>r.id===source.paragraphId);if(index<0){setNotice('原文已修改，请在会议中重新检索');return}setDetailTab('full');setTimeout(()=>locate(index),100)}});

 const showRecords=()=>{setSelected('');setSearch('');setProject('');setTab('records')};
 const resetTaskFilters=()=>{setTaskFilter('open');setTaskProject('');setOwner('');setTaskDue('all');setSort('date')};
 const showOpenTasks=()=>{setSearch('');resetTaskFilters();setTab('tasks')};
 const managePlan=id=>{const plan=ref.current.data.plans?.find(p=>p.id===id&&!p.deletedAt);if(plan)setPlanToManage(structuredClone(plan));else setError('会议安排已删除，请重新查看')};
 const startPlan=id=>run(async()=>{await request('/plans/start',{id,confirmed:true});await refresh();setTab('meetings')});
 const addTask=()=>{if(!data.meetings.length){setError('请先创建一场来源会议');return}taskEdit({title:'',owner:'',due:'',done:false,meetingId:data.meetings[0].id})};
 const rows=data.meetings.filter(x=>(tab!=='records'||!project||x.project===project)&&(!search||[x.title,x.summary,...meetingTranscript(x).map(r=>r.text)].join(' ').toLowerCase().includes(search.toLowerCase())));
 const protectedIds=()=>[recordId.current,...(ref.current.nativeCaptures||[]).map(x=>x.meetingId)].filter(Boolean);
 const protectedSet=new Set(protectedIds());
 const selectable=rows.filter(x=>!protectedSet.has(x.id));
 const chosen=selectable.filter(x=>picked.includes(x.id));
 const chosenIds=chosen.map(x=>x.id),allChosen=!!selectable.length&&chosen.length===selectable.length;
 useEffect(()=>setPicked([]),[search,project,tab]);
 useEffect(()=>{if(snapshot.ready&&project&&!data.projects.some(p=>p.id===project))setProject('')},[snapshot.ready,project,data.projects]);
 useEffect(()=>setPicked(previous=>{const valid=new Set(data.meetings.map(x=>x.id));return previous.every(id=>valid.has(id))?previous:previous.filter(id=>valid.has(id))}),[data.meetings]);
 const toggleMeeting=id=>setPicked(previous=>previous.includes(id)?previous.filter(x=>x!==id):[...previous,id]);
 const exportSelected=()=>run(async()=>{const result=transcriptArchive(ref.current.data,chosenIds,exportFormat);download(new Blob([result.bytes],{type:'application/zip'}),`会议逐字稿_${today()}_${result.count}场.zip`,'application/zip');setNotice(`已导出 ${result.count} 场会议逐字稿${result.skipped?`，跳过 ${result.skipped} 场无逐字稿会议`:''}`)});
 const taskPeople=peopleFor(data);
 useEffect(()=>{if(owner&&!taskPeople.includes(owner))setOwner('');},[owner,taskPeople]);
 const tasks=allTasks(data).filter(t=>(taskFilter==='all'||(taskFilter==='done'?t.done:!t.done))&&(!owner||taskOwners(t).includes(owner))&&(!taskProject||t.project===taskProject)&&taskMatchesDue(t,taskDue,today())&&(!search||[t.title,t.owner,t.meetingTitle].join().toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>sort==='date'?(a.due||'9999').localeCompare(b.due||'9999'):a.title.localeCompare(b.title));
 const field=(key,props={})=><input name={key} {...props} value={draft[key]??''} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>;
 const projectSelect=(value,change)=><div className="mw-project-picker"><div className="actions"><select aria-label="所属项目" value={value} onChange={e=>change(e.target.value)}>{data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><button type="button" onClick={()=>setNewProject('')}>＋ 新建项目</button></div>{newProject!==null&&<div className="actions"><input aria-label="新项目名称" placeholder="项目名称" maxLength={100} value={newProject} onChange={e=>setNewProject(e.target.value)}/><button type="button" disabled={busy||!newProject.trim()} onClick={()=>run(async()=>{const name=newProject.trim(),id=crypto.randomUUID();await commit(d=>{if(d.projects.some(p=>p.name===name))throw Error('已存在同名项目');d.projects.push({id,name})});change(id);setNewProject(null)})}>创建并选择</button><button type="button" onClick={()=>setNewProject(null)}>取消</button></div>}</div>;
 const taskRows=(items,global=false)=><TaskTable items={items.map(t=>({...t,meetingId:t.meetingId||selected,meetingTitle:t.meetingTitle||m?.title,project:t.project||m?.project||'default'}))} data={data} global={global} today={today()} onPatch={editTaskCell} onRosterChange={editPeopleRoster} onToggle={toggleTask} onMeeting={goto} onDelete={t=>openModal('deleteTask',t)}/>;
 const renderMeetingRows=(items,selection=true)=>items.map(item=><div className={'mw-meeting-row'+(chosenIds.includes(item.id)?' is-selected':'')} key={item.id}>
  {selection&&<label className="mw-meeting-pick" title={protectedSet.has(item.id)?'录音中，请先结束并保存':'选择 '+item.title}>
   <input className="mw-circle-check" type="checkbox" aria-label={'选择会议 '+item.title} checked={chosenIds.includes(item.id)}
    disabled={busy||protectedSet.has(item.id)} onChange={()=>toggleMeeting(item.id)}/>
  </label>}
  <button className="mw-meeting" onClick={()=>goto(item.id)}>
   <span className="mw-file-icon"><WorkspaceIcon name="document" size={18}/></span>
   <div className="mw-meeting-body">
    <h3>{item.title}</h3>
    <div className="mw-meeting-meta">
     <time dateTime={item.date}>{item.date}</time>
     {item.duration>0&&<span>{time(item.duration)}</span>}
     {!selection&&<span>{pname(item.project)}</span>}
     {item.participants.length>0&&<span className="mw-participants">{item.participants.join('、')}</span>}
    </div>
    {(item.summary||meetingTranscript(item)[0]?.text)&&<p>{item.summary||meetingTranscript(item)[0].text}</p>}
   </div>
   <span className="mw-meeting-end">
    {captureBadges.has(item.status)&&<span className="badge">{item.status}</span>}
    <WorkspaceIcon name="forward" size={15}/>
   </span>
  </button>
 </div>);
 const bulkToolbar=!!rows.length&&<div className="mw-bulk-toolbar"><label className="mw-select-all"><input className="mw-circle-check" type="checkbox" aria-label="全选当前列表" checked={allChosen} ref={el=>{if(el)el.indeterminate=chosen.length>0&&!allChosen}} disabled={busy||!selectable.length} onChange={()=>setPicked(allChosen?[]:selectable.map(x=>x.id))}/><span>{chosen.length?`已选 ${chosen.length} 场`:'全选'}</span></label>{!!chosen.length&&<div className="actions"><select aria-label="逐字稿导出格式" value={exportFormat} onChange={e=>setExportFormat(e.target.value)}><option value="txt">TXT</option><option value="md">Markdown</option></select><button disabled={busy} onClick={exportSelected}>导出逐字稿</button><button className="danger" disabled={busy} onClick={()=>openModal('deleteMeetings',{ids:chosenIds})}>批量删除</button><button className="link" disabled={busy} onClick={()=>setPicked([])}>取消选择</button></div>}</div>;
 const speakerBusy=snapshot.speakerJobs?.includes(m?.id);
 const canAutoAnalyze=tab==='records'&&!recording&&!snapshot.speakerJobs?.length&&needsSpeakerAnalysis(m);
 useEffect(()=>{
  if(!canAutoAnalyze)return;
  request('/speakers/auto',{meetingId:m.id}).then(result=>{if(result.started)return refresh();}).catch(()=>{});
 },[canAutoAnalyze,m?.id]);
 const timeline=m?meetingTranscript(m):[];
 const citation=m?.transcript[highlight];
 const activeSource=sourceHit||citation?.id;
 const savedExcerpt=citation&&!sourceHit&&!timeline.some(row=>row.id===citation.id)?citation:null;
 const sourceAnchor=(id,el)=>{anchorRefs.current[id]=el};
 useEffect(()=>{
  if(activeSource&&tab==='records'&&detailTab!=='full'){
   anchorRefs.current[activeSource]?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
 },[activeSource,detailTab,tab,m?.id,savedExcerpt?.id]);
 return <div className="meeting-workspace" data-testid="meeting-workspace"><div className="mw-popover-layer"/><style>{css+assistantTheme}</style><header className="mw-nav"><div role="tablist" aria-label="会议业务导航">{[['meetings','会议工作台'],['records','会议记录'],['prepare','会议安排'],['tasks','任务安排']].map(([id,title])=><button role="tab" aria-selected={tab===id} key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);if(id==='meetings'||id==='records')setSelected('')}}>{title}</button>)}</div><div className="mw-tools"><label className="mw-global-search"><WorkspaceIcon name="search" size={15}/><input aria-label="关键词搜索" placeholder="搜索会议、原文、任务…" value={search} onChange={e=>setSearch(e.target.value)}/></label><button ref={assistantTrigger} type="button" aria-controls="mw-meeting-assistant-panel" aria-expanded={conversationOpen} className={conversationOpen?'mw-assistant-active':''} onClick={conversationOpen?hideAssistant:showAssistant}>会议助手</button><button onClick={()=>setModal('settings')}>设置</button></div></header>
 {deletedPlan&&<div className="mw-notice mw-plan-undo" role="status"><span>会议安排已删除</span><button type="button" disabled={busy} onClick={()=>run(async()=>{await commit(d=>restorePlan(d,deletedPlan));setDeletedPlan(null)})}>撤销删除</button><button type="button" className="link" aria-label="关闭删除提示" onClick={()=>setDeletedPlan(null)}>关闭</button></div>}
 {error&&<div role="alert" className="mw-error">{error}<button onClick={()=>setError('')}>关闭</button></div>}{notice&&<div role="status" className="mw-notice">{notice}</div>}
 <div className={'mw-frame mw-docked-frame'+(conversationOpen?' is-assistant-open':'')}>
 <div className="mw-business-pane"><main ref={contentRef} className={'mw-content'+(tab==='meetings'?' mw-home-content':'')}>
 {!!data.plans?.some(p=>['提醒中','待确认'].includes(p.status))&&tab!=='prepare'&&<div className="mw-notice"><span>有会议等待确认是否开始记录</span><button onClick={()=>setTab('prepare')}>查看会议安排</button></div>}
 {!snapshot.ready&&<div className="mw-welcome"><div><h2>先为会议资料选一个本地位置</h2></div><button className="primary" onClick={chooseLocation}>选择资料文件夹</button></div>}
 {recording&&<section className="mw-live"><div className="mw-live-head"><div><span className="badge">{recording.native&&recording.captureMode!=='microphone'?'电脑声音＋麦克风':'麦克风录音'}</span><h2>{recording.title}</h2><p>{recording.live?(recording.asrModel==='x-asr'?'X-ASR · 本机流式转写':'SenseVoiceSmall · 本机分段转写'):'仅录音 · 未开启同步转写'}</p></div><strong className="clock">{time(recState.seconds||0)}</strong></div>{recording.native&&<div className="mw-source-status"><span>麦克风 · {recState.paused?'已暂停':recState.microphoneRecovering?'正在重连':recState.microphoneLevel>.002?'有声音':recState.microphoneFrames?'等待发言':'等待输入'}</span>{recording.captureMode!=='microphone'&&<span>电脑声音 · {recState.paused?'已暂停':recState.systemLevel>.002?'有声音':recState.systemFrames?'等待发言':'等待输入'}</span>}</div>}<div className="mw-waveform" role="img" aria-label={recState.paused?'录音已暂停':recording.native?'双路声音波形':'麦克风声音波形'}>{(recState.levels||Array(25).fill(0)).map((level,i)=><i key={i} style={{height:(4+Math.min(1,Math.pow(level*5,.6))*48)+'px'}}/>)}</div><p className="muted">{recState.status||'正在准备音频'}{recState.pending>0&&` · ${recState.pending} 段识别中`}</p><div className="mw-live-text">{recordLines.current.slice(-3).map(r=><p key={r.id}><small>{r.time} · 已确认</small><br/>{r.text}</p>)}{recState.interim?.map(r=><p key={r.id}><small>{r.time} · 正在识别</small><br/>{r.text}<span className="mw-interim">{r.stash}</span></p>)}{!recordLines.current.length&&!recState.interim?.length&&<p className="muted">{recording.live?(recState.status?.includes('失败')?'识别暂未成功，录音仍会保存。结束后可重试生成逐字稿。':recState.streaming?'等待发言，识别中的文字会先显示在这里。':recState.pending?'正在识别，确认后将在这里显示逐字稿。':'等待发言，约每 6 秒确认一段逐字稿。'):'点击“开启同步转写”即可从现在开始识别；之前的音频保存后可补转。'}</p>}</div><div className="actions">{!recording.live&&<button className="primary" disabled={busy} onClick={enableLive}>开启同步转写</button>}{recording.native&&<button onClick={()=>run(()=>request('/capture/control',{id:recorder.current.id,action:'show-window'}))}>显示悬浮窗</button>}<button onClick={()=>run(()=>recorder.current.pause())} disabled={busy||recState.starting||recState.stopping}>{recState.paused?'继续':'暂停'}</button><button className="primary" disabled={busy} onClick={stopRecording}>结束并保存</button>{finalBlob.current&&<button onClick={()=>download(finalBlob.current,'会议录音.webm',finalBlob.current.type)}>下载未保存录音</button>}</div></section>}
 {tab==='meetings'&&<>
  <section className="mw-heading mw-home-heading">
   <div><h1>会议工作台</h1><p>{new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</p></div>
   <div className="actions">
    <button className="mw-action-icon" onClick={openImport} disabled={busy}><WorkspaceIcon name="import"/>导入会议</button>
    <button className="primary mw-action-icon" disabled={busy||!!recording} onClick={()=>run(async()=>{
     if(await ready())openModal('record',{title:'',project:'default',language:'auto',live:true,captureMode:snapshot.capabilities.systemAudio?'system-microphone':'microphone'});
    })}><WorkspaceIcon name="record"/>开始记录</button>
   </div>
  </section>
  <section className="mw-home-counts" aria-label="工作台概览">
   {[[data.meetings.length,'已收录会议',showRecords],[allTasks(data).filter(t=>!t.done).length,'待跟进行动',showOpenTasks],[data.projects.length,'项目分类',showRecords]].map(([count,label,onClick])=>
    <button type="button" key={label} aria-label={'查看'+label} onClick={onClick}><strong>{count}</strong><span>{label}</span></button>
   )}
  </section>
  <div className="mw-home-grid">
   <section className="mw-card mw-home-recent" aria-label="近期会议">
    <div className="mw-card-head"><h2>近期会议</h2><button className="link" onClick={()=>{setSelected('');setTab('records')}}>查看全部会议</button></div>
    {renderMeetingRows([...rows].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6),false)}
    {!rows.length&&<p className="empty">{data.meetings.length?'没有符合筛选条件的会议。':'录制或导入第一场会议，它就会出现在这里。'}</p>}
   </section>
   <Dashboard data={data} project="" today={today()} busy={busy} recording={!!recording}
    onPlans={()=>setTab('prepare')} onAddPlan={()=>{setCreatePlan(true);setTab('prepare')}} onStart={startPlan}
    onManagePlan={managePlan} onTasks={showOpenTasks} onAddTask={addTask} onToggleTask={toggleTask} onMeeting={goto}/>
  </div>
 </>}
 {tab==='records'&&!m&&<MeetingRecords data={data} rows={[...rows].sort((a,b)=>b.date.localeCompare(a.date))} project={project} onProject={setProject} busy={busy} onManageProjects={()=>run(async()=>{if(await ready())setModal('projects')})} onNewProject={()=>run(async()=>{if(await ready())openModal('project',{name:'',returnToRecords:true})})} onImport={openImport} toolbar={bulkToolbar} renderMeetings={renderMeetingRows}/>}
 {tab==='records'&&m&&<><button className="link" onClick={()=>setSelected('')}>← 返回会议记录</button><section className="mw-heading mw-detail-heading"><div><h1>{m.title}</h1><div className="mw-detail-meta">
  <time dateTime={m.date}>{m.date}</time><span>{pname(m.project)}</span><span>{m.source}</span>{captureBadges.has(m.status)&&<span className="badge">{m.status}</span>}
 </div></div><div className="actions"><button onClick={editMeeting}>编辑会议</button>{m.autoTitle&&m.titleStatus!=='已生成'&&<button disabled={busy||!m.transcript.length} onClick={generateTitle}>生成标题</button>}<button onClick={()=>openModal('exportMinutes',{meetingId:m.id})}>导出纪要</button><button className="danger" disabled={recording?.id===m.id} onClick={()=>setModal('deleteMeeting')}>删除</button></div></section><div className={'mw-detail'+(detailTab==='full'?' mw-detail-transcript':'')}><section className="mw-card"><div className="mw-tabs">{[['notes','会议纪要'],['tasks','行动事项'],['full','完整逐字稿']].map(([id,title])=><button key={id} className={detailTab===id?'active':''} aria-pressed={detailTab===id} onClick={()=>setDetailTab(id)}>{title}{id==='full'&&timeline.length>0&&<small>{timeline.length}</small>}</button>)}</div><div className="mw-document">{detailTab==='notes'?<><div className="mw-card-head"><h2>会议摘要</h2></div>{m.aiError&&<p role="alert" className="mw-capture-warning">{m.aiError}</p>}{m.generatedSummary&&<details className="mw-generated-summary"><summary>查看另存的 AI 摘要</summary><SummaryText text={m.generatedSummary}/></details>}<MeetingSummary key={m.id} meeting={m} onLocate={locate}/><div className="mw-card-head"><h2>行动事项</h2><button onClick={()=>taskEdit({title:'',owner:'',due:'',done:false,meetingId:m.id})}>添加任务</button></div>{taskRows(m.tasks)}{Array.isArray(m.liveQuestions)&&m.liveQuestions.length>0&&<details className="mw-summary-diagram"><summary>会中问答 · {m.liveQuestions.length} 条</summary>{m.liveQuestions.map((row,i)=><section key={i}><h3>{row.question}</h3><SummaryText text={row.answer}/></section>)}</details>}</>:detailTab==='tasks'?<><button onClick={()=>taskEdit({title:'',owner:'',due:'',done:false,meetingId:m.id})}>添加任务</button>{taskRows(m.tasks)}</>:<TranscriptTimeline key={m.id} rows={timeline} busy={speakerBusy}
  canEdit={recording?.id!==m.id&&!speakerBusy}
  onEdit={()=>openModal('transcript',{text:editableTimeline(timeline)})}/>}
 {m.audioClearedAt&&!m.audio.length&&<p className="small muted">录音已清理，纪要、逐字稿与任务已保留。</p>}
 {meetingAudio(m).length>0&&<section><h2>会议音频</h2>{(m.captureError||m.captureWarning)&&<p className="mw-capture-warning">{m.captureError||m.captureWarning}</p>}{meetingAudio(m).map(a=><div className="mw-audio" key={a.id}><span>{a.name}</span><button onClick={()=>run(async()=>{const r=await fetch(API+'/audio?id='+a.id);if(!r.ok)throw Error('音频文件无法读取');const b=await r.blob();if(playURL)URL.revokeObjectURL(playURL);setPlayURL(URL.createObjectURL(b))})}>加载回放</button>{(!a.source||a.source==='mixed'||a.source==='recovered')&&<button disabled={!snapshot.capabilities.asrConfigured||busy} onClick={()=>run(async()=>{const r=await fetch(API+'/audio?id='+a.id);if(!r.ok)throw Error('原始文件无法读取');const text=await transcribe(await r.blob(),a.name.split('.').at(-1));if(!text.trim())throw Error('本次未识别出逐字稿，原录音和已有逐字稿保持不变');await updateMeeting(m.id,x=>{x.transcript=parseTranscript(text);x.summaryDiagram=null;delete x.speakerStatus;delete x.speakerTranscript;delete x.speakerAutoAttempted;x.decisions=x.decisions.map(v=>({...v,ref:null}));x.tasks=x.tasks.map(v=>({...v,ref:null}));x.status='待整理'});if(!m.summary)await organizeMeeting(m.id)})}>生成逐字稿</button>}</div>)}{playURL&&<audio controls src={playURL}/>}</section>}
 </div></section>{detailTab!=='full'&&<aside className="mw-card mw-source">
  <div className="mw-card-head"><h2>原文溯源</h2><small>{timeline.length} 段</small></div>
  <input key={m.id} aria-label="原文关键词定位" placeholder="输入关键词定位原文…" onChange={e=>{
   const query=e.target.value.trim().toLowerCase();
   setHighlight(null);
   setSourceHit(query?timeline.find(row=>row.text.toLowerCase().includes(query))?.id||'':'');
  }}/>
  {savedExcerpt&&<div className="mw-source-citation"><p className="small muted">引用时的原文</p><TranscriptRows rows={[savedExcerpt]} activeId={activeSource} onAnchor={sourceAnchor}/></div>}
  <TranscriptRows rows={timeline} activeId={activeSource} onAnchor={sourceAnchor}/>
 </aside>}</div></>}
 {tab==='prepare'&&<MeetingPreparation data={data} busy={busy} recording={!!recording} api={request} refresh={refresh} commit={commit} run={run} start={startPlan} createRequested={createPlan} onCreateOpened={()=>setCreatePlan(false)} onDeleted={setDeletedPlan}/>}
 {tab==='tasks'&&<>
  <section className="mw-heading"><div><h1>任务安排</h1></div><button className="primary" onClick={addTask}>新建任务</button></section>
  <TaskFilters projects={data.projects} people={taskPeople} filter={taskFilter} project={taskProject} owner={owner} due={taskDue} sort={sort}
   onFilter={setTaskFilter} onProject={setTaskProject} onOwner={setOwner} onDue={setTaskDue} onSort={setSort} onReset={resetTaskFilters}/>
  <section className="mw-card">{taskRows(tasks,true)}</section>
 </>}
 </main></div>
 <AssistantPanel open={conversationOpen} onClose={hideAssistant} data={data} scope={assistantScope}
  sessionId={chatSession} opening={assistantOpening} ready={snapshot.ready} available={snapshot.capabilities.assistantAvailable}
  conversation={conversation} onScope={scope=>openAssistant(false,scope)} onHistory={item=>openAssistant(false,item.scope,item.id)}
  onNew={()=>openAssistant(true)} onChooseLocation={chooseLocation} sources={assistantSources} onSource={openAssistantSource}/>
 </div>

 {planToManage&&<MeetingPlanEditor key={planToManage.id} plan={planToManage} data={data} commit={commit} onClose={()=>setPlanToManage(null)} onDeleted={setDeletedPlan}/>}
 {modal&&<Modal error={modal==='import'?error:''} title={{settings:'设置',exportMinutes:'导出纪要',projects:'项目管理',project:draft.id?'编辑项目':'新建项目',meeting:'编辑会议',import:'导入会议',record:'开始记录',task:'行动事项',transcript:'编辑逐字稿',deleteMeeting:'删除会议',deleteMeetings:'批量删除会议',deleteTask:'删除任务',restore:'恢复备份'}[modal]} busy={busy} onClose={()=>setModal(null)} onSave={['settings','projects','exportMinutes'].includes(modal)||modal==='import'&&draft.importMode==='minutes'&&!draft.minutesPreview?undefined:['deleteMeeting','deleteMeetings','deleteTask','restore'].includes(modal)?()=>run(async()=>{if(modal==='deleteMeeting'){await commit(d=>removeMeetings(d,[selected],protectedIds()));setSelected('')}if(modal==='deleteMeetings'){await commit(d=>removeMeetings(d,draft.ids,protectedIds()));setPicked([]);setNotice(`已删除 ${draft.ids.length} 场会议及关联行动事项，原始录音保留在资料目录`)}if(modal==='deleteTask')await updateMeeting(draft.meetingId||selected,x=>x.tasks=x.tasks.filter(t=>t.id!==draft.id));if(modal==='restore'){validateData(draft.backup);await commit(d=>Object.assign(d,draft.backup));setSelected('')};setModal(null)}):saveModal} saveLabel={modal==='import'&&draft.importMode==='minutes'?'导入妙记':modal==='record'?(draft.live===false?'开始仅录音':'开始录音并转写'):['deleteMeeting','deleteMeetings','deleteTask'].includes(modal)?'确认删除':modal==='restore'?'替换文本资料':'保存'}>
 {modal==='exportMinutes'?<><p className="muted">选择文件格式</p><div className="mw-minutes-formats">{[['docx','Word（.docx）'],['txt','纯文本（.txt）'],['md','Markdown（.md）']].map(([format,label])=><button key={format} type="button" onClick={()=>run(()=>exportMinutes(format))}>{label}</button>)}</div></>:
 modal==='settings'?<><MeetingDetectionSettings api={request} ready={snapshot.ready} projects={data.projects} status={snapshot.meetingDetection} onSaved={refresh}/><StorageManagement api={request} onSaved={refresh} ready={snapshot.ready} recording={recording} location={snapshot.location}/><SpeechConfiguration api={request} disabled={!!recording} activeModel={recording?.live?recState.asrModel||recording?.asrModel:undefined} onSaved={refresh}/><div className="mw-setting"><b>资料位置</b><p>{snapshot.location||'尚未选择'}</p><button disabled={!!recording} onClick={chooseLocation}>选择或更换资料文件夹</button> <button disabled={!!recording} onClick={()=>run(refresh)}>重新读取资料</button></div><div className="mw-setting"><b>AI 模型</b><p>{snapshot.capabilities.aiModel||'尚未在 DSH 选择模型'}</p><b>音频采集</b><p>{snapshot.capabilities.systemAudio?'电脑声音＋麦克风 / 仅麦克风':'仅麦克风；双路采集组件未加载'}</p><p className="small muted">工作台版本：0.16.1 · 服务：{snapshot.serviceVersion||'待确认'}</p></div><div className="mw-setting"><b>数据备份</b><p className="small muted">JSON 备份包括会议、逐字稿、任务和音频索引。请另外备份资料目录里的 audio 文件夹。恢复会替换文本资料；不会删除磁盘上的录音文件。</p><div className="actions"><button onClick={()=>download(JSON.stringify(data,null,2),'会议工作台-备份.json')}>导出全部文本资料</button><label className="mw-file-button">恢复备份<input type="file" accept=".json" onChange={e=>run(async()=>{const f=e.target.files[0];if(!f)return;if(!snapshot.ready)throw Error('请先选择资料文件夹');const backup=JSON.parse(await f.text());validateData(backup);openModal('restore',{backup})})}/></label></div></div><div className="mw-setting"><b>示例数据</b><button onClick={()=>run(()=>commit(d=>d.meetings=d.meetings.filter(m=>m.source!=='示例')))}>清理示例会议</button></div></>:
 modal==='projects'?<><div className="mw-setting">{data.projects.map(p=><div className="mw-project" key={p.id}><span>{p.name}</span><button onClick={()=>openModal('project',p)}>编辑</button>{p.id!=='default'&&<button onClick={()=>run(()=>commit(d=>removeProject(d,p.id)))}>删除并移至未分类</button>}</div>)}<button disabled={!snapshot.ready} onClick={()=>openModal('project',{name:''})}>新建项目</button></div></>:
 modal==='project'?<label>项目名称{field('name',{required:true,maxLength:100})}</label>:
 modal==='deleteMeetings'?<><p>将删除所选 {draft.ids.length} 场会议及其 {data.meetings.filter(x=>draft.ids.includes(x.id)).reduce((n,x)=>n+x.tasks.length,0)} 项行动事项。此操作不可撤销，磁盘上的原始录音会保留。</p><ul className="mw-delete-list">{data.meetings.filter(x=>draft.ids.includes(x.id)).map(x=><li key={x.id}>{x.title}</li>)}</ul><button type="button" onClick={()=>download(JSON.stringify(data,null,2),'会议工作台-删除前备份.json')}>导出删除前备份</button></>:
 ['deleteMeeting','deleteTask','restore'].includes(modal)?<p>此操作会{modal==='restore'?'替换当前文本资料，请先导出备份':'删除所选记录'}。请确认后继续。磁盘上的原始录音不会被自动删除。</p>:
 modal==='task'?<><label>任务内容{field('title',{required:true,maxLength:1000})}</label><label>来源会议<select aria-label="来源会议" value={draft.meetingId} disabled={!!draft.id} onChange={e=>setDraft({...draft,meetingId:e.target.value,project:data.meetings.find(m=>m.id===e.target.value)?.project||'default',ref:''})}>{data.meetings.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label><div className="mw-fields"><label>负责人<PeoplePicker value={draft.owners||[]} people={peopleFor(data,{assignableOnly:true})} archived={data.archivedTaskPeople} onRosterChange={editPeopleRoster} label="任务负责人" onSave={async owners=>setDraft(d=>({...d,owners}))}/></label><label>截止日期{field('due',{type:'date'})}</label></div><label>项目<select aria-label="新任务项目" value={draft.project||'default'} onChange={e=>setDraft({...draft,project:e.target.value})}>{data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>原文段落<select value={draft.ref??''} onChange={e=>setDraft({...draft,ref:e.target.value})}><option value="">待核对，不关联</option>{data.meetings.find(x=>x.id===draft.meetingId)?.transcript.map((r,i)=><option key={r.id} value={i}>{r.time} · {r.text.slice(0,45)}</option>)}</select></label><label className="inline"><input type="checkbox" checked={!!draft.done} onChange={e=>setDraft({...draft,done:e.target.checked})}/>已完成</label></>:
 modal==='import'&&draft.importMode==='minutes'?<>
  <div className="mw-import-modes actions" aria-label="导入来源">
   <button type="button" disabled={busy} onClick={()=>setDraft(value=>({...value,importMode:'file'}))}>文件或文字</button>
   <button type="button" className="active" aria-pressed="true">飞书妙记链接</button>
  </div>
  <FeishuMinutesImport draft={draft} setDraft={setDraft} api={request} run={run} busy={busy} projectSelect={projectSelect}/>
 </>:
 modal==='transcript'?<><p className="small muted">{m?.speakerTranscript?.length?'编辑当前显示的逐字稿。已有纪要引用仍可查看引用时的原文。':'修改原文会解除已有决策和任务的段落引用，请重新核对。'}</p><textarea className="large" value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})}/></>:
 <>{modal==='import'&&<div className="mw-import-modes actions" aria-label="导入来源">
  <button type="button" className="active" aria-pressed="true">文件或文字</button>
  <button type="button" disabled={busy} onClick={()=>setDraft(value=>({...value,importMode:'minutes'}))}>飞书妙记链接</button>
 </div>}<label>会议名称{field('title',{required:modal!=='record',maxLength:200,placeholder:modal==='record'?'会议结束后自动生成（可选填）':''})}</label><div className="mw-fields"><label>所属项目{projectSelect(draft.project,v=>setDraft(d=>({...d,project:v})))}</label>{modal!=='record'&&<label>会议日期{field('date',{type:'date',required:true})}</label>}</div>{modal==='meeting'&&<label>参与者{field('participants',{placeholder:'用顿号或逗号分隔'})}</label>}{modal==='import'&&<><label className="mw-upload">选择文件<input aria-label="上传逐字稿或音视频" type="file" accept=".txt,.md,.srt,.vtt,audio/*,video/*" onChange={e=>run(()=>importFile(e.target.files[0]))}/><small>支持 TXT / Markdown / SRT / VTT 与音视频，最大 25 MB</small></label>{draft.file&&<p>已选择：{draft.file.name}</p>}<label>或粘贴逐字稿<textarea aria-label="逐字稿内容" value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})} placeholder="00:12 陈宇：讨论内容…"/></label></>}{modal==='record'&&<><label>采集方式<select aria-label="采集方式" value={draft.captureMode||'microphone'} onChange={e=>setDraft({...draft,captureMode:e.target.value})}><option value="system-microphone" disabled={!snapshot.capabilities.systemAudio}>电脑声音＋麦克风（腾讯会议 / 飞书）</option><option value="microphone">仅麦克风</option></select></label>{draft.captureMode==='system-microphone'&&<p className="small muted">使用系统默认麦克风。首次使用需允许麦克风和屏幕录制权限；屏幕画面不会保存。建议佩戴耳机。</p>}<label>转写语言<select value={snapshot.capabilities.transcription?.selected==='x-asr'?'auto':draft.language} disabled={snapshot.capabilities.transcription?.selected==='x-asr'||draft.live===false} onChange={e=>setDraft({...draft,language:e.target.value})}><option value="auto">自动识别（中英混合）</option><option value="zh">中文</option><option value="en">English</option></select></label><label className="inline"><input type="checkbox" checked={draft.live!==false} onChange={e=>setDraft({...draft,live:e.target.checked})}/>同步转写</label>{draft.live!==false&&<RecordingModelInfo catalog={snapshot.capabilities.transcription} busy={busy} prepare={prepareSpeech}/>}</>}</>}
 </Modal>}
 </div>
}
export function apply(ctx){const service=workbenchService(ctx);ctx.effect(()=>ctx.desktopWorkbenches.register({title:'会议纪要工作台',repository:'https://github.com/mehrocc/dsh-meeting-workspace',description:'采集会议、核对纪要、跟进行动与检索历史',customFrame:true,headerLayout:'default'},props=><MeetingWorkspace {...props} service={service} host={{pickDirectory:()=>ctx.uiWorkspace.pickDirectory()}}/>))}
export const inject=['desktopWorkbenches','uiWorkspace','sessions','conversation'];
