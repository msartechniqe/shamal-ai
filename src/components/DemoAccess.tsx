"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/auth-context";
import {ENTITIES} from "@/lib/kb/entities";
export function DemoAccess(){
 const {demoMode,signIn,loading}=useAuth();const router=useRouter();const [entity,setEntity]=useState("mc");const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 if(loading||!demoMode)return null;
 async function enter(email:string,path:string){setBusy(true);try{await signIn(email,"demo-only");router.replace(path);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section className="card p-4 mt-4 relative space-y-3"><h2 className="font-bold text-sm">جرّب تساهيل من الجهتين</h2><p className="text-xs text-muted">حسابات تجريبية وبيانات محفوظة في هذا المتصفح فقط. استخدم ملفات تجريبية.</p><button disabled={busy} className="btn-primary text-sm" onClick={()=>enter("beneficiary@example.test","/home")}>الدخول كمستفيد تجريبي</button><select aria-label="جهة الحساب التجريبي" className="form-input" value={entity} onChange={e=>setEntity(e.target.value)}>{ENTITIES.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><button disabled={busy} className="btn-ghost text-sm" onClick={()=>enter("agency."+entity+"@example.test","/requests")}>الدخول كموظف الجهة التجريبي</button><button disabled={busy} className="text-xs text-primary underline" onClick={()=>enter("admin.demo@example.test","/requests")}>إشراف المنصة التجريبي</button>{error&&<p role="alert">{error}</p>}</section>;
}

