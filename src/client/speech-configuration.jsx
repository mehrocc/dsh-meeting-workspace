import React,{useEffect,useState} from 'react';

const phases={
 unavailable:'不可用',disabled:'未启用',unprepared:'尚未初始化',initializing:'初始化中',checking:'正在检查',
 downloading:'正在下载',loading:'正在加载',waking:'正在唤醒',standby:'已就绪',ready:'已就绪',failed:'初始化失败',
 cancelled:'已取消',cancelling:'正在取消'
};
const modeName=model=>model.mode==='streaming'?'实时转写':'分段转写';
const phaseName=model=>phases[model.phase]||'未就绪';

export function RecordingModelInfo({catalog,busy,prepare}){
 const model=catalog?.models.find(m=>m.id===catalog.selected);
 if(!model)return <p className="small muted">请在设置中选择语音转写模型。</p>;
 return <div className="mw-setting">
  <p className="small"><strong>{model.label}</strong> · {modeName(model)} · {phaseName(model)}</p>
  <p className="small muted">{model.available?model.description:'当前环境无法运行此模型，可在设置中更换模型，或取消同步转写。'}</p>
  {model.available&&!model.ready&&<button type="button" disabled={busy||model.busy} onClick={prepare}>准备语音模型</button>}
 </div>;
}

export function SpeechConfiguration({api,disabled,activeModel,onSaved}){
 const [state,setState]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[restartRequired,setRestartRequired]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  const load=async()=>{try{const value=await api('/asr/models',undefined,{signal:controller.signal});if(!controller.signal.aborted)setState(value)}
   catch(e){if(!controller.signal.aborted)setError(e.message)}};
  void load();
  const timer=setInterval(load,1800);
  return()=>{controller.abort();clearInterval(timer)};
 },[api]);
 async function update(action,id){
  setError('');setBusy(true);
  try{
   const value=await api('/asr/models',{action,id});
   if(value.restartRequired)setRestartRequired(true);
   setState(action==='select'?value:await api('/asr/models'));
   await onSaved();
  }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 const selected=state?.models.find(model=>model.id===state.selected);
 const current=state?.models.find(model=>model.id===activeModel);
 return <div className="mw-setting mw-speech-settings">
  <h3>语音转写设置</h3>
  <label>新录音默认模型
   <select aria-label="新录音默认转写模型" value={state?.selected||''} disabled={busy||!state} onChange={e=>update('select',e.target.value)}>
    {!state?.selected&&<option value="" disabled>{state?'请选择模型':'读取中…'}</option>}
    {(state?.models||[]).map(model=><option key={model.id} value={model.id}>{model.label} · {modeName(model)}</option>)}
   </select>
  </label>
  {disabled&&<p className="small muted">{current?'本场使用 '+current.label+'。':'本场录音的模型选择已锁定。'}更改默认模型会在下次录音生效。</p>}
  {selected&&<p className="small">默认使用 {selected.label} · {phaseName(selected)}</p>}
  {(state?.models||[]).map(model=><section key={model.id} className="mw-setting">
   <strong>{model.label}</strong> <span className="badge">{phaseName(model)}</span>
   <p className="small muted">{model.source} · {modeName(model)}。{model.description}</p>
   {!model.ready&&model.available&&<button type="button" disabled={disabled||busy||model.busy} onClick={()=>update('prepare',model.id)}>{model.busy?'正在准备…':'准备 '+model.label}</button>}
  </section>)}
  <p className="small muted">导入音视频和会后补转使用 SenseVoiceSmall。</p>
  {restartRequired&&!state?.models.find(model=>model.id==='sensevoice-local')?.ready&&<p role="status">语音输入已启用，请重启 Harness 后准备 SenseVoiceSmall。</p>}
  {error&&<p role="alert">{error}</p>}
 </div>;
}
