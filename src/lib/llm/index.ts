/**
 * طبقة النموذج اللغوي — تعمل على الخادم فقط (API routes).
 *
 * المزودون المدعومون عبر متغيرات البيئة:
 *   LLM_PROVIDER = "openai-compatible" | "anthropic" | "oracle" | "none"
 *
 * openai-compatible: أي نقطة نهاية متوافقة مع OpenAI Chat Completions (بما فيها Oracle/OCI عند تفعيل التوافق)
 *   LLM_BASE_URL, LLM_API_KEY, LLM_MODEL
 * anthropic: ANTHROPIC_API_KEY, LLM_MODEL (افتراضي claude-sonnet-5)
 * oracle: نقطة نهاية مخصصة (ORDS / OCI). يُضبط لاحقاً حسب واجهة النموذج المتاحة لديك:
 *   ORACLE_LLM_URL, ORACLE_LLM_KEY, ORACLE_LLM_MODEL
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type Provider = "openai-compatible" | "anthropic" | "oracle" | "none";

export function activeProvider(): Provider {
  const p = (process.env.LLM_PROVIDER ?? "").toLowerCase();
  if (p === "openai-compatible" || p === "anthropic" || p === "oracle") return p;
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.LLM_BASE_URL && process.env.LLM_API_KEY) return "openai-compatible";
  if (process.env.ORACLE_LLM_URL) return "oracle";
  return "none";
}

export async function chat(messages: LLMMessage[], opts?: { json?: boolean; maxTokens?: number }): Promise<string> {
  const provider = activeProvider();
  const maxTokens = opts?.maxTokens ?? 800;

  if (provider === "anthropic") {
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const rest = messages.filter((m) => m.role !== "system");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "claude-sonnet-5",
        max_tokens: maxTokens,
        system: system || undefined,
        messages: rest.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    return data.content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  }

  if (provider === "openai-compatible") {
    const base = process.env.LLM_BASE_URL!.replace(/\/$/, "");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.LLM_API_KEY}` },
      body: JSON.stringify({
        model: process.env.LLM_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.2,
        ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`llm ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message?.content ?? "";
  }

  if (provider === "oracle") {
    // قالب عام: POST JSON { prompt, model } ويُتوقع { text } أو { response } — يُعدّل بعد معاينة واجهة Oracle الفعلية
    const res = await fetch(process.env.ORACLE_LLM_URL!, {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: {
        "content-type": "application/json",
        ...(process.env.ORACLE_LLM_KEY ? { authorization: `Bearer ${process.env.ORACLE_LLM_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.ORACLE_LLM_MODEL,
        messages,
        prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n\n"),
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) throw new Error(`oracle ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as Record<string, unknown>;
    const text =
      (data.text as string) ??
      (data.response as string) ??
      (data.output as string) ??
      ((data.choices as { message?: { content?: string } }[] | undefined)?.[0]?.message?.content ?? "");
    return String(text);
  }

  throw new Error("لا يوجد مزود نموذج لغوي مضبوط");
}

/** استخراج JSON من رد قد يحتوي نصاً زائداً أو أسوار كود */
export function extractJSON<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

