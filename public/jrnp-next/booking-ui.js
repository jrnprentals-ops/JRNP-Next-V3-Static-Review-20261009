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
    requestButton.disabled=false;requestButton.removeAttribute('aria-busy');requestButton.textContent='Save test request ↗';
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
      // A quote does not reserve inventory. Only local demo records can be created.
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
    requestButton.disabled=true;requestButton.setAttribute('aria-busy','true');requestButton.textContent='Saving test request…';
    try{
      const res=await fetch('/api/staging/requests',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(body)
      });
      const result=await res.json().catch(()=>({}));
      if(sequence!==current)return;
      if(!(res.status===201||res.status===200)||typeof result.id!=='string'){
        throw new Error(res.status===503?'The staging booking test server is currently disabled.':res.status===409?'Please retry with a new quote; this test request was changed.':'Could not save a test request. No reservation was created.');
      }
      requestSaved=true;
      requestButton.textContent='Test request saved';requestButton.disabled=true;
      requestSuccess.textContent='Staging reference '+result.id+' saved as '+String(result.status||'pending_preview')+'. This is not a reservation. No email or payment was sent.';
      requestSuccess.hidden=false;
    }catch(err){
      if(sequence!==current)return;
      requestError.textContent=err.message||'Could not reach the staging server. Retry using the same form; no live booking was made.';
      requestError.hidden=false;
    }finally{
      requestPending=false;
      if(sequence===current){requestButton.removeAttribute('aria-busy');if(!requestSaved){requestButton.disabled=false;requestButton.textContent='Retry test request ↗'}}
    }
  });
})();
