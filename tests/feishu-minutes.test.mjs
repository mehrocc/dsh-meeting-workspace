import assert from 'node:assert/strict';
import {mkdir,writeFile,lstat} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {test} from 'node:test';
import {parseMinutesLink,parseMinutesTranscript,saveMinutesMeeting} from '../src/feishu-minutes.mjs';
import {FeishuMinutes} from '../src/server/feishu-minutes.mjs';
import {emptyData,validateData} from '../src/model.mjs';

const token='obcn12345678901234567890';
const url='https://example.feishu.cn/minutes/'+token;
const transcript='2026-11-10 10:01:26 时长34分 11秒\n\nSpeaker 1 00:00:55.260 \n第一段发言\n下一行\n\n张三 00:01:06.570\n第二段发言';

test('accepts only HTTPS Feishu Minutes URLs and deduplicates tracking variants',()=>{
 assert.deepEqual(parseMinutesLink(' '+url+'/?from=share#source '),{token,url});
 for(const link of [url.replace('https:','http:'),url.replace('feishu.cn','feishu.cn.example.com'),
  url.replace('/minutes/','/vc/'),url+'/download','https://example.feishu.cn@other.test/minutes/'+token]){
  assert.throws(()=>parseMinutesLink(link),/飞书妙记分享链接/);
 }
});

test('Minutes parser preserves timestamp, speaker labels and multiline text',()=>{
 const parsed=parseMinutesTranscript(transcript);
 assert.equal(parsed.date,'2026-11-10');
 assert.deepEqual(parsed.participants,['张三']);
 assert.deepEqual(parsed.rows.map(({speaker,time,startSeconds,text})=>({speaker,time,startSeconds,text})),[
  {speaker:'Speaker 1',time:'00:00:55.260',startSeconds:55.26,text:'第一段发言\n下一行'},
  {speaker:'张三',time:'00:01:06.570',startSeconds:66.57,text:'第二段发言'},
 ]);
 assert.throws(()=>parseMinutesTranscript('   '),/尚未提供/);
});

test('provider reads the user-authorized artifact and discards the staging directory',async()=>{
 let directory;
 const provider=new FeishuMinutes(async(args,{cwd})=>{
  assert.deepEqual(args,['minutes','+detail','--as','user','--minute-tokens',token,'--transcript']);
  directory=cwd;
  const path='minutes/'+token+'/transcript.txt';
  await mkdir(dirname(join(cwd,path)),{recursive:true});
  await writeFile(join(cwd,path),transcript);
  return {ok:true,data:{minutes:[{minute_token:token,title:'会议标题',artifacts:{transcript_file:path}}]}};
 });
 const preview=await provider.preview(url,new AbortController().signal);
 assert.equal(preview.title,'会议标题');
 assert.equal(preview.rows.length,2);
 await assert.rejects(lstat(directory),{code:'ENOENT'});
 const data=emptyData(),id=crypto.randomUUID();
 const fields={title:preview.title,project:'default',date:preview.date};
 assert.deepEqual(saveMinutesMeeting(data,preview,fields,id),{id,duplicate:false});
 assert.deepEqual(saveMinutesMeeting(data,preview,fields,crypto.randomUUID()),{id,duplicate:true});
 assert.equal(data.meetings.length,1);
 assert.equal(data.meetings[0].sourceUrl,url);
 assert.equal(data.meetings[0].aiStatus,'等待整理');
 validateData(data);
});

test('provider does not import an unavailable or out-of-directory transcript',async()=>{
 const errors=[
  [{error:'No read permission for minute'},403],
  [{error:'minute artifacts are still being generated'},409],
  [{artifacts:{transcript_file:''}},404],
  [{artifacts:{transcript_file:'../transcript.txt'}},502],
 ];
 for(const [minute,status] of errors){
  const provider=new FeishuMinutes(async()=>({data:{minutes:[{minute_token:token,...minute}]}}));
  await assert.rejects(provider.preview(url,new AbortController().signal),{status});
 }
});

test('only the public verification URL reaches the client during authorization',async()=>{
 const scope='minutes:minutes.basic:read minutes:minutes.artifacts:read';
 const verification='https://accounts.feishu.cn/oauth/v1/device/verify?user_code=ABCD-EFGH';
 let resolveAuthorization;
 const finish=new Promise(resolve=>{resolveAuthorization=resolve});
 const provider=new FeishuMinutes(async args=>{
  if(args.includes('--no-wait')){
   assert.ok(args.includes(scope));
   return {device_code:'private-device-code',verification_url:verification,expires_in:600};
  }
  assert.ok(args.includes('private-device-code'));
  return finish;
 });
 assert.deepEqual(await provider.authorize(),{pending:true,url:verification});
 resolveAuthorization({scope});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(provider.authorizationStatus().authorized,true);
});
