"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Building2, FileCheck2, HelpCircle, Mic, Search, Sparkles } from "lucide-react";
import { NotificationBell, Page, SectionTitle, TopBar } from "@/components/ui";
import { InstallApp } from "@/components/InstallApp";
import { useAuth } from "@/lib/auth-context";
import { useSpeech } from "@/lib/hooks/useSpeech";
import { useRequests } from "@/lib/requests/hooks";
import { RequestStatus } from "@/components/RequestWidgets";
import { entityName } from "@/lib/requests/model";

const START = [
  { kind: "inquiry", title: "استفسار حكومي", text: "اسأل جهة واحصل على رد موثق", icon: HelpCircle, tone: "blue" },
  { kind: "license", title: "ترخيص نشاط", text: "جهّز متطلبات نشاطك وقدّمها", icon: BadgeCheck, tone: "gold" },
  { kind: "permit", title: "طلب تصريح", text: "قدّم التصريح وتابع القرار", icon: FileCheck2, tone: "violet" },
] as const;

export default function HomePage() {
  const { user } = useAuth();
  const { requests, actor } = useRequests();
  const router = useRouter();
  const [need, setNeed] = useState("");
  const speech = useSpeech(setNeed);
  const isStaff = actor?.role !== "beneficiary";
  const active = requests.filter(r => !["approved","rejected","closed"].includes(r.status));

  const ask = () => {
    const value = need.trim();
    if (!value) return;
    sessionStorage.setItem("tasaheel:need", value);
    router.push("/requests/new");
  };

  if (isStaff) {
    return <><TopBar showLogo right={<NotificationBell/>}/><Page>
      <section className="welcome-panel staff">
        <p>مساحة الجهة</p><h1>مرحباً، {user?.name}</h1>
        <span>{actor?.role === "admin" ? "إشراف تساهيل" : entityName(actor?.entityId || "")}</span>
      </section>
      <div className="dashboard-stats">
        <div><b>{requests.length}</b><span>كل الطلبات</span></div>
        <div><b>{active.length}</b><span>تحتاج متابعة</span></div>
        <div><b>{requests.filter(r=>r.status==="needs_info").length}</b><span>بانتظار مستفيد</span></div>
      </div>
      <Link href="/requests" className="primary-action mt-5">فتح صندوق الطلبات <ArrowLeft size={18}/></Link>
      <SectionTitle>أحدث الطلبات</SectionTitle>
      <div className="space-y-3">{requests.slice(0,4).map(r=><Link href={"/requests/"+r.id} key={r.id} className="request-row"><div><b>{r.subject}</b><span>{r.number} · {r.city}</span></div><RequestStatus request={r}/></Link>)}</div>
    </Page></>;
  }

  return <><TopBar showLogo right={<NotificationBell/>}/><Page>
    <section className="welcome-panel">
      <p>صباح الخير</p>
      <h1>{user?.name || "أهلاً بك"}</h1>
      <span>ما المعاملة التي تريد إنجازها اليوم؟</span>
    </section>

    <div className="dashboard-stats">
      <div><b>{requests.length}</b><span>كل المعاملات</span></div>
      <div><b>{active.length}</b><span>قيد الإجراء</span></div>
      <div><b>{requests.filter(r=>r.status==="needs_info").length}</b><span>تحتاج إجراء</span></div>
    </div>

    <SectionTitle action={<Link href="/services" className="section-link">دليل الخدمات <ArrowLeft size={14}/></Link>}>ابدأ معاملة</SectionTitle>
    <div className="start-grid">{START.map(({kind,title,text,icon:Icon,tone})=><Link href={"/requests/new?kind="+kind} key={kind} className={`start-card ${tone}`}><span className="start-icon"><Icon size={23}/></span><b>{title}</b><small>{text}</small><ArrowLeft size={17} className="start-arrow"/></Link>)}</div>

    <section className="assistant-panel">
      <div className="assistant-title"><span><Sparkles size={18}/></span><div><b>لست متأكداً من الخدمة؟</b><p>صف احتياجك وسنقترح الجهة والخدمة المناسبة.</p></div></div>
      <div className="assistant-input"><Search size={18}/><input value={speech.listening?speech.interim||need:need} onChange={e=>setNeed(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="مثال: أريد فتح مقهى في جدة"/><button onClick={speech.toggle} aria-label="إدخال صوتي" className={speech.listening?"recording":""}><Mic size={18}/></button></div>
      <button className="assistant-submit" onClick={ask} disabled={!need.trim()}>تحليل الاحتياج <ArrowLeft size={16}/></button>
    </section>

    {requests.length>0&&<><SectionTitle action={<Link href="/requests" className="section-link">عرض الكل <ArrowLeft size={14}/></Link>}>آخر المعاملات</SectionTitle><div className="space-y-3">{requests.slice(0,3).map(r=><Link href={"/requests/"+r.id} key={r.id} className="request-row"><div><b>{r.subject}</b><span>{entityName(r.entityId,r.region)} · {r.number}</span></div><RequestStatus request={r}/></Link>)}</div></>}

    <Link href="/services" className="directory-banner"><span><Building2 size={22}/></span><div><b>دليل الجهات والخدمات</b><p>تصفّح الخدمات حسب الجهة أو نوع المعاملة</p></div><ArrowLeft size={19}/></Link>
    <InstallApp/>
  </Page></>;
}
