"use client";

import Link from "next/link";
import { use } from "react";
import { Building2, Clock, Coins, ExternalLink, Link2, ListChecks, Sparkles } from "lucide-react";
import { EmptyState, Page, TopBar } from "@/components/ui";
import { getEntity, getService, SCENARIOS } from "@/lib/kb";
import { serviceIcon } from "@/lib/icons";

/** تفاصيل خدمة من قاعدة المعرفة */
export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const svc = getService(id);
  if (!svc)
    return (
      <>
        <TopBar title="الخدمة" back="/services" />
        <Page>
          <EmptyState title="الخدمة غير موجودة" />
        </Page>
      </>
    );
  const ent = getEntity(svc.entityId);
  const scenario = SCENARIOS.find((s) => s.serviceIds.includes(svc.id));
  const Icon = serviceIcon(svc.id);

  return (
    <>
      <TopBar title="تفاصيل الخدمة" back />
      <Page>
        <div className="card p-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-3">
            <Icon size={24} strokeWidth={1.8} />
          </div>
          <div className="text-xs text-muted flex items-center gap-1">
            <Building2 size={12} /> {ent?.name}
          </div>
          <h1 className="text-lg font-bold mt-1">{svc.name}</h1>
          <p className="text-sm text-muted mt-1">{svc.description}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-surface-2 rounded-xl p-2">
              <div className="text-[11px] text-muted flex items-center gap-1">
                <Coins size={12} /> الرسوم
              </div>
              <div className="text-xs font-bold mt-0.5">{svc.fees ?? "حسب الجهة"}</div>
            </div>
            <div className="bg-surface-2 rounded-xl p-2">
              <div className="text-[11px] text-muted flex items-center gap-1">
                <Clock size={12} /> المدة
              </div>
              <div className="text-xs font-bold mt-0.5">{svc.duration ?? "حسب الجهة"}</div>
            </div>
          </div>
        </div>

        {svc.prerequisites.length > 0 && (
          <div className="card p-4 mt-3">
            <div className="font-bold text-sm">يتطلب أولاً</div>
            <ul className="mt-2 space-y-1">
              {svc.prerequisites.map((p) => (
                <li key={p}>
                  <Link href={`/services/${p}`} className="text-sm text-primary">
                    • {getService(p)?.name ?? p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card p-4 mt-3">
          <div className="font-bold text-sm flex items-center gap-2">
            <ListChecks size={16} className="text-primary" /> المتطلبات
          </div>
          <ul className="mt-2 space-y-2">
            {svc.requirements.map((r) => (
              <li key={r.id} className="text-sm">
                <div className="font-medium">• {r.label}</div>
                {r.description && <div className="text-xs text-muted mr-3">{r.description}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4 mt-3">
          <div className="font-bold text-sm">الخطوات</div>
          <ol className="mt-2 space-y-2">
            {svc.steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-4 mt-3">
          <div className="font-bold text-sm flex items-center gap-2">
            <Link2 size={16} className="text-primary" /> المصادر الرسمية
          </div>
          <ul className="mt-2 space-y-1">
            {svc.sources.map((u) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-primary break-all" dir="ltr">
                  {u}
                </a>
              </li>
            ))}
          </ul>
          {svc.lastVerified && <div className="text-[11px] text-muted mt-2">آخر تحقق من المعلومات: {svc.lastVerified}</div>}
        </div>

        <div className="mt-4 space-y-2">
          <Link href={`/requests/new?service=${svc.id}`} className="btn-primary">
            <ExternalLink size={18} /> تقديم الطلب في تساهيل
          </Link>
          {scenario && (
            <Link href={`/understand?need=${encodeURIComponent(scenario.title)}`} className="btn-ghost">
              <Sparkles size={18} /> ابنِ لي رحلة لهذه الخدمة
            </Link>
          )}
        </div>
      </Page>
    </>
  );
}

