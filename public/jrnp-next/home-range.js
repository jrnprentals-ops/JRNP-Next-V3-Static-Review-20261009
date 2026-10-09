/* JRNP Next review-only homepage range calendar.
   Read-only sanitized snapshot. Never treats this as a reservation/quote.
   Production integration must replace the snapshot with a verified read-only API. */
(()=>{"use strict";
const form=document.getElementById("stay-search");
const host=document.querySelector(".stay-finder");
const toggle=document.getElementById("home-range-toggle");
const panel=document.getElementById("home-range-panel");
const checkin=document.getElementById("stay-in");
const checkout=document.getElementById("stay-out");
const destination=document.getElementById("stay-destination");
const guests=document.getElementById("stay-guests");
const hint=document.getElementById("finder-hint");
if(!form||!host||!toggle||!panel||!checkin||!checkout||!destination||!guests)return;
const map={family:"1",ensuite:"2",pool:"5",studio:"4",lake:"3"};
const week=["Su","Mo","Tu","We","Th","Fr","Sa"];
const today=new Date();today.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const parse=s=>/^\d{4}-\d\d-\d\d$/.test(s||"")?new Date(Number(s.slice(0,4)),Number(s.slice(5,7))-1,Number(s.slice(8,10))):null;
const plus=(date,n)=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+n);
const dollars=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n));
let month=new Date(today.getFullYear(),today.getMonth(),1);
let start=null,end=null,loaded=null,lastMessage="";
const view={};
panel.innerHTML='<div class="hrc-head"><button type="button" class="hrc-nav" data-direction="-1" aria-label="Previous month">‹</button><strong data-month></strong><button type="button" class="hrc-nav" data-direction="1" aria-label="Next month">›</button></div><div class="hrc-week" aria-hidden="true">'+week.map(x=>"<span>"+x+"</span>").join("")+'</div><div class="hrc-grid" role="group" aria-label="Available dates" data-days></div><div class="hrc-legend"><span><i class="hrc-available"></i>Available</span><span><i class="hrc-blocked"></i>Booked</span><span><i class="hrc-selected"></i>Your dates</span><span><i class="hrc-unknown"></i>Not verified</span></div><p class="hrc-status" aria-live="polite" data-message></p>';
view.label=panel.querySelector("[data-month]");
view.grid=panel.querySelector("[data-days]");
view.msg=panel.querySelector("[data-message]");
host.classList.add("has-home-range");
form.dataset.availabilityMode="snapshot";
function propertyList(){
 if(!loaded)return[];
 const allowed=destination.value==="lake"?["3"]:destination.value==="phoenix"?["1","2","4","5"]:["1","2","3","4","5"];
 const count=Number(guests.value)||1;
 return loaded.properties.filter(p=>allowed.includes(p.id)&&p.maxGuests>=count);
}
function dayInfo(date){
 const key=iso(date),list=propertyList();
 if(!loaded||!list.length)return {state:"unknown"};
 const values=list.map(p=>p.lookup.get(key));
 const live=values.filter(d=>d&&d.available===true&&Number.isFinite(Number(d.rate)));
 if(live.length)return {state:"available",rate:Math.min(...live.map(d=>Number(d.rate))),all:list.length===1};
 if(values.every(Boolean))return {state:"blocked"};
 return {state:"unknown"};
}
function validRange(a,b){
 const nights=Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
 if(nights<1||nights>60||!loaded)return[];
 return propertyList().filter(p=>nights>=Number(p.minStay||1)&&Array.from({length:nights},(_,n)=>p.lookup.get(iso(plus(a,n)))).every(x=>x?.available===true));
}
function message(text){lastMessage=text;view.msg.textContent=text;}
function field(input,date){const value=date?iso(date):"";if(input.value!==value){input.value=value;input.dispatchEvent(new Event("change",{bubbles:true}));}}
function updateSelection(){
 field(checkin,start);field(checkout,end);
 toggle.textContent=start?(end?iso(start)+" → "+iso(end):iso(start)+" → Select checkout"):"Select check-in → checkout";
 toggle.setAttribute("aria-label",end?"Stay: "+iso(start)+" through "+iso(end):"Select check-in and check-out dates");
}
function setInfoText(){
 if(!loaded)return "No verified calendar data. Dates cannot be selected.";
 if(start&&end)return iso(start)+" to "+iso(end)+" · "+validRange(start,end).length+" matching home(s). Read-only preview; host confirmation required.";
 if(start)return "Check-in "+iso(start)+". Choose a checkout date with no blocked nights.";
 return "Select your check-in date, then your checkout date. Pricing is a dated preview snapshot, not a confirmed quote.";
}
function render(){
 view.label.textContent=month.toLocaleString("en-US",{month:"long",year:"numeric"});
 const previous=panel.querySelector('[data-direction="-1"]');
 const next=panel.querySelector('[data-direction="1"]');
 previous.disabled=month<=new Date(today.getFullYear(),today.getMonth(),1);
 next.disabled=month>=new Date(today.getFullYear(),today.getMonth()+2,1);
 view.grid.replaceChildren();
 const startWeek=new Date(month.getFullYear(),month.getMonth(),1).getDay();
 for(let i=0;i<startWeek;i++){const blank=document.createElement("span");blank.className="hrc-blank";view.grid.appendChild(blank);}
 const total=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 for(let d=1;d<=total;d++){
  const date=new Date(month.getFullYear(),month.getMonth(),d),key=iso(date),info=dayInfo(date);
  const btn=document.createElement("button");btn.type="button";btn.className="hrc-day "+("hrc-"+info.state);btn.dataset.date=key;
  const num=document.createElement("span");num.className="hrc-day-num";num.textContent=String(d);btn.appendChild(num);
  const rate=document.createElement("small");rate.className="hrc-price";
  rate.textContent=date<today?"":info.state==="available"?(info.all?"":"From ")+dollars(info.rate):info.state==="blocked"?"Booked":"—";btn.appendChild(rate);
  if(date<today){btn.classList.add("hrc-past");btn.disabled=true;}
  else if(info.state!=="available"){btn.disabled=true;}
  if(start&&iso(start)===key)btn.classList.add("hrc-start");
  if(end&&iso(end)===key)btn.classList.add("hrc-end");
  if(start&&end&&date>start&&date<end)btn.classList.add("hrc-between");
  const readable=date.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  btn.setAttribute("aria-label",readable+" — "+(info.state==="available"?dollars(info.rate)+" nightly estimate":info.state==="blocked"?"unavailable":"unverified"));
  btn.setAttribute("aria-pressed",String(!!(start&&iso(start)===key||end&&iso(end)===key)));
  view.grid.appendChild(btn);
 }
 if(!lastMessage)message(setInfoText());
}
function choose(date){
 if(dayInfo(date).state!=="available")return;
 lastMessage="";
 if(!start||end||date<=start){start=date;end=null;}
 else{
  const matches=validRange(start,date);
  if(matches.length)end=date;
  else{message("No single matching home has every night open in that range. Choose another checkout date.");render();return;}
 }
 updateSelection();render();message(setInfoText());
}
function result(){
 const list=propertyList();
 let yes=0;
 for(const card of document.querySelectorAll(".property-card")){
  const p=loaded?.properties.find(x=>x.id===map[card.dataset.property]);
  const old=card.querySelector(".finder-result");old?.remove();
  if(!p||!start||!end)continue;
  const count=Number(guests.value),matching=list.some(x=>x.id===p.id);
  const row=document.createElement("p");row.className="finder-result";
  if(!matching)row.textContent="Not suitable for selected guests or destination";
  else if(validRange(start,end).some(x=>x.id===p.id)){
   yes++;const nights=Math.round((Date.UTC(end.getFullYear(),end.getMonth(),end.getDate())-Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()))/86400000);
   const rates=Array.from({length:nights},(_,n)=>Number(p.lookup.get(iso(plus(start,n)))?.rate||0));
   row.textContent="Open in snapshot · "+dollars(rates.reduce((a,b)=>a+b,0))+" nightly-rate subtotal (excludes fees/taxes)";
   const link=new URL(card.href,location.href);link.searchParams.set("checkIn",iso(start));link.searchParams.set("checkOut",iso(end));link.searchParams.set("guests",String(count));card.href=link.pathname+link.search;
  }else row.textContent="Unavailable or below minimum stay for these dates";
  card.querySelector(".property-meta > div")?.appendChild(row);
 }
 hint.textContent=yes+" possible home(s) in the dated preview. Availability and pricing require host verification; no reservation has been made.";
}
panel.addEventListener("click",e=>{
 const nav=e.target.closest("[data-direction]");
 if(nav){month=new Date(month.getFullYear(),month.getMonth()+Number(nav.dataset.direction),1);lastMessage="";render();return;}
 const day=e.target.closest("[data-date]");
 if(day&&!day.disabled)choose(parse(day.dataset.date));
});
toggle.addEventListener("click",()=>{panel.hidden=!panel.hidden;toggle.setAttribute("aria-expanded",String(!panel.hidden));if(!panel.hidden){lastMessage="";render();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){panel.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus();}});
for(const fieldEl of [destination,guests])fieldEl.addEventListener("change",()=>{start=null;end=null;lastMessage="";updateSelection();render();});
form.addEventListener("submit",event=>{event.preventDefault();event.stopImmediatePropagation();if(!loaded||!start||!end){hint.textContent="Select a valid, available date range first.";return;}result();},{capture:true});
render();
fetch("/jrnp-next/data/availability-preview.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Calendar data unavailable");return r.json()}).then(data=>{
 if(data.previewOnly!==true||!Array.isArray(data.properties)||Date.now()>Date.parse(data.expiresAt))throw Error("Calendar snapshot is missing or has expired");
 loaded={...data,properties:data.properties.map(p=>({...p,id:String(p.id),lookup:new Map((p.days||[]).map(d=>[d.date,d]))}))};
 lastMessage="";render();
}).catch(()=>{loaded=null;message("Availability data has expired or cannot be verified. Date selection is disabled until the calendar feed is restored.");render();});
})();