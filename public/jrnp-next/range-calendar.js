/* JRNP Next property calendar — read-only availability preview.
 * Blocks unavailable and unverified nights; never creates a reservation.
 * Production must substitute a reviewed read-only live availability adapter. */
(function(){"use strict";
var root=document.getElementById("range-calendar"),checkin=document.getElementById("checkin"),checkout=document.getElementById("checkout");
if(!root||!checkin||!checkout)return;
var propertyMap={family:"1",ensuite:"2",pool:"5",studio:"4",lake:"3"};
var propertyId=propertyMap[document.body.dataset.property];
var weekday=["Su","Mo","Tu","We","Th","Fr","Sa"];
var today=startOfDay(new Date());
var maxMonth=new Date(today.getFullYear(),today.getMonth()+18,1);
var cursor=new Date(today.getFullYear(),today.getMonth(),1);
var start=null,end=null,writing=false,inventory=null,minimumNights=1,loadState="loading",lastError="";
root.innerHTML=[
'<div class="range-calendar-head"><button type="button" class="range-calendar-nav" data-dir="-1" aria-label="Previous month">‹</button><p class="range-calendar-label" data-label></p><button type="button" class="range-calendar-nav" data-dir="1" aria-label="Next month">›</button></div>',
'<div class="range-calendar-week" aria-hidden="true">'+weekday.map(function(day){return "<span>"+day+"</span>";}).join("")+'</div>',
'<div class="range-calendar-grid" role="grid" data-grid></div>',
'<div class="range-calendar-legend"><span>🟢 Available</span><span class="range-legend-blocked">Booked</span><span class="range-legend-unknown">Unverified</span></div>',
'<p class="range-calendar-status" data-status aria-live="polite"></p>'
].join("");
var label=root.querySelector("[data-label]"),grid=root.querySelector("[data-grid]"),status=root.querySelector("[data-status]");
root.addEventListener("click",function(event){
 var nav=event.target.closest("[data-dir]");
 if(nav){moveMonth(Number(nav.dataset.dir));return;}
 var day=event.target.closest("[data-date]");
 if(day&&!day.disabled)choose(parseISO(day.dataset.date));
});
root.addEventListener("keydown",function(event){
 var day=event.target.closest("[data-date]");if(!day)return;
 var current=parseISO(day.dataset.date),next=null;
 if(event.key==="ArrowRight")next=addDays(current,1);
 if(event.key==="ArrowLeft")next=addDays(current,-1);
 if(event.key==="ArrowDown")next=addDays(current,7);
 if(event.key==="ArrowUp")next=addDays(current,-7);
 if(event.key==="Enter"||event.key===" "){event.preventDefault();if(!day.disabled)choose(current);return;}
 if(!next)return;
 event.preventDefault();
 if(next<today||next>=addMonths(maxMonth,1))return;
 cursor=new Date(next.getFullYear(),next.getMonth(),1);
 draw();
 var target=grid.querySelector('[data-date="'+iso(next)+'"]');
 if(target&&!target.disabled)target.focus();
});
checkin.addEventListener("change",syncFromFields);
checkout.addEventListener("change",syncFromFields);
syncFromFields();
document.addEventListener("DOMContentLoaded",syncFromFields,{once:true});
fetch("/jrnp-next/data/availability-preview.json",{cache:"no-store"}).then(function(response){
 if(!response.ok)throw Error("Availability data could not be loaded");
 return response.json();
}).then(function(data){
 if(!data||data.previewOnly!==true||!Array.isArray(data.properties)||Date.now()>Date.parse(data.expiresAt))throw Error("Availability snapshot has expired");
 var property=data.properties.find(function(item){return String(item.id)===propertyId;});
 if(!property||!Array.isArray(property.days))throw Error("No verified data for this property");
 inventory=new Map(property.days.map(function(day){return [day.date,day];}));
 minimumNights=Math.max(1,Number(property.minStay||1));
 var finalDate=parseISO(property.days[property.days.length-1]?.date);
 if(finalDate)maxMonth=new Date(finalDate.getFullYear(),finalDate.getMonth(),1);
 loadState="ready";
 validateInputs();
 draw();
}).catch(function(error){
 loadState="unavailable";lastError=error.message||"Availability could not be verified";
 inventory=null;clearFields();draw();
});
function isOpen(date){return inventory?.get(iso(date))?.available===true;}
function nightsBetween(a,b){return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);}
function isRangeOpen(a,b){
 if(!a||!b||!inventory)return false;
 var nights=nightsBetween(a,b);if(nights<minimumNights||nights>60)return false;
 for(var i=0;i<nights;i++)if(!isOpen(addDays(a,i)))return false;
 return true;
}
function choose(date){
 if(!isOpen(date))return;
 if(!start||end||date<=start){start=date;end=null;}
 else if(isRangeOpen(start,date))end=date;
 else{status.textContent="This range crosses unavailable dates or does not meet the minimum "+minimumNights+"-night stay. Choose another checkout date.";return;}
 writeFields();draw();
}
function clearFields(){
 start=null;end=null;writing=true;setValue(checkin,null);setValue(checkout,null);writing=false;
}
function validateInputs(){
 if(!inventory)return;
 if(start&&!isOpen(start)){clearFields();return;}
 if(end&&!isRangeOpen(start,end)){end=null;writing=true;setValue(checkout,null);writing=false;}
}
function syncFromFields(){
 if(writing)return;
 start=parseISO(checkin.value);end=parseISO(checkout.value);
 if(start&&end&&end<=start)end=null;
 if(inventory)validateInputs();
 if(start)cursor=new Date(start.getFullYear(),start.getMonth(),1);
 draw();
}
function writeFields(){
 writing=true;setValue(checkin,start);setValue(checkout,end);writing=false;
}
function setValue(input,date){
 var value=date?iso(date):"";
 if(input.value===value)return;
 input.value=value;input.dispatchEvent(new Event("change",{bubbles:true}));
}
function moveMonth(offset){
 var next=new Date(cursor.getFullYear(),cursor.getMonth()+offset,1);
 if(next<new Date(today.getFullYear(),today.getMonth(),1)||next>maxMonth)return;
 cursor=next;draw();
}
function draw(){
 label.textContent=cursor.toLocaleString("en-US",{month:"long",year:"numeric"});
 root.querySelector('[data-dir="-1"]').disabled=cursor<=new Date(today.getFullYear(),today.getMonth(),1);
 root.querySelector('[data-dir="1"]').disabled=cursor>=maxMonth;
 grid.replaceChildren();
 var monthStart=new Date(cursor.getFullYear(),cursor.getMonth(),1),lead=monthStart.getDay();
 var count=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
 for(var i=0;i<lead;i++){var blank=document.createElement("span");blank.className="range-calendar-empty";blank.setAttribute("aria-hidden","true");grid.appendChild(blank);}
 for(var d=1;d<=count;d++)grid.appendChild(dayButton(new Date(cursor.getFullYear(),cursor.getMonth(),d)));
 status.textContent=summary();
}
function dayButton(date){
 var button=document.createElement("button");button.type="button";button.className="range-calendar-day";
 var key=iso(date),day=inventory?.get(key),open=day?.available===true;
 var state=!inventory||!day?"unknown":open?"available":"blocked";
 button.dataset.date=key;button.setAttribute("role","gridcell");
 var number=document.createElement("span");number.className="range-date-num";number.textContent=String(date.getDate());button.appendChild(number);
 var price=document.createElement("small");price.className="range-date-price";
 price.textContent=date<today?"":open?formatRate(Number(day.rate||0)):state==="blocked"?"Booked":"—";button.appendChild(price);
 button.classList.add("is-"+state);
 if(date<today||state!=="available")button.disabled=true;
 if(same(date,today))button.classList.add("is-today");
 if(inventory&&same(date,start))button.classList.add("is-start");
 if(inventory&&same(date,end))button.classList.add("is-end");
 if(start&&end&&date>start&&date<end&&isOpen(date))button.classList.add("is-between");
 button.setAttribute("aria-label",date.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})+" — "+(open?"nightly estimate "+formatRate(Number(day.rate||0)):state==="blocked"?"unavailable":"availability unverified"));
 button.setAttribute("aria-pressed",String(!!(start&&same(date,start)||end&&same(date,end))));
 return button;
}
function summary(){
 if(loadState==="loading")return "Checking preview availability. Dates stay disabled until results are verified.";
 if(loadState!=="ready")return lastError+" — no dates can be selected.";
 if(start&&end)return "Arrival "+spoken(start)+", departure "+spoken(end)+". Rates shown are a dated preview; host confirmation required.";
 if(start)return "Arrival "+spoken(start)+". Choose checkout; blocked nights cannot be selected. Minimum "+minimumNights+" nights.";
 return "Green = available in the dated preview; red = unavailable. Nightly estimates exclude fees and taxes. No reservation is being made.";
}
function formatRate(amount){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:2}).format(amount);}
function spoken(date){return date.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});}
function startOfDay(date){return new Date(date.getFullYear(),date.getMonth(),date.getDate());}
function addDays(date,n){return new Date(date.getFullYear(),date.getMonth(),date.getDate()+n);}
function addMonths(date,n){return new Date(date.getFullYear(),date.getMonth()+n,1);}
function parseISO(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||""))return null;return new Date(Number(value.slice(0,4)),Number(value.slice(5,7))-1,Number(value.slice(8,10)));}
function iso(date){return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");}
function same(a,b){return Boolean(a&&b&&iso(a)===iso(b));}
})();