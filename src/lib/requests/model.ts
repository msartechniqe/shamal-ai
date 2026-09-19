import { ENTITIES } from "@/lib/kb/entities";
import { getService } from "@/lib/kb";
import type { UserProfile } from "@/lib/types";

export const REGIONS = ["الرياض","مكة المكرمة","المدينة المنورة","القصيم","المنطقة الشرقية","عسير","تبوك","حائل","الحدود الشمالية","جازان","نجران","الباحة","الجوف"] as const;
export const KINDS = { inquiry: "استفسار", license: "ترخيص نشاط", permit: "تصريح" } as const;
export const STATUSES = { routed: "تم التوجيه", in_progress: "قيد المعالجة", needs_info: "بانتظار استكمالك", approved: "تمت الموافقة", rejected: "مرفوض", closed: "تم الرد والإغلاق" } as const;
export type Kind = keyof typeof KINDS;
export type Status = keyof typeof STATUSES;
export type Actor = UserProfile & { role: "beneficiary" | "agency" | "admin"; entityId?: string };
export interface Attachment { id: string; requirementId: string; name: string; mime: string; size: number; data: string; }
export interface Draft { kind: Kind; subject: string; body: string; region: string; city: string; audience: "citizen" | "resident" | "visitor" | "business"; entityId: string; serviceId?: string; attachments: Attachment[]; }
export interface Event { id: string; at: number; actor: string; note: string; status: Status; }
export interface ServiceRequest extends Draft { id: string; number: string; ownerId: string; ownerName: string; status: Status; createdAt: number; updatedAt: number; dueAt: number; escalated: boolean; events: Event[]; version: number; certificate?: { number: string; at: number; issuedBy: string; demo: true }; }
export type Action = { type: "reply" | "start" | "request_info" | "approve" | "reject" | "close" | "resubmit" | "escalate"; note?: string; attachments?: Attachment[] };
export const uid = () => crypto.randomUUID();
export const entityName = (id: string, region?: string) => id === "balady" ? `الأمانة / البلدية — ${region || "حسب المنطقة"}` : ENTITIES.find(e => e.id === id)?.name || "جهة غير محددة";
export function canRead(r: ServiceRequest, actor: Actor) { return actor.role === "admin" || (actor.role === "agency" ? actor.entityId === r.entityId : actor.uid === r.ownerId); }
export function requiredDocuments(d: Pick<Draft, "serviceId" | "kind">) {
  if (d.kind === "inquiry") return [];
  return d.serviceId ? (getService(d.serviceId)?.requirements.filter(r => r.kind === "document") || []) : [];
}
export function validateAttachments(items: Attachment[]) {
  if (!Array.isArray(items) || items.length > 5) throw new Error("الحد الأقصى خمسة مرفقات.");
  let total = 0;
  for (const a of items) {
    if (!a || typeof a.name !== "string" || !a.name.trim() || a.name.length > 150 || typeof a.id !== "string" || typeof a.requirementId !== "string") throw new Error("بيانات المرفق غير صالحة.");
    if (!["application/pdf","image/png","image/jpeg","text/plain"].includes(a.mime) || typeof a.data !== "string") throw new Error("المرفقات المدعومة: PDF وصور ونصوص.");
    const prefix = `data:${a.mime};base64,`;
    if (!a.data.startsWith(prefix) || !/^[A-Za-z0-9+/]*={0,2}$/.test(a.data.slice(prefix.length))) throw new Error("محتوى المرفق غير صالح.");
    const size = Math.floor(a.data.slice(prefix.length).length * 3 / 4);
    if (size > 750_000 || size === 0 || !Number.isFinite(a.size) || a.size <= 0) throw new Error("حجم كل مرفق حتى 750 كيلوبايت.");
    total += size;
  }
  if (total > 2_000_000) throw new Error("إجمالي المرفقات حتى 2 ميجابايت.");
}
export function validateDraft(d: Draft) {
  if (!d || !Object.hasOwn(KINDS, d.kind) || typeof d.subject !== "string" || d.subject.trim().length < 3 || d.subject.length > 180 || typeof d.body !== "string" || d.body.trim().length < 10 || d.body.length > 4000) throw new Error("أكمل عنوان الطلب ووصفه (10 أحرف على الأقل).");
  if (!REGIONS.some(r => r === d.region) || typeof d.city !== "string" || !d.city.trim() || d.city.length > 80) throw new Error("حدد المنطقة والمدينة.");
  if (!["citizen","resident","visitor","business"].includes(d.audience)) throw new Error("حدد صفة المستفيد.");
  if (!ENTITIES.some(e => e.id === d.entityId)) throw new Error("حدد الجهة المختصة قبل الإرسال.");
  if (d.serviceId && (!getService(d.serviceId) || getService(d.serviceId)!.entityId !== d.entityId)) throw new Error("الخدمة لا تتبع الجهة المحددة.");
  validateAttachments(d.attachments);
  const missing = requiredDocuments(d).filter(r => !d.attachments.some(a => a.requirementId === r.id));
  if (missing.length) throw new Error("أرفق المستندات المطلوبة: " + missing.map(r => r.label).join("، "));
}
export function createRequest(d: Draft, actor: Actor, now = Date.now()): ServiceRequest {
  if (actor.role !== "beneficiary") throw new Error("تقديم الطلبات متاح لحساب المستفيد.");
  validateDraft(d);
  const id = uid();
  return { ...d, id, number: "TS-" + id.slice(0,8).toUpperCase(), ownerId: actor.uid, ownerName: actor.name, status: "routed", createdAt: now, updatedAt: now, dueAt: now + (d.kind === "inquiry" ? 48 : 72) * 3600000, escalated: false, version: 1, events: [{ id: uid(), at: now, actor: actor.name, note: "تم تقديم الطلب وتوجيهه إلى " + entityName(d.entityId, d.region), status: "routed" }] };
}
export function actOnRequest(r: ServiceRequest, actor: Actor, a: Action, now = Date.now()): ServiceRequest {
  if (!canRead(r, actor)) throw new Error("لا تملك صلاحية الوصول لهذا الطلب.");
  const terminal = ["approved","rejected","closed"].includes(r.status);
  if (terminal) throw new Error("انتهت معالجة هذا الطلب.");
  const staff = actor.role !== "beneficiary";
  const note = typeof a.note === "string" ? a.note.trim() : "";
  if (note.length > 3000) throw new Error("الرد أطول من الحد المسموح.");
  let status = r.status;
  let attachments = r.attachments;
  let escalated = r.escalated;
  let certificate = r.certificate;
  if (a.type === "escalate") {
    if (now <= r.dueAt || r.escalated) throw new Error("التصعيد متاح مرة واحدة بعد انتهاء المدة.");
    escalated = true;
  } else if (a.type === "resubmit") {
    if (staff || r.status !== "needs_info" || !note) throw new Error("الاستكمال متاح للمستفيد عند طلب معلومات إضافية مع توضيح.");
    attachments = [...r.attachments, ...(a.attachments || [])];
    validateAttachments(attachments);
    status = "in_progress";
  } else {
    if (!staff) throw new Error("هذا الإجراء مخصص لموظف الجهة.");
    if (a.type !== "start" && !note) throw new Error("اكتب الرد أو سبب القرار.");
    const allowed: Action["type"][] = ["start","reply","request_info","approve","reject","close"];
    if (!allowed.includes(a.type)) throw new Error("إجراء غير صالح.");
    if (a.type === "start") {
      if (r.status !== "routed") throw new Error("بدأت معالجة الطلب بالفعل.");
      status = "in_progress";
    }
    if (a.type === "request_info") status = "needs_info";
    if (a.type === "reject") status = "rejected";
    if (a.type === "close") {
      if (r.kind !== "inquiry") throw new Error("طلبات التراخيص والتصاريح تحتاج موافقة أو رفض.");
      status = "closed";
    }
    if (a.type === "approve") {
      if (r.kind === "inquiry" || r.status === "needs_info") throw new Error("لا يمكن إصدار تصريح لهذا الطلب قبل استكماله.");
      status = "approved";
      certificate = { number: "DEMO-" + r.number, at: now, issuedBy: actor.name, demo: true };
    }
  }
  const fallback = a.type === "escalate" ? "تم تصعيد الطلب المتأخر إلى إشراف المنصة." : "بدأت الجهة معالجة الطلب.";
  return { ...r, status, attachments, escalated, certificate, updatedAt: now, version: r.version + 1, events: [...r.events, { id: uid(), at: now, actor: actor.name, note: note || fallback, status }] };
}

