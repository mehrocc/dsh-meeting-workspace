import React,{useLayoutEffect,useState,useRef} from 'react';
import {createPortal} from 'react-dom';

export function AnchoredPopover({anchor,label,onClose,children,width=290,preferredHeight=200,className='',role='dialog'}){
 const box=useRef(null),[position,setPosition]=useState(null);
 const close=useRef(onClose);
 close.current=onClose;
 const layer=anchor.current?.closest('.meeting-workspace')?.querySelector('.mw-popover-layer');

 useLayoutEffect(()=>{
  if(!layer)return;
  const root=layer.parentElement;
  const place=()=>{
   const a=anchor.current?.getBoundingClientRect(),r=root.getBoundingClientRect();
   if(!a)return;
   const gap=6,margin=12;
   const panelWidth=Math.min(width,Math.max(0,r.width-margin*2));
   const belowRoom=r.bottom-a.bottom-gap-margin,aboveRoom=a.top-r.top-gap-margin;
   const below=belowRoom>=preferredHeight||belowRoom>=aboveRoom;
   setPosition({
    left:Math.max(margin,Math.min(a.left-r.left,r.width-panelWidth-margin)),
    ...(below?{top:a.bottom-r.top+gap}:{bottom:r.bottom-a.top+gap}),
    width:panelWidth,maxHeight:Math.max(0,Math.min(390,below?belowRoom:aboveRoom)),
   });
  };
  const outside=event=>{
   if(!box.current?.contains(event.target)&&!anchor.current?.contains(event.target))close.current();
  };
  const escape=event=>{
   if(event.key==='Escape'){
    event.preventDefault();event.stopPropagation();close.current();anchor.current?.focus();
   }
  };
  place();
  const observer=new ResizeObserver(place);
  observer.observe(root);
  window.addEventListener('resize',place);
  document.addEventListener('scroll',place,true);
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',escape);
  return()=>{
   observer.disconnect();
   window.removeEventListener('resize',place);
   document.removeEventListener('scroll',place,true);
   document.removeEventListener('pointerdown',outside);
   document.removeEventListener('keydown',escape);
  };
 },[layer,width,preferredHeight,anchor]);

 return layer&&createPortal(
  <div ref={box} className={('mw-cell-popover '+className).trim()} role={role} aria-label={label}
   data-dsh-no-drag style={position||{visibility:'hidden',width}}>{children}</div>,layer);
}
