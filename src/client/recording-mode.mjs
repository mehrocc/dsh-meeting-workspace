// A missing/stale capability snapshot must never silently turn transcription off.
export async function resolveRecordingMode({live=true,readCapabilities,prepare}){
 if(live===false)return false;
 let caps=await readCapabilities();
 if(!caps.asrConfigured&&caps.localSpeech?.supported){await prepare();caps=await readCapabilities()}
 if(!caps.asrConfigured)throw Error('本地转写尚未就绪，请在“设置”查看模型准备进度。也可取消“同步转写”仅保存录音。');
 return true;
}

export async function resolveRecordingModel({live=true,id,readModels,prepare}){
 const catalog=await readModels();
 const asrModel=id||catalog?.selected;
 const model=catalog?.models.find(m=>m.id===asrModel);
 if(!model)throw Error('请在设置中选择语音转写模型');
 if(live!==false){
  if(!model.available)throw Error(model.mode==='streaming'?'当前设备无法使用 X-ASR，请选择 SenseVoiceSmall 或仅录音。':'DSH 本地语音服务不可用，请先准备模型。');
  if(model.mode==='segmented')await resolveRecordingMode({prepare:()=>prepare(asrModel),readCapabilities:async()=>{
   const current=(await readModels()).models.find(m=>m.id===asrModel);
   return {asrConfigured:current?.ready,localSpeech:{supported:current?.available}};
  }});
 }
 return {live:live!==false,asrModel,language:model.mode==='streaming'?'auto':undefined};
}
