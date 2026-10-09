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
  const address='jrnprentals@gmail.com';
  const property=document.getElementById('jrnp-contact-property');
  const feedback=document.getElementById('jrnp-contact-feedback');
  const button=form.querySelector('button[type="submit"]');
  const current=new URLSearchParams(window.location.search).get('property');
  const mapping={family:'Stylish & Perfect for Families',ensuite:'Modern All-En-Suite Home',pool:'Palm Haven Pool House',studio:'Detached Studio Guesthouse',lake:'Weiss Lake House with Private Dock'};
  if(current&&mapping[current])property.value=mapping[current];
  button.textContent='Prepare my email ↗';
  let composeLink=null;
  for(const field of form.querySelectorAll('input,textarea,select')){
    field.addEventListener('input',()=>{
      if(composeLink)composeLink.remove();
      composeLink=null;
      feedback.textContent='Review your details, then prepare your message. Nothing is sent automatically.';
    });
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const name=document.getElementById('jrnp-contact-name').value.trim();
    const email=document.getElementById('jrnp-contact-email').value.trim();
    const home=property.value;
    const message=document.getElementById('jrnp-contact-message').value.trim();
    if(!name||!email||!message)return;
    if(composeLink)composeLink.remove();
    const subject='JRNP Rentals inquiry — '+home;
    const body='Hello JRNP Rentals,\n\n'+message+'\n\nProperty: '+home+'\nFrom: '+name+'\nReply-to: '+email;
    const link=document.createElement('a');
    link.className='jrnp-page-cta';
    link.textContent='Review and send in email app ↗';
    link.href='mailto:'+address+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    link.setAttribute('aria-label','Open a draft email to JRNP Rentals in your email application');
    feedback.textContent='Email draft prepared. Select the link below, then review and SEND it from your own email app. JRNP has not received anything yet.';
    feedback.insertAdjacentElement('afterend',link);
    composeLink=link;
  });
})();
