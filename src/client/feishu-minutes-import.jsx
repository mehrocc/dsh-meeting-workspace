import React,{useEffect,useState} from 'react';

export function FeishuMinutesImport({draft,setDraft,api,run,busy,projectSelect}){
 const [error,setError]=useState(null);
 const [auth,setAuth]=useState(null);
 const [reading,setReading]=useState(false);
 const preview=draft.minutesPreview;
 const patch=change=>setDraft(value=>({...value,...change}));
 useEffect(()=>{
  if(!auth?.pending)return;
  let active=true,checking=false;
  const timer=setInterval(async()=>{
   if(checking)return;
   checking=true;
   try{
    const status=await api('/minutes/authorization');
    if(active)setAuth(status);
   }catch(e){
    if(active)setAuth({error:e.message});
   }finally{checking=false;}
  },2000);
  return()=>{active=false;clearInterval(timer)};
 },[auth?.pending]);
 function readMinutes(){
  return run(async()=>{
   setError(null);
   setReading(true);
   try{
    const result=await api('/minutes/preview',{link:draft.minutesLink});
    patch({minutesPreview:result,minutesTitle:result.title,minutesDate:result.date||draft.date});
   }catch(e){
    if(e.status===401&&auth?.authorized)setAuth(null);
    setError(e);
   }
   finally{setReading(false);}
  });
 }
 function authorize(){
  return run(async()=>{
   setAuth(null);
   try{setAuth(await api('/minutes/authorization',{}));}
   catch(e){setAuth({error:e.message});}
  });
 }
 return <>
  <label>飞书妙记链接
   <input aria-label="飞书妙记链接" placeholder="https://组织域名.feishu.cn/minutes/…" disabled={busy}
    value={draft.minutesLink||''} maxLength={2000} onChange={e=>{setError(null);patch({minutesLink:e.target.value,minutesPreview:null});}}/>
  </label>
  <div className="actions mw-minutes-actions">
   <button type="button" disabled={busy||!draft.minutesLink?.trim()} onClick={readMinutes}>
    {reading?'正在读取逐字稿…':'读取妙记'}
   </button>
   {error?.status===401&&!auth?.pending&&!auth?.authorized&&<button type="button" disabled={busy} onClick={authorize}>授权飞书</button>}
   {auth?.pending&&<a href={auth.url} target="_blank" rel="noopener noreferrer">打开飞书授权页 ↗</a>}
   {error?.status===503&&<a href="https://github.com/larksuite/cli" target="_blank" rel="noopener noreferrer">飞书官方 CLI 安装与配置 ↗</a>}
  </div>
  {error&&!(auth?.authorized&&error.status===401)&&<p className="mw-capture-warning" role="alert">{error.message}</p>}
  {auth?.pending&&<p className="small muted" role="status">正在等待飞书授权。完成后可重新读取妙记。</p>}
  {auth?.authorized&&!preview&&<p className="small muted" role="status">飞书授权已完成。点击「读取妙记」继续。</p>}
  {auth?.error&&<p className="mw-capture-warning" role="alert">{auth.error}</p>}
  {preview&&<>
   <label>会议名称<input name="minutesTitle" required maxLength={200} value={draft.minutesTitle} onChange={e=>patch({minutesTitle:e.target.value})}/></label>
   <div className="mw-fields">
    <label>会议日期<input type="date" name="minutesDate" required value={draft.minutesDate} onChange={e=>patch({minutesDate:e.target.value})}/></label>
    <label>所属项目{projectSelect(draft.project,project=>patch({project}))}</label>
   </div>
   <section className="mw-minutes-preview" aria-label="妙记逐字稿预览">
    <h3>逐字稿预览 <small>共 {preview.rows.length} 段</small></h3>
    {preview.rows.slice(0,8).map(row=><article key={row.id}>
     <strong>{row.speaker} · {row.time}</strong><p>{row.text.slice(0,1200)}{row.text.length>1200?'…':''}</p>
    </article>)}
   </section>
   <p className="small muted">确认后保存完整逐字稿，并按工作台现有设置生成会议纪要。</p>
  </>}
 </>;
}
