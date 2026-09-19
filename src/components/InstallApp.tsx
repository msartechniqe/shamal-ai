"use client";
import {useEffect,useState,useSyncExternalStore} from "react";
interface InstallEvent extends Event {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>}
function subscribeDisplay(callback:()=>void){const media=window.matchMedia("(display-mode: standalone)");media.addEventListener("change",callback);return()=>media.removeEventListener("change",callback);}
export function InstallApp(){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null);const installed=useSyncExternalStore(subscribeDisplay,()=>window.matchMedia("(display-mode: standalone)").matches,()=>false);
 useEffect(()=>{
  const handler=(e:Event)=>{e.preventDefault();setPrompt(e as InstallEvent);};const done=()=>{setPrompt(null);};
  window.addEventListener("beforeinstallprompt",handler);window.addEventListener("appinstalled",done);
  if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});
  return()=>{window.removeEventListener("beforeinstallprompt",handler);window.removeEventListener("appinstalled",done);};
 },[]);
 if(installed)return null;
 return <div className="card p-3 mt-4"><strong className="text-sm">تساهيل على شاشة جوالك</strong>{prompt?<button className="btn-ghost mt-2 text-sm" onClick={async()=>{await prompt.prompt();await prompt.userChoice;setPrompt(null);}}>إضافة التطبيق</button>:<p className="text-xs text-muted mt-1">من قائمة المتصفح اختر «إضافة إلى الشاشة الرئيسية». على iPhone: مشاركة ثم «إضافة إلى الشاشة الرئيسية».</p>}</div>;
}

