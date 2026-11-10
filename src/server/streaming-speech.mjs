import {fork} from 'node:child_process';
import {existsSync} from 'node:fs';
import {join} from 'node:path';

export function streamingAvailable(directory) {
 return process.platform==='darwin' && process.arch==='arm64' && !!directory &&
  ['worker.cjs','native/sherpa-onnx.node','native/libonnxruntime.dylib','native/libsherpa-onnx-c-api.dylib','native/libsherpa-onnx-cxx-api.dylib','model/encoder.int8.onnx','model/decoder.onnx','model/joiner.int8.onnx','model/tokens.txt','model/bpe.model'].every(file=>existsSync(join(directory,file)));
}

export class StreamingSpeech {
 constructor(directory,{partial,final,warning}) {
  Object.assign(this,{partial,final,warning});
  this.inFlight=0;this.closed=false;
  this.done=new Promise(resolve=>{this.resolveDone=resolve});
  this.ready=new Promise((resolve,reject)=>{this.resolveReady=resolve;this.rejectReady=reject});
  this.ready.catch(()=>{});
  this.child=fork(join(directory,'worker.cjs'),[],{execArgv:[],env:{...process.env,ELECTRON_RUN_AS_NODE:'1'},stdio:['ignore','ignore','ignore','ipc']});
  this.child.on('message',message=>{
   if(this.closed)return;
   if(message.type==='ready'){clearTimeout(this.timer);this.resolveReady()}
   else if(message.type==='ack')this.inFlight--;
   else if(message.type==='partial')this.partial(message);
   else if(message.type==='final')this.final(message);
   else if(message.type==='done')this.close();
   else if(message.type==='error')this.fail();
  });
  this.child.on('error',()=>this.fail());
  this.child.on('exit',()=>this.fail());
  // Loading the ONNX weights from a cold disk can take over 12 seconds.
  this.timer=setTimeout(()=>this.fail(),30000);
  this.timer.unref?.();
 }
 send(message) {
  if(this.closed)return;
  if(!this.child.connected){this.fail();return;}
  this.child.send(message,error=>{if(error)this.fail()});
 }
 audio(data,seconds) {
  if(this.closed)return;
  if(this.inFlight>=80){this.fail();return;}
  this.inFlight++;this.send({type:'pcm',data,seconds});
 }
 boundary(){this.send({type:'boundary'})}
 async finish(){
  if(this.closed)return;
  clearTimeout(this.timer);
  this.timer=setTimeout(()=>this.fail(),15000);
  this.timer.unref?.();
  this.send({type:'finish'});
  await this.done;
 }
 fail(){
  if(this.closed)return;
  this.warning('本机流式识别中断，录音继续保存，结束后尝试补转');
  this.close();
 }
 close(){
  if(this.closed)return;
  this.closed=true;clearTimeout(this.timer);
  this.rejectReady(Error('本机流式识别未能初始化'));
  this.child.kill();
  this.resolveDone();
 }
}
