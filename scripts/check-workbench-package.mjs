import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';import vm from 'node:vm';import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),p=JSON.parse(await readFile('package.json','utf8'));
assert.equal(p.dsh.client.platform,'web');assert(p.dsh.client.inject.includes('dsh-desktop-workbenches'));assert.equal(p.repository.url,'https://github.com/mehrocc/dsh-meeting-workspace');assert(p.dsh.bundle.patch);assert(p.exports['.']&&p.exports['./client']);assert(/^\d+\.\d+\.\d+$/.test(p.version));
for(const file of [p.exports['.'],p.exports['./client'],p.dsh.bundle.patch])assert((await stat(file)).isFile());
const patch=await readFile(p.dsh.bundle.patch,'utf8');assert(patch.includes('name: '+p.name));assert(patch.includes('dshHomePath('));
let module;vm.runInNewContext(await readFile(p.exports['./client'],'utf8'),{window:{__ModuleLoader__:{load(value){module=value}}},console,Blob,URL,TextEncoder,setTimeout,clearTimeout,crypto:globalThis.crypto});assert.equal(module.id,p.name);const client=module.factory(require);let registration;let disposed=false;client.apply({effect(fn){assert.equal(typeof fn(),'function')},desktopWorkbenches:{register(d,c){registration={d,c};return()=>{disposed=true}}},uiWorkspace:{}});assert.equal(registration.d.title,'会议纪要工作台');assert.equal(registration.d.customFrame,true);assert(!registration.d.id);assert.equal(registration.d.repository,p.repository.url);assert.equal(typeof registration.c,'function');const rawHostService={};const panel=registration.c({service:rawHostService});assert.notEqual(panel.props.service,rawHostService,'panel must use the registering plugin context, not the raw host service');assert.equal(typeof panel.props.service.ensureSession,'function');assert(client.inject.includes('desktopWorkbenches'));
const server=await import('../dsh/index.js');assert.equal(server.Config.type,'object');assert.equal(typeof server.apply,'function');assert(server.inject.includes('connection'));
console.log('PASS: package fields, patch, entries, ModuleLoader identity, native registration, full-page layout and Config schema');

assert(!p.dependencies?.ws&&!p.bin);
assert(!p.files.some(path=>path==='runtime'||path.startsWith('runtime/')));
const modelManifest=JSON.parse(await readFile('scripts/speech-runtime-sha256.json','utf8'));
for(const file of ['worker.cjs','native/sherpa-onnx.node','model/encoder.int8.onnx','speaker-worker.cjs','speaker/segmentation.onnx','speaker/embedding.onnx']){
 assert.match(modelManifest[file],/^[0-9a-f]{64}$/);
}
console.log('PASS: local speech assets are versioned separately from the workbench package');

const app='native/darwin-arm64/DSHMeetingAudio.app';const binary=app+'/Contents/MacOS/DSHMeetingAudio';assert((await stat(binary)).mode&0o111);const info=await readFile(app+'/Contents/Info.plist','utf8');assert(info.includes('NSMicrophoneUsageDescription')&&info.includes('io.dsh.meeting-workspace.audio'));assert(p.files.includes(app));if(process.platform==='darwin'&&process.arch==='arm64'){execFileSync('/usr/bin/codesign',['--verify','--strict',app]);const result=JSON.parse(execFileSync('./'+binary,['--self-test'],{encoding:'utf8'}));assert(result.passed)}console.log('PASS: native capture bundle, permission purpose, signature and mixer tests');

if(process.platform==='darwin'&&process.arch==='arm64'){const activity=JSON.parse(execFileSync('./'+binary,['--activity-self-test'],{encoding:'utf8'}));assert(activity.passed&&activity.recordsAudio===false);console.log('PASS: supported meeting app identities, helper matching, ignore own recorder and browsers')}

if(process.platform==='darwin'&&process.arch==='arm64'){const r=JSON.parse(execFileSync('./'+binary,['--microphone-recovery-self-test'],{encoding:'utf8'}));assert(r.passed&&r.recordsAudio===false);console.log('PASS: microphone startup grace, route recovery, real samples, bounded retries, stop/pause and permission loss')}
