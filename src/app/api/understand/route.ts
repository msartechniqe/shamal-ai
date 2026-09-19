import { NextResponse } from "next/server";
import { SCENARIOS, getScenario } from "@/lib/kb";
import { matchScenarioByRules } from "@/lib/engine";
import { activeProvider, chat, extractJSON } from "@/lib/llm";
import type { IntentResult } from "@/lib/types";

export const runtime = "nodejs";

/**
 * POST /api/understand  { need: string }
 * يحوّل نص الاحتياج إلى: سيناريو مطابق + ملخص + أسئلة توضيحية.
 * يستخدم النموذج اللغوي إن توفر، وإلا يعتمد على قواعد المطابقة.
 */
export async function POST(req: Request) {
  const { need } = (await req.json()) as { need?: string };
  if (!need?.trim()) return NextResponse.json({ error: "أدخل احتياجك" }, { status: 400 });

  const rules = matchScenarioByRules(need);
  const fallback: IntentResult = {
    scenarioId: rules.scenario?.id ?? null,
    confidence: rules.scenario ? Math.min(1, rules.score / 3) : 0,
    summary: rules.scenario ? rules.scenario.summary : "لم أتأكد من احتياجك بعد، وضّح لي أكثر.",
    questions: rules.scenario?.questions ?? [],
    source: "rules",
  };

  if (activeProvider() === "none") return NextResponse.json(fallback);

  const catalog = SCENARIOS.map((s) => `- ${s.id}: ${s.title} | كلمات: ${s.intentKeywords.slice(0, 6).join("، ")}`).join("\n");
  const system = `أنت "تساهيل"، مساعد حكومي ذكي للمستفيدين في جميع مناطق السعودية. مهمتك فهم احتياج المستفيد المكتوب باللهجة السعودية أو الفصحى ومطابقته مع أحد السيناريوهات التالية فقط:
${catalog}

أجب بصيغة JSON فقط بالشكل:
{"scenarioId": "<id أو null>", "confidence": 0..1, "summary": "<ملخص قصير للاحتياج بصيغة: الاحتياج: ...>", "extraQuestions": ["سؤال قصير اختياري"]}
لا تضف أي نص خارج JSON. لا تخترع سيناريوهات غير موجودة. إن لم يطابق أي سيناريو اجعل scenarioId = null واكتب في summary سؤالاً توضيحياً قصيراً.`;

  try {
    const raw = await chat(
      [
        { role: "system", content: system },
        { role: "user", content: need },
      ],
      { json: true, maxTokens: 300 },
    );
    const parsed = extractJSON<{ scenarioId: string | null; confidence: number; summary: string; extraQuestions?: string[] }>(raw);
    if (!parsed) return NextResponse.json(fallback);
    const sc = parsed.scenarioId ? getScenario(parsed.scenarioId) : null;
    const result: IntentResult = {
      scenarioId: sc?.id ?? fallback.scenarioId,
      confidence: sc ? Number(parsed.confidence) || 0.7 : fallback.confidence,
      summary: parsed.summary || fallback.summary,
      questions: sc?.questions ?? fallback.questions,
      source: "llm",
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error("understand llm error", e);
    return NextResponse.json(fallback);
  }
}

