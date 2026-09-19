"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserProfile } from "@/lib/types";

interface AuthCtx {
  user: UserProfile | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
const DEMO_KEY = "shamal:demo-user";

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/auth/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "حدث خطأ، حاول مرة أخرى.");
  return data;
}

/**
 * المصادقة: خادم (Postgres + JWT) عند ضبط DATABASE_URL و AUTH_SECRET،
 * وإلا وضع تجريبي محلي (localStorage) ليعمل التطبيق بدون إعداد.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    api<{ configured: boolean; user: UserProfile | null }>("me")
      .then((r) => {
        if (r.configured) {
          setDemoMode(false);
          setUser(r.user);
        } else {
          setDemoMode(true);
          try {
            const raw = localStorage.getItem(DEMO_KEY);
            setUser(raw ? (JSON.parse(raw) as UserProfile) : null);
          } catch {
            setUser(null);
          }
        }
      })
      .catch(() => { setDemoMode(false); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const demoLogin = (name: string, email: string) => {
    const u: UserProfile = { uid: "demo-" + email.toLowerCase(), name, email, createdAt: Date.now() };
    localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (demoMode) {
        if (!email || password.length < 4) throw new Error("أدخل بريداً وكلمة مرور صحيحة.");
        return demoLogin(email.startsWith("agency.") ? "موظف الجهة التجريبي" : email.startsWith("admin.demo") ? "مشرف تساهيل" : email === "beneficiary@example.test" ? "المستفيد التجريبي" : email.split("@")[0], email);
      }
      const r = await api<{ user: UserProfile }>("login", { email, password });
      setUser(r.user);
    },
    [demoMode],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (demoMode) {
        if (!name || !email || password.length < 6) throw new Error("أكمل البيانات (كلمة المرور 6 أحرف على الأقل).");
        return demoLogin(name, email);
      }
      const r = await api<{ user: UserProfile }>("register", { name, email, password });
      setUser(r.user);
    },
    [demoMode],
  );

  const signOut = useCallback(async () => {
    if (demoMode) localStorage.removeItem(DEMO_KEY);
    else await api("logout", {});
    setUser(null);
  }, [demoMode]);

  const updateName = useCallback(
    async (name: string) => {
      if (!user) return;
      if (demoMode) {
        const next = { ...user, name };
        localStorage.setItem(DEMO_KEY, JSON.stringify(next));
        setUser(next);
        return;
      }
      const r = await api<{ user: UserProfile }>("name", { name });
      setUser(r.user);
    },
    [user, demoMode],
  );

  const value = useMemo<AuthCtx>(
    () => ({ user, loading, demoMode, signIn, signUp, signOut, updateName }),
    [user, loading, demoMode, signIn, signUp, signOut, updateName],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth خارج AuthProvider");
  return ctx;
}

