"use client";
import Link from "next/link";
import {useRequests} from "@/lib/requests/hooks";
import {STATUSES} from "@/lib/requests/model";
export function RequestAlerts(){
 const {requests,error}=useRequests();
 return <section className="mt-4"><h2 className="font-bold mb-2">تحديثات الطلبات</h2>{error&&<p className="text-sm text-danger">{error}</p>}{requests.length===0?<p className="text-sm text-muted">ستظهر هنا تحديثات الطلبات والردود.</p>:requests.map(r=><Link href={"/requests/"+r.id} key={r.id} className="card p-3 block mb-2"><div className="text-sm font-bold">{STATUSES[r.status]} · {r.subject}</div><p className="text-xs text-muted mt-1">{r.events.at(-1)?.note}</p></Link>)}</section>;
}

