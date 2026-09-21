import { NextResponse } from "next/server";
import { getEntity, getService, getScenario } from "@/lib/kb";
import { activeProvider, chat } from "@/lib/llm";
import type { Journey } from "@/lib/types";

export const runtime = "nodejs";

/**
 * POST /api/assist { journey: Journey, question: string }
 * إجابة سياقية على سؤال المستخدم داخل رحلته (اختياري، يعمل فقط عند وجود مزود نموذج).
 * القاعدة الصارمة: لا يقترح تجاوز الأنظمة، ويوجه فقط للقنوات الرسمية الموجودة في قاعدة المعرفة.
 */
export async function POST(req: Request) {
  const { journey, question } = (await req.json()) as { journey: Journey; question: string };
  if (!question?.trim()) return NextResponse.json({ error: "اكتب سؤالك" }, { status: 400 });
  if (activeProvider() === "none") {
    return NextResponse.json({
      answer: "المساعد الذكي غير مفعّل حالياً. استخدم شاشة «لو ما أقدر؟» لعرض المسار الرسمي لمعالجة أي عائق.",
    });
  }
  const sc = getScenario(journey.scenarioId);
  const context = journey.steps
    .map((st) => {
      const s = getService(st.serviceId);
      if (!s) return "";
      const ent = getEntity(s.entityId);
      return `الخطوة ${st.order} (${st.status}): ${s.name} — الجهة: ${ent?.name ?? s.entityId} — القناة: ${s.url}
المتطلبات: ${s.requirements.map((r) => `${r.label}${r.obtain ? ` (طريقة الحصول: ${r.obtain.title} عبر ${r.obtain.url ?? ""})` : ""}`).join("؛ ")}`;
    })
    .join("\n");

  const system = `أنت "تساهيل" مساعد رحلة الخدمات الحكومية. أجب بالعربية بإيجاز (3-5 جمل) وبلهجة ودودة.
قواعد صارمة: لا تقترح أبداً تجاوز الأنظمة أو الشروط. وجّه فقط إلى القنوات الرسمية الواردة في السياق. إن لم تعرف قل "تحقق من الجهة الرسمية".
سيناريو المستخدم: ${sc?.title ?? journey.title}
السياق:\n${context}`;

  try {
    const answer = await chat([
      { role: "system", content: system },
      { role: "user", content: question },
    ]);
    return NextResponse.json({ answer });
  } catch (e) {
    console.error("assist error", e);
    return NextResponse.json({ answer: "تعذر الاتصال بالمساعد الآن. حاول لاحقاً." });
  }
}

