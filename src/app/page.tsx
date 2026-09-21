"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Building2, CheckCircle2, MessageSquareText } from "lucide-react";
import { LogoFull, LogoMark } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

export default function Splash() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && user) router.replace("/home"); }, [loading,user,router]);
  return <main className="onboarding">
    <div className="onboarding-grid"/>
    <header><LogoFull size={46}/><span>نسخة تجريبية</span></header>
    <section className="onboarding-copy">
      <div className="onboarding-mark"><LogoMark size={76}/></div>
      <p className="eyebrow">منصة معاملات موحّدة</p>
      <h1>طلبك الحكومي<br/><em>من البداية إلى القرار.</em></h1>
      <p className="lead">جهّز استفسارك أو ترخيصك أو تصريحك، وأرسله للجهة وتابع الرد في مكان واحد.</p>
      <div className="promise-list"><span><MessageSquareText size={17}/>نفهم طلبك</span><span><Building2 size={17}/>نوصله للجهة</span><span><CheckCircle2 size={17}/>تتابع النتيجة</span></div>
    </section>
    <div className="onboarding-action"><Link href={user?"/home":"/login"} className="primary-action">الدخول إلى تساهيل <ArrowLeft size={19}/></Link><p>جميع الوثائق والجهات في النسخة الحالية تجريبية</p></div>
  </main>;
}
