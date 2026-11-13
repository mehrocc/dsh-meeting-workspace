import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readModelResult} from '../src/server/ai-output.mjs';
test('meeting answers preserve ordinary prose, Markdown, quotes and code examples',()=>{
 const answer='他负责“接口联调”，周五前完成。\n\n- 来源：[00:12]\n- 字段格式：{"name":"value"}';
 assert.equal(readModelResult(answer,'question').answer,answer);
 const code='```json\n{"name":"value"}\n```';assert.equal(readModelResult(code,'question').answer,code);
});
test('legacy JSON answer envelopes still work and malformed envelopes request a safe retry',()=>{
 assert.equal(readModelResult('```json\n{"answer":"周五验收 [00:12]"}\n```','question').answer,'周五验收 [00:12]');
 assert.throws(()=>readModelResult('{"answer":"他说"好的""}','question'),e=>e.code==='INVALID_AI_RESPONSE'&&!e.message.includes('position'));
});
test('structured summaries stay strict; empty or damaged output cannot become saved facts',()=>{
 assert.deepEqual(readModelResult('{"summary":"摘要","tasks":[]}','meeting'),{summary:'摘要',tasks:[]});
 for(const value of ['null','[]','{"summary":"broken'])assert.throws(()=>readModelResult(value,'meeting'),e=>e.code==='INVALID_AI_RESPONSE');
 assert.throws(()=>readModelResult('  ','question'),e=>e.code==='EMPTY_RESPONSE');
});
