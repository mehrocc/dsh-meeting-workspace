import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {copyFile,lstat,mkdir,mkdtemp,readFile,rename,rm} from 'node:fs/promises';
import {dirname,isAbsolute,join} from 'node:path';
import {speechRuntimeDirectory} from '../src/speech-runtime-location.mjs';

const [source,metadataRoot]=process.argv.slice(2);
if(!source||!metadataRoot||!isAbsolute(source)||!isAbsolute(metadataRoot)){
 throw Error('用法：npm run prepare:speech-runtime -- <旧版 runtime/streaming 绝对路径> <工作台数据目录绝对路径>');
}
const files=JSON.parse(await readFile(new URL('./speech-runtime-sha256.json',import.meta.url),'utf8'));
const target=speechRuntimeDirectory(metadataRoot);
const parent=dirname(target);

async function verify(directory){
 for(const [relative,expected] of Object.entries(files)){
  const file=join(directory,relative);
  if(!(await lstat(file)).isFile())throw Error('模型资源不是普通文件：'+relative);
  const digest=createHash('sha256');
  for await(const buffer of createReadStream(file))digest.update(buffer);
  if(digest.digest('hex')!==expected)throw Error('模型资源校验失败：'+relative);
 }
}

const existing=await lstat(target).catch(error=>{
 if(error.code!=='ENOENT')throw error;
 return null;
});
if(existing){
 if(!existing.isDirectory())throw Error('离线模型目录无效');
 await verify(target);
}else{
 await mkdir(parent,{recursive:true,mode:0o700});
 const staging=await mkdtemp(join(parent,'.staging-'));
 try{
  for(const relative of Object.keys(files)){
   const original=join(source,relative);
   const destination=join(staging,relative);
   if(!(await lstat(original)).isFile())throw Error('旧版模型资源不是普通文件：'+relative);
   await mkdir(dirname(destination),{recursive:true,mode:0o700});
   await copyFile(original,destination);
  }
  await verify(staging);
  try{await rename(staging,target)}
  catch(error){
   if(!['EEXIST','ENOTEMPTY'].includes(error.code))throw error;
   await verify(target);
  }
 }finally{await rm(staging,{recursive:true,force:true})}
}
console.log('离线转写和发言人区分资源已校验，可跨工作台版本复用。');
