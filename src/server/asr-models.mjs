import {mkdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {StreamingSpeech,streamingAvailable} from './streaming-speech.mjs';

export const X_ASR='x-asr';
export const SENSEVOICE='sensevoice-local';
const definitions={
 [X_ASR]:{id:X_ASR,label:'X-ASR',source:'本地模型',mode:'streaming',description:'中英自动识别，讲话时显示中间结果。需要 Mac 原生录音。'},
 [SENSEVOICE]:{id:SENSEVOICE,label:'SenseVoiceSmall',source:'本地模型',mode:'segmented',description:'DSH 本地语音输入，按音频分段显示。支持自动、中文和英文。'},
};

export class ASRModels{
 constructor({root,storage,speech,directory,nativeAvailable,createStream=(path,callbacks)=>new StreamingSpeech(path,callbacks)}){
  Object.assign(this,{root,storage,speech,directory,nativeAvailable,createStream});
  this.path=join(root,'asr-model.json');
  this.phase='unprepared';
  this.queue=Promise.resolve();
 }
 async selected(){
  try{
   const id=JSON.parse(await readFile(this.path,'utf8')).id;
   if(!Object.hasOwn(definitions,id))throw Error();
   return id;
  }catch(error){if(error.code==='ENOENT')return this.directory&&streamingAvailable(this.directory)?X_ASR:SENSEVOICE;throw Error('转写模型设置无法读取，请在设置中重新选择')}
 }
 async snapshot(){
  const selected=await this.selected().catch(()=>null);
  const available=await this.nativeAvailable()&&streamingAvailable(this.directory);
  const voice=this.speech.status();
  return {selected,models:[
   {...definitions[X_ASR],available,ready:available&&this.phase==='ready',phase:available?this.phase:'unavailable',busy:this.phase==='initializing'},
   {...definitions[SENSEVOICE],...voice,available:voice.supported},
  ]};
 }
 async select(id){
  if(!Object.hasOwn(definitions,id))throw Error('请选择已支持的语音转写模型');
  const write=this.queue.then(async()=>{
   await mkdir(this.root,{recursive:true,mode:0o700});
   await this.storage.atomic(this.path,JSON.stringify({id}));
  });
  this.queue=write.catch(()=>{});
  await write;
  return this.snapshot();
 }
 async assertUsable(id,language='auto'){
  if(id===SENSEVOICE){
   if(!this.speech.status().ready)throw Error('SenseVoiceSmall 尚未就绪，请在设置中启用并准备模型');
   return;
  }
  if(id!==X_ASR)throw Error('请选择有效的语音转写模型');
  if(language!=='auto')throw Error('X-ASR 使用中英自动识别。固定语种可在设置中选择 SenseVoiceSmall');
  if(!await this.nativeAvailable())throw Error('X-ASR 需要可用的 Mac 原生录音组件');
  if(!streamingAvailable(this.directory))throw Error('本机尚未准备好 X-ASR 离线模型资源，可先选用已启用的 SenseVoiceSmall 或仅录音');
 }
 async openStream(callbacks){
  this.phase='initializing';
  let stream;
  try{
   stream=this.createStream(this.directory,{...callbacks,warning:message=>{this.phase='failed';callbacks.warning(message)}});
   await stream.ready;
   this.phase='ready';
   return stream;
  }catch{
   stream?.close();
   this.phase='failed';
   throw Error('X-ASR 初始化失败，请在设置中重试，或选择 SenseVoiceSmall 后重新录音');
  }
 }
 async prepare(id){
  if(id===SENSEVOICE)return this.speech.prepare();
  await this.assertUsable(id);
  const stream=await this.openStream({partial:()=>{},final:()=>{},warning:()=>{}});
  stream.close();
  return {ready:true};
 }
}
