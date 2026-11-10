import React from 'react';

const paths={
 search:<><circle cx="10.7" cy="10.7" r="6.3"/><path d="m15.5 15.5 4 4"/></>,
 record:<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21m-3 0h6"/></>,
 import:<path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5"/>,
 document:<><path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6m-6 4h6"/></>,
 forward:<path d="m9 6 6 6-6 6"/>,
};

export function WorkspaceIcon({name,size=17}){
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
