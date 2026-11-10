import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,mkdir,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {emptyData,createMeeting,allTasks,validateData,markdown} from '../src/model.mjs';import {patchTask,taskOwners,peopleFor,removeProject,setTaskPersonAvailable} from '../src/task-editing.mjs';import {MeetingStorage} from '../src/server/storage.mjs';import {dashboardItems} from '../src/dashboard.mjs';import {searchMeetings} from '../src/server/meeting-assistant.mjs';
function fixture(){const d=emptyData();d.projects.push({id:'product',name:'产品项目'});const m=createMeeting('虚构评审','default','00:12 小王：确认接口');m.tasks.push({id:'task',title:'核对接口',owner:'原有负责人',due:'',done:false,ref:0});d.meetings.push(m);return {d,m}}
test('inline task fields persist in the same meeting with multiple owners and independent project',async t=>{const {d,m}=fixture(),root=await mkdtemp(join(tmpdir(),'mw-task-'));t.after(()=>rm(root,{recursive:true,force:true}));await mkdir(join(root,'data'));const storage=new MeetingStorage(join(root,'meta'));await storage.choose(join(root,'data'));await storage.write(d,0);await storage.mutate(data=>patchTask(data,m.id,'task',{title:'核对接口与验收范围',owners:['原有负责人','Alex'],due:'2026-11-09',project:'product'},{title:'核对接口',owners:['原有负责人'],due:'',project:'default'}));const saved=(await new MeetingStorage(join(root,'meta')).read()).data;const task=allTasks(saved)[0];assert.equal(task.project,'product');assert.equal(saved.meetings[0].project,'default');assert.deepEqual(task.owners,['原有负责人','Alex']);assert.equal(task.ref,0);assert.equal(task.meetingId,m.id);assert(peopleFor(saved).includes('Alex'));assert(markdown(saved.meetings[0]).includes('原有负责人、Alex'));assert.equal(dashboardItems(saved,'product').taskCount,1);assert.equal(searchMeetings(saved,{kind:'tasks',owner:'Alex'}).total,1);validateData(saved);patchTask(saved,m.id,'task',{owners:[]});assert(peopleFor(saved).includes('Alex'));assert.equal(allTasks(saved)[0].owner,'')});
test('legacy owners are kept as written and invalid edits or concurrent same-field changes fail',()=>{const {d,m}=fixture();m.tasks[0].owner='Smith, John';assert.deepEqual(taskOwners(m.tasks[0]),['Smith, John']);patchTask(d,m.id,'task',{due:'2026-11-10'});patchTask(d,m.id,'task',{title:'新内容'},{title:'核对接口'});assert.throws(()=>patchTask(d,m.id,'task',{title:'覆盖'},{title:'核对接口'}),/其他窗口/);for(const patch of [{title:' '},{owners:['重复','重复']},{owners:['a\nb']},{due:'2026-02-30'},{project:'missing'},{meetingId:'other'}])assert.throws(()=>patchTask(d,m.id,'task',patch));assert.throws(()=>patchTask(d,m.id,'deleted',{done:true}));assert.equal(allTasks(d)[0].due,'2026-11-10')});
test('backup restore retains roster and project deletion repairs task overrides',()=>{const {d,m}=fixture();patchTask(d,m.id,'task',{owners:['小王','Alex'],project:'product'});const restored=JSON.parse(JSON.stringify(d));validateData(restored);removeProject(restored,'product');validateData(restored);assert.equal(allTasks(restored)[0].project,'default');assert.deepEqual(restored.taskPeople,['小王','Alex']);assert.throws(()=>removeProject(restored,'default'));const bad=structuredClone(d);bad.meetings[0].tasks[0].owner='不一致';assert.throws(()=>validateData(bad),/负责人/)});

test('removing a candidate keeps historical assignments and survives a backup round trip',()=>{
 const {d,m}=fixture();
 const name='原有负责人';
 setTaskPersonAvailable(d,name,false);
 assert.deepEqual(peopleFor(d,{assignableOnly:true}),[]);
 assert.deepEqual(peopleFor(d),[name]);
 assert.deepEqual(taskOwners(m.tasks[0]),[name]);
 patchTask(d,m.id,'task',{owners:[name,'新增同事']});
 const restored=JSON.parse(JSON.stringify(d));
 validateData(restored);
 assert.deepEqual(peopleFor(restored,{assignableOnly:true}),['新增同事']);
 setTaskPersonAvailable(restored,name,true);
 assert.ok(peopleFor(restored,{assignableOnly:true}).includes(name));
 assert.deepEqual(taskOwners(restored.meetings[0].tasks[0]),[name,'新增同事']);
});
