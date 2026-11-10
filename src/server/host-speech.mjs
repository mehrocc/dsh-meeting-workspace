export const SPEECH_PROVIDER='sensevoice-local';
export const VOICE_BUNDLE='@deepseek-ai/dsh-experimental-voice-input-bundle';
const busy=new Set(['checking','downloading','loading','waking','cancelling']);
export class HostSpeech{
 constructor(get){this.get=get}
 status(){const service=this.get('speechToText');const provider=service?.snapshot().providers.find(p=>p.id===SPEECH_PROVIDER&&p.location==='host-local');const phase=provider?.preparation?.phase||'disabled';return {supported:!!service||!!this.get('pluginManager'),enabled:!!provider,ready:['ready','standby'].includes(phase),phase,model:'SenseVoiceSmall',provider:SPEECH_PROVIDER,busy:busy.has(phase),preparation:provider?.preparation||null}}
 async prepare(){if(!this.get('speechToText')?.listProviders().some(p=>p.id===SPEECH_PROVIDER)){
  const manager=this.get('pluginManager');if(!manager)throw Error('请在 DSH 插件管理中启用“语音输入”');
  const result=await manager.setBundleEnabled(VOICE_BUNDLE,true);
  if(result.application==='restart-required')return {...this.status(),restartRequired:true};
  if(result.application&&result.application!=='applied')throw Error('DSH 语音输入未启用，请检查插件管理');
 }
 const service=this.get('speechToText');if(!service?.listProviders().some(p=>p.id===SPEECH_PROVIDER))throw Error('DSH 语音服务尚未加载，请检查“语音输入”插件');
 if(!this.status().ready)service.prepare(SPEECH_PROVIDER);return this.status();
 }
 async transcribe(bytes,language,signal){const service=this.get('speechToText');if(!this.status().ready)throw Error('DSH 本地语音模型尚未准备好，请先准备模型');
 if(bytes.byteLength>4*1024*1024)throw Error('单段音频过长，请分段处理');
 const spec=service.resolve({audio:Buffer.from(bytes),providerId:SPEECH_PROVIDER,language:['zh','en'].includes(language)?language:'auto'});
 return await service.transcribe(spec,AbortSignal.any([signal,AbortSignal.timeout(120000)]));
 }
}
