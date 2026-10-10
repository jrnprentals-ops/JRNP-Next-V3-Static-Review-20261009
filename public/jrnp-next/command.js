'use strict';
(()=>{
  // Keep the approved JRNP Next Command Center navigation unchanged.
  const links=[...document.querySelectorAll('.command-sidebar nav a')];
  const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      links.forEach(a=>{
        const active=a.getAttribute('href')==='#'+visible.target.id;
        a.classList.toggle('active',active);
        if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
      });
    },{rootMargin:'-20% 0px -60% 0px',threshold:[0,.25,.5]});
    sections.forEach(s=>observer.observe(s));
  }
  const login=document.getElementById('staging-login');
  const password=document.getElementById('staging-password');
  const loginError=document.getElementById('staging-login-error');
  const privateArea=document.getElementById('staging-private');
  const status=document.getElementById('staging-status');
  const list=document.getElementById('staging-requests');
  const refresh=document.getElementById('staging-refresh');
  const logout=document.getElementById('staging-logout');
  if(!login||!password||!privateArea||!list)return;
  let csrfToken='',authenticated=false;
  const money=value=>(Number.isFinite(Number(value))?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)):'Estimate unavailable');
  function text(message){status.textContent=message}
  function signedOut(message,showLogin=true){
    csrfToken='';authenticated=false;privateArea.hidden=true;login.hidden=!showLogin;
    list.replaceChildren();text(message);
  }
  async function api(endpoint,method='GET',payload,token=''){
    const options={method,credentials:'same-origin',headers:{Accept:'application/json'}};
    if(method!=='GET'){options.headers['Content-Type']='application/json';options.body=JSON.stringify(payload||{});}
    if(token)options.headers['X-CSRF-Token']=token;
    const response=await fetch('/api/staging'+endpoint,options);
    const data=await response.json().catch(()=>({}));
    return {response,data};
  }
  function element(tag,className,content){
    const el=document.createElement(tag);
    if(className)el.className=className;
    if(content!==undefined)el.textContent=String(content);
    return el;
  }
  function line(box,label,value){
    const row=element('p','staging-request-line');
    row.append(element('span',null,label),element('strong',null,value));
    box.append(row);
  }
  async function changeStatus(id,next,card){
    if(!authenticated||!csrfToken)return;
    const buttons=[...card.querySelectorAll('button')];
    buttons.forEach(button=>button.disabled=true);
    text('Saving test request review…');
    try{
      const {response,data}=await api('/admin/requests/'+encodeURIComponent(id),'PATCH',{status:next},csrfToken);
      if(response.status===401){signedOut('Session expired. Sign in again.');return}
      if(!response.ok||data.status!==next)throw Error('Could not update the staging request.');
      await loadRequests();
      text('Test request updated. No live reservation was created.');
    }catch{
      text('Could not save the change. No guest messages were sent.');
      buttons.forEach(button=>button.disabled=false);
    }
  }
  function renderRequests(records){
    list.replaceChildren();
    if(!Array.isArray(records)||!records.length){
      list.append(element('p','staging-empty','No staging booking requests yet. Try the property booking preview first.'));
      return;
    }
    for(const item of records){
      const card=element('article','staging-request-card');
      const head=element('div','staging-request-head');
      head.append(element('h3',null,(item.firstName||'')+' '+(item.lastName||'')));
      head.append(element('span','staging-request-badge',item.status||'pending_preview'));
      card.append(head);
      line(card,'Property',({1:'Stylish & Perfect for Families',2:'Modern All-En-Suite Home',3:'Weiss Lake House with Private Dock',4:'Detached Studio Guesthouse',5:'Palm Haven Pool House'})[item.propertyId]||'JRNP Home');
      line(card,'Dates',String(item.checkIn||'')+' → '+String(item.checkOut||''));
      line(card,'Guests',item.guests);
      line(card,'Contact',String(item.email||'')+' · '+String(item.phone||''));
      line(card,'Verified estimate',money(item.quote?.totals?.total));
      line(card,'Staging reference',item.id);
      const actions=element('div','staging-request-actions');
      const review=element('button',null,'Mark reviewed');review.type='button';
      const decline=element('button',null,'Mark declined');decline.type='button';
      review.disabled=item.status==='reviewed_preview';
      decline.disabled=item.status==='declined_preview';
      review.addEventListener('click',()=>changeStatus(item.id,'reviewed_preview',card));
      decline.addEventListener('click',()=>changeStatus(item.id,'declined_preview',card));
      actions.append(review,decline);
      card.append(actions);
      list.append(card);
    }
  }
  async function loadRequests(){
    if(!authenticated)return;
    text('Loading protected test requests…');
    try{
      const {response,data}=await api('/admin/requests');
      if(response.status===401){signedOut('Session expired. Sign in again.');return}
      if(!response.ok||!Array.isArray(data.requests))throw Error('Staging inbox unavailable');
      renderRequests(data.requests);
      text('Authenticated local staging. Changes here do not affect live guests.');
    }catch{
      list.replaceChildren();
      text('Unable to load test requests. Please try Refresh.');
    }
  }
  async function checkSession(){
    try{
      const {response,data}=await api('/admin/me');
      if(response.status===200&&data.authenticated&&typeof data.csrfToken==='string'){
        csrfToken=data.csrfToken;authenticated=true;login.hidden=true;privateArea.hidden=false;
        await loadRequests();return;
      }
      if(response.status===401){signedOut('Sign in to inspect local staging booking requests.');return}
      signedOut('Local staging admin is not configured yet. Live CMP remains separate.',false);
    }catch{signedOut('Staging admin could not be reached. No live data is available.',false)}
  }
  login.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!password.value)return;
    const secret=password.value;password.value='';loginError.hidden=true;
    const submit=login.querySelector('button[type=submit]');submit.disabled=true;
    try{
      const {response,data}=await api('/admin/login','POST',{password:secret});
      if(response.ok&&data.authenticated&&typeof data.csrfToken==='string'){
        csrfToken=data.csrfToken;authenticated=true;login.hidden=true;privateArea.hidden=false;
        await loadRequests();return;
      }
      loginError.textContent=response.status===429?'Too many attempts. Try later.':response.status===503?'Local staging login is disabled.':'Incorrect staging password.';
      loginError.hidden=false;
    }catch{
      loginError.textContent='Unable to reach staging admin. Please try later.';
      loginError.hidden=false;
    }finally{submit.disabled=false}
  });
  refresh.addEventListener('click',()=>loadRequests());
  logout.addEventListener('click',async()=>{
    if(authenticated){try{await api('/admin/logout','POST',{},csrfToken)}catch{}}
    signedOut('Signed out of the protected test inbox.');
  });
  checkSession();
})();
