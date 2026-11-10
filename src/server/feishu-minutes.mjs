import {execFile} from 'node:child_process';
import {lstat,mkdtemp,readFile,realpath,rm} from 'node:fs/promises';
import {homedir,tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {promisify} from 'node:util';
import {parseMinutesLink,parseMinutesTranscript} from '../feishu-minutes.mjs';

const exec=promisify(execFile);
const scopes='minutes:minutes.basic:read minutes:minutes.artifacts:read';
const maxFileBytes=8*1024*1024;
const fail=(message,status=400)=>Object.assign(Error(message),{status});
const loginRequired=()=>fail('请先授权飞书读取妙记和逐字稿。',401);

function json(value){
 try{return JSON.parse(value)}catch{return null}
}

function apiError(result,detail=''){
 const error=result?.error;
 const message=[error?.type,error?.subtype,error?.message,detail].filter(Boolean).join(' ');
 if(error?.code===2091003||/still being generated|2091003/i.test(message))return fail('飞书仍在生成这份妙记，请稍后重试。',409);
 if(/missing.scope|scope.*(required|denied)|not.logged.in|authorization|authentication|invalid.grant|token.*(expired|invalid)|invalid.*token/i.test(message))return loginRequired();
 if(/config init|not.configured|no.*config/i.test(message))return fail('请先配置飞书官方 CLI，再授权导入妙记。',503);
 if(error?.code===2091005||/permission|access.denied|forbidden|2091005/i.test(message))return fail('当前飞书账号无权读取此妙记或导出逐字稿，请在飞书核对共享和导出权限。',403);
 if(/not.found|not.exist/i.test(message))return fail('找不到这条飞书妙记，请检查链接。',404);
 return fail('飞书暂时无法读取妙记，请稍后重试。',502);
}

async function run(args,{cwd,signal,timeout=25000}={}){
 const paths=[join(homedir(),'.local/bin/lark-cli'),'/opt/homebrew/bin/lark-cli','/usr/local/bin/lark-cli','lark-cli'];
 for(const path of paths){
  let stdout;
  try{
   ({stdout}=await exec(path,args,{cwd,signal,timeout,maxBuffer:1024*1024}));
  }catch(error){
   if(error.code==='ENOENT')continue;
   if(error.name==='AbortError')throw fail('已取消飞书请求。',499);
   if(error.killed)throw fail('飞书请求超时，请重试。',504);
   const result=json(error.stdout)||json(error.stderr);
   throw apiError(result,result?.data?.minutes?.[0]?.error||String(error.stderr||''));
  }
  const result=json(stdout);
  if(!result||result.ok===false)throw apiError(result,result?.data?.minutes?.[0]?.error);
  return result;
 }
 throw fail('此电脑尚未安装飞书官方 CLI。请安装并配置后再导入妙记。',503);
}

export class FeishuMinutes{
 constructor(execute=run){this.execute=execute;this.controller=new AbortController();this.flow=null;this.starting=null;}
 dispose(){this.controller.abort();}
 async preview(link,requestSignal){
  const source=parseMinutesLink(link);
  const signal=AbortSignal.any([requestSignal,this.controller.signal]);
  const directory=await realpath(await mkdtemp(join(tmpdir(),'dsh-feishu-minutes-')));
  try{
   const result=await this.execute(['minutes','+detail','--as','user','--minute-tokens',source.token,'--transcript'],{cwd:directory,signal});
   const entries=result.data?.minutes;
   const minute=Array.isArray(entries)&&entries.find(entry=>entry?.minute_token===source.token);
   if(!minute)throw fail('飞书返回的妙记与链接不匹配。',502);
   if(minute.error)throw apiError(null,minute.error);
   const expected=join(directory,'minutes',source.token,'transcript.txt');
   const path=minute.artifacts?.transcript_file;
   if(!path)throw fail('飞书尚未提供这条妙记的逐字稿。',404);
   if(typeof path!=='string'||resolve(directory,path)!==expected||await realpath(expected).catch(()=>null)!==expected){
    throw fail('飞书逐字稿文件未能安全读取。',502);
   }
   const info=await lstat(expected);
   if(!info.isFile()||info.size>maxFileBytes)throw fail('飞书逐字稿文件超出读取上限。',413);
   const parsed=parseMinutesTranscript(await readFile(expected,'utf8'));
   const title=typeof minute.title==='string'?minute.title.trim().slice(0,200):'';
   return {...source,title:title||'飞书妙记',...parsed};
  }finally{await rm(directory,{recursive:true,force:true});}
 }
 async authorize(){
  if(this.flow?.pending)return this.authorizationStatus();
  if(this.starting)return this.starting;
  this.starting=this.startAuthorization();
  try{return await this.starting;}finally{this.starting=null;}
 }
 async startAuthorization(){
  const signal=this.controller.signal;
  const result=await this.execute(['auth','login','--scope',scopes,'--no-wait','--json'],{signal});
  let url;
  try{url=new URL(result.verification_url)}catch{}
  if(url?.origin!=='https://accounts.feishu.cn'||url.pathname!=='/oauth/v1/device/verify'||url.username||url.password||
     typeof result.device_code!=='string'||!/^[A-Za-z0-9_.-]{8,512}$/.test(result.device_code)){
   throw fail('飞书没有返回有效的授权链接。',502);
  }
  const flow=this.flow={pending:true,url:result.verification_url};
  const timeout=Math.min(900,Math.max(1,Number(result.expires_in)||600))*1000;
  this.execute(['auth','login','--device-code',result.device_code,'--json'],{signal,timeout})
   .then(answer=>{
    const granted=new Set(String(answer.scope||'').split(/\s+/));
    if(scopes.split(' ').every(scope=>granted.has(scope)))flow.authorized=true;
    else flow.error='飞书尚未授予妙记读取权限。请检查管理员审批或重新授权。';
   })
   .catch(error=>{flow.error=error.status===401?'授权未完成或已过期，请重新发起授权。':error.message;})
   .finally(()=>{flow.pending=false;});
  return this.authorizationStatus();
 }
 authorizationStatus(){
  if(this.flow?.pending)return {pending:true,url:this.flow.url};
  return {pending:false,authorized:this.flow?.authorized===true,error:this.flow?.error};
 }
}
