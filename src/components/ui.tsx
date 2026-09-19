"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Home, LayoutGrid, MessageSquare, User, Files } from "lucide-react";
import type { ReactNode } from "react";
import { LogoFull } from "./Logo";

/* ---------- الشريط العلوي ---------- */
export function TopBar({
  title,
  back,
  showLogo,
  right,
}: {
  title?: string;
  back?: boolean | string;
  showLogo?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur px-4 pt-3 pb-2">
      <div className="flex items-center justify-between min-h-11">
        <div className="flex items-center gap-2">
          {showLogo ? (
            <LogoFull size={40} />
          ) : (
            <h1 className="text-xl font-bold text-text">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {right}
          {back && (
            <button
              onClick={() => (typeof back === "string" ? router.push(back) : router.back())}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text"
              aria-label="رجوع"
            >
              <ChevronRight className="rotate-180" size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <Link
      href="/notifications"
      className="relative w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text"
      aria-label="الإشعارات"
    >
      <Bell size={19} />
      {count > 0 && (
        <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

/* ---------- شريط التنقل السفلي ---------- */
const NAV = [
  { href: "/home", label: "الرئيسية", icon: Home },
  { href: "/services", label: "الخدمات", icon: LayoutGrid },
  { href: "/requests", label: "طلباتي", icon: Files },
  { href: "/chats", label: "المساعد", icon: MessageSquare },
  { href: "/profile", label: "حسابي", icon: User },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active ? "text-primary font-bold" : "text-muted"}`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------- حاوية الصفحة ---------- */
export function Page({ children, nav = true, className = "" }: { children: ReactNode; nav?: boolean; className?: string }) {
  return (
    <>
      <main className={`flex-1 px-4 pb-6 ${className}`}>{children}</main>
      {nav && <BottomNav />}
    </>
  );
}

/* ---------- عناصر صغيرة ---------- */
export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`card p-4 ${onClick ? "cursor-pointer active:scale-[0.99] transition" : ""} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-5 mb-2">
      <h2 className="font-bold text-text">{children}</h2>
      {action}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <div className="w-8 h-8 rounded-full border-4 border-primary-soft border-t-primary animate-spin" />
      {label && <div className="text-sm">{label}</div>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="card p-6 text-center mt-4">
      <div className="font-bold text-text">{title}</div>
      {body && <p className="text-sm text-muted mt-1">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- حلقة مؤشر الجاهزية ---------- */
export function ReadinessRing({ percent, level, size = 128 }: { percent: number; level: "green" | "yellow" | "red"; size?: number }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const color = level === "green" ? "var(--ok)" : level === "yellow" ? "var(--warn)" : "var(--danger)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth={12} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold" style={{ color }}>
          {percent}%
        </div>
        <div className="text-[11px] text-muted">مؤشر الجاهزية</div>
      </div>
    </div>
  );
}

export function StatusPill({ level, label }: { level: "green" | "yellow" | "red"; label: string }) {
  const cls =
    level === "green" ? "bg-ok-soft text-ok" : level === "yellow" ? "bg-warn-soft text-warn" : "bg-danger-soft text-danger";
  const dot = level === "green" ? "🟢" : level === "yellow" ? "🟡" : "🔴";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${cls}`}>
      {dot} {label}
    </span>
  );
}

