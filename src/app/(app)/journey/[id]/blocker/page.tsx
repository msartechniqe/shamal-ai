"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import { AlertTriangle, ArrowLeft, Check, ExternalLink, HelpCircle, Route, Undo2 } from "lucide-react";
import { EmptyState, Page, Spinner, TopBar } from "@/components/ui";
import { useJourney } from "@/lib/hooks/useJourneys";
import { useAuth } from "@/lib/auth-context";
import { currentStep, setRequirementStatus, stepRequirements } from "@/lib/engine";
import { getEntity, getService } from "@/lib/kb";
import { pushNotification } from "@/lib/storage";

/** الشاشة 5: لو ما أقدر؟ — العائق، السبب، المسار الرسمي، والعودة للرحلة */
function Blocker({ id }: { id: string }) {
  const { journey, loading, update } = useJourney(id);
  const { user } = useAuth();
  const router = useRouter();
  const reqId = useSearchParams().get("req");

  if (loading) return <Spinner />;
  if (!journey)
    return (
      <>
        <TopBar title="لو ما أقدر؟" back="/home" />
        <Page>
          <EmptyState title="الرحلة غير موجودة" />
        </Page>
      </>
    );

  const step = currentStep(journey);
  const svc = step ? getService(step.serviceId) : null;
  const reqs = step ? stepRequirements(journey, step) : [];
  const req = reqs.find((r) => r.id === reqId) ?? reqs[0];

  if (!svc || !req)
    return (
      <>
        <TopBar title="لو ما أقدر؟" back={`/journey/${journey.id}`} />
        <Page>
          <EmptyState title="لا يوجد عائق حالياً" body="جميع متطلبات الخطوة الحالية متاحة." />
        </Page>
      </>
    );

  // متطلب من نوع "خطوة سابقة"
  const prereqSvc = req.kind === "prerequisite" ? getService(req.id.replace("prereq:", "")) : null;
  const obtain = req.obtain;
  const entity = obtain?.entityId ? getEntity(obtain.entityId) : prereqSvc ? getEntity(prereqSvc.entityId) : null;
  const url = obtain?.url ?? prereqSvc?.url ?? entity?.url;
  const steps = obtain?.steps ?? prereqSvc?.steps ?? [];
  const why = obtain?.why ?? (prereqSvc ? `خطوة «${svc.name}» تعتمد نظامياً على إنجاز «${prereqSvc.name}» أولاً.` : `هذا المتطلب شرط لإكمال خطوة «${svc.name}».`);
  const title = obtain?.title ?? (prereqSvc ? `إنجاز ${prereqSvc.name}` : "المسار الرسمي");

  const resolved = async () => {
    if (req.kind === "prerequisite") {
      router.push(`/journey/${journey.id}`);
      return;
    }
    await update(setRequirementStatus(journey, req.id, "done"));
    if (user)
      await pushNotification(user.uid, {
        title: "تمت معالجة العائق",
        body: `أصبح «${req.label}» متوفراً، عدنا بك إلى رحلتك.`,
        kind: "success",
        journeyId: journey.id,
      });
    router.push(`/journey/${journey.id}/ready`);
  };

  return (
    <>
      <TopBar showLogo back={`/journey/${journey.id}/ready`} />
      <Page>
        <h1 className="text-xl font-bold">لو ما أقدر؟</h1>
        <p className="text-sm text-muted">يوجد عائق يمنعك من إكمال الخطوة الحالية</p>

        {/* العائق */}
        <div className="card mt-4 p-4 border-danger/30 bg-danger-soft/40">
          <div className="flex items-center gap-2 text-danger font-bold text-sm">
            <AlertTriangle size={18} /> العائق
          </div>
          <div className="font-bold mt-1">
            {req.kind === "prerequisite" ? `لم تُنجز بعد: ${req.label}` : `لا يوجد لديك ${req.label}`}
          </div>
          <div className="text-xs text-muted mt-1">الخطوة المتأثرة: {svc.name}</div>
        </div>

        {/* السبب */}
        <div className="card mt-3 p-4">
          <div className="flex items-center gap-2 font-bold text-sm">
            <HelpCircle size={18} className="text-primary" /> ما السبب؟
          </div>
          <p className="text-sm text-muted mt-1">{why}</p>
        </div>

        {/* المسار الرسمي */}
        <div className="card mt-3 p-4">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Route size={18} className="text-primary" /> المسار الرسمي للحل
          </div>
          <div className="font-bold mt-2">{title}</div>
          {entity && <div className="text-xs text-muted">{entity.name} · عبر {entity.channel}</div>}
          {steps.length > 0 && (
            <ol className="mt-3 space-y-2">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}
          {(obtain?.durationText || prereqSvc?.duration) && (
            <div className="text-xs text-muted mt-3">المدة المتوقعة: {obtain?.durationText ?? prereqSvc?.duration}</div>
          )}
          <p className="text-[11px] text-muted mt-3 bg-surface-2 rounded-xl px-3 py-2">
            تساهيل لا يقترح تجاوز الأنظمة أو الشروط؛ يوجهك فقط إلى المسارات الرسمية المتاحة.
          </p>
        </div>

        {/* المسار: العائق → الإجراء → الاكتمال → العودة */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted px-1">
          <span className="text-danger font-bold">العائق</span>
          <span>←</span>
          <span className="text-primary font-bold">الإجراء</span>
          <span>←</span>
          <span className="text-ok font-bold">اكتمال المتطلب</span>
          <span>←</span>
          <span className="font-bold">العودة للرحلة</span>
        </div>

        <div className="mt-4 space-y-2">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <ExternalLink size={18} /> الانتقال إلى {entity?.channel ?? "القناة الرسمية"}
            </a>
          )}
          <button onClick={resolved} className="btn-ghost">
            <Check size={18} /> {req.kind === "prerequisite" ? "العودة لإنجاز الخطوة السابقة" : "حصلت عليه، أعدني إلى رحلتي"}
          </button>
          <Link href={`/journey/${journey.id}`} className="btn-ghost !border-transparent !bg-transparent text-sm">
            <Undo2 size={16} /> عودة إلى رحلتك
          </Link>
        </div>
        <Link href={`/journey/${journey.id}/next`} className="hidden">
          <ArrowLeft />
        </Link>
      </Page>
    </>
  );
}

export default function BlockerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <Blocker id={id} />
    </Suspense>
  );
}

