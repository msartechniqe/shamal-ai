"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, HelpCircle, Mail, Star } from "lucide-react";
import { Page, TopBar } from "@/components/ui";
import { IMAGES } from "@/lib/images";

const FAQ = [
  { q: "ما هو تساهيل؟", a: "منصة ذكية تحوّل وصفك لاحتياجك الحكومي إلى رحلة إجرائية واضحة: تفهم قصدك، تحدد الخدمات، ترتب الخطوات، تكشف النواقص، وتحدد خطوتك التالية." },
  { q: "هل يقدّم التطبيق الخدمة بدلاً عني؟", a: "لا. تساهيل طبقة إرشادية فوق القنوات الرسمية (أبشر، بلدي، المركز السعودي للأعمال...). كل إجراء يتم عبر القناة الرسمية بزر انتقال مباشر." },
  { q: "وش يعني «لو ما أقدر؟»", a: "إذا نقصك مستند أو شرط، يشرح لك التطبيق السبب ويقترح المسار الرسمي للحصول عليه، ثم يعيدك إلى رحلتك عند اكتماله." },
  { q: "كيف يُحسب مؤشر الجاهزية؟", a: "🟢 جاهز للتقديم عند اكتمال كل المتطلبات، 🟡 يحتاج إكمال عند وجود مستند ناقص، 🔴 لا تبدأ الآن عند وجود خطوة سابقة لم تكتمل." },
  { q: "هل معلومات الخدمات محدثة؟", a: "تُبنى قاعدة المعرفة من المصادر الحكومية الرسمية وتعرض روابطها في صفحة كل خدمة. تحقق دائماً من القناة الرسمية قبل التقديم." },
  { q: "هل بياناتي محفوظة؟", a: "نحفظ رحلاتك وحالة المتطلبات التي تحددها فقط، ولا نطلب أو نخزن مستنداتك الرسمية." },
];

/** الشاشة 11: المساعدة والدعم */
export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [showFaq, setShowFaq] = useState(false);

  const row = "flex items-center gap-3 p-4 w-full";

  return (
    <>
      <TopBar title="المساعدة والدعم" back="/profile" />
      <Page className="flex flex-col !pb-0">
        <ul className="space-y-2 mt-1">
          <li className="card overflow-hidden">
            <button onClick={() => setShowFaq(!showFaq)} className={row}>
              <HelpCircle size={20} className="text-primary" />
              <span className="flex-1 text-sm font-medium text-right">الأسئلة الشائعة</span>
              {showFaq ? <ChevronDown size={18} className="text-muted" /> : <ChevronLeft size={18} className="text-muted" />}
            </button>
            {showFaq && (
              <ul className="px-3 pb-3 space-y-1">
                {FAQ.map((f, i) => (
                  <li key={i} className="rounded-xl bg-surface-2">
                    <button onClick={() => setOpen(open === i ? null : i)} className="flex items-center gap-2 w-full p-3 text-right">
                      <span className="flex-1 text-sm">{f.q}</span>
                      <ChevronDown size={16} className={`text-muted transition ${open === i ? "rotate-180" : ""}`} />
                    </button>
                    {open === i && <p className="text-xs text-muted px-3 pb-3 leading-relaxed">{f.a}</p>}
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className="card">
            <a href="mailto:support@shamal.ai" className={row}>
              <Mail size={20} className="text-primary" />
              <span className="flex-1">
                <span className="block text-sm font-medium">تواصل معنا</span>
                <span className="block text-xs text-muted" dir="ltr">
                  support@shamal.ai
                </span>
              </span>
              <ChevronLeft size={18} className="text-muted" />
            </a>
          </li>
          <li className="card">
            <a href="https://my.gov.sa" target="_blank" rel="noopener noreferrer" className={row}>
              <HelpCircle size={20} className="text-primary" />
              <span className="flex-1 text-sm font-medium">مركز المساعدة</span>
              <ChevronLeft size={18} className="text-muted" />
            </a>
          </li>
          <li className="card">
            <button className={row} onClick={() => alert("شكراً لك! تقييمك يساعدنا على التحسين.")}>
              <Star size={20} className="text-primary" />
              <span className="flex-1 text-sm font-medium text-right">تقييم التطبيق</span>
              <ChevronLeft size={18} className="text-muted" />
            </button>
          </li>
        </ul>

        {/* صورة جبال حقيقية أسفل الشاشة مع تلاشٍ ضبابي في الأعلى */}
        <div className="flex-1 -mx-4 mt-4 relative min-h-[300px] overflow-hidden">
          <div
            className="absolute inset-0 photo-cover"
            style={{ backgroundImage: `url(${IMAGES.help})`, backgroundPosition: "center 60%", filter: "saturate(0.6) brightness(0.95)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/70 to-transparent" />
          <div className="absolute inset-x-0 top-[22%] flex flex-col items-center gap-0 text-primary-dark">
            <PalmIcon />
            <div className="text-sm font-bold">معك في كل خطوة</div>
          </div>
        </div>
      </Page>
    </>
  );
}

function PalmIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" aria-hidden>
      <path d="M50 44 L50 88" stroke="#17504e" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M50 44 C44 38 38 40 34 44 C40 43 46 45 50 44 Z M50 44 C56 38 62 40 66 44 C60 43 54 45 50 44 Z M50 44 C46 36 46 30 50 26 C51 32 51 38 50 44 Z M50 44 C42 44 38 48 36 52 C42 49 47 46 50 44 Z M50 44 C58 44 62 48 64 52 C58 49 53 46 50 44 Z"
        fill="#1f6a68"
      />
    </svg>
  );
}

