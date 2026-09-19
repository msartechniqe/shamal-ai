"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Bell, Check, Info } from "lucide-react";
import { RequestAlerts } from "@/components/RequestAlerts";
import { EmptyState, Page, TopBar } from "@/components/ui";
import { useNotifications } from "@/lib/hooks/useJourneys";
import { saveNotification } from "@/lib/storage";
import type { Notification } from "@/lib/types";

function relTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("ar-SA-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "أمس";
  return d.toLocaleDateString("ar-SA-u-nu-latn", { month: "numeric", day: "numeric" });
}

const ICON: Record<Notification["kind"], { icon: typeof Bell; cls: string }> = {
  success: { icon: Check, cls: "bg-ok-soft text-ok" },
  warning: { icon: AlertTriangle, cls: "bg-danger-soft text-danger" },
  info: { icon: Info, cls: "bg-primary-soft text-primary" },
  reminder: { icon: Bell, cls: "bg-warn-soft text-warn" },
};

/** الشاشة 10: الإشعارات */
export default function NotificationsPage() {
  const { items, refresh } = useNotifications();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const list = tab === "unread" ? items.filter((n) => !n.read) : items;

  const markRead = async (n: Notification) => {
    if (n.read) return;
    await saveNotification({ ...n, read: true });
    refresh();
  };
  const markAll = async () => {
    await Promise.all(items.filter((n) => !n.read).map((n) => saveNotification({ ...n, read: true })));
    refresh();
  };

  return (
    <>
      <TopBar title="الإشعارات" back />
      <Page>
        <RequestAlerts/>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("all")} className={`chip ${tab === "all" ? "chip-active" : ""}`}>
            الكل
          </button>
          <button onClick={() => setTab("unread")} className={`chip ${tab === "unread" ? "chip-active" : ""}`}>
            غير مقروءة
          </button>
          {items.some((n) => !n.read) && (
            <button onClick={markAll} className="text-xs text-primary font-bold mr-auto">
              تعليم الكل كمقروء
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <EmptyState title="لا توجد إشعارات" body="ستصلك تنبيهات عند تحديث رحلتك أو اكتشاف نقص في المتطلبات." />
        ) : (
          <ul className="mt-4 space-y-2">
            {list.map((n) => {
              const { icon: Icon, cls } = ICON[n.kind];
              const inner = (
                <div className={`card p-3 flex items-start gap-3 ${!n.read ? "border-primary/40" : ""}`} onClick={() => markRead(n)}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm flex-1">{n.title}</div>
                      <span className="text-[11px] text-muted">{relTime(n.at)}</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">{n.body}</div>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2" />}
                </div>
              );
              return <li key={n.id}>{n.journeyId ? <Link href={`/journey/${n.journeyId}`}>{inner}</Link> : inner}</li>;
            })}
          </ul>
        )}
      </Page>
    </>
  );
}

