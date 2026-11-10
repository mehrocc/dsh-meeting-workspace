import {createHash} from 'node:crypto';
import {scopeFromBinding,sessionSelection} from '../assistant-context.mjs';
const retryPrompt = '请重试回答上一条会议助手问题。沿用当前会话范围。可读取原文和安排核对，已经执行的操作只报告现状，不重复写入。';
export function conversationMessages(events) {
 let running = false, issue = '', retry = null, hasQuestion = false;
 const messages = [];
 for (const event of events) {
  if (event.type === 'turn/start') { running = true; issue = ''; retry = null; }
  if (event.type === 'turn/end') {
   running = false;
   const reason = event.data?.reason?.kind;
   if (reason === 'error' || reason === 'aborted') {
    issue = reason === 'error' ? '本次模型回复未完成。' : '本次回复已停止。';
    if (hasQuestion && Number.isInteger(event.seq)) retry = event.seq;
   }
  }
  const user = event.type === 'user/message';
  const message = user ? event.data : event.type === 'assistant/message' ? event.data?.message : null;
  if (!message) continue;
  const text = (message.content || []).filter(b => b.type === 'text' && typeof b.text === 'string').map(b => b.text).join('\n');
  if (!text.trim() || (user && text === retryPrompt)) continue;
  if (user) { hasQuestion = true; retry = null; issue = ''; }
  messages.push({id:message.id || String(event.seq),role:user ? 'user' : 'assistant',text:text.slice(0,100000),time:event.time || event.timestamp || null});
 }
 return {messages,running,issue,retry};
}
export class AssistantConversations{
 constructor({get,storage,assistant}){Object.assign(this,{get,storage,assistant});this.readOnlyRetries=new Set();this.retryAdmissions=new Set()}
 services(){const query=this.get('sessionQuery'),controller=this.get('sessionController');if(!query?.readSession||!controller?.prompt)throw Error('DSH 对话服务尚未加载，请稍后重试');return {query,controller}}
 async authorize(id){const assistant=this.assistant();if(!assistant)throw Error('会议助手尚未加载');await assistant.authorize({session:{id}});return assistant}
 async list(signal){const assistant=this.assistant();if(!assistant)throw Error('会议助手尚未加载');const owner=await assistant.ownership.read();if(!owner.added?.includes('mehrocc/dsh-meeting-workspace'))throw Error('工作台尚未加载');const {query}=this.services(),state=await this.storage.read(),records=await query.listSessions(signal),items=[];
  for(const record of records){const id=record.header?.id;if(record.header?.origin==='subagent')continue;if(owner.sessionBindings?.[id]!=='mehrocc/dsh-meeting-workspace')continue;const binding=state.data.assistant?.['session:'+id]||Object.values(state.data.assistant||{}).find(v=>v?.sessionId===id);let title;try{const snapshot=await query.readTitle(id,signal);title=typeof snapshot==='string'?snapshot:snapshot?.title||snapshot?.text}catch{}items.push({id,title:typeof title==='string'&&title.trim()?title:binding?.title||'会议助手对话',scope:scopeFromBinding(binding),createdAt:record.header?.createdAt||null})}return {items};
 }
 async read(id,limit=100){await this.authorize(id);if(!Number.isInteger(limit)||limit<20||limit>2000)throw Error('对话读取范围无效');const {query}=this.services(),result=conversationMessages((await query.readSession(id)).events);return {...result,messages:result.messages.slice(-limit),hasEarlier:result.messages.length>limit,total:result.messages.length}}
 async send({sessionId,text,requestId},signal){await this.authorize(sessionId);if(typeof text!=='string'||!text.trim()||text.length>12000)throw Error('请输入 1 至 12000 字的问题');if(typeof requestId!=='string'||!/^[a-f0-9-]{36}$/i.test(requestId))throw Error('消息请求无效');const {controller}=this.services(),state=await this.storage.read();sessionSelection(state.data,sessionId);if(this.retryAdmissions.has(sessionId))throw Error('正在重试，请稍候');this.readOnlyRetries.delete(sessionId);return controller.prompt({sessionId,requestId,mode:'followup',content:[{type:'text',text:text.trim()}],clientTimeZone:'Asia/Shanghai'},signal)}
 async retry({sessionId,failedTurn}, signal) {
  await this.authorize(sessionId);
  if (this.retryAdmissions.has(sessionId)) return {accepted:true};
  this.retryAdmissions.add(sessionId);
  try {
   const {query,controller} = this.services();
   const result = conversationMessages((await query.readSession(sessionId)).events);
   if (result.running || result.retry === null || result.retry !== failedTurn) throw Error('这条回复的状态已更新，请刷新后再试');
   sessionSelection((await this.storage.read()).data,sessionId);
   const key = createHash('sha256').update(sessionId+':'+failedTurn).digest('hex').slice(0,32);
   const requestId = key.replace(/^(........)(....)(....)(....)(............)$/,'$1-$2-$3-$4-$5');
   this.readOnlyRetries.add(sessionId);
   return await controller.prompt({sessionId,requestId,mode:'followup',content:[{type:'text',text:retryPrompt}],clientTimeZone:'Asia/Shanghai'},signal);
  } finally {
   this.retryAdmissions.delete(sessionId);
  }
 }
 async stop(id){await this.authorize(id);return this.services().controller.cancel({sessionId:id})}
}
