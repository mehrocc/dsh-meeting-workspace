import React from 'react';
import {HistoryPicker,RangePicker} from './assistant-page.jsx';

export function AssistantPanel({open,onClose,data,scope,sessionId,opening,ready,available,conversation,
 onScope,onHistory,onNew,onChooseLocation,sources,onSource}){
 const canChat=ready&&available;
 return <aside id="mw-meeting-assistant-panel" className="mw-assistant-dock mw-assistant-unified" aria-labelledby="mw-assistant-dock-title" hidden={!open}>
  <header className="mw-assistant-dock-title">
   <h2 id="mw-assistant-dock-title">会议助手</h2>
   <button type="button" onClick={onClose} aria-label="收起会议助手">−</button>
  </header>
  {canChat&&<div className="mw-assistant-dock-controls">
   <RangePicker data={data} value={scope} onChange={onScope} disabled={opening}/>
   <HistoryPicker sessionId={sessionId} onSelect={onHistory} disabled={opening}/>
   <button type="button" disabled={opening} onClick={onNew}>新建对话</button>
  </div>}
  <div className="mw-assistant-dock-thread mw-host-conversation" hidden={!canChat||!sessionId||opening}>
   {conversation}
  </div>
  {(!canChat||!sessionId||opening)&&<div className="mw-assistant-dock-empty">
   {opening?<p role="status">正在打开会议助手对话…</p>:!ready?
    <><p>选择会议资料位置后，即可用会议助手查询记录。</p><button type="button" onClick={onChooseLocation}>选择资料文件夹</button></>:
    available?<><p>开始一场对话，查询会议内容、原文和待办。</p><button className="primary" type="button" onClick={onNew}>开始对话</button></>:
    <p role="status">会议助手服务暂不可用，请稍后重试。</p>}
  </div>}
  {canChat&&sessionId&&!opening&&sources.length>0&&<footer className="mw-assistant-dock-footer">
   <details className="mw-assistant-dock-sources">
    <summary>会议来源 · {sources.length}</summary>
    <ul>{sources.map((source,index)=><li key={source.meetingId+':'+index}>
     <button type="button" className="link" onClick={()=>onSource(source)}>
      {source.meetingTitle}{source.time?' · '+source.time:''}
     </button>
    </li>)}</ul>
   </details>
  </footer>}
 </aside>;
}
