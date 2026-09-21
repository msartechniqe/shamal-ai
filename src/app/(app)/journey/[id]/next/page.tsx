"use client";

import Link from "next/link";
import { use } from "react";
import { Building2, Clock, ExternalLink, HelpCircle } from "lucide-react";
import { EmptyState, Page, Spinner, TopBar } from "@/components/ui";
import { useJourney } from "@/lib/hooks/useJourneys";
import { nextAction } from "@/lib/engine";
import { getEntity } from "@/lib/kb";

/** الشاشة 6: خطوتك التالية — الإجراء المطلوب وزر القناة الرسمية */
export default function NextStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { journey, loading } = useJourney(id);

  if (loading) return <Spinner />;
  if (!journey)
    return (
      <>
        <TopBar title="خطوتك التالية" back="/home" />
        <Page>
          <EmptyState title="الرحلة غير موجودة" />
        </Page>
      </>
    );

  const a = nextAction(journey);
  const entity = a.entityName ? getEntity(a.entityName) : null;

  return (
    <>
      <TopBar showLogo back={`/journey/${journey.id}/ready`} />
      <Page>
        <h1 className="text-xl font-bold">خطوتك التالية</h1>

        <div className="card mt-4 p-4 bg-primary-soft/50 border-primary/30">
          <div className="font-bold">{a.title}</div>
          <p className="text-sm text-muted mt-1">
            {a.kind === "obtain" ? "هذه الخطوة مطلوبة قبل إكمال رحلتك" : "جميع المتطلبات مكتملة، يمكنك التقديم الآن"}
          </p>
        </div>

        <div className="card mt-3 p-4">
          <div className="flex items-center gap-2 font-bold text-sm">
            <HelpCircle size={18} className="text-primary" /> لماذا؟
          </div>
          <p className="text-sm text-muted mt-1">{a.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="card p-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Building2 size={14} /> الجهة
            </div>
            <div className="font-bold text-sm mt-1">{entity?.channel ?? entity?.name ?? "القناة الرسمية"}</div>
          </div>
          <div className="card p-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Clock size={14} /> المدة المتوقعة
            </div>
            <div className="font-bold text-sm mt-1">{a.durationText ?? "حسب الجهة"}</div>
          </div>
        </div>

        {a.kind === "obtain" && a.requirement && (
          <Link href={`/journey/${journey.id}/blocker?req=${a.requirement.id}`} className="block text-center text-sm text-primary font-bold mt-4">
            عرض المسار الرسمي كاملاً (لو ما أقدر؟)
          </Link>
        )}

        <div className="mt-5 space-y-2">
          {a.service && (
            <Link href={`/requests/new?service=${a.service.id}`} className="btn-primary">
              <ExternalLink size={18} /> تجهيز الطلب في تساهيل
            </Link>
          )}
          <Link href={`/journey/${journey.id}`} className="btn-ghost">
            متابعة لاحقاً
          </Link>
        </div>
      </Page>
    </>
  );
}

