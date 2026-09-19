import { currentUser } from "./auth";
import { dbEnabled, ensureSchema, sql } from "./db";
import type { Actor } from "@/lib/requests/model";
let ready: Promise<void> | null = null;
export function requestSchema() {
  if (!ready) ready = (async () => {
    await ensureSchema();
    await sql()`CREATE TABLE IF NOT EXISTS agency_members (user_id TEXT PRIMARY KEY REFERENCES users(id), entity_id TEXT, role TEXT NOT NULL CHECK(role IN ('agency','admin')))`;
    await sql()`CREATE TABLE IF NOT EXISTS service_requests (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), entity_id TEXT NOT NULL, data JSONB NOT NULL, version INTEGER NOT NULL DEFAULT 1)`;
    await sql()`CREATE INDEX IF NOT EXISTS service_requests_owner_idx ON service_requests(owner_id)`;
    await sql()`CREATE INDEX IF NOT EXISTS service_requests_entity_idx ON service_requests(entity_id)`;
  })().catch(e => {ready = null; throw e;});
  return ready;
}
export async function requestActor(): Promise<Actor> {
  if (!dbEnabled || !process.env.AUTH_SECRET) throw new Error("التجربة المحلية تعمل داخل المتصفح فقط.");
  const user = await currentUser();
  if (!user) throw new Error("سجّل دخولك أولاً.");
  await requestSchema();
  const rows = await sql()`SELECT role, entity_id FROM agency_members WHERE user_id = ${user.uid}`;
  const m = rows[0];
  return {...user, role: m?.role === "admin" ? "admin" : m?.role === "agency" ? "agency" : "beneficiary", entityId: m?.entity_id as string | undefined};
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) throw new Error("مصدر الطلب غير مسموح.");
}
export async function boundedJson(req: Request) {
  const text = await req.text();
  if (text.length > 2_900_000) throw new Error("حجم الطلب أكبر من الحد المسموح.");
  return JSON.parse(text);
}

