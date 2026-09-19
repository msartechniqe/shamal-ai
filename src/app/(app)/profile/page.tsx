"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Globe, HelpCircle, LogOut, Settings, User, UserCircle } from "lucide-react";
import { DemoAccess } from "@/components/DemoAccess";
import { InstallApp } from "@/components/InstallApp";
import { Page, TopBar } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

/** الشاشة 9: حسابي */
export default function ProfilePage() {
  const { user, signOut, demoMode } = useAuth();
  const router = useRouter();

  const items = [
    { href: "/profile/personal", label: "معلوماتي الشخصية", icon: User },
    { href: "/profile/settings", label: "إعدادات الحساب", icon: Settings },
    { href: "/profile/language", label: "اللغة", icon: Globe },
    { href: "/help", label: "المساعدة والدعم", icon: HelpCircle },
  ];

  return (
    <>
      <TopBar title="حسابي" />
      <Page>
        <div className="flex flex-col items-center mt-4">
          <div className="w-20 h-20 rounded-full bg-primary-soft text-primary flex items-center justify-center">
            <UserCircle size={48} strokeWidth={1.5} />
          </div>
          <div className="font-bold text-lg mt-3">{user?.name}</div>
          <div className="text-xs text-muted" dir="ltr">
            {user?.email}
          </div>
          {demoMode && <div className="text-[11px] text-warn mt-1">حساب تجريبي محلي</div>}
        </div>

        <ul className="card mt-6 divide-y divide-border">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-3 p-4">
                <Icon size={20} className="text-primary" />
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronLeft size={18} className="text-muted" />
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
              className="flex items-center gap-3 p-4 w-full text-danger"
            >
              <LogOut size={20} />
              <span className="flex-1 text-sm font-medium text-right">تسجيل الخروج</span>
            </button>
          </li>
        </ul>

        <DemoAccess/><InstallApp/>
        <p className="text-center text-[11px] text-muted mt-8">تساهيل · الإصدار التجريبي</p>
      </Page>
    </>
  );
}

