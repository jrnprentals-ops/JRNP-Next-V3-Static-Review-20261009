'use strict';
/* New-design homepage finder: read-only quote results, never a reservation. */
(()=>{
  const form=document.getElementById('stay-search');
  const api=window.JRNPQuoteContract;
  if(!form||!api)return;
  const arrival=document.getElementById('stay-in'),departure=document.getElementById('stay-out');
  const guests=document.getElementById('stay-guests'),hint=document.getElementById('finder-hint');
  const destination=document.getElementById('stay-destination');
  const button=form.querySelector('button[type="submit"]');
  let sequence=0,controller=null;
  const cards=()=>Array.from(document.querySelectorAll('a.property-card'));
  const propertyKey=card=>card.dataset.property;
  function filterDestination(){
    for(const card of cards()){
      const key=propertyKey(card);
      card.hidden=destination.value==='lake'?key!=='lake':destination.value==='phoenix'?key==='lake':false;
    }
    const count=cards().filter(card=>!card.hidden).length;
    hint.textContent=destination.value==='all'
      ?'Browse matching properties. Dates will be checked against live availability before booking.'
      :'Showing '+count+' '+(count===1?'home':'homes')+' in '+(destination.value==='lake'?'Weiss Lake':'Phoenix')+'. Choose dates to check availability.';
  }
  function clear(){
    sequence++;
    if(controller)controller.abort();
    for(const card of cards()){
      card.querySelector('.finder-result')?.remove();
      const link=new URL(card.href,location.href);
      for(const field of ['checkIn','checkOut','guests'])link.searchParams.delete(field);
      card.href=link.pathname+link.search;
    }
    button.disabled=false;button.removeAttribute('aria-busy');button.textContent='Find my stay ↗';
  }
  for(const el of [arrival,departure,guests])el.addEventListener('change',()=>{clear();filterDestination()});
  destination.addEventListener('change',()=>{clear();filterDestination()});
  filterDestination();
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const count=Number(guests.value);
    if(!arrival.value||!departure.value||departure.value<=arrival.value||!Number.isInteger(count)||count<1||count>8){
      hint.textContent='Enter valid stay dates and a guest count between 1 and 8.';
      return;
    }
    clear();
    const current=++sequence;
    controller=new AbortController();
    const matching=cards().filter(card=>!card.hidden);
    if(!matching.length)return;
    hint.textContent='Checking live availability for '+matching.length+' matching '+(matching.length===1?'home':'homes')+'…';
    button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Checking live dates…';
    let available=0,unavailable=0,unknown=0,ineligible=0;
    await Promise.all(matching.map(async card=>{
      const key=propertyKey(card);
      const text=document.createElement('p');
      text.className='finder-result';text.setAttribute('aria-live','polite');
      text.textContent='Checking these dates…';
      card.querySelector('.property-meta > div').appendChild(text);
      const maxGuests=api.maxGuestsFor(key);
      if(maxGuests!==null&&count>maxGuests){
        ineligible++;
        text.textContent='Up to '+maxGuests+' guests — this home is not a match';
        return;
      }
      const link=new URL(card.href,location.href);
      link.searchParams.set('checkIn',arrival.value);
      link.searchParams.set('checkOut',departure.value);
      link.searchParams.set('guests',String(count));
      card.href=link.pathname+link.search;
      try{
        const request=api.buildRequest({propertyKey:key,checkIn:arrival.value,checkOut:departure.value,guests:count});
        const response=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:controller.signal});
        const data=await response.json().catch(()=>({}));
        if(current!==sequence)return;
        if(response.status===409){unavailable++;text.textContent='Unavailable for those dates';return}
        if(!response.ok)throw Error('Availability could not be confirmed');
        const quote=api.parseQuote(data,request);
        available++;
        text.textContent='Available · '+api.money(quote.total)+' estimated total';
      }catch(err){
        if(current!==sequence)return;
        unknown++;
        text.textContent='Availability not confirmed — view home for details';
      }
    }));
    if(current!==sequence)return;
    const summary=[available+' available',unavailable+' unavailable'];
    if(ineligible)summary.push(ineligible+' not suitable for '+count+' guests');
    summary.push(unknown+' unconfirmed');
    hint.textContent=summary.join(' · ')+'. Rates are estimates only; no reservation has been made.';
    button.disabled=false;button.removeAttribute('aria-busy');button.textContent='Find my stay ↗';
  });
})();
