import React,{useState,useEffect} from 'react';
export function MeetingDetectionSettings({api,ready,projects,status,onSaved}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[local,setLocal]=useState(null);const value=local||status||{enabled:true,project:'default'};
 useEffect(()=>setLocal(null),[status]);
 async function save(change){setBusy(true);setError('');try{setLocal(await api('/detection',{enabled:value.enabled,project:value.project||'default',offlineEnabled:value.offlineEnabled===true,...change}));await onSaved()}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function check(){setBusy(true);setError('');try{setLocal(await api('/detection/check',{}))}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="mw-setting mw-detection" aria-label="会议检测与悬浮转写"><h3>会议检测与悬浮转写</h3>
  <label className="inline"><input type="checkbox" aria-label="检测会议并提醒" checked={value.enabled!==false} disabled={busy||!ready} onChange={e=>save({enabled:e.target.checked})}/>检测会议并提醒</label>
  <label className="inline"><input type="checkbox" aria-label="线下会议提醒" checked={value.offlineEnabled===true} disabled={busy||!ready} onChange={e=>save({offlineEnabled:e.target.checked})}/>线下会议提醒</label>
  <p className="small muted">默认关闭。开启后持续使用麦克风，在本机判断持续人声，约半分钟后提醒；确认前不保存、不转写、不上传。普通聊天或外放人声也可能触发。</p>
  {value.offlineEnabled&&<p className="small">{({off:'已关闭',starting:'正在请求麦克风…',listening:'正在检测人声 · 麦克风使用中',paused:'录音中，检测已暂停','permission-required':'需要麦克风权限',failed:'检测未运行'})[value.offline?.phase]||'准备检测'}{value.offline?.error?' · '+value.offline.error:''}</p>}
  <p className="small muted">识别腾讯会议、飞书正在使用麦克风的状态，确认后才开始录音和实时转写。同一场会议忽略后不重复提醒，也可延后 5 分钟。</p>
  <label className="mw-retention">录音默认项目<select aria-label="检测会议的默认项目" value={value.project||'default'} disabled={busy||!ready} onChange={e=>save({project:e.target.value})}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
  <div className="mw-detection-status"><span className="badge">{!ready?'待选择资料位置':value.enabled===false?'已关闭':value.supported===false?'当前系统不可用':value.platforms?.length?'发现会议活动':value.lastCheckedAt?'检测中':'等待检测'}</span><button type="button" disabled={busy||!ready||value.enabled===false} onClick={check}>{busy?'检测中…':'立即检测'}</button></div>
  {!!value.platforms?.length&&<p className="small">{value.platforms.map(p=>p.name).join('、')}{value.prompting?' · 等待确认是否记录':''}</p>}
  {(error||value.error)&&<p role="alert" className="mw-capture-warning">{error||value.error}</p>}
  <p className="small muted">需要 macOS 14.2 或更新版本；不采集会议声音来做检测。只收听且应用未启用麦克风时可能漏检，可手动开始记录。</p>
  <div className="mw-floating-explanation"><b>录音悬浮窗</b><p>开始录音后显示小悬浮入口，点击展开实时逐字稿与 AI 摘要，收起后回到入口。工作台最小化后继续保留，可在小窗内暂停、继续和结束；隐藏后可从菜单栏「DSH 录音 → 显示实时转写」恢复。</p></div>
 </section>
}
