// Persistent, isolated inference worker. Each request is <= 60s of mono PCM.
const {join}=require('node:path');
const {readFileSync,lstatSync}=require('node:fs');
const {SpeakerRegistry}=require('./speaker-core.cjs');
const root=process.argv[2],directory=process.argv[3];
function send(value){if(process.connected)process.send(value)}
try{
 const addon=require(join(root,'native/sherpa-onnx.node'));
 const model=name=>join(root,'speaker',name);
 const diarizer=addon.createOfflineSpeakerDiarization({segmentation:{pyannote:{model:model('segmentation.onnx'),windowShiftRatio:.25},numThreads:1,provider:'cpu'},embedding:{model:model('embedding.onnx'),numThreads:1,provider:'cpu'},clustering:{numClusters:-1,threshold:.65},minDurationOn:.45,minDurationOff:.4});
 const extractor=addon.createSpeakerEmbeddingExtractor({model:model('embedding.onnx'),numThreads:1,provider:'cpu',debug:false});
 const registry=new SpeakerRegistry();
 process.on('message',message=>{
  if(message.command==='close'){process.disconnect();return}
  const {id,files,offset,from}=message;
  try{
   if(!Array.isArray(files)||!files.length||files.length>65||!files.every(n=>/^\d{6}\.wav$/.test(n))||!Number.isFinite(offset)||!Number.isFinite(from))throw Error('发言人分析窗口无效');
   const sizes=files.map(n=>{const f=lstatSync(join(directory,n));if(!f.isFile()||f.size<46||f.size>320044)throw Error('原始录音分段无效');return (f.size-44)/2});
   const count=sizes.reduce((a,b)=>a+b,0);if(!Number.isInteger(count)||count>60*16000)throw Error('分析窗口超过 60 秒');
   const samples=new Float32Array(count);let cursor=0;
   for(const name of files){const b=readFileSync(join(directory,name));if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',36,40)!=='data'||b.readUInt16LE(20)!==1||b.readUInt16LE(22)!==1||b.readUInt32LE(24)!==16000||b.readUInt16LE(34)!==16||b.readUInt32LE(40)!==b.length-44)throw Error('原始录音不是 16kHz PCM16');for(let i=44;i<b.length;i+=2)samples[cursor++]=b.readInt16LE(i)/32768}
   const local=addon.offlineSpeakerDiarizationProcess(diarizer,samples),mapping=new Map();
   for(const speaker of new Set(local.map(s=>s.speaker))){
    // Avoid overlapping speech when building a voice prototype.
    const turns=local.filter(s=>s.speaker===speaker&&s.end-s.start>=.9&&!local.some(o=>o.speaker!==speaker&&o.start<s.end&&o.end>s.start));
    const parts=[];let length=0;
    for(const t of turns){const p=samples.subarray(Math.max(0,Math.floor(t.start*16000)),Math.min(count,Math.ceil(t.end*16000)));const n=Math.min(p.length,160000-length);if(n>0){parts.push(p.subarray(0,n));length+=n}if(length>=160000)break}
    if(length<16000){mapping.set(speaker,-1);continue}
    const voice=new Float32Array(length);let at=0;for(const p of parts){voice.set(p,at);at+=p.length}
    const stream=addon.speakerEmbeddingExtractorCreateStream(extractor);
    addon.acceptWaveformOnline(stream,{sampleRate:16000,samples:voice});addon.inputFinished(stream);
    mapping.set(speaker,addon.speakerEmbeddingExtractorIsReady(extractor,stream)?registry.match(addon.speakerEmbeddingExtractorComputeEmbedding(extractor,stream,false)):-1);
   }
   const segments=local.map(s=>({start:Math.max(from,offset+s.start),end:offset+s.end,speaker:mapping.get(s.speaker)??-1})).filter(s=>s.end>s.start);
   send({id,segments,processedThrough:offset+count/16000,profileCount:registry.profiles.length,windowSamples:count});
  }catch(error){send({id,error:String(error.message).slice(0,300)})}
 });
 process.on('disconnect',()=>process.exit(0));send({ready:true});
}catch(error){send({error:String(error.message).slice(0,300)});process.disconnect()}
