"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useAuth} from "@/lib/auth-context";
import {ENTITIES} from "@/lib/kb/entities";
import {listRequests} from "./client";
import type {Actor,ServiceRequest} from "./model";
export function useRequests() {
 const {user,demoMode,loading:authLoading}=useAuth();
 const [serverActor,setServerActor]=useState<Actor|null>(null);
 const [requests,setRequests]=useState<ServiceRequest[]>([]);
 const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 const demoActor=useMemo<Actor|null>(()=>{
  if(!user)return null;
  const part=user.email.split("@")[0]; const entityId=part.startsWith("agency.")?part.slice(7):undefined;
  return {...user,role:part==="admin.demo"?"admin":entityId && ENTITIES.some(e=>e.id===entityId)?"agency":"beneficiary",entityId};
 },[user]);
 const actor=demoMode?demoActor:serverActor;
 const refresh=useCallback(async()=>{
   if(authLoading || !user)return;
   setError("");
   try {
    if(demoMode && demoActor)setRequests(await listRequests(demoActor,true));
    else {
     const res=await fetch("/api/requests"); const data=await res.json();
     if(!res.ok)throw new Error(data.error);
     setServerActor(data.actor);setRequests(data.requests);
    }
   }catch(e){setError((e as Error).message);}finally{setLoading(false);}
 },[authLoading,user,demoMode,demoActor]);
 useEffect(()=>{void Promise.resolve().then(refresh);window.addEventListener("tasaheel:requests",refresh);window.addEventListener("focus",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("tasaheel:requests",refresh);window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh);};},[refresh]);
 return {actor,requests,loading:loading||authLoading,error,refresh,demoMode};
}


export function useRequestClock(){
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
 return now;
}
