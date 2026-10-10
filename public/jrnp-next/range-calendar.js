'use strict';
/* JRNP Next date-range enhancement; existing quote handler is the pricing authority. */
(()=>{
 const form=document.getElementById('dates'),arrival=document.getElementById('checkin'),departure=document.getElementById('checkout');
 const api=window.JRNPQuoteContract;
 if(!form||!arrival||!departure||!api||typeof HTMLDialogElement==='undefined')return;
 const key=(new URLSearchParams(location.search).get('property')||document.body.dataset.property||'').toLowerCase();
 if(!['family','ensuite','pool','studio','lake'].includes(key))return;
 const pad=n=>String(n).padStart(2,'0');
 const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
 const parse=s=>new Date(Number(s.slice(0,4)),Number(s.slice(5,7))-1,Number(s.slice(8,10)),12);
 const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(parse(s).valueOf())&&iso(parse(s))===s;
 const today=()=>iso(new Date());
 const monthStart=d=>new Date(d.getFullYear(),d.getMonth(),1,12);
 const addMonth=(d,n)=>new Date(d.getFullYear(),d.getMonth()+n,1,12);
 const pretty=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'});
 const monthName=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'});
 const nights=(a,b)=>Math.round((Date.UTC(+b.slice(0,4),+b.slice(5,7)-1,+b.slice(8,10))-Date.UTC(+a.slice(0,4),+a.slice(5,7)-1,+a.slice(8,10)))/86400000);
 let start='',end='',month=monthStart(new Date()),result='idle',loading=false;
 const statuses=new Map();
 let feedTime=0,expiryTimer;
 const fresh=record=>record&&record.asOf<=Date.now()&&record.expiresAt>Date.now()&&iso(new Date(record.asOf))===today();
 const evidence=date=>{const record=statuses.get(date);return fresh(record)?record:null;};
 const trigger=document.createElement('button');
 trigger.type='button';trigger.id='range-calendar-trigger';trigger.className='jrnp-range-trigger';
 const element=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
 trigger.append(element('span','','Select check-in & check-out dates'),element('span','jrnp-range-trigger-icon','▦ ↗'));
 trigger.lastElementChild.setAttribute('aria-hidden','true');
 const note=document.createElement('p');note.className='jrnp-range-form-note';
 note.textContent='Open the larger date calendar. Prices and dates are not confirmed until a successful live quote.';
 form.prepend(note);form.prepend(trigger);
 const dialog=document.createElement('dialog');
 dialog.id='jrnp-range-calendar';dialog.className='jrnp-range-dialog';
 dialog.setAttribute('aria-labelledby','jrnp-range-title');
 const top=element('div','jrnp-range-top'),topCopy=element('div');
 topCopy.append(element('p','jrnp-range-eyebrow','JRNP RENTALS / CHOOSE YOUR STAY'));
 const title=element('h2','jrnp-range-title','Your dates, your getaway.');
 title.id='jrnp-range-title';
 topCopy.append(title,element('p','jrnp-range-subtitle','Pick your arrival and departure. The exact price appears only after we verify the selected stay.'));
 const closeButton=element('button','jrnp-range-close','×');
 closeButton.type='button';closeButton.setAttribute('aria-label','Close date calendar');
 top.append(topCopy,closeButton);
 const bar=element('div','jrnp-range-bar'),nav=element('div','jrnp-range-month-nav');
 for(const [direction,label,symbol] of [[-1,'Previous month','‹'],[1,'Next month','›']]){
  const button=element('button','jrnp-range-nav',symbol);
  button.type='button';button.dataset.nav=String(direction);button.setAttribute('aria-label',label);nav.append(button);
 }
 bar.append(nav,element('span','jrnp-range-hint','Select check-in → check-out'));
 const monthsHolder=element('div','jrnp-range-months');
 monthsHolder.setAttribute('aria-label','Two-month date range calendar');
 const legend=element('div','jrnp-range-legend');
 legend.setAttribute('aria-label','Availability legend');
 for(const [color,label] of [['green','Verified available'],['red','Verified unavailable'],['','Not yet checked']]){
  const span=element('span'),icon=element('i',color);
  icon.setAttribute('aria-hidden','true');span.append(icon,document.createTextNode(label));legend.append(span);
 }
 const lower=element('div','jrnp-range-summary'),details=element('div');
 const chosen=element('p','jrnp-range-selection','Choose an arrival date');
 const status=element('p','jrnp-range-feedback','Select a range to check pricing.');
 chosen.setAttribute('aria-live','polite');status.setAttribute('aria-live','polite');
 const breakdown=element('dl','jrnp-range-quote-lines');breakdown.hidden=true;
 details.append(chosen,status,breakdown);
 const actions=element('div','jrnp-range-actions');
 const quoteButton=element('button','jrnp-range-check','Check dates & price ↗');
 quoteButton.type='button';quoteButton.disabled=true;
 const doneButton=element('button','jrnp-range-done','Close');doneButton.type='button';
 actions.append(quoteButton,doneButton);lower.append(details,actions);
 dialog.append(top,bar,monthsHolder,legend,lower,
  element('p','jrnp-range-fineprint','Unverified dates are unknown, not confirmed vacancies. A price check does not reserve the home.'));
 document.body.append(dialog);
 const months=dialog.querySelector('.jrnp-range-months');
 const summary=dialog.querySelector('.jrnp-range-selection');
 const feedback=dialog.querySelector('.jrnp-range-feedback');
 const lines=dialog.querySelector('.jrnp-range-quote-lines');
 const action=dialog.querySelector('.jrnp-range-check');
 const previous=dialog.querySelector('[data-nav="-1"]');
 const clear=()=>{lines.hidden=true;lines.replaceChildren();};
 const message=(txt,error=false)=>{feedback.textContent=txt;feedback.classList.toggle('is-error',error);};
 const inRange=(d,a,b)=>!!a&&!!b&&d>=a&&d<=b;
 const blocked=(a,b)=>[...statuses].some(([d,s])=>fresh(s)&&s.status==='unavailable'&&d>=a&&d<b);
 function render(){
  months.replaceChildren();
  previous.disabled=month.getTime()<=monthStart(new Date()).getTime();
  for(let m=0;m<2;m++){
   const first=addMonth(month,m),section=document.createElement('section');
   section.className='jrnp-range-month';section.setAttribute('aria-label',monthName.format(first));
   const h=document.createElement('h3');h.textContent=monthName.format(first);section.append(h);
   const weekdays=document.createElement('div');weekdays.className='jrnp-range-weekdays';
   for(const day of ['Su','Mo','Tu','We','Th','Fr','Sa']){const label=document.createElement('span');label.textContent=day;weekdays.append(label);}
   section.append(weekdays);
   const days=document.createElement('div');days.className='jrnp-range-days';
   for(let gap=0;gap<first.getDay();gap++){const blank=document.createElement('span');blank.className='jrnp-range-day is-blank';blank.setAttribute('aria-hidden','true');days.append(blank);}
   const count=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
   for(let n=1;n<=count;n++){
    const d=new Date(first.getFullYear(),first.getMonth(),n,12),date=iso(d),record=evidence(date),status=record?.status,past=date<today();
    const b=document.createElement('button');b.type='button';b.dataset.date=date;b.className='jrnp-range-day';b.textContent=String(n);
    if(!past&&status==='available'&&Number.isFinite(record.nightlyPrice)){
     b.classList.add('has-nightly-price');
     b.append(element('small','jrnp-range-nightly-price',api.money(record.nightlyPrice)));
    }
    if(past)b.classList.add('is-past');
    else if(status==='available')b.classList.add('is-known-available');
    else if(status==='unavailable')b.classList.add('is-known-unavailable');
    if(status!=='unavailable'&&inRange(date,start,end)){
     b.classList.add('is-range');
     if(result==='verified')b.classList.add('is-range-verified');
     if(result==='unavailable')b.classList.add('is-range-error');
    }
    if(status!=='unavailable'&&(date===start||date===end))b.classList.add('is-endpoint');
    const state=past?'past':status==='available'?'verified available':status==='unavailable'?'verified unavailable':'not yet checked';
    b.setAttribute('aria-label',pretty.format(d)+', '+state+(b.classList.contains('has-nightly-price')?', '+api.money(record.nightlyPrice)+' per night':''));
    b.setAttribute('aria-pressed',inRange(date,start,end)||date===start?'true':'false');
    if(past||status==='unavailable')b.disabled=true;else b.addEventListener('click',()=>choose(date));
    days.append(b);
   }
   section.append(days);months.append(section);
  }
  summary.textContent=!start?'Select your arrival date':!end?pretty.format(parse(start))+' · Select checkout':pretty.format(parse(start))+' – '+pretty.format(parse(end))+' · '+nights(start,end)+' nights';
  action.disabled=!start||!end||loading||result==='verified';
  action.textContent=loading?'Checking rates…':result==='verified'?'Dates verified ✓':'Check dates & price ↗';
 }
 function choose(date){
  if(!start||end||date<=start){start=date;end='';message('Choose a later checkout date.');}
  else if(blocked(start,date)){start=date;end='';message('That stay includes a confirmed blocked night. Choose another departure.',true);}
  else{end=date;message('Dates selected. Check the rate for a verified total.');}
  result='idle';loading=false;clear();render();
 }
 function addPrice(label,value,total=false){
  const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=api.money(value);
  if(total){dt.className='jrnp-range-total';dd.className='jrnp-range-total';}
  lines.append(dt,dd);
 }
 function showPrice(q){
  clear();addPrice('Nightly subtotal',q.subtotal);addPrice('Cleaning',q.cleaningFee);addPrice('Taxes',q.taxes);
  addPrice('Estimated total',q.total,true);addPrice('Initial deposit if requested',q.depositDue);addPrice('Remaining balance',q.balanceDue);lines.hidden=false;
 }
 function open(){
  start=valid(arrival.value)?arrival.value:'';
  end=valid(departure.value)&&departure.value>start?departure.value:'';
  month=monthStart(start?parse(start):new Date());
  result='idle';loading=false;clear();
  message(end?'Dates selected. Verify current pricing and availability.':'Neutral dates have not been checked against live availability.');
  render();if(!dialog.open)dialog.showModal();
  dialog.querySelector('.jrnp-range-close').focus({preventScroll:true});
 }
 trigger.addEventListener('click',open);
 for(const input of [arrival,departure])input.addEventListener('click',event=>{event.preventDefault();if(!dialog.open)open();});
 for(const jump of document.querySelectorAll('.detail-hero-book[href="#dates"]')){
  jump.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();open();},true);
 }
 dialog.querySelector('.jrnp-range-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.jrnp-range-done').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 for(const nav of dialog.querySelectorAll('.jrnp-range-nav'))nav.addEventListener('click',()=>{month=addMonth(month,Number(nav.dataset.nav));render();});
 action.addEventListener('click',()=>{
  if(!start||!end||loading||result==='verified')return;
  if(blocked(start,end)){message('A verified unavailable night is within this range. Choose other dates.',true);return;}
  arrival.value=start;arrival.dispatchEvent(new Event('change',{bubbles:true}));
  departure.value=end;departure.dispatchEvent(new Event('change',{bubbles:true}));
  loading=true;result='loading';message('Checking live availability and the exact stay price…');clear();render();
  form.requestSubmit(form.querySelector('button[type="submit"]'));
 });
 document.addEventListener('jrnp:quote-state',event=>{
  if(!dialog.open)return;
  const info=event.detail||{},req=info.request||{};
  if(req.checkIn!==start||req.checkOut!==end)return;
  if(info.state==='loading'){loading=true;result='loading';message('Verifying the selected stay…');}
  else if(info.state==='verified'&&info.verified&&!blocked(start,end)){
   loading=false;result='verified';showPrice(info.verified);
   message('Verified for this selected stay. A quote does not reserve the home.');
   // A stay quote is not a reconciled per-day calendar feed; never overwrite blocked nights.
  }else if(info.state==='unavailable'||(info.state==='verified'&&blocked(start,end))){
   loading=false;result='unavailable';clear();
   message('This stay is unavailable. The exact blocked night has not been identified. Choose another range.',true);
  }else if(info.state==='invalid'||info.state==='unknown'){
   loading=false;result='idle';clear();
   message('Availability or pricing was not verified. No nights are confirmed available.',true);
  }
  render();
 });
 /* Only a trusted adapter may emit this event; the source string alone is not authentication.
    Full property snapshots are reconciled, current-day, monotonic and expire within 24 hours. */
 document.addEventListener('jrnp:availability-dates',event=>{
  const data=event.detail||{},time=Date.parse(data.asOf||''),now=Date.now();
  if(data.propertyKey!==key||data.source!=='verified-provider-calendar')return;
  if(!Number.isFinite(time)||time>now||time<feedTime)return;
  feedTime=time;
  statuses.clear();clearTimeout(expiryTimer);
  const until=data.expiresAt===undefined?time+86400000:Date.parse(data.expiresAt);
  const expiresAt=Math.min(until,time+86400000,new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+1).getTime());
  if(data.reconciled===true&&iso(new Date(time))===today()&&Number.isFinite(expiresAt)&&expiresAt>now&&Array.isArray(data.days)){
   const duplicates=new Set(),seen=new Set();
   for(const day of data.days){
    if(!day||!valid(day.date))continue;
    if(seen.has(day.date)){duplicates.add(day.date);statuses.delete(day.date);continue;}
    seen.add(day.date);
    if(!['available','unavailable'].includes(day.status)||day.reconciled===false)continue;
    const record={status:day.status,asOf:time,expiresAt};
    if(day.status==='available'&&data.currency==='USD'&&typeof day.nightlyPrice==='number'&&Number.isFinite(day.nightlyPrice)&&day.nightlyPrice>0)record.nightlyPrice=day.nightlyPrice;
    statuses.set(day.date,record);
   }
   for(const date of duplicates)statuses.delete(date);
   expiryTimer=setTimeout(()=>{statuses.clear();if(dialog.open)render();},expiresAt-now);
  }
  if(start&&end&&blocked(start,end)){
   result='unavailable';loading=false;clear();
   message('A verified unavailable night is within this range. Choose other dates.',true);
  }
  if(dialog.open)render();
 });
})();
