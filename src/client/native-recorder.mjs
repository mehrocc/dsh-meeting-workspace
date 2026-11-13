import {readAPIResponse} from './api-response.mjs';
const API='/api/meeting-workspace';
export class NativeRecorder{
 constructor({meetingId,onState,onTranscript,language='auto',captureMode='system-microphone',expectedModel}){Object.assign(this,{meetingId,onState,onTranscript,language,captureMode,expectedModel});this.isNative=true;this.cursor=0;this.seen=new Set();this.seconds=0;this.levels=Array(25).fill(0)}
 async call(path,body){const r=await fetch(API+path,{cache:'no-store',...(body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),signal:AbortSignal.timeout(180000)});const value=await readAPIResponse(r);if(!r.ok)throw Error(value.error||'本机音频采集失败');return value}
 async start(live){this.live=live;const state=await this.call('/capture',{meetingId:this.meetingId,language:this.language,live,captureMode:this.captureMode,expectedModel:this.expectedModel,confirmed:true,background:true});this.id=state.id;if(this.cancelled){await this.call('/capture/control',{id:this.id,action:'stop'});throw Error('录音已取消')}this.apply(state);this.poll()}
 async attach(id){this.id=id;const state=await this.call('/capture/events?id='+id+'&after=0');this.live=state.live;this.apply(state);this.poll()}
 apply(state){this.state=state;this.seconds=Math.floor(state.seconds||0);for(const event of state.events||[]){if(event.serial<=this.cursor)continue;this.cursor=event.serial;if(event.type==='transcript'&&!this.seen.has(event.row.id)){this.seen.add(event.row.id);this.onTranscript(event.row)}if(event.type==='speaker-labels')for(const row of event.rows||[])this.onTranscript(row);if(event.type==='warning'||event.type==='error')this.warning=event.message}
  this.cursor=Math.max(this.cursor,state.cursor||0);const ended=['saved','failed'].includes(state.state),paused=state.paused===true,level=paused||ended?0:Math.max(state.microphoneLevel||0,state.systemLevel||0);this.levels=[...this.levels.slice(1),level];
  this.onState({native:true,error:state.error||'',asrModel:state.asrModel,speakerState:state.speakerState,seconds:this.seconds,paused,ended,starting:state.state==='starting',stopping:state.state==='stopping',pending:state.pending||0,level,levels:this.levels,microphoneLevel:state.microphoneLevel||0,systemLevel:state.systemLevel||0,microphoneRecovering:state.microphoneRecovering===true,microphoneDevice:state.microphoneDevice||'',microphoneFallback:state.microphoneFallback===true,microphoneFrames:state.microphoneFrames||0,systemFrames:state.systemFrames||0,resync:state.resync,streaming:state.streaming===true,interim:state.interim||[],status:state.error||(!ended&&!paused&&state.microphoneStatus)||this.warning||(ended?'录音已保存':state.state==='starting'?(state.startupStatus||'正在启动音频采集，尚未开始录音'):state.state==='stopping'?'正在保存音频和逐字稿…':paused?'录音已暂停':state.microphoneRecovering?'麦克风连接中，部分声音暂无法采集；正在尝试重连…':state.pending?'DSH 正在转写混合音频…':state.streaming?'本机流式转写中':this.live?'双路录音中，等待下一段识别':'双路录音中')});
 }
 poll(){if(this.cancelled||['saved','failed'].includes(this.state?.state))return;this.timer=setTimeout(async()=>{try{this.apply(await this.call('/capture/events?id='+this.id+'&after='+this.cursor))}catch{this.onState({...this.state,native:true,seconds:this.seconds,status:'暂时无法读取采集状态，请保留工作台并重试',level:0,levels:this.levels})}this.poll()},500)}
 async pause(){if(!this.id)return;this.apply(await this.call('/capture/control',{id:this.id,action:this.state.paused?'resume':'pause'}))}
 async enableTranscription(){this.apply(await this.call('/capture/control',{id:this.id,action:'enable-transcription'}));this.live=true}
 async stop(){
  clearTimeout(this.timer);
  try{
   this.apply(await this.call('/capture/control',{id:this.id,action:'stop',background:true}));
   const until=Date.now()+180000;
   while(!['saved','failed'].includes(this.state.state)){
    if(this.cancelled)throw Error('录音正在后台保存，可重新打开会议查看');
    if(Date.now()>until)throw Error('录音正在保存或补转，请保留工作台并稍后查看');
    await new Promise(resolve=>setTimeout(resolve,500));
    this.apply(await this.call('/capture/events?id='+this.id+'&after='+this.cursor));
   }
   return this.state;
  }finally{if(!this.cancelled&&!['saved','failed'].includes(this.state?.state))this.poll()}
 }
 dispose(){this.cancelled=true;clearTimeout(this.timer)}
}
