export function scopeKey(scope={kind:'all'}){return scope.kind==='meeting'?'meeting:'+scope.id:scope.kind==='project'?'project:'+scope.id:'all'}
export function scopeFromBinding(binding){return binding?.meetingId?{kind:'meeting',id:binding.meetingId}:binding?.project?{kind:'project',id:binding.project}:{kind:'all'}}
export function scopeBinding(scope){return {meetingId:scope.kind==='meeting'?scope.id:null,project:scope.kind==='project'?scope.id:null}}
export function selectedMeetings(data,scope={kind:'all'}){
 if(scope.kind==='meeting'){const meeting=data.meetings.find(m=>m.id===scope.id);if(!meeting)throw Error('所选会议已删除，请重新选择范围');return {scope:{...scope,label:meeting.title,count:1},data:{...data,meetings:[meeting]}}}
 if(scope.kind==='project'){const project=data.projects.find(p=>p.id===scope.id);if(!project)throw Error('所选项目已删除，请重新选择范围');const meetings=data.meetings.filter(m=>m.project===scope.id);return {scope:{...scope,label:project.name,count:meetings.length},data:{...data,meetings}}}
 if(scope.kind!=='all')throw Error('会议范围无效');return {scope:{kind:'all',label:'全部会议',count:data.meetings.length},data};
}
export function sessionSelection(data,sessionId){const direct=data.assistant?.['session:'+sessionId];const bindings=direct?[direct]:Object.values(data.assistant||{}).filter(v=>v?.sessionId===sessionId);const scopes=bindings.map(scopeFromBinding);if(new Set(scopes.map(scopeKey)).size>1)throw Error('对话范围关联不一致，请重新选择范围');return selectedMeetings(data,scopes[0]||{kind:'all'})}
