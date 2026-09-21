"use client";

import { useState } from "react";
import { Page, TopBar } from "@/components/ui";

const KEY = "shamal:settings";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-12 h-7 rounded-full transition relative ${on ? "bg-primary" : "bg-border"}`}
      role="switch"
      aria-checked={on}
    >
      <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${on ? "left-1" : "right-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [s, setS] = useState<{ notif: boolean; reminders: boolean; voice: boolean }>(() => {
    try {
      return { notif: true, reminders: true, voice: true, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
    } catch {
      return { notif: true, reminders: true, voice: true };
    }
  });
  const set = (k: keyof typeof s, v: boolean) => {
    const next = { ...s, [k]: v };
    setS(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const rows: { k: keyof typeof s; label: string; sub: string }[] = [
    { k: "notif", label: "الإشعارات", sub: "تنبيهات عند تحديث رحلتك" },
    { k: "reminders", label: "التذكيرات", sub: "تذكير بالخطوات القادمة" },
    { k: "voice", label: "الإدخال الصوتي", sub: "إظهار زر التحدث" },
  ];

  return (
    <>
      <TopBar title="إعدادات الحساب" back="/profile" />
      <Page>
        <ul className="card mt-2 divide-y divide-border">
          {rows.map((r) => (
            <li key={r.k} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-xs text-muted">{r.sub}</div>
              </div>
              <Toggle on={s[r.k]} onChange={(v) => set(r.k, v)} />
            </li>
          ))}
        </ul>
        <div className="card mt-3 p-4">
          <div className="text-sm font-medium">الخصوصية</div>
          <p className="text-xs text-muted mt-1">
            تساهيل لا يخزن مستنداتك الرسمية. يحفظ فقط رحلاتك وحالة المتطلبات التي تحددها بنفسك، ويحيلك دائماً إلى القنوات الحكومية الرسمية لإتمام الإجراء.
          </p>
        </div>
      </Page>
    </>
  );
}

