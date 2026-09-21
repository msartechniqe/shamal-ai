"use client";
import Link from "next/link";
import {useState} from "react";
import {Plus,Building2,Clock,RefreshCw,Files} from "lucide-react";
import {Page,TopBar,Spinner,EmptyState} from "@/components/ui";
import {DemoNote,RequestStatus} from "@/components/RequestWidgets";
import {useRequests,useRequestClock} from "@/lib/requests/hooks";
import {entityName,KINDS,STATUSES} from "@/lib/requests/model";
export default function RequestsPage(){
 const now=useRequestClock(); const {actor,requests,loading,error,refresh}=useRequests();const [query,setQuery]=useState("");const [status,setStatus]=useState("");
 const staff=actor?.role!=="beneficiary";
 const filtered=requests.filter(r=>(!status||r.status===status)&&(r.subject+" "+r.number+" "+r.ownerName).includes(query));
 const pending=requests.filter(r=>!["approved","rejected","closed"].includes(r.status));
 if(loading)return <Spinner label="تحميل الطلبات"/>;
 return <><TopBar showLogo/><Page><div className="flex items-center justify-between mt-3"><div><div className="eyebrow">{staff?"مساحة الجهة":"كل معاملاتك، في مكان واحد"}</div><h1 className="text-2xl font-bold mt-1">{staff?"صندوق الطلبات":"طلباتي"}</h1></div><button aria-label="تحديث الطلبات" onClick={refresh} className="chip"><RefreshCw size={17}/></button></div>
 {staff&&<p className="text-sm text-muted mt-2">{actor?.role==="admin"?"إشراف المنصة · جميع الجهات":entityName(actor?.entityId||"")}</p>}
 <DemoNote/>
 <div className="grid grid-cols-3 gap-2 my-4">{[[requests.length,"إجمالي الطلبات"],[pending.length,"قيد المتابعة"],[pending.filter(r=>r.dueAt<now).length,"متأخرة"]].map(([n,l])=><div key={l} className="card p-3 text-center"><strong className="text-xl text-primary">{n}</strong><div className="text-[11px] text-muted mt-1">{l}</div></div>)}</div>
 {!staff&&<Link href="/requests/new" className="btn-primary mb-4"><Plus size={18}/>طلب جديد</Link>}
 <input className="form-input" aria-label="بحث الطلبات" placeholder="ابحث بالعنوان أو رقم الطلب" value={query} onChange={e=>setQuery(e.target.value)}/>
 <select className="form-input mt-2" aria-label="تصفية الحالة" value={status} onChange={e=>setStatus(e.target.value)}><option value="">جميع الحالات</option>{Object.entries(STATUSES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
 {error&&<p role="alert" className="error-box">{error}</p>}
 <div className="space-y-3 mt-4">{filtered.map(r=><Link href={"/requests/"+r.id} key={r.id} className="card block p-4"><div className="flex justify-between items-center gap-2"><span className="text-xs text-muted" dir="ltr">{r.number}</span><RequestStatus request={r}/></div><h2 className="font-bold mt-3">{r.subject}</h2><p className="text-xs text-muted mt-2 flex items-center gap-1"><Building2 size={13}/>{entityName(r.entityId,r.region)}</p><div className="flex justify-between text-xs text-muted mt-3"><span>{KINDS[r.kind]} · {r.city}</span><span>{new Date(r.updatedAt).toLocaleDateString("ar-SA")}</span></div>{pending.includes(r)&&r.dueAt<now&&<p className="text-xs text-danger mt-3 flex items-center gap-1"><Clock size={13}/>{r.escalated?"تم التصعيد للإشراف":"تجاوز المدة المستهدفة التجريبية"}</p>}</Link>)}</div>
 {!filtered.length&&!error&&<EmptyState title={query||status?"لا توجد نتائج مطابقة":"ما عندك طلبات حتى الآن"} body={staff?"ستظهر هنا الطلبات الموجهة لجهتك.":"ابدأ باستفسار أو طلب ترخيص أو تصريح."} action={!staff?<Link className="btn-ghost" href="/requests/new"><Files size={18}/>ابدأ طلبك الأول</Link>:undefined}/>}
 </Page></>;
}

