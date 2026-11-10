import {spawn} from 'node:child_process';
export class VoiceActivityGate{
 constructor(){this.samples=[]}
 push(confidence,now){if(!Number.isFinite(confidence)||confidence<0||confidence>1)return;this.samples.push({at:now,voice:confidence>=.65});this.samples=this.samples.filter(s=>s.at>=now-30000).slice(-100)}
 confirmed(now){if(this.samples.length<3||now-this.samples.at(-1).at>5000||now-this.samples[0].at<20000)return false;let speech=0;for(let i=1;i<this.samples.length;i++)if(this.samples[i].voice&&this.samples[i-1].voice)speech+=Math.min(2000,this.samples[i].at-this.samples[i-1].at);return speech>=12000}
 clear(){this.samples=[]}
}
export class OfflineVoiceWatcher{
 constructor({binary,spawnProcess=spawn,now=()=>Date.now()}){Object.assign(this,{binary,spawnProcess,now});this.gate=new VoiceActivityGate();this.phase='off';this.error='';this.child=null;this.blocked=false}
 confirmed(){return this.phase==='listening'&&this.gate.confirmed(this.now())}
 snapshot(){return {phase:this.phase,error:this.error,microphoneActive:this.phase==='listening',speechConfirmed:this.confirmed()}}
 async sync(enabled,paused){if(!enabled){await this.stop('off');this.blocked=false;this.error='';return}if(paused){await this.stop('paused');return}if(this.child||this.blocked)return;
  this.phase='starting';const child=this.spawnProcess(this.binary,['--offline-watch'],{stdio:['pipe','pipe','pipe'],windowsHide:true});this.child=child;const startup=setTimeout(()=>{if(this.child===child&&this.phase==='starting'){this.phase='failed';this.error='等待麦克风授权或检测启动超时，请关闭再开启';this.blocked=true;child.kill()}},30000);startup.unref?.();let buffer='';
  const fail=message=>{if(this.child!==child)return;this.error=message;this.blocked=true;this.phase='failed';child.kill()};
  child.stdout.on('data',chunk=>{if(this.child!==child)return;buffer+=chunk.toString('utf8');if(buffer.length>16384){fail('人声检测组件响应异常，请重新开启');return}let at;while((at=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,at);buffer=buffer.slice(at+1);try{const e=JSON.parse(line);if(e.type==='offline-ready'){clearTimeout(startup);this.phase='listening';this.error=''}else if(e.type==='speech-activity')this.gate.push(e.confidence,this.now());else if(e.type==='offline-permission'||e.type==='offline-error'){this.phase=e.type==='offline-permission'?'permission-required':'failed';this.error=String(e.message||'麦克风检测不可用').slice(0,300);this.blocked=true;child.kill()}}catch{fail('人声检测响应无法读取')}}});
  child.stderr.on('data',()=>{});child.stdin.on('error',()=>{});child.on('error',()=>fail('本机人声检测无法启动，请重新开启'));
  child.on('close',()=>{clearTimeout(startup);if(this.child!==child)return;this.child=null;this.gate.clear();if(!this.blocked){this.blocked=true;this.phase='failed';this.error='人声检测已停止，请关闭再开启重试'}});
 }
 async stop(phase='paused'){const child=this.child;this.child=null;this.gate.clear();this.phase=phase;if(!child)return;await new Promise(resolve=>{const timer=setTimeout(()=>{child.kill();resolve()},1500);timer.unref?.();child.once('close',()=>{clearTimeout(timer);resolve()});child.stdin.end()})}
 async reset(){this.blocked=false;this.error='';await this.stop('off')}
 dispose(){this.stop('off').catch(()=>{})}
}
