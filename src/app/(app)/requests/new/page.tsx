"use client";
import {Suspense,useEffect,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {Sparkles,ArrowLeft,Send,CheckCircle2,Mic} from "lucide-react";
import {Page,TopBar,Spinner} from "@/components/ui";
import {DemoNote,Field,Upload} from "@/components/RequestWidgets";
import {useRequests} from "@/lib/requests/hooks";
import {submitRequest} from "@/lib/requests/client";
import {REGIONS,KINDS,entityName,requiredDocuments,validateDraft,type Draft} from "@/lib/requests/model";
import {ENTITIES} from "@/lib/kb/entities";
import {SERVICES,getService} from "@/lib/kb";
import {useSpeech} from "@/lib/hooks/useSpeech";
function NewRequest(){
 const router=useRouter(); const params=useSearchParams();const {actor,demoMode,loading}=useRequests();
 const [need,setNeed]=useState("");const [stage,setStage]=useState(0);const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [source,setSource]=useState("");const [question,setQuestion]=useState("");const [inspection,setInspection]=useState("");
 const [draft,setDraft]=useState<Draft>({kind:"inquiry",subject:"",body:"",region:"",city:"",audience:"citizen",entityId:"",serviceId:"",attachments:[]});
 const speech=useSpeech(setNeed);
 useEffect(()=>{
   // Hydrate a one-time draft from external session storage after client mount.
   // eslint-disable-next-line react-hooks/set-state-in-effect
   const pending=sessionStorage.getItem("tasaheel:need");if(pending){setNeed(pending);sessionStorage.removeItem("tasaheel:need");}
   const service=getService(params.get("service")||"");
   if(service){setDraft(d=>({...d,serviceId:service.id,entityId:service.entityId,subject:service.name,body:"أرغب في "+service.name,kind:/تصريح/.test(service.name)?"permit":/ترخيص|رخصة/.test(service.name)?"license":"inquiry"}));setStage(1);}
 },[params]);
 function update(p:Partial<Draft>){setDraft(d=>({...d,...p}));setInspection("");}
 async function analyze(){
  setBusy(true);setError("");
  try{const r=await fetch("/api/requests/analyze",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({need})});const data=await r.json();if(!r.ok)throw new Error(data.error);setDraft(d=>({...d,kind:data.kind,subject:data.subject,body:data.body,entityId:data.entityId,serviceId:data.serviceId}));setSource(data.source);setQuestion(data.question);setStage(1);}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function inspect(){
  setBusy(true);setError("");
  try{const r=await fetch("/api/requests/inspect",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({attachments:draft.attachments,requirements:requiredDocuments(draft).map(r=>r.label),subject:draft.subject})});const data=await r.json();if(!r.ok)throw new Error(data.error);setInspection(data.summary);}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 if(loading)return <Spinner/>;
 if(actor?.role!=="beneficiary")return <><TopBar title="طلب جديد" back="/requests"/><Page><p className="card p-4">تقديم الطلبات متاح من حساب المستفيد. حساب الجهة مخصص لاستقبال الطلبات والرد عليها.</p></Page></>;
 const docs=requiredDocuments(draft);
 return <><TopBar showLogo back="/requests"/><Page>
 <div className="eyebrow mt-3">من احتياجك إلى إنجاز طلبك</div><h1 className="text-2xl font-bold mt-1">خلّها على تساهيل</h1><DemoNote/>
 <ol className="step-strip my-5">{["احتياجك","تجهيز الطلب","المراجعة"].map((s,i)=><li key={s} className={stage>=i?"active":""}><span>{i+1}</span>{s}</li>)}</ol>
 {stage===0&&<div className="card p-5 space-y-4"><div className="flex items-center gap-2 text-primary font-bold"><Sparkles size={20}/>وش تحتاج من الجهة؟</div><p className="text-sm text-muted">اشرح بطريقتك، ونساعدك في صياغة الطلب واختيار الجهة.</p><textarea className="form-input min-h-36" aria-label="وصف احتياجك" value={need} maxLength={4000} onChange={e=>setNeed(e.target.value)} placeholder="مثلاً: أبغى أستفسر من وزارة التجارة عن اسم تجاري لمشروعي"/>
 <button type="button" className="btn-ghost" onClick={speech.toggle}><Mic size={18}/>{speech.listening?"إيقاف التسجيل":"تحدث بدلاً من الكتابة"}</button>
 {speech.error&&<p className="text-xs text-danger">{speech.error}</p>}
 <button className="btn-primary" disabled={busy||need.trim().length<10} onClick={analyze}>{busy?"نحلل احتياجك...":"فهم وتجهيز الطلب"}<ArrowLeft size={18}/></button></div>}
 {stage===1&&<div className="space-y-4">
 {source&&<p className="text-xs text-muted">{source==="llm"?"تمت المساعدة في الصياغة باستخدام الذكاء الاصطناعي.":"تمت المطابقة الأولية بالكلمات المفتاحية؛ راجع الجهة والخدمة."}</p>}
 {question&&<p className="demo-note">{question}</p>}
 <div className="card p-4 space-y-4">
 <Field label="نوع الطلب"><select className="form-input" value={draft.kind} onChange={e=>update({kind:e.target.value as Draft["kind"]})}>{Object.entries(KINDS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></Field>
 <Field label="عنوان الطلب"><input className="form-input" value={draft.subject} maxLength={180} onChange={e=>update({subject:e.target.value})}/></Field>
 <Field label="تفاصيل الطلب"><textarea className="form-input min-h-28" value={draft.body} maxLength={4000} onChange={e=>update({body:e.target.value})}/></Field>
 <Field label="صفة المستفيد"><select className="form-input" value={draft.audience} onChange={e=>update({audience:e.target.value as Draft["audience"]})}><option value="citizen">مواطن</option><option value="resident">مقيم</option><option value="visitor">زائر</option><option value="business">منشأة / صاحب عمل</option></select></Field>
 <div className="grid grid-cols-2 gap-3"><Field label="المنطقة"><select className="form-input" value={draft.region} onChange={e=>update({region:e.target.value})}><option value="">اختر المنطقة</option>{REGIONS.map(r=><option key={r}>{r}</option>)}</select></Field><Field label="المدينة"><input className="form-input" value={draft.city} maxLength={80} onChange={e=>update({city:e.target.value})}/></Field></div>
 <Field label="الجهة المختصة"><select className="form-input" value={draft.entityId} onChange={e=>update({entityId:e.target.value,serviceId:""})}><option value="">اختر الجهة</option>{ENTITIES.map(e=><option key={e.id} value={e.id}>{entityName(e.id,draft.region)}</option>)}</select></Field>
 <Field label="الخدمة"><select className="form-input" value={draft.serviceId||""} onChange={e=>update({serviceId:e.target.value})}><option value="">طلب عام للجهة</option>{SERVICES.filter(s=>s.entityId===draft.entityId).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
 </div>
 <div className="card p-4 space-y-3"><h2 className="font-bold">المستندات المطلوبة</h2><p className="text-xs text-muted">{docs.length?"أرفق كل مستند في مكانه. الفحص الأولي لا يغني عن مراجعة موظف الجهة.":draft.kind==="inquiry"?"المرفقات اختيارية للاستفسار.":"هذا طلب عام؛ ستحدد الجهة المتطلبات التفصيلية أثناء المراجعة."}</p>
 {docs.map(r=><Upload key={r.id} label={r.label} requirementId={r.id} value={draft.attachments} onChange={attachments=>update({attachments})} onError={setError}/>)}
 <Upload label="مرفق إضافي (اختياري)" value={draft.attachments} onChange={attachments=>update({attachments})} onError={setError}/>
 {draft.attachments.length>0&&<button type="button" className="btn-ghost" disabled={busy} onClick={inspect}>{busy?"جارٍ الفحص...":"فحص أولي للمستندات"}</button>}
 {inspection&&<p className="text-sm whitespace-pre-wrap bg-primary-soft rounded-xl p-3">{inspection}</p>}
 </div>
 <button className="btn-primary" disabled={busy} onClick={()=>{try{validateDraft(draft);setStage(2);setError("");}catch(e){setError((e as Error).message);}}}>مراجعة الطلب<ArrowLeft size={18}/></button>
 <button className="btn-ghost" onClick={()=>setStage(0)}>تعديل وصف الاحتياج</button>
 </div>}
 {stage===2&&<div className="space-y-4"><div className="card p-5 space-y-4"><CheckCircle2 className="text-primary" size={28}/><h2 className="text-xl font-bold">{draft.subject}</h2><p className="text-sm whitespace-pre-wrap">{draft.body}</p><dl className="review-grid"><dt>الجهة المستقبلة</dt><dd>{entityName(draft.entityId,draft.region)}</dd><dt>نوع الطلب</dt><dd>{KINDS[draft.kind]}</dd><dt>الموقع</dt><dd>{draft.region} · {draft.city}</dd><dt>المرفقات</dt><dd>{draft.attachments.length} ملفات</dd></dl><p className="text-xs text-muted">سيُرسل الطلب ومرفقاته إلى صندوق الجهة التجريبي داخل تساهيل.</p></div>
 <button className="btn-primary" disabled={busy} onClick={async()=>{setBusy(true);setError("");try{const r=await submitRequest(draft,actor,demoMode);router.replace("/requests/"+r.id);}catch(e){setError((e as Error).message);setBusy(false);}}}><Send size={18}/>{busy?"جارٍ الإرسال...":"إرسال الطلب"}</button><button className="btn-ghost" disabled={busy} onClick={()=>setStage(1)}>تعديل الطلب</button></div>}
 {error&&<p role="alert" className="error-box">{error}</p>}
 </Page></>;
}
export default function NewRequestPage(){return <Suspense fallback={<Spinner/>}><NewRequest/></Suspense>;}

