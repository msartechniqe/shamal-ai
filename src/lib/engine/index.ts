import type {
  Journey,
  JourneyStep,
  ReadinessLevel,
  ReqStatus,
  Requirement,
  Scenario,
  Service,
} from "@/lib/types";
import { getScenario, getService, SCENARIOS, SERVICES } from "@/lib/kb";

/* ---------- المطابقة (قواعد احتياطية بدون نموذج لغوي) ---------- */

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export function matchScenarioByRules(need: string): { scenario: Scenario | null; score: number } {
  const n = normalize(need);
  let best: { scenario: Scenario | null; score: number } = { scenario: null, score: 0 };
  for (const sc of SCENARIOS) {
    let score = 0;
    // الكلمات الأطول أكثر تحديداً: «علامة تجارية» تتفوق على «مشروع»
    for (const kw of sc.intentKeywords) {
      const k = normalize(kw);
      if (n.includes(k)) score += k.length;
    }
    if (score > best.score) best = { scenario: sc, score };
  }
  return best;
}

export function matchServicesByRules(need: string, limit = 5): Service[] {
  const n = normalize(need);
  return SERVICES.map((s) => ({
    s,
    score: s.keywords.reduce((acc, kw) => acc + (n.includes(normalize(kw)) ? 1 : 0), 0),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

/* ---------- بناء الرحلة ---------- */

/** ترتيب الخدمات طوبولوجياً حسب التبعيات (prerequisites) */
export function orderServices(serviceIds: string[]): string[] {
  const visited = new Set<string>();
  const out: string[] = [];
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const s = getService(id);
    if (!s) return;
    for (const p of s.prerequisites) if (serviceIds.includes(p)) visit(p);
    out.push(id);
  };
  serviceIds.forEach(visit);
  return out;
}

export function buildSteps(serviceIds: string[]): JourneyStep[] {
  const ordered = orderServices(serviceIds);
  return ordered.map((serviceId, i) => ({
    serviceId,
    order: i + 1,
    status: i === 0 ? "current" : "upcoming",
  }));
}

export function createJourney(params: {
  id: string;
  userId: string;
  scenarioId: string;
  need: string;
  answers?: Record<string, string>;
}): Journey {
  const sc = getScenario(params.scenarioId);
  if (!sc) throw new Error("سيناريو غير معروف");
  const now = Date.now();
  return {
    id: params.id,
    userId: params.userId,
    scenarioId: sc.id,
    title: sc.title,
    need: params.need,
    answers: params.answers ?? {},
    steps: buildSteps(sc.serviceIds),
    reqStatus: {},
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/* ---------- الجاهزية ---------- */

export function currentStep(j: Journey): JourneyStep | undefined {
  return j.steps.find((s) => s.status === "current" || s.status === "blocked") ?? j.steps.find((s) => s.status === "upcoming");
}

export function stepRequirements(j: Journey, step: JourneyStep): Requirement[] {
  const svc = getService(step.serviceId);
  if (!svc) return [];
  // الخطوات السابقة في الرحلة تُعرض كمتطلبات "سابقة" أيضاً
  const prereqReqs: Requirement[] = svc.prerequisites
    .filter((p) => j.steps.some((s) => s.serviceId === p))
    .map((p) => {
      const ps = getService(p)!;
      return {
        id: `prereq:${p}`,
        label: ps.name,
        kind: "prerequisite" as const,
        description: `يجب إنجاز خطوة «${ps.name}» أولاً`,
      };
    });
  return [...prereqReqs, ...svc.requirements];
}

export function reqStatusOf(j: Journey, req: Requirement): ReqStatus {
  if (req.kind === "prerequisite") {
    const sid = req.id.replace("prereq:", "");
    const st = j.steps.find((s) => s.serviceId === sid);
    return st?.status === "done" ? "done" : "missing";
  }
  return j.reqStatus[req.id] ?? "unknown";
}

export interface Readiness {
  percent: number;
  level: ReadinessLevel;
  done: Requirement[];
  missing: Requirement[];
  unknown: Requirement[];
  blockedByPrereq: Requirement[];
  label: string;
  hint: string;
}

export function computeReadiness(j: Journey, step?: JourneyStep): Readiness {
  const st = step ?? currentStep(j);
  if (!st) {
    return {
      percent: 100,
      level: "green",
      done: [],
      missing: [],
      unknown: [],
      blockedByPrereq: [],
      label: "اكتملت رحلتك",
      hint: "أنجزت جميع الخطوات.",
    };
  }
  const reqs = stepRequirements(j, st);
  const done: Requirement[] = [];
  const missing: Requirement[] = [];
  const unknown: Requirement[] = [];
  const blockedByPrereq: Requirement[] = [];
  for (const r of reqs) {
    const s = reqStatusOf(j, r);
    if (r.kind === "prerequisite" && s !== "done") blockedByPrereq.push(r);
    else if (s === "done") done.push(r);
    else if (s === "missing") missing.push(r);
    else unknown.push(r);
  }
  const total = reqs.length || 1;
  const percent = reqs.length ? Math.round((done.length / total) * 100) : 100;
  let level: ReadinessLevel = "green";
  if (blockedByPrereq.length) level = "red";
  else if (missing.length || unknown.length) level = "yellow";
  const label =
    level === "green" ? "جاهز للتقديم" : level === "yellow" ? "تحتاج إلى إكمال" : "لا تبدأ الآن";
  const hint =
    level === "green"
      ? "المتطلبات الأساسية مكتملة."
      : level === "yellow"
        ? "يوجد مستند أو إجراء ناقص."
        : "توجد خطوة سابقة أو شرط يجب إكماله أولاً.";
  return { percent, level, done, missing, unknown, blockedByPrereq, label, hint };
}

/* ---------- تحديث الحالة ---------- */

export function setRequirementStatus(j: Journey, reqId: string, status: ReqStatus): Journey {
  return { ...j, reqStatus: { ...j.reqStatus, [reqId]: status }, updatedAt: Date.now() };
}

export function completeCurrentStep(j: Journey): Journey {
  const idx = j.steps.findIndex((s) => s.status === "current" || s.status === "blocked");
  if (idx < 0) return j;
  const steps = j.steps.map((s, i) => {
    if (i === idx) return { ...s, status: "done" as const };
    if (i === idx + 1) return { ...s, status: "current" as const };
    return s;
  });
  return { ...j, steps, updatedAt: Date.now() };
}

export function markBlocked(j: Journey, blocked: boolean): Journey {
  const steps = j.steps.map((s) =>
    s.status === "current" || s.status === "blocked"
      ? { ...s, status: blocked ? ("blocked" as const) : ("current" as const) }
      : s,
  );
  return { ...j, steps, updatedAt: Date.now() };
}

/** الخطوة التالية العملية للمستخدم: إما إكمال متطلب ناقص أو التقديم في القناة الرسمية */
export function nextAction(j: Journey): {
  kind: "obtain" | "apply" | "finished";
  title: string;
  description: string;
  url?: string;
  entityName?: string;
  durationText?: string;
  requirement?: Requirement;
  service?: Service;
} {
  const st = currentStep(j);
  if (!st) return { kind: "finished", title: "اكتملت رحلتك", description: "أنجزت جميع الخطوات المطلوبة." };
  const svc = getService(st.serviceId)!;
  const r = computeReadiness(j, st);
  const missing = [...r.blockedByPrereq, ...r.missing, ...r.unknown];
  if (missing.length) {
    const req = missing[0];
    if (req.kind === "prerequisite") {
      const ps = getService(req.id.replace("prereq:", ""))!;
      return {
        kind: "obtain",
        title: `أنجز أولاً: ${ps.name}`,
        description: `خطوة «${svc.name}» تعتمد على إنجاز «${ps.name}» أولاً.`,
        url: ps.url,
        entityName: ps.entityId,
        durationText: ps.duration,
        requirement: req,
        service: ps,
      };
    }
    return {
      kind: "obtain",
      title: `ابدأ باستكمال ${req.label}`,
      description: req.obtain?.why ?? `هذا المتطلب مطلوب لإكمال خطوة «${svc.name}».`,
      url: req.obtain?.url,
      entityName: req.obtain?.entityId,
      durationText: req.obtain?.durationText,
      requirement: req,
      service: svc,
    };
  }
  return {
    kind: "apply",
    title: `قدّم على ${svc.name}`,
    description: svc.description,
    url: svc.url,
    entityName: svc.entityId,
    durationText: svc.duration,
    service: svc,
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

