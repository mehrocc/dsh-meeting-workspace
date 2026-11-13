import {test} from 'node:test';import assert from 'node:assert/strict';
import {readAPIResponse} from '../src/client/api-response.mjs';
test('Harness proxy errors stay readable and preserve HTTP status instead of becoming JSON parser errors',async()=>{
 for(const [status,text] of [[502,'Harness proxy failed'],[503,'Harness unavailable'],[504,'Gateway Timeout']])await assert.rejects(readAPIResponse(new Response(text,{status})),e=>e.status===status&&e.code==='HARNESS_UNAVAILABLE'&&/连接/.test(e.message)&&!/JSON|Unexpected|token/.test(e.message));
});
test('JSON business errors remain available to callers; malformed success responses are rejected safely',async()=>{
 assert.deepEqual(await readAPIResponse(Response.json({error:'麦克风未授权'},{status:400})),{error:'麦克风未授权'});
 assert.deepEqual(await readAPIResponse(Response.json({state:'starting',id:'capture'})),{state:'starting',id:'capture'});
 for(const raw of ['<html>error</html>','null','"wrong shape"'])await assert.rejects(readAPIResponse(new Response(raw)),e=>e.code==='INVALID_SERVICE_RESPONSE');
});
