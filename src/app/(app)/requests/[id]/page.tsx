"use client";
import {use,useState} from "react";
import {Clock,Download,Send,FileCheck2} from "lucide-react";
import {Page,TopBar,Spinner,EmptyState} from "@/components/ui";
import {DemoNote,RequestStatus,Upload,AttachmentLink} from "@/components/RequestWidgets";
import {useRequests,useRequestClock} from "@/lib/requests/hooks";
import {updateRequest} from "@/lib/requests/client";
import {entityName,KINDS,type Action,type Attachment} from "@/lib/requests/model";
export default function RequestDetail({params}:{params:Promise<{id:string}>}){
 const now=useRequestClock(); const {id}=use(params);const {requests,actor,demoMode,loading,error:loadError,refresh}=useRequests();const [note,setNote]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [attachments,setAttachments]=useState<Attachment[]>([]);
 const r=requests.find(x=>x.id===id);
 if(loading)return <Spinner/>;
 if(!r||!actor)return <><TopBar title="تفاصيل الطلب" back="/requests"/><Page><EmptyState title={loadError||"الطلب غير موجود أو لا يمكنك الوصول إليه"}/></Page></>;
 const staff=actor.role!=="beneficiary";const terminal=["approved","rejected","closed"].includes(r.status);
 async function act(type:Action["type"]){if(!r||!actor)return;setBusy(true);setError("");try{await updateRequest(r,{type,note,attachments},actor,demoMode);setNote("");setAttachments([]);await refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <><TopBar showLogo back="/requests"/><Page><DemoNote/>
 <div className="card p-5 mt-4"><div className="flex justify-between items-center"><span dir="ltr" className="text-xs text-muted">{r.number}</span><RequestStatus request={r}/></div><h1 className="text-xl font-bold mt-4">{r.subject}</h1><p className="text-sm text-muted mt-2">{entityName(r.entityId,r.region)}</p><p className="text-xs text-muted mt-2">{KINDS[r.kind]} · {r.region} · {r.city}</p><p className="whitespace-pre-wrap text-sm mt-4 leading-7">{r.body}</p>{staff&&<p className="text-xs text-muted mt-3">مقدم الطلب: {r.ownerName}</p>}
 {!terminal&&<p className="text-xs mt-4 text-primary flex gap-1 items-center"><Clock size={14}/>موعد المتابعة المستهدف: {new Date(r.dueAt).toLocaleString("ar-SA")}</p>}
 </div>
 {r.attachments.length>0&&<section className="card p-4 mt-3"><h2 className="font-bold mb-2">المرفقات</h2><div className="flex flex-col gap-2">{r.attachments.map(a=><AttachmentLink key={a.id} attachment={a}/>)}</div></section>}
 {r.certificate&&<section id="certificate" className="certificate card p-6 mt-4 text-center"><FileCheck2 className="mx-auto text-primary" size={32}/><h2 className="text-xl font-bold mt-3">{KINDS[r.kind]} تجريبي</h2><p className="certificate-watermark">نسخة تجريبية — غير صالحة للاستخدام الرسمي</p><p className="font-bold mt-4">{r.subject}</p><p className="text-sm mt-2">{r.ownerName}</p><p className="text-sm mt-2">{entityName(r.entityId,r.region)}</p><p className="font-mono text-sm mt-3" dir="ltr">{r.certificate.number}</p><p className="text-xs text-muted mt-3">أصدرها: {r.certificate.issuedBy} · {new Date(r.certificate.at).toLocaleDateString("ar-SA")}</p><button className="btn-ghost mt-4 no-print" onClick={()=>window.print()}><Download size={16}/>طباعة / حفظ PDF</button></section>}
 <section className="mt-5"><h2 className="font-bold">سجل الطلب والردود</h2><ol className="timeline mt-4">{r.events.map(e=><li key={e.id}><div className="font-bold text-sm">{e.actor}</div><p className="text-sm whitespace-pre-wrap mt-1">{e.note}</p><time className="text-xs text-muted block mt-2">{new Date(e.at).toLocaleString("ar-SA")}</time></li>)}</ol></section>
 {!terminal&&(staff||r.status==="needs_info")&&<section className="card p-4 mt-4 space-y-3"><h2 className="font-bold">{staff?"معالجة الطلب":"استكمال طلبك"}</h2><textarea className="form-input min-h-28" aria-label={staff?"رد الجهة":"تفاصيل الاستكمال"} value={note} maxLength={3000} onChange={e=>setNote(e.target.value)} placeholder={staff?"اكتب الرد أو سبب القرار...":"وضح المعلومات المطلوبة..."}/>
 {!staff&&<Upload value={attachments} onChange={setAttachments} onError={setError} label="إرفاق مستند للاستكمال"/>}
 <div className="grid grid-cols-2 gap-2">{staff?<>{r.status==="routed"&&<button disabled={busy} className="btn-ghost text-sm" onClick={()=>act("start")}>بدء المعالجة</button>}<button disabled={busy||!note.trim()} className="btn-ghost text-sm" onClick={()=>act("reply")}>إرسال رد</button><button disabled={busy||!note.trim()} className="btn-ghost text-sm" onClick={()=>act("request_info")}>طلب استكمال</button>{r.kind==="inquiry"?<button disabled={busy||!note.trim()} className="btn-primary text-sm" onClick={()=>act("close")}>الرد وإغلاق الطلب</button>:<button disabled={busy||!note.trim()||r.status==="needs_info"} className="btn-primary text-sm" onClick={()=>act("approve")}>موافقة وإصدار تجريبي</button>}<button disabled={busy||!note.trim()} className="btn-ghost text-sm !text-danger" onClick={()=>act("reject")}>رفض مع السبب</button></>:<button disabled={busy||!note.trim()} className="btn-primary col-span-2" onClick={()=>act("resubmit")}><Send size={16}/>إرسال الاستكمال</button>}</div></section>}
 {!terminal&&r.dueAt<now&&<div className="demo-note mt-4">{r.escalated?"تم تصعيد الطلب إلى إشراف المنصة.":<button disabled={busy} onClick={()=>act("escalate")} className="font-bold">تأخر الرد؟ تصعيد الطلب للإشراف</button>}</div>}
 {error&&<p role="alert" className="error-box">{error}</p>}
 </Page></>;
}

