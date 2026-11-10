import React,{useState} from 'react';
import {savePlan,deletePlan,planVersion} from '../plan-management.mjs';
import {parseMeetingInvitation} from '../meeting-invitation.mjs';
export function MeetingPlanEditor({plan,data,commit,onClose,onDeleted,onSaved,fromInvitation=false}){
 const [initial]=useState(()=>plan?{...plan}:null),[draft,setDraft]=useState(()=>plan?{...plan,captureMode:plan.captureMode||'system-microphone',agenda:plan.agenda||'',startsAt:new Date(Date.parse(plan.startsAt)-new Date(plan.startsAt).getTimezoneOffset()*60000).toISOString().slice(0,16)}:{title:'',startsAt:'',project:'default',agenda:'',link:'',live:true,captureMode:'system-microphone'}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[confirming,setConfirming]=useState(false);
 const [inviteText,setInviteText]=useState('');
 const [pasting,setPasting]=useState(fromInvitation);
 const begun=initial?.status==='已开始';
 const [date='',time='']=draft.startsAt.split('T');
 const heading=confirming?'删除会议安排':initial?'管理会议安排':fromInvitation?'核对会议安排':'添加会议安排';

 function recognize(event){
  event.preventDefault();
  if(!inviteText.trim()){setError('请粘贴会议邀请或入会链接');return}
  const invitation=parseMeetingInvitation(inviteText);
  setDraft(previous=>({...previous,title:invitation.title,link:invitation.link,startsAt:invitation.date+'T'+invitation.time}));
  setError('');
  setPasting(false);
 }

 if(pasting)return <div className="mw-overlay" data-dsh-no-drag>
  <form className="mw-dialog" role="dialog" aria-modal="true" aria-label="粘贴会议邀请" onSubmit={recognize}>
   <header><h2>粘贴会议邀请</h2><button type="button" aria-label="关闭会议邀请" onClick={onClose}>×</button></header>
   <p className="muted small">复制飞书或腾讯会议的邀请全文，识别后可以核对和补充。</p>
   <label>邀请内容<textarea required autoFocus rows={7} maxLength={12000} value={inviteText} onChange={e=>{setInviteText(e.target.value);setError('')}} placeholder="粘贴邀请全文或入会链接…"/></label>
   {error&&<p role="alert" className="mw-inline-error">{error}</p>}
   <footer><button type="button" onClick={onClose}>取消</button><button type="submit" className="primary">识别邀请</button></footer>
  </form>
 </div>;
 async function save(event){event.preventDefault();if(busy)return;setBusy(true);setError('');try{if(!draft.startsAt||!Number.isFinite(Date.parse(draft.startsAt)))throw Error('请填写有效会议日期和时间');await commit(d=>savePlan(d,{...draft,startsAt:new Date(draft.startsAt).toISOString()},initial?planVersion(initial):undefined));onSaved?.();onClose()}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function remove(){if(busy)return;setBusy(true);setError('');try{let token;await commit(d=>{token=deletePlan(d,initial.id,planVersion(initial))});onDeleted?.(token);onClose()}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <div className="mw-overlay" data-dsh-no-drag><form className="mw-dialog mw-plan-manager" role="dialog" aria-modal="true" aria-label={heading} onSubmit={confirming?e=>e.preventDefault():save}><header><h2>{heading}</h2><button type="button" aria-label="关闭会议安排管理" disabled={busy} onClick={onClose}>×</button></header>{confirming?<><p>确定删除「{initial.title}」的会议安排吗？</p><p className="muted small">删除后停止该安排的提醒，已有会议记录、任务和录音会保留。</p></>:<>{fromInvitation&&<p className="muted small">{date&&time?'请按本机时区核对会议名称、开始时间和链接。':'请补填缺少的会议日期或开始时间，再核对名称和链接。'}</p>}<label>会议名称<input aria-label="安排会议名称" required maxLength={200} disabled={busy||begun} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><div className="mw-fields"><label>会议日期<input aria-label="安排会议日期" type="date" required disabled={busy||begun} value={date} onChange={e=>setDraft({...draft,startsAt:e.target.value+'T'+(time||(fromInvitation?'':'09:00'))})}/></label><label>开始时间<input aria-label="安排开始时间" type="time" required disabled={busy||begun} value={time||(fromInvitation?'':'09:00')} onChange={e=>setDraft({...draft,startsAt:(date||(fromInvitation?'':new Date().toLocaleDateString('sv-SE')))+'T'+e.target.value})}/></label></div><label>所属项目<select aria-label="安排所属项目" disabled={busy||begun} value={draft.project} onChange={e=>setDraft({...draft,project:e.target.value})}>{data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>议题与准备资料<textarea aria-label="议题与准备资料" maxLength={20000} disabled={busy||begun} value={draft.agenda} onChange={e=>setDraft({...draft,agenda:e.target.value})}/></label><label>会议链接（选填）<input aria-label="会议链接" type="url" disabled={busy||begun} value={draft.link||''} onChange={e=>setDraft({...draft,link:e.target.value})}/></label><label>采集方式<select aria-label="安排采集方式" disabled={busy||begun} value={draft.captureMode||'system-microphone'} onChange={e=>setDraft({...draft,captureMode:e.target.value})}><option value="system-microphone">电脑声音＋麦克风</option><option value="microphone">仅麦克风</option></select></label><label className="inline"><input type="checkbox" disabled={busy||begun} checked={draft.live!==false} onChange={e=>setDraft({...draft,live:e.target.checked})}/>开始后同步转写（自动识别语言）</label>{initial?.source==='system-calendar'&&<p className="muted small">此处管理本地安排，不修改系统日历。</p>}{begun&&<p className="muted small">该安排已开始记录，可在会议记录中编辑会议内容。</p>}</>}{error&&<p role="alert" className="mw-inline-error">{error}</p>}<footer>{confirming?<><button type="button" disabled={busy} onClick={()=>setConfirming(false)}>返回</button><button type="button" className="danger" disabled={busy} onClick={remove}>{busy?'删除中…':'确认删除安排'}</button></>:<>{initial&&<button type="button" className="danger mw-plan-delete" disabled={busy} onClick={()=>setConfirming(true)}>删除安排</button>}{fromInvitation&&<button type="button" disabled={busy} onClick={()=>{setError('');setPasting(true)}}>返回邀请</button>}<button type="button" disabled={busy} onClick={onClose}>取消</button><button type="submit" className="primary" disabled={busy||begun}>{busy?'保存中…':initial?'保存修改':'保存安排'}</button></>}</footer></form></div>;
}
