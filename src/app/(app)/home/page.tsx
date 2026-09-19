"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Car, ChevronLeft, Contact, FileBadge, Keyboard, Mic, Plane, Sparkles } from "lucide-react";
import { NotificationBell, Page, SectionTitle, TopBar } from "@/components/ui";
import { InstallApp } from "@/components/InstallApp";
import { LogoMark } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { useSpeech } from "@/lib/hooks/useSpeech";
import { useJourneys, useNotifications } from "@/lib/hooks/useJourneys";
import { getService } from "@/lib/kb";
import { IMAGES } from "@/lib/images";

const QUICK = [
  { id: "commercial-register", label: "بدء نشاط", sub: "الأعمال", icon: FileBadge, tile: "tile-beige", color: "#8a6d3b" },
  { id: "balady-license", label: "ترخيص نشاط", sub: "البلديات", icon: Contact, tile: "tile-blue", color: "#3b5f8a" },
  { id: "final-permit", label: "تصريح / ترخيص", sub: "حسب النشاط", icon: FileBadge, tile: "tile-green", color: "#2e7a5a" },
  { id: "driving-license", label: "رخصة قيادة", sub: "المرور", icon: Car, tile: "tile-lavender", color: "#5b4f9a" },
];

const EXAMPLES = ["أبغى أستفسر من وزارة التجارة عن اسم تجاري", "أبي ترخيص نشاط لمشروعي", "أحتاج تصريح من البلدية"];

