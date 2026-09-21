import { requestActor, sameOrigin, boundedJson } from "@/lib/server/requests";
import { sql } from "@/lib/server/db";
import { createRequest, type Draft, type ServiceRequest } from "@/lib/requests/model";
export const runtime = "nodejs";
export async function GET() {
  try {
    const actor = await requestActor();
    const rows = actor.role === "admin" ? await sql()`SELECT data FROM service_requests ORDER BY data->>'updatedAt' DESC LIMIT 500`
      : actor.role === "agency" ? await sql()`SELECT data FROM service_requests WHERE entity_id = ${actor.entityId || ""} ORDER BY data->>'updatedAt' DESC LIMIT 500`
      : await sql()`SELECT data FROM service_requests WHERE owner_id = ${actor.uid} ORDER BY data->>'updatedAt' DESC LIMIT 500`;
    return Response.json({actor, requests: rows.map(r => r.data as ServiceRequest)}, {headers:{"Cache-Control":"no-store"}});
  } catch { return Response.json({error:"تعذر تحميل الطلبات. تحقق من تسجيل الدخول وإعداد الخادم."},{status:401}); }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req); const actor = await requestActor();
    const d = await boundedJson(req) as Draft;
    const clean: Draft = {kind:d.kind, subject:d.subject, body:d.body, region:d.region, city:d.city, audience:d.audience, entityId:d.entityId, serviceId:d.serviceId, attachments:d.attachments};
    const r = createRequest(clean, actor);
    await sql()`INSERT INTO service_requests (id,owner_id,entity_id,data,version) VALUES (${r.id},${r.ownerId},${r.entityId},${JSON.stringify(r)}::jsonb,1)`;
    return Response.json({request:r},{status:201});
  } catch(e) { return Response.json({error:(e as Error).message},{status:400}); }
}

