/* JRNP Next preview — read-only daily rates and occupancy adapter.
   Public Supabase publishable key is intentionally browser-safe; no private API keys.
   skipSync=1 guarantees GET requests do not alter the bookings/calendar database.
   Unverified or failed requests produce no selectable dates. */
(()=>{
 "use strict";
 const ENDPOINT="https://gqoflldyswqdafrzgath.supabase.co/functions/v1/jrnp-public-booking";
 const PUBLISHABLE_KEY="sb_publishable_gI9fpvqe02fO65mC-uEv5A_56flUtgi";
 const TTL=120000;
 const cache=new Map();
 const datePattern=/^\d{4}-\d{2}-\d{2}$/;
 const allowed=new Set(["1","2","3","4","5"]);
 const inFlight=new Map();
 function normalDay(item){
  if(!item||typeof item!=="object"||!datePattern.test(String(item.date||"")))return null;
  const rate=Number(item.rate);
  if(!Number.isFinite(rate)||rate<=0)return {date:item.date,rate:null,available:false,verified:false};
  return {date:String(item.date),rate,available:item.available===true&&item.blocked!==true,verified:true};
 }
 async function fetchProperty(id,start,end){
  if(!allowed.has(id)||!datePattern.test(start)||!datePattern.test(end)||end<=start)throw Error("Invalid calendar parameters");
  const key=id+":"+start+":"+end;
  const cached=cache.get(key);
  if(cached&&Date.now()-cached.at<TTL)return cached.result;
  if(inFlight.has(key))return inFlight.get(key);
  const qs=new URLSearchParams({action:"calendar",propertyId:id,start,end,skipSync:"1"});
  const request=fetch(ENDPOINT+"?"+qs,{
   method:"GET",mode:"cors",cache:"no-store",
   headers:{apikey:PUBLISHABLE_KEY},
   signal:AbortSignal.timeout(12000)
  }).then(async r=>{
    if(!r.ok)throw Error("Availability service could not verify dates ("+r.status+")");
    const data=await r.json();
    if(String(data?.property?.id)!==id||!Array.isArray(data.days)||data.start!==start||data.end!==end)throw Error("Calendar response did not match requested property");
    const days=data.days.map(normalDay).filter(Boolean);
    if(!days.length)throw Error("No days returned for property");
    const result={
      id,name:String(data.property.name||"JRNP Home"),
      maxGuests:Math.max(1,Number(data.property.maxGuests||1)),
      minStay:Math.max(1,Number(data.property.minNights||data.property.minStay||1)),
      days,
      checkedAt:new Date().toISOString()
    };
    cache.set(key,{at:Date.now(),result});
    return result;
  }).finally(()=>inFlight.delete(key));
  inFlight.set(key,request);
  return request;
 }
 async function load(ids,start,end){
  const unique=[...new Set(ids.map(String))];
  if(unique.length<1||unique.length>5||unique.some(id=>!allowed.has(id)))throw Error("Invalid property list");
  const properties=await Promise.all(unique.map(id=>fetchProperty(id,start,end)));
  return {properties,checkedAt:new Date().toISOString(),readOnly:true};
 }
 window.JRNPReadOnlyCalendar=Object.freeze({load});
})();
