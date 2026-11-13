import {build} from 'esbuild';import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
await mkdir('lib',{recursive:true});await mkdir('dsh',{recursive:true});
const client=await build({entryPoints:['src/client/main.jsx'],bundle:true,write:false,format:'cjs',platform:'browser',external:['react','react-dom'],loader:{'.css':'text'},target:'es2022',jsx:'transform'});
await writeFile('lib/client.js',`window.__ModuleLoader__.load({id:'dsh-meeting-workspace-local',factory:(require)=>{const module={exports:{}};const exports=module.exports;\n${client.outputFiles[0].text}\nreturn module.exports;}});\n`);
await build({entryPoints:['src/server/index.mjs'],outfile:'dsh/index.js',bundle:true,format:'esm',platform:'node',packages:'external',target:'node22'});
console.log('Built DSH server and single-file client');

for(const file of ['speaker-worker.cjs','speaker-core.cjs'])await copyFile('src/server/'+file,'dsh/'+file);
