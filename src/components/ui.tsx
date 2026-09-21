"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, ChevronLeft, ChevronRight, ClipboardList, Home, User } from "lucide-react";
import type { ReactNode } from "react";
import { LogoFull } from "./Logo";

export function TopBar({ title, back, showLogo, right }: { title?: string; back?: boolean | string; showLogo?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="app-header">
      <div>{showLogo ? <LogoFull size={38} /> : <h1 className="text-xl font-extrabold">{title}</h1>}</div>
      <div className="flex items-center gap-2">{right}{back && <button onClick={() => typeof back === "string" ? router.push(back) : router.back()} className="icon-button" aria-label="رجوع"><ChevronRight className="rotate-180" size={20}/></button>}</div>
    </header>
  );
}

export function NotificationBell({ count = 0 }: { count?: number }) {
  return <Link href="/notifications" className="icon-button relative" aria-label="الإشعارات"><Bell size={19}/>{count > 0 && <span className="notification-count">{count}</span>}</Link>;
}

const NAV = [
  { href: "/home", label: "الرئيسية", icon: Home },
  { href: "/requests", label: "معاملاتي", icon: ClipboardList },
  { href: "/services", label: "الدليل", icon: BookOpen },
  { href: "/profile", label: "حسابي", icon: User },
];

export function BottomNav() {
  const path = usePathname();
  return <nav className="bottom-nav"><ul>{NAV.map(({href,label,icon:Icon}) => { const active=path===href||path.startsWith(href+"/"); return <li key={href}><Link href={href} className={active?"active":""}><Icon size={21}/><span>{label}</span></Link></li>;})}</ul></nav>;
}

export function Page({ children, nav = true, className = "" }: { children: ReactNode; nav?: boolean; className?: string }) {
  return <><main className={`page-content ${className}`}>{children}</main>{nav && <BottomNav/>}</>;
}

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div className={`card p-4 ${onClick?"cursor-pointer":""} ${className}`} onClick={onClick}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="section-heading"><h2>{children}</h2>{action}</div>;
}

export function Spinner({ label }: { label?: string }) {
  return <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted"><div className="w-8 h-8 rounded-full border-4 border-primary-soft border-t-primary animate-spin"/>{label&&<div className="text-sm">{label}</div>}</div>;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return <div className="card p-7 text-center mt-4"><div className="font-extrabold">{title}</div>{body&&<p className="text-sm text-muted mt-2">{body}</p>}{action&&<div className="mt-4">{action}</div>}</div>;
}

export function ReadinessRing({ percent, level, size=128 }: {percent:number;level:"green"|"yellow"|"red";size?:number}) {
 const r=(size-14)/2,c=2*Math.PI*r,color=level==="green"?"var(--ok)":level==="yellow"?"var(--warn)":"var(--danger)";
 return <div className="relative" style={{width:size,height:size}}><svg width={size} height={size} className="-rotate-90"><circle cx={size/2} cy={size/2} r={r} stroke="var(--border)" strokeWidth={12} fill="none"/><circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-percent/100)}/></svg><div className="absolute inset-0 grid place-content-center text-center"><b className="text-3xl" style={{color}}>{percent}%</b><span className="text-[11px] text-muted">الجاهزية</span></div></div>;
}

export function StatusPill({level,label}:{level:"green"|"yellow"|"red";label:string}) {return <span className={`status-pill ${level}`}>{label}</span>;}

export { ChevronLeft };
