"use client";
import type { Actor, Draft, ServiceRequest, Action } from "./model";
import { createRequest, actOnRequest, canRead } from "./model";
const KEY = "tasaheel:requests:v1";
async function api(path: string, body?: unknown, method = "POST") {
  const res = await fetch("/api/requests" + path, { method: body === undefined ? "GET" : method, headers: {"content-type":"application/json"}, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "تعذر حفظ الطلب، حاول مجدداً.");
  return data;
}
function all(): ServiceRequest[] { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
function save(rows: ServiceRequest[]) {
  try { localStorage.setItem(KEY, JSON.stringify(rows)); window.dispatchEvent(new Event("tasaheel:requests")); }
  catch { throw new Error("مساحة التجربة ممتلئة. قلل حجم المرفقات وحاول مجدداً."); }
}
export async function listRequests(actor: Actor, demo: boolean): Promise<ServiceRequest[]> {
  return demo ? all().filter(r => canRead(r, actor)).sort((a,b) => b.updatedAt-a.updatedAt) : (await api("")).requests;
}
export async function submitRequest(draft: Draft, actor: Actor, demo: boolean): Promise<ServiceRequest> {
  if (!demo) return (await api("", draft)).request;
  const r = createRequest(draft, actor); save([r, ...all()]); return r;
}
export async function updateRequest(r: ServiceRequest, action: Action, actor: Actor, demo: boolean): Promise<ServiceRequest> {
  if (!demo) return (await api("/" + r.id, { ...action, version: r.version }, "PATCH")).request;
  const rows = all(); const current = rows.find(x => x.id === r.id);
  if (!current || current.version !== r.version) throw new Error("تم تحديث الطلب. حدّث الصفحة قبل المتابعة.");
  const next = actOnRequest(current, actor, action); save(rows.map(x => x.id === r.id ? next : x)); return next;
}

