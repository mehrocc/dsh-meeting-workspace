import {execFileSync} from 'node:child_process';
import {chmod, mkdtemp, readFile, rename, rm, stat} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';

const {name, version} = JSON.parse(await readFile('package.json', 'utf8'));
const archiveName = `${name}-${version}.tgz`;
const destination = resolve(process.argv[2] || '..', archiveName);
const staging = await mkdtemp(join(tmpdir(), 'dsh-meeting-package-'));
const tarEnv = {...process.env, COPYFILE_DISABLE: '1', LC_ALL: 'C'};
const executable = 'native/darwin-arm64/DSHMeetingAudio.app/Contents/MacOS/DSHMeetingAudio';

try {
  execFileSync('pnpm', ['pack', '--pack-destination', staging], {stdio: ['ignore', 'pipe', 'inherit']});
  execFileSync('tar', ['-xzf', join(staging, archiveName), '-C', staging], {env: tarEnv});
  const sourceMode = (await stat(executable)).mode & 0o777;
  if (!(sourceMode & 0o111)) throw Error('The signed native helper is not executable');
  // pnpm treats packaged files outside the bin map as regular data.
  await chmod(join(staging, 'package', executable), sourceMode);
  const packed = join(staging, 'verified.tgz');
  execFileSync('tar', ['-czf', packed, '-C', staging, 'package'], {env: tarEnv});
  const mode = execFileSync('tar', ['-tvzf', packed, 'package/'+executable], {env: tarEnv, encoding:'utf8'});
  if (!mode.split(/\s+/)[0].includes('x')) throw Error('The native helper lost its executable bit in the archive');
  const entries = execFileSync('tar', ['-tzf', packed], {env: tarEnv, encoding:'utf8'});
  if (entries.split('\n').some(name=>name.startsWith('package/runtime/'))) throw Error('The update contains speech assets');
  if ((await stat(packed)).size > 8 * 1024 * 1024) throw Error('The workbench update exceeds the local installer limit of 8 MiB');
  await rename(packed, destination);
  console.log(destination);
} finally {
  await rm(staging, {recursive:true, force:true});
}
