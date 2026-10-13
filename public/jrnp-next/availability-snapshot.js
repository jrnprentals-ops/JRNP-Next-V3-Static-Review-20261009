'use strict';
/* Read-only calendar adapter. Only confirmed blocked dates are published; all other dates stay unknown until quoted. */
(()=>{
 const ids={family:'1',ensuite:'2',lake:'3',studio:'4',pool:'5'};
 const propertyKey=String(document.body?.dataset?.property||'').toLowerCase();
 const propertyId=ids[propertyKey];
 if(!propertyId)return;
 const pad=value=>String(value).padStart(2,'0');
 const iso=date=>date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());
 const start=new Date(),end=new Date(start);end.setDate(end.getDate()+540);
 const url='/api/properties/'+encodeURIComponent(propertyId)+'/calendar?start='+iso(start)+'&end='+iso(end)+'&skipSync=1';
 fetch(url,{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(15000)})
  .then(response=>response.ok?response.json():null)
  .then(data=>{
   if(!data||String(data.property?.id||'')!==propertyId||!Array.isArray(data.days))return;
   const seen=new Set(),days=[];
   for(const day of data.days){
    const date=String(day?.date||'');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||seen.has(date))return;
    seen.add(date);
    if(day.blocked===true||day.available===false)days.push({date,status:'unavailable',reconciled:true});
   }
   const asOf=new Date(),expiresAt=new Date(asOf.getTime()+10*60*1000);
   document.dispatchEvent(new CustomEvent('jrnp:availability-dates',{detail:{
    propertyKey,source:'verified-provider-calendar',asOf:asOf.toISOString(),expiresAt:expiresAt.toISOString(),
    reconciled:true,availabilityComplete:false,days
   }}));
  })
  .catch(()=>{/* Fail closed: dates remain unknown and the quote endpoint remains authoritative. */});
})();
