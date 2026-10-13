'use strict';
(()=>{
  const api=window.JRNPQuoteContract;
  const form=document.getElementById('dates');
  const panel=document.getElementById('quote-result');
  const requestPanel=document.getElementById('request-panel');
  const requestForm=document.getElementById('request-form');
  if(!api||!form||!panel||!requestPanel||!requestForm)return;
  const button=form.querySelector('button[type="submit"]');
  const title=document.getElementById('quote-title'),message=document.getElementById('quote-message'),lines=document.getElementById('quote-lines');
  const requestError=document.getElementById('request-error');
  const requestSuccess=document.getElementById('request-success');
  const requestButton=document.getElementById('request-submit');
  let current=0,confirmedRequest=null,idempotencyKey=null,requestPending=false,requestSaved=false;
  function render(heading,detail,values=[]){
    panel.hidden=false;title.textContent=heading;message.textContent=detail;lines.replaceChildren();
    for(const [label,value] of values){
      const dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=label;dd.textContent=value;lines.append(dt,dd);
    }
  }
  function secureRequestKey(){
    if(!window.crypto||typeof window.crypto.getRandomValues!=='function')throw new Error('Secure request IDs are not available in this browser.');
    const bytes=new Uint8Array(20);window.crypto.getRandomValues(bytes);
    return 'jrnp_'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  }
  function resetRequest(){
    confirmedRequest=null;idempotencyKey=null;requestPending=false;requestSaved=false;
    requestPanel.hidden=true;requestError.hidden=true;requestSuccess.hidden=true;
    requestButton.disabled=false;requestButton.removeAttribute('aria-busy');requestButton.textContent='Send booking request ↗';
  }
  function emitQuoteState(state,request,verified){
    document.dispatchEvent(new CustomEvent('jrnp:quote-state',{detail:{state,request,verified}}));
  }
  async function quote(details){
    const sequence=++current;let request;
    resetRequest();
    try{request=api.buildRequest(details)}
    catch(err){render('Please update your dates',err.message);return}
    emitQuoteState('loading',request);
    button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Checking dates…';
    render('Checking your stay','Verifying live availability and direct-booking pricing.');
    try{
      const res=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
      const data=await res.json().catch(()=>({}));
      if(sequence!==current)return;
      if(!res.ok){
        if(res.status===409){emitQuoteState('unavailable',request);render('Those dates are unavailable','Please choose another check-in or checkout date.');return}
        if(res.status===400&&typeof data.error==='string'){emitQuoteState('invalid',request);render('Please review your dates',data.error);return}
        throw new Error('Live availability is not connected to this preview yet. No booking or payment has been made.');
      }
      const verified=api.parseQuote(data,request);
      emitQuoteState('verified',request,verified);
      render('Available for a booking request',verified.nights+' nights · '+verified.propertyName,[
        ['Nightly subtotal',api.money(verified.subtotal)],
        ['Cleaning',api.money(verified.cleaningFee)],
        ['Taxes',api.money(verified.taxes)],
        ['Estimated total',api.money(verified.total)],
        ['Initial deposit if requested',api.money(verified.depositDue)],
        ['Remaining balance',api.money(verified.balanceDue)]
      ]);
      // A quote does not reserve inventory. The server revalidates before saving a request.
      idempotencyKey=secureRequestKey();
      confirmedRequest=request;
      requestPanel.hidden=false;
    }catch(err){
      if(sequence!==current)return;
      resetRequest();
      emitQuoteState('unknown',request);
      const msg=err.message||'We cannot verify the estimate right now.';
      render('Quote not confirmed',msg.includes('not connected')?msg:'We could not confirm this stay safely. Please try again or contact JRNP.');
    }finally{
      if(sequence===current){button.disabled=false;button.removeAttribute('aria-busy');button.textContent='Check availability ↗'}
    }
  }
  document.addEventListener('jrnp:quote-request',event=>{quote(event.detail)});
  for(const id of ['checkin','checkout','guests']){
    document.getElementById(id).addEventListener('change',()=>{
      current++;panel.hidden=true;resetRequest();button.disabled=false;button.removeAttribute('aria-busy');button.textContent='Check availability ↗';
    });
  }
  requestForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!confirmedRequest||!idempotencyKey||requestPending||requestSaved)return;
    if(!requestForm.reportValidity())return;
    const sequence=current;
    const body={
      propertyId:confirmedRequest.propertyId,
      checkIn:confirmedRequest.checkIn,
      checkOut:confirmedRequest.checkOut,
      guests:confirmedRequest.guests,
      firstName:document.getElementById('request-first').value.trim(),
      lastName:document.getElementById('request-last').value.trim(),
      email:document.getElementById('request-email').value.trim(),
      phone:document.getElementById('request-phone').value.trim(),
      ageCertified:document.getElementById('request-age').checked,
      rulesAcknowledged:document.getElementById('request-rules').checked,
      idempotencyKey
    };
    requestPending=true;requestError.hidden=true;requestSuccess.hidden=true;
    requestButton.disabled=true;requestButton.setAttribute('aria-busy','true');requestButton.textContent='Sending booking request…';
    try{
      const res=await fetch('/api/bookings',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json','Idempotency-Key':idempotencyKey},
        body:JSON.stringify(body)
      });
      const result=await res.json().catch(()=>({}));
      if(sequence!==current)return;
      if(!(res.status===201||res.status===200)||typeof result.bookingId!=='string'){
        const message=typeof result.error==='string'?result.error:'';
        throw new Error(res.status===409?'Those dates are no longer available. Please choose new dates and request a fresh quote.':res.status===429?'Too many requests were sent. Please wait a moment and retry.':res.status===503?'Request-to-book is temporarily unavailable. Please try again shortly.':message||'Could not send the booking request. No reservation or payment was created.');
      }
      requestSaved=true;
      requestButton.textContent='Booking request sent';requestButton.disabled=true;
      requestSuccess.textContent='Request '+result.bookingId+' was received for host review. Your stay is not confirmed, and no payment has been charged.';
      requestSuccess.hidden=false;
    }catch(err){
      if(sequence!==current)return;
      requestError.textContent=err.message||'Could not send the request. Retry using the same form; no reservation or payment was created.';
      requestError.hidden=false;
    }finally{
      requestPending=false;
      if(sequence===current){requestButton.removeAttribute('aria-busy');if(!requestSaved){requestButton.disabled=false;requestButton.textContent='Retry booking request ↗'}}
    }
  });
})();
