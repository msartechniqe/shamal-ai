"use client";
import type {ReactNode} from "react";
import type {Attachment,ServiceRequest} from "@/lib/requests/model";
import {STATUSES,uid,validateAttachments} from "@/lib/requests/model";
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="block space-y-1.5"><span className="text-sm font-bold">{label}</span>{children}</label>;}
export function RequestStatus({request:r}:{request:ServiceRequest}){
 const ended=["approved","rejected","closed"].includes(r.status);
 return <span className={`request-status ${r.status==="rejected"?"status-danger":ended?"status-success":r.status==="needs_info"?"status-warning":""}`}>{STATUSES[r.status]}</span>;
}
export function DemoNote(){return <p className="demo-note">نسخة تجريبية — الجهات والوثائق في هذه النسخة للتجربة، ولا تمثل إصداراً حكومياً معتمداً.</p>;}
export function Upload({value,onChange,requirementId="",label="إرفاق مستند",onError}:{value:Attachment[];onChange:(a:Attachment[])=>void;requirementId?:string;label?:string;onError:(s:string)=>void}){
 return <div className="space-y-2"><label className="upload-box"><span className="font-bold text-sm">{label}</span><span className="text-xs text-muted">PDF، JPG، PNG، TXT · حتى 750 كيلوبايت للملف</span><input type="file" aria-label={label} accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={async e=>{
  const file=e.target.files?.[0];e.target.value="";if(!file)return;
  try {
   if(file.size>750000)throw new Error("حجم الملف أكبر من 750 كيلوبايت.");
   const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("تعذر قراءة الملف."));reader.readAsDataURL(file);});
   const a:Attachment={id:uid(),name:file.name,mime:file.type||"text/plain",size:file.size,data,requirementId};
   const next=[...value,a];validateAttachments(next);onChange(next);onError("");
  }catch(err){onError((err as Error).message);}
 }}/></label>
 {value.filter(a=>a.requirementId===requirementId).map(a=><div key={a.id} className="flex items-center justify-between gap-2 text-xs bg-surface-2 rounded-xl p-2"><span className="truncate">{a.name}</span><button type="button" className="text-danger shrink-0" onClick={()=>onChange(value.filter(x=>x.id!==a.id))}>إزالة</button></div>)}
 </div>;
}
export function AttachmentLink({attachment:a}:{attachment:Attachment}){return <button className="text-primary text-sm underline text-right break-all" type="button" onClick={()=>{
 const raw=atob(a.data.slice(a.data.indexOf(",")+1));const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:a.mime}));const link=document.createElement("a");link.href=url;link.download=a.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }}>{a.name} ↓</button>;}

