'use strict';
(()=>{
  const aboutInk=document.querySelector('.jrnp-about-host-heading h2 em');
  if(aboutInk&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    aboutInk.classList.add('jrnp-ink-ready');
    const reveal=()=>aboutInk.classList.add('jrnp-ink-visible');
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting)){reveal();observer.disconnect()}
      },{threshold:.16,rootMargin:'0px 0px 40px 0px'});
      observer.observe(aboutInk);
    }else reveal();
  }
  const form=document.getElementById('jrnp-contact-form');
  if(!form)return;
  const property=document.getElementById('jrnp-contact-property');
  const feedback=document.getElementById('jrnp-contact-feedback');
  const button=form.querySelector('button[type="submit"]');
  const arrival=document.getElementById('jrnp-contact-checkin');
  const departure=document.getElementById('jrnp-contact-checkout');
  const guestCount=document.getElementById('jrnp-contact-guests');
  const current=new URLSearchParams(window.location.search).get('property');
  const mapping={family:'1',ensuite:'2',lake:'3',studio:'4',pool:'5'};
  if(current&&mapping[current])property.value=mapping[current];
  const maxGuests={1:8,2:6,3:6,4:2,5:2};
  guestCount.max=String(maxGuests[property.value]||8);
  const today=new Date(),localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
  arrival.min=localToday;departure.min=localToday;
  arrival.addEventListener('change',()=>{departure.min=arrival.value||localToday;if(departure.value&&departure.value<=arrival.value)departure.value=''});
  property.addEventListener('change',()=>{guestCount.max=String(maxGuests[property.value]||8);if(Number(guestCount.value)>Number(guestCount.max))guestCount.value=guestCount.max});
  button.textContent='Send message securely ↗';
  let idempotencyKey=null,pending=false,saved=false;
  const messageKey=()=>{
    if(!window.crypto||typeof window.crypto.getRandomValues!=='function')throw new Error('Secure message IDs are not available in this browser.');
    const bytes=new Uint8Array(20);window.crypto.getRandomValues(bytes);
    return 'jrnp_msg_'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  };
  for(const field of form.querySelectorAll('input,textarea,select')){
    field.addEventListener('input',()=>{
      if(saved)return;
      idempotencyKey=null;
      feedback.classList.remove('is-error','is-success');
      feedback.textContent='Your message will be saved to JRNP’s private owner workspace.';
    });
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity()||pending||saved)return;
    const name=document.getElementById('jrnp-contact-name').value.trim();
    const email=document.getElementById('jrnp-contact-email').value.trim();
    const phone=document.getElementById('jrnp-contact-phone').value.trim();
    const category=document.getElementById('jrnp-contact-topic').value;
    const message=document.getElementById('jrnp-contact-message').value.trim();
    if(!name||!email||!message)return;
    const arrivalDate=arrival.value;
    const departureDate=departure.value;
    const guests=document.getElementById('jrnp-contact-guests').value;
    if((arrivalDate&&!departureDate)||(!arrivalDate&&departureDate)||arrivalDate&&departureDate&&departureDate<=arrivalDate){feedback.classList.add('is-error');feedback.textContent='Choose both preferred dates with checkout after check-in.';return}
    const stay=[arrivalDate&&departureDate?'Preferred dates: '+arrivalDate+' to '+departureDate:'',guests?'Guests: '+guests:''].filter(Boolean).join('\n');
    try{
      if(!idempotencyKey)idempotencyKey=messageKey();
      pending=true;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Sending securely…';
      feedback.classList.remove('is-error','is-success');feedback.textContent='Saving your message…';
      const response=await fetch('/api/support/messages',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({
        name,email,phone,propertyId:property.value,category,message:stay?message+'\n\n'+stay:message,website:document.getElementById('jrnp-contact-website').value
      })});
      const result=await response.json().catch(()=>({}));
      if(!(response.status===201||response.status===200||response.status===202)||result.success!==true)throw new Error(response.status===429?'Too many messages were sent. Please wait a few minutes and try again.':result.error||'Your message could not be saved.');
      saved=true;button.textContent='Message sent';feedback.classList.add('is-success');
      feedback.textContent='Message received'+(result.messageId?' · Reference '+result.messageId:'')+'. JRNP will reply to '+email+'. No reservation or payment was created.';
    }catch(error){
      feedback.classList.add('is-error');feedback.textContent=(error.message||'Your message could not be saved.')+' You can also email jrnprentals@gmail.com.';
      button.disabled=false;button.textContent='Retry secure message ↗';
    }finally{
      pending=false;button.removeAttribute('aria-busy');
    }
  });
})();
