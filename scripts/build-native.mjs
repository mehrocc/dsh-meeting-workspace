import {execFileSync} from 'node:child_process';
import {mkdir,copyFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const app='native/darwin-arm64/DSHMeetingAudio.app';
if(process.platform!=='darwin'||process.arch!=='arm64')throw Error('Native capture currently targets macOS arm64');
const scratch=await mkdtemp(join(tmpdir(),'dsh-meeting-native-'));
try {
await mkdir(app+'/Contents/MacOS',{recursive:true});
await copyFile('native/Info.plist',app+'/Contents/Info.plist');
execFileSync('/usr/bin/xcrun',['swiftc','-O','-target','arm64-apple-macos13.0','-module-cache-path',join(scratch,'swift-cache'),'native/Sources/AudioTimeline.swift','native/Sources/MicrophoneRecovery.swift','native/Sources/MicrophoneInput.swift','native/Sources/CaptureAcknowledgement.swift','native/Sources/CapturePipeline.swift','native/Sources/CalendarAccess.swift','native/Sources/MeetingPanel.swift','native/Sources/MeetingBubble.swift','native/Sources/OfflineSpeech.swift','native/Sources/MeetingPrompt.swift','native/Sources/MeetingActivity.swift','native/Sources/main.swift','-o',app+'/Contents/MacOS/DSHMeetingAudio'],{stdio:'inherit'});
await mkdir(app+'/Contents/Resources',{recursive:true});
const icons=join(scratch,'MeetingWorkspace.iconset');
execFileSync(app+'/Contents/MacOS/DSHMeetingAudio',['--export-icons',icons],{stdio:'inherit'});
execFileSync('/usr/bin/iconutil',['--convert','icns','--output',app+'/Contents/Resources/MeetingWorkspace.icns',icons],{stdio:'inherit'});
execFileSync('/usr/bin/codesign',['--force','--sign','-','--entitlements','native/entitlements.plist','--timestamp=none',app],{stdio:'inherit'});
execFileSync('/usr/bin/codesign',['--verify','--strict',app],{stdio:'inherit'});
execFileSync(app+'/Contents/MacOS/DSHMeetingAudio',['--self-test'],{stdio:'inherit'});
} finally {
 await rm(scratch,{recursive:true,force:true});
}