/** الشاشة 1: الرئيسية — «وش تحتاج؟» */
export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [need, setNeed] = useState("");
  const [typing, setTyping] = useState(false);
  const { unread } = useNotifications();
  const { journeys } = useJourneys();
  const speech = useSpeech((text) => {
    setNeed(text);
    go(text);
  });

  const go = (text: string) => {
    const t = text.trim();
    if (!t) return;
    sessionStorage.setItem("tasaheel:need",t);
    router.push("/requests/new");
  };

  const active = journeys.find((j) => j.steps.some((s) => s.status !== "done"));

  return (
    <>
      <TopBar showLogo right={<NotificationBell count={unread} />} />
      <Page className="!px-0">
        {/* بطاقة الترحيب بصورة الجرف الصحراوي */}
        <section className="relative mx-4 rounded-[28px] overflow-hidden h-[290px] photo-cover" style={{ backgroundImage: `url(${IMAGES.heroCliff})`, backgroundPosition: "center 58%", filter: "saturate(1.05)" }}>
          <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/20 to-transparent" />
          <div className="absolute inset-0 p-5 pt-6 flex flex-col justify-start items-start text-white text-right" dir="rtl">
            <div className="text-lg leading-tight drop-shadow">أهلاً بك في</div>
            <div className="text-[28px] font-bold leading-tight drop-shadow">تساهيل</div>
            <p className="text-[11px] opacity-95 mt-2 max-w-[210px] leading-relaxed drop-shadow">
              مساعدك الذكي للوصول إلى الخدمات الحكومية في جميع مناطق السعودية.
            </p>
            {user && <div className="text-[11px] mt-2 opacity-90 drop-shadow">مرحباً {user.name} 👋</div>}
          </div>
        </section>

        {/* مربع الاحتياج — يتداخل مع أسفل البطاقة */}
        <section className="card mx-4 -mt-9 relative p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={speech.toggle}
              aria-label="تحدث"
              className={`w-11 h-11 rounded-full border border-border bg-surface flex items-center justify-center text-primary shrink-0 ${speech.listening ? "recording !bg-danger !text-white !border-danger" : ""}`}
            >
              <Mic size={18} />
            </button>
            <div
              className="flex-1 rounded-2xl border border-border bg-surface-2 px-4 py-3 cursor-text"
              onClick={() => setTyping(true)}
            >
              {typing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    go(need);
                  }}
                >
                  <input
                    autoFocus
                    value={speech.listening ? speech.interim || need : need}
                    onChange={(e) => setNeed(e.target.value)}
                    placeholder="اكتب طلبك هنا..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </form>
              ) : (
                <>
                  <div className="font-bold text-sm flex items-center gap-1">
                    <Sparkles size={14} className="text-primary" /> وش تحتاج؟
                  </div>
                  <div className="text-[11px] text-muted">اكتب طلبك أو تحدث معنا</div>
                </>
              )}
            </div>
          </div>
          {speech.error && <div className="text-danger text-xs mt-2">{speech.error}</div>}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button type="button" onClick={speech.toggle} className={`btn-ghost !py-2.5 text-sm ${speech.listening ? "!bg-danger !text-white !border-danger" : ""}`}>
              <Mic size={16} /> {speech.listening ? "جارٍ الاستماع..." : "تحدث صوتياً"}
            </button>
            <button
              type="button"
              onClick={() => (typing && need.trim() ? go(need) : setTyping(true))}
              className="btn-ghost !py-2.5 text-sm"
            >
              <Keyboard size={16} /> اكتب طلبك
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none mt-3 -mx-1 px-1">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => go(ex)} className="chip text-xs">
                {ex}
              </button>
            ))}
          </div>
        </section>

        <div className="mx-4 mt-4 grid grid-cols-2 gap-2"><Link href="/requests/new" className="btn-primary text-sm">تقديم طلب جديد</Link><Link href="/requests" className="btn-ghost text-sm">متابعة الطلبات</Link></div>
        {/* رحلتك الحالية */}
        {active && (
          <Link href={`/journey/${active.id}`} className="card mx-4 mt-3 p-4 flex items-center gap-3">
            <LogoMark size={40} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted">رحلتك الحالية</div>
              <div className="font-bold truncate">{active.title}</div>
              <div className="text-xs text-muted truncate">
                الخطوة الحالية: {getService(active.steps.find((s) => s.status !== "done")?.serviceId ?? "")?.name}
              </div>
            </div>
            <ArrowLeft className="text-primary" size={20} />
          </Link>
        )}

        {/* خدمات تبدأ بها */}
        <div className="px-4">
          <SectionTitle
            action={
              <Link href="/services" className="text-xs text-muted font-medium flex items-center gap-0.5">
                عرض الكل <ChevronLeft size={14} />
              </Link>
            }
          >
            خدمات تبدأ بها
          </SectionTitle>
          <div className="grid grid-cols-4 gap-2">
            {QUICK.map(({ id, label, sub, icon: Icon, tile, color }) => (
              <Link key={id} href={`/services/${id}`} className={`${tile} rounded-2xl p-2 pt-3 flex flex-col items-center text-center gap-1.5`}>
                <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center" style={{ color }}>
                  <Icon size={20} />
                </div>
                <div className="text-[11px] font-bold leading-tight" style={{ color }}>
                  {label}
                </div>
                <div className="text-[10px] text-muted">{sub}</div>
              </Link>
            ))}
          </div>

          {/* بانر بجبال مائية */}
          <section className="mt-4 rounded-3xl overflow-hidden relative bg-gradient-to-l from-[#eef4f4] to-[#dfeceb] border border-border">
            <div className="absolute inset-y-0 left-0 w-[45%] watercolor-mountains opacity-90" />
            <div className="relative p-4 pl-[42%] flex items-center gap-2">
              <div className="flex-1">
                <div className="font-bold text-primary-dark text-sm">خدماتك في مكان واحد</div>
                <p className="text-[11px] text-muted mt-1 leading-relaxed">نفهم احتياجك، نجهّز طلبك، ونوصله للجهة لتتابع الرد والنتيجة من مكان واحد.</p>
              </div>
              <ChevronLeft size={18} className="text-primary shrink-0" />
            </div>
          </section>
        </div>
        <div className="mx-4"><InstallApp/></div>
      </Page>
    </>
  );
}

