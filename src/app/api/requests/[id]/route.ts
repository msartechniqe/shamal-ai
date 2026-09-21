import { requestActor, sameOrigin, boundedJson } from "@/lib/server/requests";
import { sql } from "@/lib/server/db";
import { actOnRequest, canRead, type ServiceRequest, type Action } from "@/lib/requests/model";
export async function PATCH(req: Request, {params}: {params:Promise<{id:string}>}) {
  try {
    sameOrigin(req); const actor = await requestActor();
    const {id} = await params; const a = await boundedJson(req) as Action & {version:number};
    const rows = await sql()`SELECT data FROM service_requests WHERE id=${id}`;
    const r = rows[0]?.data as ServiceRequest | undefined;
    if (!r || !canRead(r,actor)) return Response.json({error:"الطلب غير موجود."},{status:404});
    if (r.version !== a.version) return Response.json({error:"تم تحديث الطلب، حدّث الصفحة."},{status:409});
    const next = actOnRequest(r,actor,a);
    const updated = await sql()`UPDATE service_requests SET data=${JSON.stringify(next)}::jsonb,version=${next.version} WHERE id=${id} AND version=${r.version} RETURNING id`;
    if (!updated.length) return Response.json({error:"تم تحديث الطلب، حدّث الصفحة."},{status:409});
    return Response.json({request:next});
  } catch(e) {return Response.json({error:(e as Error).message},{status:400});}
}

