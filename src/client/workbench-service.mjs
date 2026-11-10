// Panel props carry the host's unscoped service. Use the registering plugin's
// contextual service so ownership checks and session creation retain its package.
export function workbenchService(ctx){
 return {
  subscribe:listener=>ctx.desktopWorkbenches.subscribe(listener),
  getSnapshot:()=>ctx.desktopWorkbenches.getSnapshot(),
  subscribeSessions:listener=>ctx.sessions.list.subscribe(listener),
  currentSession:()=>ctx.desktopWorkbenches.currentSession(),
  ownsSession:id=>ctx.desktopWorkbenches.ownsSession(id),
  ensureSession:options=>ctx.desktopWorkbenches.ensureSession(options),
 };
}
