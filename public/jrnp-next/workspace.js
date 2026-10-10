'use strict';
/* JRNP NEXT / owned green-and-white command workspace. Never sends or publishes. */
(()=>{
 const byId=id=>document.getElementById(id);
 const nav=byId('workspace-navigation'),app=byId('workspace-app'),panel=byId('workspace-panel');
 const inactive=byId('workspace-inactive'),access=byId('workspace-access'),login=byId('workspace-login');
 const pass=byId('workspace-password'),loginError=byId('workspace-login-error');
 const accessStatus=byId('workspace-access-status'),feedback=byId('workspace-feedback');
 const title=byId('workspace-title'),desc=byId('workspace-description'),eyebrow=byId('workspace-eyebrow');
 const refresh=byId('workspace-refresh'),signOut=byId('workspace-sign-out');
 const demoEnter=byId('workspace-explore-demo'),demoIntro=byId('workspace-inactive-demo');
 const hostLogin=byId('workspace-host-login'),modeBadge=byId('workspace-state');
 if(!nav||!panel||!login)return;
 const moduleNames={overview:'Operational overview',bookings:'Booking requests',calendar:'Calendar & turnovers',
  cleanings:'Cleaning & costs',messages:'Guest messaging',listings:'Listings & photos',
  pricing:'Pricing proposals',guides:'Guest guides',reviews:'Guest reviews',ai:'AI drafting',
  automation:'Automation plans',reports:'Reports & insights',system:'System & access'};
 const editable=['cleanings','messages','listings','pricing','guides','reviews','ai','automation'];
 const statuses={
  cleanings:['todo','scheduled_preview','in_progress','complete_preview'],
  messages:['draft','review_preview','approved_preview'],
  listings:['draft','review_preview','approved_preview'],
  pricing:['draft','review_preview','approved_preview','declined_preview'],
  guides:['draft','review_preview','approved_preview'],
  reviews:['draft','review_preview','approved_preview'],
  ai:['draft','review_preview','approved_preview'],
  automation:['draft','review_preview','disabled_preview']
 };
 const homeNames={'1':'Stylish & Perfect for Families','2':'Modern All-En-Suite Home',
  '3':'Weiss Lake House with Private Dock','4':'Detached Studio Guesthouse','5':'Palm Haven Pool House'};
 const homes=[{id:'1',slug:'loma-linda',name:homeNames['1'],max:8,region:'Phoenix'},
  {id:'2',slug:'mitchell-en-suite',name:homeNames['2'],max:6,region:'Phoenix'},
  {id:'3',slug:'weiss-lake',name:homeNames['3'],max:6,region:'Alabama'},
  {id:'4',slug:'mitchell-studio',name:homeNames['4'],max:2,region:'Phoenix'},
  {id:'5',slug:'palm-haven-clean',name:homeNames['5'],max:2,region:'Phoenix'}];
 const emailTypes={request_received:'Request received',seven_day:'7 days before',
  three_day:'3 days before',forty_two_hour:'42 hours before',checkin_day:'Arrival day',
  checkout:'Checkout',post_checkout:'After checkout',long_stay:'Long-stay cleaning'};
 let authenticated=false,demoMode=false,csrf='',active='overview',requestCounter=0,monthOffset=0;
 const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
 const h=(tag,cls,text)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined&&text!==null)el.textContent=String(text);
  return el;
 };
 // In-flow sticky module access keeps mobile editors and Save controls reachable.
 const moduleSwitch=h('label','workspace-module-switch');
 const moduleSelect=h('select');moduleSelect.id='workspace-module-switch';
 for(const [value,label] of Object.entries(moduleNames)){
  const option=h('option',null,label);option.value=value;moduleSelect.append(option);
 }
 moduleSwitch.append(h('span',null,'Module'),moduleSelect);app.prepend(moduleSwitch);
 moduleSelect.addEventListener('change',()=>setActive(moduleSelect.value));
 const money=n=>Number.isFinite(Number(n))?'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
 function note(message){feedback.textContent=message}
 function append(parent,...children){children.filter(Boolean).forEach(el=>parent.append(el));return parent}
 function action(label,fn,cls='workspace-button'){
  const b=h('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;
 }
 function sectionHeadline(parent,heading,body){
  append(parent,h('h3',null,heading),h('p','workspace-muted',body));return parent;
 }
 function empty(message){return h('p','workspace-empty',message)}
 function box(label,value,foot){
  const el=h('div','workspace-metric');
  append(el,h('span',null,label),h('strong',null,value),h('small',null,foot||'Local staging only'));
  return el;
 }
 function propertySelect(label='Property',required=false){
  const select=h('select');select.name='propertyId';select.id='field-propertyId';select.required=required;
  if(!required){const all=h('option',null,'Portfolio / all homes');all.value='';select.append(all)}
  for(const home of homes){const opt=h('option',null,home.name);opt.value=home.id;select.append(opt)}
  return formField(label,select);
 }
 function formField(labelText,input){
  const label=h('label','workspace-field');
  append(label,h('span',null,labelText),input);return label;
 }
 function fieldInput(labelText,name,kind='text',max=140,required=false,initial=''){
  const input=h(kind==='multiline'?'textarea':'input');
  if(kind!=='multiline')input.type=kind;input.name=name;input.id='field-'+name;input.required=required;
  if(max>0)input.maxLength=max;
  if(initial!==null)input.value=initial||'';
  return formField(labelText,input);
 }
 function selectField(labelText,name,choices,initial){
  const select=h('select');select.name=name;select.id='field-'+name;
  for(const [value,label] of choices){const opt=h('option',null,label);opt.value=value;select.append(opt)}
  if(initial!==undefined)select.value=initial;
  return formField(labelText,select);
 }
 function disarm(){
  authenticated=false;demoMode=false;csrf='';app.hidden=true;inactive.hidden=false;signOut.hidden=true;
  access.hidden=false;hostLogin.hidden=true;demoEnter.hidden=false;modeBadge.textContent='LOCAL PREVIEW';
  pass.value='';panel.replaceChildren();note('');
 }
 function revealWorkspace(){
  title.setAttribute('tabindex','-1');title.focus({preventScroll:true});
  app.scrollIntoView({block:'start',behavior:'instant'});
 }
 function enterDemo(){
  if(authenticated)return;
  demoMode=true;access.hidden=true;inactive.hidden=true;app.hidden=false;signOut.hidden=true;
  hostLogin.hidden=false;demoEnter.hidden=true;modeBadge.textContent='SAMPLE DEMO';
  refresh.textContent='Reset sample data ↻';
  window.JRNPDemo.reset();setHeader(active);load();revealWorkspace();
 }
 function exitDemo(){
  demoMode=false;app.hidden=true;inactive.hidden=false;access.hidden=false;
  hostLogin.hidden=true;demoEnter.hidden=false;modeBadge.textContent='LOCAL PREVIEW';
  refresh.textContent='Refresh workspace ↗';panel.replaceChildren();
  login.hidden=false;accessStatus.textContent='Secure local staging login; demo content is not host data.';
  access.scrollIntoView({block:'start'});pass.focus();
 }
 demoEnter.addEventListener('click',enterDemo);demoIntro.addEventListener('click',enterDemo);
 hostLogin.addEventListener('click',exitDemo);
 async function call(path,method='GET',body){
  const opt={method,credentials:'same-origin',headers:{Accept:'application/json'}};
  if(method!=='GET'){
   opt.headers['Content-Type']='application/json';
   opt.body=JSON.stringify(body||{});
   if(csrf)opt.headers['X-CSRF-Token']=csrf;
  }
  const response=await fetch('/api/staging/admin'+path,opt);
  const result=await response.json().catch(()=>({error:'Invalid server response'}));
  if(response.status===401&&path==='/me')throw Error('Authentication required');
  if(response.status===401&&path!=='/login'&&path!=='/me'){
   disarm();login.hidden=false;accessStatus.textContent='Session expired. Please sign in again.';
   throw Error('Session expired');
  }
  if(!response.ok)throw Error(typeof result.error==='string'?result.error:'Request failed ('+response.status+')');
  return result;
 }
 function setHeader(module){
  eyebrow.textContent=(demoMode?'INTERACTIVE SAMPLE DEMO / ':'LOCAL STAGING / ')+module.toUpperCase();
  title.textContent=moduleNames[module]||'Operations';
  moduleSelect.value=module;
  desc.textContent=demoMode?'Invented sample records and local-only controls. Nothing here is connected to guests, payments, email or channels.':
   module==='overview'?'Your local test-data snapshot and operational entry points.':
   module==='bookings'?'Review test booking requests securely without changing live reservations.':
   module==='calendar'?'Monthly planning using only local preview requests and cleaning tasks—not an OTA availability calendar.':
   module==='reports'?'Summary of only the records created inside this staging workspace.':
   module==='listings'?'Select a property, preview and save a protected content draft. Public listing pages remain unchanged.':
   module==='system'?'Access controls, safe integrations, and the current release boundary.':
   'Create and review '+(moduleNames[module]||module).toLowerCase()+' as private draft records.';
 }
 function setActive(module){
  if(!Object.hasOwn(moduleNames,module))module='overview';
  active=module;requestCounter++;
  for(const button of nav.querySelectorAll('button[data-module]')){
   const checked=button.dataset.module===module;
   button.classList.toggle('active',checked);
   if(checked)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  }
  setHeader(module);
  if(!authenticated&&!demoMode){enterDemo();return}
  load();revealWorkspace();
 }
 nav.addEventListener('click',ev=>{
  const item=ev.target.closest('button[data-module]');
  if(item)setActive(item.dataset.module);
 });
 async function authenticate(){
  try{
   const result=await call('/me');
   if(result.authenticated&&typeof result.csrfToken==='string'){
    if(demoMode)return;
    csrf=result.csrfToken;authenticated=true;login.hidden=true;inactive.hidden=true;
    app.hidden=false;signOut.hidden=false;demoEnter.hidden=true;hostLogin.hidden=true;modeBadge.textContent='PROTECTED STAGING';accessStatus.textContent='Authenticated local-staging session.';
    load();revealWorkspace();return;
   }
   throw Error('Authentication unavailable');
  }catch(err){
   if(demoMode)return;
   disarm();
   if(/Authentication|401|session/i.test(err.message)){login.hidden=false;accessStatus.textContent='Sign in to use the protected local staging workspace.'}
   else{login.hidden=true;accessStatus.textContent='Staging access unavailable. The preview remains view-only.'}
  }
 }
 login.addEventListener('submit',async ev=>{
  ev.preventDefault();
  loginError.hidden=true;const secret=pass.value;pass.value='';
  if(!secret)return;
  const submit=login.querySelector('button[type="submit"]');submit.disabled=true;
  try{
   const result=await call('/login','POST',{password:secret});
   if(!result.authenticated||!result.csrfToken)throw Error('Authentication not verified');
   demoMode=false;csrf=result.csrfToken;authenticated=true;login.hidden=true;app.hidden=false;
   inactive.hidden=true;signOut.hidden=false;demoEnter.hidden=true;hostLogin.hidden=true;modeBadge.textContent='PROTECTED STAGING';accessStatus.textContent='Staging account authenticated.';
   load();revealWorkspace();
  }catch(err){loginError.textContent=err.message;loginError.hidden=false;}
  finally{submit.disabled=false;}
 });
 signOut.addEventListener('click',async()=>{
  try{if(authenticated)await call('/logout','POST',{})}catch{}
  disarm();login.hidden=false;accessStatus.textContent='Signed out of the protected workspace.';
 });
 refresh.addEventListener('click',()=>{if(demoMode){window.JRNPDemo.reset();note('All fictional records reset.');load()}else if(authenticated)load()});
 const formatDate=value=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return value||'—';
  const date=new Date(value+'T12:00:00Z');return date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
 };
 function recordLine(record,field,value){
  if(!value&&value!==0)return;
  const p=h('p','workspace-record-meta',field+': '+String(value));record.append(p);
 }
 async function load(){
  if(demoMode){panel.replaceChildren(window.JRNPDemo.render(active));return}
  if(!authenticated)return;
  const seq=++requestCounter;
  panel.replaceChildren(empty('Loading protected staging data…'));note('');
  try{
   let rendered;
   if(active==='overview')rendered=await renderOverview();
   else if(active==='bookings')rendered=await renderBookings();
   else if(active==='calendar')rendered=await renderCalendar();
   else if(active==='reports')rendered=await renderReports();
   else if(active==='pricing'){
    const legacy=await renderDrafts('pricing',false);
    try{legacy.prepend(await renderSmartRates());}
    catch(error){
     const unavailable=h('section','workspace-card');
     sectionHeadline(unavailable,'JRNP Smart Rates unavailable',
      'This staging origin does not have the protected Desktop pricing service. Existing private proposals remain available.');
     unavailable.append(empty('Pricing connection unavailable: '+error.message));
     legacy.prepend(unavailable);
    }
    rendered=legacy;
   }
   else if(active==='system')rendered=await renderSystem();
   else if(active==='messages'){
    const legacy=await renderDrafts('messages',true);
    try{legacy.prepend(await renderTemplateManager());}
    catch(error){
     if(!authenticated)throw error;
     const unavailable=h('section','workspace-card');
     sectionHeadline(unavailable,'Property templates unavailable',
      'This staging origin has no protected content-template service. Existing guest message drafts and previews remain usable.');
     unavailable.append(empty('Template connection unavailable: '+error.message));
     legacy.prepend(unavailable);
    }
    rendered=legacy;
   }
   else if(active==='listings'){
    const tab=new URLSearchParams(location.search).get('cms');
    rendered=tab==='sections'?await renderCmsSections():tab==='blogs'||tab==='products'?await renderCmsCatalog(tab):await renderPropertyManager();
   }
   else rendered=await renderDrafts(active,false);
   if(seq===requestCounter&&authenticated)panel.replaceChildren(rendered);
  }catch(err){
   if(seq===requestCounter&&authenticated){panel.replaceChildren(empty('Could not load '+moduleNames[active]+'. '+err.message));note('Refresh to retry.');}
  }
 }
 async function renderOverview(){
  const [overview,bookings]=await Promise.all([call('/workspace/overview'),call('/requests')]);
  const root=h('div');
  const metrics=h('div','workspace-metrics');
  const values=overview.counts||[];
  const drafts=values.reduce((sum,row)=>sum+Number(row.total||0),0);
  const pending=(bookings.requests||[]).filter(r=>r.status==='pending_preview').length;
  append(metrics,box('Pending test requests',pending,'Local request-to-book'),
   box('Operational drafts',drafts,'Eight staged modules'),
   box('Properties',overview.properties?.length||5,'Verified portfolio'),
   box('External sends',0,'Always blocked in staging'));
  root.append(metrics);
  const portfolio=h('div','workspace-property-grid');
  for(const home of homes){
   const card=h('div','workspace-property');
   const photo=h('img');photo.src='/assets/images/'+home.slug+'/cover.jpg';photo.alt=home.name+' property photograph';photo.loading='lazy';
   append(card,photo,h('p',null,home.name),h('small',null,home.region+' · Up to '+home.max+' guests'));
   portfolio.append(card);
  }
  root.append(portfolio);
  const grid=h('div','workspace-cards');
  for(const id of ['bookings','calendar','cleanings','messages','pricing','listings','reports','system']){
   const card=h('article','workspace-card');
   sectionHeadline(card,moduleNames[id],id==='bookings'?'Manage new preview requests.':
    id==='calendar'?'Visualize test tasks and requested arrival dates.':
    id==='reports'?'Understand your staged operations.':'Create and review internal '+moduleNames[id].toLowerCase()+'.');
   card.append(action('Open workspace ↗',()=>setActive(id)));
   grid.append(card);
  }
  root.append(grid);
  return root;
 }
 async function renderBookings(){
  const root=h('div'),data=await call('/requests'),requests=Array.isArray(data.requests)?data.requests:[];
  const head=h('div','workspace-metrics');
  append(head,box('Requests',requests.length),box('Pending',requests.filter(x=>x.status==='pending_preview').length),
   box('Reviewed',requests.filter(x=>x.status==='reviewed_preview').length),
   box('Declined',requests.filter(x=>x.status==='declined_preview').length));
  root.append(head);
  const list=h('div','workspace-record-list');
  if(!requests.length){list.append(empty('No local booking requests have been created. Use a property page in secured local staging to create a demo request.'));}
  for(const rec of requests){
   const card=h('article','workspace-record');
   append(card,h('span','workspace-record-status',rec.status||'pending_preview'),h('h3',null,(rec.firstName||'')+' '+(rec.lastName||'')));
   recordLine(card,'Property',homeNames[rec.propertyId]||'JRNP');
   recordLine(card,'Dates',formatDate(rec.checkIn)+' — '+formatDate(rec.checkOut));
   recordLine(card,'Guests',rec.guests);
   recordLine(card,'Contact',String(rec.email||'')+' · '+String(rec.phone||''));
   recordLine(card,'Quoted total',rec.quote?.totals?.total!==undefined?money(rec.quote.totals.total):'Not confirmed');
   recordLine(card,'Request ID',rec.id);
   const actions=h('div','workspace-record-actions');
   for(const [state,label] of [['reviewed_preview','Mark reviewed'],['declined_preview','Decline preview']]){
    actions.append(action(label,async ev=>{
     const buttons=[...actions.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
     try{await call('/requests/'+encodeURIComponent(rec.id),'PATCH',{status:state});note('Test request '+state+'. No guest was contacted.');load()}
     catch(e){note(e.message);buttons.forEach(b=>b.disabled=false)}
    },''));
   }
   for(const button of actions.querySelectorAll('button'))button.disabled=button.textContent===(rec.status==='reviewed_preview'?'Mark reviewed':rec.status==='declined_preview'?'Decline preview':'');
   card.append(actions);list.append(card);
  }
  root.append(list);return root;
 }
 function moduleForm(bucket,onSaved){
  const wrapper=h('aside','workspace-form-wrap'),form=h('form','workspace-form');
  form.id='workspace-record-form';
  append(wrapper,h('p','kicker','CREATE A SAFE STAGING DRAFT'),h('h3',null,'New '+moduleNames[bucket].toLowerCase()));
  append(form,fieldInput('Title','title','text',140,true),
   propertySelect('Property / portfolio'),
   fieldInput('Description / instructions','details','multiline',2400),
   fieldInput('Due date (optional)','dueDate','date',0));
  if(bucket==='pricing'){
   append(form,fieldInput('Proposed amount in USD','amount','number',0,true),
    fieldInput('Evidence / source','source','text',250,true));
   const input=form.querySelector('[name=amount]');input.min='0';input.max='100000';input.step='0.01';
  }
  if(bucket==='messages'){
   form.append(selectField('Guest email template (optional)','template',
    [['','No template'],...Object.entries(emailTypes)]));
  }
  const actionRow=h('div','workspace-form-action');
  const submit=h('button','workspace-button','Save local draft ↗');submit.type='submit';
  const clear=action('Clear',()=>{form.reset();if(form.dataset.editId)load()},'workspace-button workspace-reset');
  append(actionRow,submit,clear);form.append(actionRow);
  form.addEventListener('submit',async ev=>{
   ev.preventDefault();
   if(!form.reportValidity())return;
   submit.disabled=true;submit.textContent='Saving draft…';
   const raw=Object.fromEntries(new FormData(form).entries());
   const payload={title:raw.title,propertyId:raw.propertyId||'',details:raw.details||'',dueDate:raw.dueDate||''};
   if(bucket==='pricing'){payload.amount=raw.amount;payload.source=raw.source}
   if(bucket==='messages'&&raw.template)payload.template=raw.template;
   try{
    const editing=form.dataset.editId;
    if(editing){await call('/workspace/'+bucket+'/'+encodeURIComponent(editing),'PATCH',payload)}
    else{await call('/workspace/'+bucket,'POST',payload)}
    form.reset();delete form.dataset.editId;
    note(editing?'Local test draft updated.':'Local preview draft saved. No external system changed.');onSaved();
   }catch(err){note('Could not save draft: '+err.message)}
   finally{submit.disabled=false;submit.textContent='Save local draft ↗'}
  });
  wrapper.append(form);return wrapper;
 }
 async function renderDrafts(bucket,withPreview){
  const data=await call('/workspace/'+bucket),root=h('div'),records=Array.isArray(data.records)?data.records:[];
  const layout=h('div','workspace-record-layout'),list=h('div','workspace-record-list');
  if(!records.length)list.append(empty('No '+moduleNames[bucket].toLowerCase()+' saved yet. Use the editor to create one; it will remain private test data.'));
  for(const row of records){
   const card=h('article','workspace-record');
   append(card,h('span','workspace-record-status',row.status),h('h3',null,row.title));
   recordLine(card,'Property',homeNames[row.propertyId]||'Portfolio');
   if(row.dueDate)recordLine(card,'Due',formatDate(row.dueDate));
   if(row.amount!==null&&row.amount!==undefined)recordLine(card,'Proposed amount',money(row.amount));
   if(row.source)recordLine(card,'Source',row.source);
   if(row.template)recordLine(card,'Template',emailTypes[row.template]||row.template);
   if(row.details)card.append(h('p','workspace-record-details',row.details));
   const actions=h('div','workspace-record-actions');
   for(const state of (statuses[bucket]||[])){
    if(state===row.status)continue;
    const label=state.replaceAll('_',' ');
    actions.append(action('Set '+label,async()=>{
     for(const b of actions.querySelectorAll('button'))b.disabled=true;
     try{await call('/workspace/'+bucket+'/'+encodeURIComponent(row.id),'PATCH',{status:state});
      note('Status changed to '+label+'. No live action was triggered.');load()}
     catch(err){note(err.message);for(const b of actions.querySelectorAll('button'))b.disabled=false}
    },''));
   }
   actions.append(action('Edit draft',()=>openEdit(row,bucket),''),action('Delete test draft',async()=>{
    if(!window.confirm('Delete this local test draft? This will not affect live JRNP data.'))return;
    try{await call('/workspace/'+bucket+'/'+encodeURIComponent(row.id),'DELETE');note('Local draft deleted.');load()}
    catch(err){note(err.message)}
   },''));
   card.append(actions);list.append(card);
  }
  layout.append(list,moduleForm(bucket,()=>load()));root.append(layout);
  if(withPreview)root.append(renderMailPreview());
  return root;
 }

 // Uses the existing Desktop staging session/CSRF and server-scoped CMS.
 // This is a persistent host DRAFT editor, never a public page publisher.

 function renderCmsSubnav(selected){
  const menu=h('nav','workspace-cms-subnav');
  menu.setAttribute('aria-label','Listing content tools');
  for(const [key,label] of [['properties','Property manager'],['sections','Rooms & content'],['blogs','Blog drafts'],['products','Products & add-ons']]){
   const button=action(label,()=>{
    const url=new URL(location.href);
    url.searchParams.set('module','listings');
    if(key==='properties')url.searchParams.delete('cms');
    else url.searchParams.set('cms',key);
    window.history.replaceState(null,'',url.pathname+url.search+url.hash);
    load();
   },'workspace-button'+(key===selected?' workspace-cms-tab-active':' workspace-reset'));
   if(key===selected)button.setAttribute('aria-current','page');
   menu.append(button);
  }
  return menu;
 }

 async function renderPropertyManager(){
  const data=await call('/workspace/cms');
  const root=h('div'),section=h('section','workspace-card workspace-cms');
  root.append(renderCmsSubnav('properties'));
  sectionHeadline(section,'Property manager','The existing authenticated JRNP CMS stores per-property revisions in isolated staging. Preview and Save never change the public listing.');
  if(!Array.isArray(data.properties)||!data.properties.length){
   section.append(empty('No properties assigned to this authenticated host account.'));
   root.append(section);return root;
  }
  const select=h('select');select.id='workspace-cms-property';
  for(const home of data.properties){
   if(!home||!home.id||!home.name)continue;
   const opt=h('option',null,home.name+' · '+(home.region||''));
   opt.value=home.id;select.append(opt);
  }
  const permitted=data.properties.map(home=>home.id);
  const params=new URLSearchParams(location.search);
  select.value=permitted.includes(params.get('propertyId'))?params.get('propertyId'):permitted[0];
  const selector=formField('Choose one of your JRNP properties',select);
  const help=h('p','workspace-muted','Owner-only drafts · Validated fields · Revision history · No payments or guest messaging.');
  const slot=h('div','workspace-cms-slot');
  section.append(selector,help,slot);
  root.append(section);
  const historic=h('details','workspace-cms-previous');
  const summary=h('summary',null,'Earlier local listing revision drafts');
  historic.append(summary,await renderDrafts('listings',false));
  root.append(historic);
  let ticket=0;
  const labels=[
   ['title','Property display name',160,false,true],
   ['shortDescription','Short listing summary',1000,true,false],
   ['longDescription','Full property description',30000,true,false],
   ['seoTitle','SEO title',180,false,false],
   ['seoDescription','SEO description',360,true,false],
   ['neighborhoodBlurb','Neighborhood and local guide',2500,true,false]
  ];
  const renderSelected=async()=>{
   const chosen=select.value,seq=++ticket;
   slot.replaceChildren(empty('Loading authorized property record…'));
   try{
    const result=await call('/workspace/cms/properties?propertyId='+encodeURIComponent(chosen));
    if(seq!==ticket||select.value!==chosen)return;
    const fields=result.draft?.fields||{};
    const revision=result.expectedRevision;
    if(result.property?.id!==chosen||!Number.isInteger(revision))throw Error('Incorrect property identity or revision');
    const form=h('form','workspace-form workspace-cms-form');
    form.id='workspace-cms-form';
    const state=h('p','workspace-cms-state','Property '+chosen+' · '+(result.draft?'Saved staging draft · revision '+revision:'No saved draft yet · revision 0'));
    state.setAttribute('role','status');state.setAttribute('aria-live','polite');
    const headline=h('h3',null,result.property.name);
    const published=h('p','workspace-muted','Public website content is unaffected until a separately approved release. The draft below may be incomplete.');
    form.append(headline,state,published);
    for(const [key,label,max,long,required] of labels){
     const input=h(long?'textarea':'input');
     if(!long)input.type='text';
     input.id='workspace-cms-'+key;input.name=key;input.maxLength=max;input.required=required;
     input.value=typeof fields[key]==='string'?fields[key]:(key==='title'?result.property.name:'');
     if(long)input.rows=key==='longDescription'?7:3;
     form.append(formField(label,input));
    }
    const preview=h('section','workspace-card workspace-cms-preview');
    preview.id='workspace-cms-preview';preview.hidden=true;
    const resultStatus=h('p','workspace-cms-result');
    resultStatus.setAttribute('role','status');resultStatus.setAttribute('aria-live','polite');
    const buttons=h('div','workspace-form-action');
    const previewButton=action('Preview draft',()=>{
     const values=Object.fromEntries(new FormData(form).entries());
     const body=h('div','workspace-cms-preview-copy');
     body.append(h('p','kicker','PRIVATE DRAFT PREVIEW — NOT PUBLISHED'),
      h('h3',null,values.title||result.property.name),
      h('p',null,values.shortDescription||'No summary provided'),
      h('p',null,values.longDescription||'No full description provided'),
      h('p',null,'SEO: '+(values.seoTitle||'Not set')),
      h('p',null,'Neighborhood: '+(values.neighborhoodBlurb||'Not set')));
     preview.replaceChildren(body);preview.hidden=false;
    },'workspace-button workspace-reset');
    const reload=action('Reload saved draft',()=>renderSelected(),'workspace-button workspace-reset');
    const save=h('button','workspace-button','Save property draft ↗');save.type='submit';
    buttons.append(previewButton,reload,save);form.append(buttons,resultStatus,preview);
    form.addEventListener('submit',async event=>{
     event.preventDefault();
     if(!form.reportValidity())return;
     const values=Object.fromEntries(new FormData(form).entries());
     const payload={expectedRevision:revision,...values};
     save.disabled=true;save.textContent='Saving securely…';
     resultStatus.textContent='Saving to the protected staging database…';
     try{
      const response=await call('/workspace/cms/properties/'+encodeURIComponent(chosen),'PATCH',payload);
      if(response.draft?.propertyId!==chosen||response.draft?.revision!==revision+1)
       throw Error('Saved response failed identity/revision verification');
      const verify=await call('/workspace/cms/properties?propertyId='+encodeURIComponent(chosen));
      if(verify.draft?.revision!==revision+1||
         labels.some(([key])=>verify.draft.fields?.[key]!==values[key]))
       throw Error('Save returned, but database readback did not match. Reload before editing.');
      await renderSelected();
      const message='Saved and read back revision '+verify.draft.revision+' for '+result.property.name+'. No public site changes.';
      const next=slot.querySelector('.workspace-cms-result');
      if(next)next.textContent=message;
      note(message);
     }catch(error){
      resultStatus.textContent='Could not verify property save: '+error.message;
      note(resultStatus.textContent);
      save.disabled=false;save.textContent='Save property draft ↗';
     }
    });
    slot.replaceChildren(form);
   }catch(error){
    if(seq===ticket)slot.replaceChildren(empty('Unable to load authorized property: '+error.message));
   }
  };
  select.addEventListener('change',()=>{
   const url=new URL(location.href);
   url.searchParams.set('module','listings');
   url.searchParams.set('propertyId',select.value);
   window.history.replaceState(null,'',url.pathname+url.search+url.hash);
   renderSelected();
  });
  await renderSelected();
  return root;
 }



 async function renderCmsSections(){
  const cmshost=await call('/workspace/cms');
  const allowed=Array.isArray(cmshost.properties)?cmshost.properties:[];
  const root=h('div');root.append(renderCmsSubnav('sections'));
  const area=h('section','workspace-card workspace-cms workspace-sections');
  sectionHeadline(area,'Room, amenity and content editor',
   'Store private, property-specific room details, amenity groups, guest FAQ, policies, neighborhood guides, SEO and photo captions. Never changes the published page or uploads a media file.');
  root.append(area);
  if(!allowed.length){area.append(empty('No properties assigned to this host account.'));return root}
  const types=[['room','Room or space'],['amenity','Amenity'],['faq','Guest FAQ'],['guide','Area guide'],
   ['photo','Photo caption / alt metadata'],['policy','House policy'],
   ['seo','SEO / social draft'],['neighborhood','Neighborhood']];
  const property=h('select');property.id='workspace-sections-property';
  for(const item of allowed){const option=h('option',null,item.name);option.value=item.id;property.append(option)}
  const requested=new URLSearchParams(location.search).get('propertyId');
  property.value=allowed.some(p=>p.id===requested)?requested:allowed[0].id;
  const chosenType=h('select');chosenType.id='workspace-sections-filter';
  for(const [value,label] of [['','All content sections'],...types]){
   const opt=h('option',null,label);opt.value=value;chosenType.append(opt);
  }
  const top=h('div','workspace-cms-catalog-top');
  top.append(formField('Property',property),formField('Filter type',chosenType));
  top.append(action('New content section ↗',()=>showEditor(null)));
  const feedback=h('p','workspace-cms-result');feedback.setAttribute('role','status');
  feedback.setAttribute('aria-live','polite');
  const items=h('div','workspace-record-list');items.id='workspace-sections-records';
  const editor=h('div');editor.id='workspace-sections-editor';
  area.append(top,feedback,items,editor);
  let ticket=0,records=[];
  function draw(){
   items.replaceChildren();
   const filtered=records.filter(x=>!chosenType.value||x.fields?.sectionType===chosenType.value);
   if(!filtered.length)items.append(empty('No private content drafts for the selected property/type.'));
   for(const item of filtered){
    const card=h('article','workspace-record');card.dataset.sectionId=item.id;
    append(card,h('span','workspace-record-status',item.status),h('h3',null,item.title),
     h('p','workspace-muted',(types.find(x=>x[0]===item.fields?.sectionType)||[])[1]||item.fields?.sectionType));
    recordLine(card,'Revision',item.revision);
    if(item.fields?.details)card.append(h('p','workspace-record-details',item.fields.details.slice(0,600)));
    if(item.fields?.metadata&&Object.keys(item.fields.metadata).length)
     recordLine(card,'Metadata',JSON.stringify(item.fields.metadata));
    const actions=h('div','workspace-record-actions');
    actions.append(action('Preview',()=>showPreview(item.fields||{}),''));
    if(item.status!=='archived'){
     actions.append(action('Edit draft',()=>showEditor(item),''));
     if(item.status!=='reviewed_preview')actions.append(action('Mark reviewed',async()=>{
      try{
       const saved=await call('/workspace/cms/sections/'+encodeURIComponent(item.id),'PATCH',{
        expectedRevision:item.revision,status:'reviewed_preview'});
       if(saved.item?.status!=='reviewed_preview')throw Error('Review change unconfirmed');
       await reload();feedback.textContent='Content reviewed privately; no published page changed.';
      }catch(e){feedback.textContent='Could not review section: '+e.message}
     },''));
     actions.append(action('Archive draft',async()=>{
      if(!window.confirm('Archive this private property content section?'))return;
      try{
       const saved=await call('/workspace/cms/sections/'+encodeURIComponent(item.id),'DELETE',{
        expectedRevision:item.revision});
       if(saved.item?.status!=='archived')throw Error('Archive change unconfirmed');
       await reload();feedback.textContent='Section archived privately.';
      }catch(e){feedback.textContent='Archive failed: '+e.message}
     },''));
    }
    card.append(actions);items.append(card);
   }
  }
  async function reload(){
   const seq=++ticket;
   items.replaceChildren(empty('Loading protected property content…'));
   editor.replaceChildren();
   try{
    const data=await call('/workspace/cms/sections?propertyId='+encodeURIComponent(property.value));
    if(seq!==ticket)return;
    records=Array.isArray(data.items)?data.items:[];
    draw();
    feedback.textContent=records.length+' scoped content drafts for '+homeNames[property.value]+'.';
   }catch(e){items.replaceChildren(empty('Content service unavailable: '+e.message))}
  }
  function showPreview(fields){
   const panel=h('section','workspace-card workspace-cms-preview');
   panel.id='workspace-sections-preview';
   append(panel,h('p','kicker','PRIVATE PROPERTY CONTENT PREVIEW — NOT PUBLISHED'),
    h('h3',null,fields.title||'Untitled content'),h('p','workspace-muted',fields.sectionType||'Section type'));
   panel.append(h('p','workspace-record-details',fields.details||'No description yet'));
   if(fields.metadata&&Object.keys(fields.metadata).length)
    panel.append(h('pre','workspace-cms-markdown',JSON.stringify(fields.metadata,null,2)));
   panel.append(h('p','workspace-muted','Photo metadata is descriptive only. Upload, crop and reorder still require a separate approved media endpoint.'));
   editor.replaceChildren(panel);
   panel.scrollIntoView({block:'nearest',behavior:'auto'});
  }
  function showEditor(item){
   const fields=item?.fields||{};
   const form=h('form','workspace-form workspace-sections-form');
   form.id='workspace-sections-form';
   form.append(h('h3',null,item?'Edit saved content draft':'New private content section'));
   form.append(h('p','workspace-muted','Use approved facts only. These changes stay in protected SQLite; public pages remain unchanged.'));
   const sectionType=selectField('Content type','sectionType',types,fields.sectionType||'room');
   sectionType.querySelector('[name]').id='workspace-sections-type';
   form.append(sectionType);
   const slug=fieldInput('Section slug / unique identifier','slug','text',90,true,fields.slug||'');
   const slugInput=slug.querySelector('[name]');slugInput.id='workspace-sections-slug';
   slugInput.pattern='[a-z0-9][a-z0-9-]{2,88}[a-z0-9]';
   form.append(slug);
   form.append(fieldInput('Title / section heading','title','text',160,true,fields.title||''));
   const body=fieldInput('Room, amenity or policy details','details','multiline',20000,true,fields.details||'');
   body.querySelector('[name]').id='workspace-sections-details';
   form.append(body);
   const metadata=fieldInput('Additional structured metadata (valid JSON object, optional)','metadataJson','multiline',3900,false,
    Object.keys(fields.metadata||{}).length?JSON.stringify(fields.metadata,null,2):'{}');
   metadata.querySelector('[name]').id='workspace-sections-metadata';
   form.append(metadata);
   form.append(h('p','workspace-muted',
    'For photo details, metadata may include verified caption and alt text; this does not upload or replace a photograph. Never include door codes, passwords or payment data.'));
   const actions=h('div','workspace-form-action');
   const preview=action('Preview draft',()=>{
    const raw=Object.fromEntries(new FormData(form).entries());
    let data={};
    try{data=JSON.parse(raw.metadataJson.trim()||'{}');
     if(!data||Array.isArray(data)||typeof data!=='object')throw Error('Object required');
    }catch(e){error.textContent='Metadata must be a JSON object: '+e.message;return}
    showPreview({...raw,metadata:data});
    editor.prepend(form);
   },'workspace-button workspace-reset');
   const cancel=action('Cancel',()=>editor.replaceChildren(),'workspace-button workspace-reset');
   const save=h('button','workspace-button','Save private content draft ↗');
   save.type='submit';save.id='workspace-sections-save';
   actions.append(preview,cancel,save);form.append(actions);
   const error=h('p','workspace-cms-result');
   error.setAttribute('role','status');form.append(error);
   form.addEventListener('submit',async ev=>{
    ev.preventDefault();if(!form.reportValidity())return;
    const raw=Object.fromEntries(new FormData(form).entries());
    let metadataObj;
    try{
     metadataObj=JSON.parse(raw.metadataJson.trim()||'{}');
     if(!metadataObj||typeof metadataObj!=='object'||Array.isArray(metadataObj))
      throw Error('Only a JSON object is permitted');
    }catch(e){error.textContent='Invalid metadata JSON: '+e.message;return}
    const payload={propertyId:property.value,sectionType:raw.sectionType,slug:raw.slug,
     title:raw.title,details:raw.details,metadata:metadataObj};
    save.disabled=true;error.textContent='Saving private content to authorized backend…';
    try{
     const result=await call('/workspace/cms/sections'+(item?'/'+encodeURIComponent(item.id):''),
      item?'PATCH':'POST',item?{expectedRevision:item.revision,...payload}:payload);
     const stored=result.item;
     if(!stored?.id||!Number.isInteger(stored.revision))throw Error('Backend save revision missing');
     const reread=await call('/workspace/cms/sections/'+encodeURIComponent(stored.id));
     if(reread.item?.revision!==stored.revision||
        reread.item?.fields?.details!==payload.details||
        JSON.stringify(reread.item?.fields?.metadata)!==JSON.stringify(metadataObj))
      throw Error('Saved content readback mismatch');
     await reload();
     feedback.textContent='Saved '+stored.title+' revision '+stored.revision+' and verified database readback. Public page not changed.';
     note(feedback.textContent);
    }catch(e){error.textContent='Unable to save content: '+e.message;save.disabled=false}
   });
   editor.replaceChildren(form);
   form.scrollIntoView({block:'nearest',behavior:'auto'});
  }
  property.addEventListener('change',()=>reload());
  chosenType.addEventListener('change',draw);
  await reload();
  return root;
 }

 async function renderCmsCatalog(kind){
  const backend=await call('/workspace/cms');
  const allowed=Array.isArray(backend.properties)?backend.properties:[];
  const root=h('div');
  root.append(renderCmsSubnav(kind));
  const section=h('section','workspace-card workspace-cms');
  sectionHeadline(section,kind==='blogs'?'Blog draft manager':'Property products & add-ons',
   kind==='blogs'?'Create, preview, edit and review property-linked Markdown drafts. Public publishing is disabled until separately verified.':
   'Maintain per-property service drafts and optional notice periods. No guest charge or public add-on is enabled.');
  root.append(section);
  if(!allowed.length){section.append(empty('This account has no editable properties.'));return root}
  const property=h('select');
  property.id='workspace-cms-catalog-property';
  for(const item of allowed){const option=h('option',null,item.name);option.value=item.id;property.append(option)}
  const requested=new URLSearchParams(location.search).get('propertyId');
  property.value=allowed.some(p=>p.id===requested)?requested:allowed[0].id;
  const controls=h('div','workspace-cms-catalog-top');
  controls.append(formField('Property',property));
  const newButton=action(kind==='blogs'?'New blog draft ↗':'New service draft ↗',()=>showForm(null));
  controls.append(newButton);
  const status=h('p','workspace-cms-result');
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  const list=h('div','workspace-record-list');
  list.id='workspace-cms-catalog-list';
  const editing=h('div');
  editing.id='workspace-cms-catalog-editor';
  section.append(controls,status,list,editing);
  let ticket=0;
  async function loadRecords(){
   const seq=++ticket;
   list.replaceChildren(empty('Loading protected content drafts…'));
   editing.replaceChildren();
   try{
    const result=await call('/workspace/cms/'+kind+'?propertyId='+encodeURIComponent(property.value));
    if(seq!==ticket)return;
    const entries=Array.isArray(result.items)?result.items:[];
    list.replaceChildren();
    if(!entries.length)list.append(empty('No '+(kind==='blogs'?'blog posts':'products')+' saved for this property. Create a draft below.'));
    for(const item of entries){
     const card=h('article','workspace-record');
     card.dataset.cmsId=item.id;
     append(card,h('span','workspace-record-status',item.status),
      h('h3',null,item.title),h('p','workspace-muted','Revision '+item.revision+' · '+(item.published?'Published':'Private staging draft')));
     if(kind==='blogs'){
      if(item.fields?.excerpt)card.append(h('p','workspace-record-details',item.fields.excerpt));
      recordLine(card,'Linked properties',(item.fields?.propertyIds||[]).map(id=>homeNames[id]||id).join(' · '));
     }else{
      recordLine(card,'SKU',item.fields?.sku);
      recordLine(card,'Draft price',item.fields?.priceCents===null?'Not set':money(item.fields?.priceCents/100));
      recordLine(card,'Notice',String(item.fields?.leadHours??0)+' hours');
     }
     const actions=h('div','workspace-record-actions');
     if(item.status!=='archived'){
      actions.append(action('Edit',()=>showForm(item),''));
      actions.append(action('Preview',()=>showPreview(item.fields||{}),''));
      if(item.status!=='reviewed_preview')actions.append(action('Mark reviewed',()=>updateStatus(item,'reviewed_preview'),''));
      actions.append(action('Archive',async()=>{
       if(!window.confirm('Archive this private staging draft? No public content changes.'))return;
       try{
        const result=await call('/workspace/cms/'+kind+'/'+encodeURIComponent(item.id),'DELETE',{expectedRevision:item.revision});
        if(result.item?.status!=='archived')throw Error('Archive not confirmed by server');
        status.textContent='Archived '+item.title+'. No public content changed.';
        await loadRecords();
       }catch(e){status.textContent='Archive failed: '+e.message}
      },''));
     }
     card.append(actions);list.append(card);
    }
    status.textContent=entries.length+' '+(kind==='blogs'?'blog':'service')+' draft records for '+(homeNames[property.value]||'this home')+'.';
   }catch(e){list.replaceChildren(empty('Could not load CMS records: '+e.message))}
  }
  async function updateStatus(item,next){
   try{
    const response=await call('/workspace/cms/'+kind+'/'+encodeURIComponent(item.id),'PATCH',{expectedRevision:item.revision,status:next});
    if(response.item?.status!==next||response.item?.revision!==item.revision+1)throw Error('Revision not verified');
    await loadRecords();
    status.textContent='Reviewed draft saved for '+item.title+'. No publication.';
   }catch(e){status.textContent='Review failed: '+e.message}
  }
  function showPreview(values){
   const view=h('div','workspace-cms-preview-copy');
   append(view,h('p','kicker','PRIVATE CONTENT PREVIEW — NOT PUBLISHED'),
    h('h3',null,values.title||'Untitled draft'));
   if(kind==='blogs'){
    if(values.excerpt)view.append(h('p',null,values.excerpt));
    const body=h('pre','workspace-cms-markdown',values.bodyMarkdown||'No draft body yet');
    view.append(body);
    view.append(h('p','workspace-muted','Markdown source is displayed safely as text. Publishing and article scheduling are not enabled.'));
   }else{
    view.append(h('p',null,values.details||'No service description'));
    view.append(h('p','workspace-muted','Price: '+(values.priceCents===null||values.priceCents===undefined?'Not set':money(values.priceCents/100))+' · Notice: '+(values.leadHours??0)+' hours.'));
    view.append(h('p','workspace-muted','A draft does not offer or charge this service to any guest.'));
   }
   const preview=h('section','workspace-card workspace-cms-preview');
   preview.id='workspace-cms-record-preview';
   preview.append(view);
   editing.replaceChildren(preview);
   preview.scrollIntoView({block:'nearest',behavior:'auto'});
  }
  function showForm(item){
   const values=item?.fields||{},form=h('form','workspace-form workspace-cms-form');
   form.id='workspace-cms-record-form';
   const heading=h('h3',null,(item?'Edit ':'New ')+(kind==='blogs'?'blog draft':'service draft'));
   form.append(heading,h('p','workspace-muted','All changes stay in isolated staging. Version conflicts require reload.'));
   const input=(label,key,type='text',max=160,required=false,initial='')=>{
    const wrapper=fieldInput(label,key,type,max,required,initial);
    wrapper.querySelector('[name]').id='workspace-cms-record-'+key;
    form.append(wrapper);
    return wrapper.querySelector('[name]');
   };
   const titleInput=input('Title','title','text',160,true,values.title||'');
   const slugInput=input(kind==='blogs'?'Article slug':'Service SKU','slug','text',90,true,
    kind==='blogs'?values.slug||'':values.sku||'');
   slugInput.pattern='[a-z0-9][a-z0-9-]{2,88}[a-z0-9]';
   if(kind==='blogs'){
    input('Excerpt','excerpt','multiline',700,false,values.excerpt||'');
    input('Markdown article','bodyMarkdown','multiline',30000,true,values.bodyMarkdown||'');
    input('SEO title','seoTitle','text',180,false,values.seoTitle||'');
    input('SEO description','seoDescription','multiline',360,false,values.seoDescription||'');
    const fieldset=h('fieldset','workspace-cms-property-links');
    fieldset.append(h('legend',null,'Associate this article with approved properties'));
    for(const p of allowed){
     const label=h('label');
     const check=h('input');check.type='checkbox';check.value=p.id;check.name='associatedProperty';
     check.checked=Array.isArray(values.propertyIds)?values.propertyIds.includes(p.id):p.id===property.value;
     append(label,check,h('span',null,p.name));fieldset.append(label);
    }
    form.append(fieldset);
   }else{
    input('Service description and eligibility','details','multiline',20000,false,values.details||'');
    const usd=input('Draft price in USD (leave blank if not approved)','priceUSD','number',0,false,
     Number.isInteger(values.priceCents)?(values.priceCents/100).toFixed(2):'');
    usd.min='0';usd.max='10000';usd.step='0.01';
    const hours=input('Advance notice required in hours','leadHours','number',0,true,String(values.leadHours??0));
    hours.min='0';hours.max='720';hours.step='1';
    form.append(h('p','workspace-muted','Effective dates, scheduling slots and guest charges require a backend contract before activation.'));
   }
   const buttons=h('div','workspace-form-action');
   const preview=action('Preview draft',()=>{
    const raw=Object.fromEntries(new FormData(form).entries());
    const fields={title:raw.title,details:raw.details,excerpt:raw.excerpt,
     bodyMarkdown:raw.bodyMarkdown,priceCents:raw.priceUSD===''?null:Math.round(Number(raw.priceUSD)*100),
     leadHours:raw.leadHours||0};
    showPreview(fields);
    editing.prepend(form);
   },'workspace-button workspace-reset');
   const cancel=action('Cancel',()=>editing.replaceChildren(),'workspace-button workspace-reset');
   const save=h('button','workspace-button',item?'Save draft changes ↗':'Save new draft ↗');
   save.type='submit';save.id='workspace-cms-record-save';
   buttons.append(preview,cancel,save);form.append(buttons);
   const error=h('p','workspace-cms-result');error.setAttribute('role','status');error.setAttribute('aria-live','polite');form.append(error);
   form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const raw=Object.fromEntries(new FormData(form).entries());
    let payload;
    if(kind==='blogs'){
     const propertyIds=[...form.querySelectorAll('[name=associatedProperty]:checked')].map(x=>x.value);
     if(!propertyIds.length){error.textContent='Associate this blog with at least one property.';return}
     payload={title:raw.title,slug:raw.slug,excerpt:raw.excerpt,bodyMarkdown:raw.bodyMarkdown,
      seoTitle:raw.seoTitle,seoDescription:raw.seoDescription,propertyIds};
    }else{
     const price=raw.priceUSD.trim()===''?null:Number(raw.priceUSD);
     if(price!==null&&(!Number.isFinite(price)||!/^[0-9]+(?:[.][0-9]{1,2})?$/.test(raw.priceUSD.trim()))){
      error.textContent='Price must use cents, or be left blank.';return;
     }
     payload={propertyId:property.value,sku:raw.slug,title:raw.title,details:raw.details,
      priceCents:price===null?null:Math.round(price*100),leadHours:Number(raw.leadHours)};
    }
    save.disabled=true;error.textContent='Saving protected draft…';
    try{
     const endpoint='/workspace/cms/'+kind+(item?'/'+encodeURIComponent(item.id):'');
     const response=await call(endpoint,item?'PATCH':'POST',
      item?{expectedRevision:item.revision,...payload}:payload);
     const saved=response.item;
     if(!saved?.id||!Number.isInteger(saved.revision)||saved.status==='archived')
      throw Error('Backend did not confirm a saved draft');
     const readback=await call('/workspace/cms/'+kind+'/'+encodeURIComponent(saved.id));
     if(readback.item?.revision!==saved.revision||
        readback.item?.fields?.title!==payload.title)
      throw Error('Saved draft database readback did not match');
     await loadRecords();
     status.textContent='Saved '+saved.title+' · revision '+saved.revision+'. Backend readback verified; nothing published.';
     note(status.textContent);
    }catch(e){error.textContent='Could not save: '+e.message;save.disabled=false}
   });
   editing.replaceChildren(form);
   form.scrollIntoView({block:'nearest',behavior:'auto'});
  }
  property.addEventListener('change',()=>{
   const url=new URL(location.href);
   url.searchParams.set('module','listings');
   url.searchParams.set('cms',kind);
   url.searchParams.set('propertyId',property.value);
   history.replaceState(null,'',url.pathname+url.search+url.hash);
   loadRecords();
  });
  await loadRecords();
  return root;
 }


 async function renderSmartRates(){
  const config=await call('/workspace/direct-pricing');
  const root=h('section','workspace-card workspace-rates');
  sectionHeadline(root,'JRNP Smart Rates — owner review',
   'Protected five-home direct-rate planning. Drafts, comparisons and 180-night reviews never publish, change bookings or update Airbnb/Vrbo.');
  const allowed=Array.isArray(config.properties)?config.properties:[];
  if(!allowed.length){root.append(empty('No properties are authorized for rate planning.'));return root}
  const choose=h('select');choose.id='workspace-rates-property';
  for(const home of allowed){const opt=h('option',null,home.name);opt.value=home.id;choose.append(opt)}
  const id=new URLSearchParams(location.search).get('propertyId');
  choose.value=allowed.some(p=>p.id===id)?id:allowed[0].id;
  const feedback=h('p','workspace-cms-result');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  const plansHost=h('div'),compsHost=h('div'),runsHost=h('div');
  plansHost.id='workspace-rates-plans';
  compsHost.id='workspace-rates-comps';
  runsHost.id='workspace-rates-runs';
  root.append(formField('Choose property',choose),feedback);
  const formBox=h('div','workspace-rates-grid');
  const form=h('form','workspace-form workspace-rates-form');
  form.id='workspace-rates-plan-form';
  form.append(h('h3',null,'Owner nightly bounds'));
  form.append(h('p','workspace-muted','Enter your approved bounds. No default rates are assumed. These are drafts only.'));
  function numeric(key,label,initial='',min='0',max='10000',step='0.01'){
   const wrapper=fieldInput(label,key,'number',0,false,initial);
   const input=wrapper.querySelector('[name]');
   input.id='workspace-rates-'+key;input.min=min;input.max=max;input.step=step;
   form.append(wrapper);
   return input;
  }
  const floor=numeric('floorUSD','Nightly floor (USD)','', '25');
  const base=numeric('baseUSD','Nightly base (USD)','', '25');
  const ceiling=numeric('ceilingUSD','Nightly ceiling (USD)','', '25');
  floor.required=base.required=ceiling.required=true;
  const savings=numeric('savings','Guest savings target (%)','0','0','30','1');
  savings.required=true;
  const from=fieldInput('Season start (optional)','startDate','date',0);
  const to=fieldInput('Season end (optional)','endDate','date',0);
  form.append(from,to,fieldInput('Owner notes and rationale','note','multiline',500));
  const actionRow=h('div','workspace-form-action');
  const save=h('button','workspace-button','Save private rate draft ↗');save.type='submit';
  save.id='workspace-rates-save';
  const reset=action('New / clear',()=>{
   form.reset();delete form.dataset.editId;delete form.dataset.revision;
   save.textContent='Save private rate draft ↗';
  },'workspace-button workspace-reset');
  actionRow.append(save,reset);
  form.append(actionRow);
  const localError=h('p','workspace-cms-result');localError.setAttribute('role','status');form.append(localError);
  const right=h('section','workspace-card workspace-rates-evidence');
  right.append(h('h3',null,'Evidence and recommendations'),
   h('p','workspace-muted','The backend requires independent, timely market evidence. Missing observations must never become invented guest prices.'));
  right.append(compsHost,runsHost);
  formBox.append(form,right);
  root.append(formBox);
  root.append(h('h3',null,'Saved owner draft plans'),plansHost);
  let currentSeq=0;
  async function loadRates(){
   const pid=choose.value,seq=++currentSeq;
   plansHost.replaceChildren(empty('Loading scoped pricing plans…'));
   compsHost.replaceChildren(empty('Checking pricing evidence…'));
   runsHost.replaceChildren();
   try{
    const [plans,comps,runs]=await Promise.all([
     call('/workspace/direct-pricing/plans?propertyId='+encodeURIComponent(pid)),
     call('/workspace/direct-pricing/comps?propertyId='+encodeURIComponent(pid)),
     call('/workspace/direct-pricing/runs?propertyId='+encodeURIComponent(pid))
    ]);
    if(seq!==currentSeq||pid!==choose.value)return;
    plansHost.replaceChildren();
    const values=Array.isArray(plans.plans)?plans.plans:[];
    if(!values.length)plansHost.append(empty('No owner rate plan has been saved. Enter host-approved nightly floor/base/ceiling.'));
    for(const item of values){
     const row=h('article','workspace-record');row.dataset.planId=item.id;
     append(row,h('span','workspace-record-status',item.approvalStatus),
      h('h3',null,(item.startDate?'Season '+item.startDate+' to '+item.endDate:'Default nightly bounds')));
     recordLine(row,'Floor / base / ceiling',
      [item.floorNightlyCents,item.baseNightlyCents,item.ceilingNightlyCents].map(n=>money(n/100)).join(' / '));
     recordLine(row,'Savings target',item.targetSavingsPercent+'%');
     recordLine(row,'Revision',item.revision);
     if(item.note)row.append(h('p','workspace-record-details',item.note));
     const actions=h('div','workspace-record-actions');
     if(item.approvalStatus!=='archived_preview'){
      actions.append(action('Edit draft',()=>{
       const data={floorUSD:item.floorNightlyCents/100,baseUSD:item.baseNightlyCents/100,
        ceilingUSD:item.ceilingNightlyCents/100,savings:item.targetSavingsPercent,
        startDate:item.startDate,endDate:item.endDate,note:item.note};
       for(const [key,v] of Object.entries(data)){
        const input=form.querySelector('[name="'+key+'"]');if(input)input.value=v??'';
       }
       form.dataset.editId=item.id;form.dataset.revision=item.revision;
       save.textContent='Save revision '+(item.revision+1)+' ↗';
       form.scrollIntoView({block:'nearest',behavior:'auto'});
      },''));
      if(item.approvalStatus!=='reviewed_preview')actions.append(action('Mark reviewed',async()=>{
       try{
        const res=await call('/workspace/direct-pricing/plans/'+encodeURIComponent(item.id),'PATCH',{
         expectedRevision:item.revision,approvalStatus:'reviewed_preview'});
        if(res.plan?.approvalStatus!=='reviewed_preview')throw Error('Review status not confirmed');
        await loadRates();feedback.textContent='Private pricing plan reviewed. No public or OTA rate change.';
       }catch(e){feedback.textContent='Rate review failed: '+e.message}
      },''));
      actions.append(action('Archive draft',async()=>{
       if(!window.confirm('Archive this private price plan? No live rate changes.'))return;
       try{
        const res=await call('/workspace/direct-pricing/plans/'+encodeURIComponent(item.id),
         'DELETE',{expectedRevision:item.revision});
        if(res.archived!==true)throw Error('Backend archive not confirmed');
        await loadRates();feedback.textContent='Pricing plan archived without provider writes.';
       }catch(e){feedback.textContent='Archive failed: '+e.message}
      },''));
     }
     row.append(actions);plansHost.append(row);
    }
    const evidence=Array.isArray(comps.records)?comps.records:[];
    const fresh=evidence.filter(x=>{
     const age=Date.now()-Date.parse(x.verified_at||'');
     return Number.isFinite(age)&&age>=0&&age<=86400000;
    }).length;
    const heading=h('p','workspace-rates-warning',
     'Recorded market observations: '+evidence.length+' · captured within 24h: '+fresh+
     '. At least 8 distinct, verified comparable listings for a night are required before recommending any rate.');
    compsHost.replaceChildren(heading);
    if(!fresh)compsHost.append(h('p','workspace-muted','No verified fresh comparable rate observations. Owner pricing suggestions must remain ineligible.'));
    for(const item of evidence.slice(0,8)){
     const row=h('p','workspace-record-meta',
      (item.channel||'Source')+' · '+(item.date||'')+' · '+(item.comparable_key||'')+
      ' · verified '+(item.verified_at||'Unknown'));
     compsHost.append(row);
    }
    const savedRuns=Array.isArray(runs.runs)?runs.runs:[];
    const runHead=h('h4',null,'180-night review (private)');
    const runForm=h('form','workspace-rates-run');
    runForm.id='workspace-rates-run-form';
    const now=new Date();
    const tomorrow=new Date(now.getTime()+86400000),end=new Date(tomorrow.getTime()+180*86400000);
    const first=fieldInput('From','startDate','date',0,true,tomorrow.toISOString().slice(0,10));
    const last=fieldInput('Through (checkout/exclusive)','endDate','date',0,true,end.toISOString().slice(0,10));
    const generate=h('button','workspace-button','Calculate review ↗');generate.type='submit';
    runForm.append(first,last,generate);
    runForm.addEventListener('submit',async event=>{
     event.preventDefault();
     const dates=Object.fromEntries(new FormData(runForm).entries());
     generate.disabled=true;
     try{
      const response=await call('/workspace/direct-pricing/runs','POST',{propertyId:choose.value,...dates});
      if(!response.id||response.autoPublish!==false)throw Error('Safe report not confirmed');
      await loadRates();
      feedback.textContent='Internal pricing run recorded: '+response.report.eligibleNights+
       ' eligible nights. Owner approval required. No rates published.';
     }catch(e){feedback.textContent='Could not calculate rate review: '+e.message;generate.disabled=false}
    });
    runsHost.replaceChildren(runHead,runForm);
    for(const item of savedRuns.slice(0,4)){
     const row=h('article','workspace-rates-run-record');
     row.dataset.runId=item.id;
     append(row,h('p','workspace-record-meta',
      item.start_date+' → '+item.end_date+' · '+item.eligible_days+'/'+item.request_days+
      ' eligible nights · '+item.review_status));
     const controls=h('div','workspace-record-actions');
     controls.append(action('View daily review',async()=>{
      try{
       const result=await call('/workspace/direct-pricing/runs/'+encodeURIComponent(item.id));
       const report=result.report||{};
       const days=Array.isArray(report.days)?report.days:[];
       row.querySelector('.workspace-rates-days')?.remove();
       const view=h('div','workspace-rates-days');
       const calendar=h('div','workspace-rates-calendar');
       for(const day of days.slice(0,180)){
        const tile=h('div','workspace-rates-day'+(day.eligible?' is-eligible':' is-insufficient'));
        const proposed=day.eligible&&Number.isInteger(day.suggestedNightlyCents)?
         money(day.suggestedNightlyCents/100):'Not eligible';
        append(tile,h('strong',null,day.date||'Date unknown'),h('span',null,proposed),
         h('small',null,String(day.selectedCompCount||0)+' comps'));
        tile.title=Array.isArray(day.explanation)?day.explanation.join(' / '):'No verified recommendation';
        calendar.append(tile);
       }
       view.append(h('p','workspace-muted',
        'Owner-only daily suggestion calendar. Missing evidence never creates a price.'),calendar);
       row.append(view);
      }catch(e){feedback.textContent='Unable to show review: '+e.message}
     },''));
     if(item.review_status==='pending_review'){
      for(const [decision,label] of [['reviewed_preview','Review'],['rejected_preview','Reject']]){
       controls.append(action(label,async()=>{
        try{
         const resp=await call('/workspace/direct-pricing/runs/'+encodeURIComponent(item.id)+'/review','POST',{
          decision,note:'Owner internal staging review; no public action'});
         if(resp.reviewStatus!==decision)throw Error('Review decision not confirmed');
         await loadRates();feedback.textContent='Internal review recorded; no OTA or public change.';
        }catch(e){feedback.textContent='Review action failed: '+e.message}
       },''));
      }
     }
     row.append(controls);runsHost.append(row);
    }
    feedback.textContent=values.length+' private plan(s), '+savedRuns.length+' review run(s) for '+(homeNames[pid]||pid)+'.';
   }catch(e){plansHost.replaceChildren(empty('Pricing service unavailable: '+e.message))}
  }
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(!form.reportValidity())return;
   const raw=Object.fromEntries(new FormData(form).entries());
   function cents(value){
    if(!/^[0-9]+(?:[.][0-9]{1,2})?$/.test(value))throw Error('Use exact USD and cents for nightly price bounds');
    return Math.round(Number(value)*100);
   }
   let payload;
   try{
    payload={propertyId:choose.value,floorNightlyCents:cents(raw.floorUSD),
     baseNightlyCents:cents(raw.baseUSD),ceilingNightlyCents:cents(raw.ceilingUSD),
     targetSavingsPercent:Number(raw.savings),
     startDate:raw.startDate||'',endDate:raw.endDate||'',note:raw.note||''};
    if(payload.floorNightlyCents>payload.baseNightlyCents||
       payload.baseNightlyCents>payload.ceilingNightlyCents)throw Error('Floor, base and ceiling must be ordered');
    if(!!payload.startDate!==!!payload.endDate)throw Error('Choose both seasonal dates, or neither');
   }catch(e){localError.textContent=e.message;return}
   const editId=form.dataset.editId,revision=Number(form.dataset.revision);
   if(editId){payload.expectedRevision=revision;delete payload.propertyId}
   save.disabled=true;localError.textContent='Saving owner-only pricing draft…';
   try{
    const response=await call('/workspace/direct-pricing/plans'+(editId?'/'+encodeURIComponent(editId):''),
     editId?'PATCH':'POST',payload);
    const plan=response.plan;
    if(!plan?.id||response.liveRatesChanged!==false||response.otaWrites!==false)
     throw Error('Backend did not verify nonpublished rate draft');
    const checked=await call('/workspace/direct-pricing/plans?propertyId='+encodeURIComponent(choose.value));
    if(!checked.plans?.some(p=>p.id===plan.id&&p.revision===plan.revision))
     throw Error('Saved plan revision not found after readback');
    form.reset();delete form.dataset.editId;delete form.dataset.revision;
    save.textContent='Save private rate draft ↗';
    await loadRates();
    feedback.textContent='Owner-only price plan saved at revision '+plan.revision+'. Live rates unchanged.';
    note(feedback.textContent);
   }catch(e){localError.textContent='Unable to save plan: '+e.message}
   finally{save.disabled=false}
  });
  choose.addEventListener('change',()=>{form.reset();delete form.dataset.editId;delete form.dataset.revision;loadRates()});
  await loadRates();
  return root;
 }


 async function renderTemplateManager(){
  const cms=await call('/workspace/cms');
  const allowed=Array.isArray(cms.properties)?cms.properties:[];
  const root=h('section','workspace-card workspace-templates');
  sectionHeadline(root,'Property message templates — private CMS',
   'Edit property-scoped Airbnb, Vrbo, direct and Furnished Finder drafts with revision history. No automatic delivery or guest send occurs.');
  if(!allowed.length){root.append(empty('No authorized properties for message templates.'));return root}
  const property=h('select');property.id='workspace-templates-property';
  for(const home of allowed){const option=h('option',null,home.name);option.value=home.id;property.append(option)}
  const requested=new URLSearchParams(location.search).get('propertyId');
  property.value=allowed.some(x=>x.id===requested)?requested:allowed[0].id;
  const channels=[['direct','Direct booking'],['airbnb','Airbnb'],['vrbo','Vrbo'],['furnished_finder','Furnished Finder']];
  const triggers=[
   ['confirmation','Booking confirmation'],['three_day','Three-day arrival'],
   ['forty_two_hour','42-hour check-in instructions'],['checkin_day','Day-of-arrival'],
   ['checkout','Checkout'],['post_checkout','Post-checkout review'],
   ['request_received','Booking request received'],['long_stay','Long-stay'],
   ['faq','Guest FAQ'],['marketing_draft','Marketing draft']
  ];
  const feedback=h('p','workspace-cms-result');feedback.setAttribute('role','status');
  feedback.setAttribute('aria-live','polite');
  const button=action('New template draft ↗',()=>showEditor(null));
  const top=h('div','workspace-cms-catalog-top');
  top.append(formField('Property',property),button);
  const list=h('div','workspace-record-list');list.id='workspace-templates-records';
  const editor=h('div');editor.id='workspace-templates-editor';
  root.append(top,feedback,list,editor);
  let requestSeq=0;
  async function loadTemplates(){
   const seq=++requestSeq;
   editor.replaceChildren();
   list.replaceChildren(empty('Loading protected templates…'));
   try{
    const result=await call('/workspace/cms/templates?propertyId='+encodeURIComponent(property.value));
    if(seq!==requestSeq)return;
    const records=Array.isArray(result.items)?result.items:[];
    list.replaceChildren();
    if(!records.length)list.append(empty('No templates saved for this home. Import only host-verified original copy.'));
    for(const item of records){
     const card=h('article','workspace-record');card.dataset.templateId=item.id;
     append(card,h('span','workspace-record-status',item.status),h('h3',null,item.title));
     recordLine(card,'Channel',item.fields?.channel);
     recordLine(card,'Trigger',item.fields?.trigger);
     recordLine(card,'Revision',item.revision);
     recordLine(card,'Delivery','DISABLED — draft only');
     if(item.fields?.details)card.append(h('p','workspace-record-details',item.fields.details.slice(0,450)));
     const actions=h('div','workspace-record-actions');
     actions.append(action('Preview',()=>showPreview(item.fields||{}),''));
     if(item.status!=='archived'){
      actions.append(action('Edit',()=>showEditor(item),''));
      if(item.status!=='reviewed_preview')actions.append(action('Mark reviewed',async()=>{
       try{
        const result=await call('/workspace/cms/templates/'+encodeURIComponent(item.id),'PATCH',{
         expectedRevision:item.revision,status:'reviewed_preview'});
        if(result.item?.status!=='reviewed_preview')throw Error('Review state not saved');
        await loadTemplates();feedback.textContent='Template reviewed privately. No message sent.';
       }catch(e){feedback.textContent='Review failed: '+e.message}
      },''));
      actions.append(action('Archive',async()=>{
       if(!window.confirm('Archive this staging template? No guest message will be sent.'))return;
       try{
        const res=await call('/workspace/cms/templates/'+encodeURIComponent(item.id),'DELETE',{
         expectedRevision:item.revision});
        if(res.item?.status!=='archived')throw Error('Backend did not confirm archive');
        await loadTemplates();feedback.textContent='Template archived with no external delivery.';
       }catch(e){feedback.textContent='Archive failed: '+e.message}
      },''));
     }
     card.append(actions);list.append(card);
    }
    feedback.textContent=records.length+' saved private template records · '+homeNames[property.value]+'.';
   }catch(e){list.replaceChildren(empty('Could not load templates: '+e.message))}
  }
  function showPreview(fields){
   const pane=h('section','workspace-card workspace-cms-preview');
   pane.id='workspace-templates-preview';
   append(pane,h('p','kicker','PRIVATE EMAIL/TEMPLATE PREVIEW — DELIVERY DISABLED'),
    h('h3',null,fields.title||'Untitled message'),
    h('p','workspace-muted',(fields.channel||'Channel')+' · '+(fields.trigger||'Trigger')));
   pane.append(h('pre','workspace-cms-markdown',fields.details||'No message copy saved.'));
   editor.replaceChildren(pane);
   pane.scrollIntoView({block:'nearest',behavior:'auto'});
  }
  function showEditor(item){
   const initial=item?.fields||{},form=h('form','workspace-form workspace-templates-form');
   form.id='workspace-templates-form';
   form.append(h('h3',null,item?'Edit lifecycle template':'New lifecycle template'));
   form.append(h('p','workspace-muted','Save versioned staging-only message drafts. Automation and guest delivery are disabled.'));
   const titles=fieldInput('Template title','title','text',160,true,initial.title||'');
   const slug=fieldInput('Template identifier / slug','slug','text',90,true,initial.slug||'');
   const key=slug.querySelector('[name]');key.id='workspace-templates-slug';
   key.pattern='[a-z0-9][a-z0-9-]{2,88}[a-z0-9]';
   form.append(titles,slug);
   form.append(selectField('Channel','channel',channels,initial.channel||'direct'));
   form.append(selectField('Lifecycle trigger','trigger',triggers,initial.trigger||'confirmation'));
   const text=fieldInput('Message body / guest instructions','details','multiline',20000,true,initial.details||'');
   text.querySelector('[name]').id='workspace-templates-details';
   form.append(text);
   const controls=h('div','workspace-form-action');
   const preview=action('Preview safely',()=>{
    const fields=Object.fromEntries(new FormData(form).entries());
    showPreview(fields);
    editor.prepend(form);
   },'workspace-button workspace-reset');
   const cancel=action('Cancel',()=>editor.replaceChildren(),'workspace-button workspace-reset');
   const save=h('button','workspace-button','Save template draft ↗');save.type='submit';
   save.id='workspace-templates-save';
   controls.append(preview,cancel,save);form.append(controls);
   const error=h('p','workspace-cms-result');error.setAttribute('role','status');form.append(error);
   form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const raw=Object.fromEntries(new FormData(form).entries());
    const payload={propertyId:property.value,channel:raw.channel,trigger:raw.trigger,
     slug:raw.slug,title:raw.title,details:raw.details};
    save.disabled=true;error.textContent='Saving protected property template…';
    try{
     const path='/workspace/cms/templates'+(item?'/'+encodeURIComponent(item.id):'');
     const response=await call(path,item?'PATCH':'POST',
      item?{expectedRevision:item.revision,...payload}:payload);
     const stored=response.item;
     if(!stored?.id||!Number.isInteger(stored.revision))throw Error('No saved revision returned');
     const readback=await call('/workspace/cms/templates/'+encodeURIComponent(stored.id));
     if(readback.item?.revision!==stored.revision||readback.item?.fields?.details!==raw.details||
        readback.item?.fields?.channel!==raw.channel)
      throw Error('Template database readback failed');
     if(readback.item.fields.autoSend!==false||readback.item.fields.externalDelivery!==false)
      throw Error('Template delivery security flags changed unexpectedly');
     await loadTemplates();
     feedback.textContent='Version '+stored.revision+' saved and reloaded for '+raw.channel+'. No guest message sent.';
     note(feedback.textContent);
    }catch(e){error.textContent='Template not saved: '+e.message;save.disabled=false}
   });
   editor.replaceChildren(form);
   form.scrollIntoView({block:'nearest',behavior:'auto'});
  }
  property.addEventListener('change',()=>loadTemplates());
  await loadTemplates();
  return root;
 }

 function openEdit(row,bucket){
  const form=panel.querySelector('#workspace-record-form');
  if(!form)return;
  const wrapper=form.closest('.workspace-form-wrap');
  if(wrapper){const heading=wrapper.querySelector('h3');heading.textContent='Editing '+moduleNames[bucket].toLowerCase();}
  for(const input of form.querySelectorAll('[name]')){
   if(Object.hasOwn(row,input.name))input.value=row[input.name]??'';
  }
  form.dataset.editId=row.id;
  const button=form.querySelector('[type=submit]');
  if(button)button.textContent='Save draft changes ↗';
  const clear=form.querySelector('.workspace-reset');
  if(clear)clear.textContent='Cancel edit';
  wrapper.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 function renderMailPreview(){
  const section=h('section','workspace-card');section.style.marginTop='24px';
  sectionHeadline(section,'Preview a guest message','Renders safe sample copy only. No email can be sent from this tool.');
  const form=h('form','workspace-form');form.id='workspace-mail-form';
  append(form,selectField('Email type','type',Object.entries(emailTypes)),
   selectField('Property','propertyId',homes.map(home=>[home.id,home.name])),
   fieldInput('Guest first name','guestFirstName','text',80,true,'Demo'),
   fieldInput('Check-in','checkIn','date',0,true),
   fieldInput('Check-out','checkOut','date',0,true));
  const ci=form.querySelector('[name=checkIn]'),co=form.querySelector('[name=checkOut]');
  const now=new Date(),future=new Date(now.getTime()+90*86400000),after=new Date(now.getTime()+93*86400000);
  ci.value=future.toISOString().slice(0,10);co.value=after.toISOString().slice(0,10);
  const submit=h('button','workspace-button','Generate preview ↗');submit.type='submit';
  const output=h('pre','workspace-preview-output','Select a message and generate a private preview.');form.append(submit);
  form.addEventListener('submit',async ev=>{
   ev.preventDefault();submit.disabled=true;
   try{
    const body=Object.fromEntries(new FormData(form).entries());
    const result=await call('/workspace/mail-preview','POST',body);
    output.textContent=result.subject+'\n\n'+result.text+'\n\n— Preview only. Delivery disabled —';
    note('Message generated privately. No email was sent.');
   }catch(e){output.textContent='Could not prepare template: '+e.message;}
   finally{submit.disabled=false}
  });
  section.append(form,output);
  return section;
 }
 async function renderCalendar(){
  const [requests,tasks]=await Promise.all([call('/requests'),call('/workspace/cleanings')]);
  const root=h('div');
  root.append(empty('Planning view only: dates come from locally saved staging requests and cleaning tasks. This is NOT a live Airbnb/Vrbo/direct availability calendar.'));
  const grid=h('div','workspace-calendar-grid');
  const toolbar=h('div','workspace-calendar-head');
  const label=h('h3');
  append(toolbar,action('← Previous month',()=>{monthOffset--;load()},''),label,
   action('Next month →',()=>{monthOffset++;load()},''));
  root.append(toolbar,grid);
  const anchor=new Date();anchor.setDate(1);anchor.setMonth(anchor.getMonth()+monthOffset);
  const year=anchor.getFullYear(),month=anchor.getMonth();
  label.textContent=anchor.toLocaleString('en-US',{month:'long',year:'numeric'});
  const byDate=new Map();
  const add=(date,msg)=>{
   if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
   if(!byDate.has(date))byDate.set(date,[]);
   byDate.get(date).push(msg);
  };
  for(const req of requests.requests||[]){
   add(req.checkIn,'Arrival: '+(homeNames[req.propertyId]||'JRNP')+' (test)');
   add(req.checkOut,'Checkout: '+(homeNames[req.propertyId]||'JRNP')+' (test)');
  }
  for(const task of tasks.records||[])add(task.dueDate,'Task: '+task.title);
  for(const name of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])grid.append(h('div','workspace-weekday',name));
  const leading=new Date(year,month,1).getDay();
  const count=new Date(year,month+1,0).getDate();
  for(let i=0;i<leading;i++)grid.append(h('div','workspace-calendar-day'));
  for(let day=1;day<=count;day++){
   const iso=year+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
   const entry=h('button','workspace-calendar-day');entry.type='button';
   if(iso===today())entry.dataset.active='true';
   const events=byDate.get(iso)||[];
   entry.append(h('b',null,String(day)));
   if(events.length)entry.append(h('small',null,events.length+' staging event'+(events.length===1?'':'s')));
   entry.title=events.length?events.join('\n'):'No local staging tasks';
   entry.addEventListener('click',()=>{note(events.length?iso+': '+events.join(' | '):iso+': No local staging tasks or test arrivals.')});
   grid.append(entry);
  }
  return root;
 }
 async function renderReports(){
  const [overview,bookings]=await Promise.all([call('/workspace/overview'),call('/requests')]);
  const root=h('div'),records=overview.counts||[],requests=bookings.requests||[];
  const summary=h('div','workspace-metrics');
  append(summary,box('Requests',requests.length),box('Local drafts',records.reduce((s,r)=>s+Number(r.total),0)),
   box('Completed cleaning',records.filter(r=>r.bucket==='cleanings'&&r.status==='complete_preview').reduce((s,r)=>s+Number(r.total),0)),
   box('Live revenue','—','Not connected to production finance'));
  root.append(summary);
  const card=h('div','workspace-card');
  sectionHeadline(card,'Operations by module','Counts reflect staged drafts—not real bookings, delivery or revenue.');
  const max=Math.max(1,...editable.map(key=>records.filter(r=>r.bucket===key).reduce((s,r)=>s+Number(r.total),0)));
  for(const key of editable){
   const val=records.filter(r=>r.bucket===key).reduce((s,r)=>s+Number(r.total),0);
   const line=h('div','workspace-report-row');
   const track=h('div','workspace-report-rail'),bar=h('div','workspace-report-bar');
   bar.style.width=Math.round(val/max*100)+'%';track.append(bar);
   append(line,h('span',null,moduleNames[key]),track,h('strong',null,String(val)));card.append(line);
  }
  card.append(action('Export summary CSV',()=>{
   const rows=[['Module','Staging draft count'],...editable.map(key=>[moduleNames[key],String(records.filter(r=>r.bucket===key).reduce((s,r)=>s+Number(r.total),0))])];
   const csv=rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\n');
   const href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
   const a=document.createElement('a');a.href=href;a.download='jrnp-staging-operations-summary.csv';
   document.body.append(a);a.click();a.remove();URL.revokeObjectURL(href);
   note('Downloaded local staging summary. No guest contact data included.');
  }));
  root.append(card);return root;
 }
 async function renderSystem(){
  const data=await fetch('/api/staging/status',{headers:{Accept:'application/json'},credentials:'same-origin'}).then(x=>x.json());
  const root=h('div','workspace-cards');
  const accessCard=h('section','workspace-card');
  sectionHeadline(accessCard,'Environment status','Actual status returned by the isolated JRNP Next server.');
  for(const [label,val] of [['Staging mode',data.mode],['Test-only database',data.bookingWrites],
   ['Staging writes',data.stagingWritesEnabled?'Enabled locally':'Disabled'],
   ['Payments',data.paymentEnabled?'Active':'Disabled'],
   ['Guest messaging',data.messagingEnabled?'Active':'Disabled']])accessCard.append(h('p','workspace-muted',label+': '+val));
  root.append(accessCard);
  const sec=h('section','workspace-card');
  sectionHeadline(sec,'Access & release','Protected session and deployment boundary.');
  append(sec,h('p','workspace-muted','You can sign out of this protected test workspace. All production payment and guest-send actions remain disabled.'),
   action('Sign out ↗',()=>signOut.click()));
  root.append(sec);
  const links=h('section','workspace-card');
  sectionHeadline(links,'Existing systems','Separate verified source systems—not embedded into the new design.');
  const old=h('a','workspace-button','Open existing secure CMP ↗');
  old.href='/admin-v2/';old.rel='noopener';
  const website=h('a','workspace-button','View guest website ↗');website.href='/jrnp-next/';
  links.append(old,h('p','workspace-muted','Legacy CMP operations are an explicit temporary handoff, not a new-design screen.'),website);
  root.append(links);
  return root;
 }
 window.JRNPDemo.setCallbacks({redraw:()=>load(),notify:note});
 window.JRNPDemo.open=module=>setActive(module);window.JRNPDemo.hostLogin=exitDemo;
 const hashModule=decodeURIComponent(location.hash.replace(/^#/,''));
 const requestedModule=new URLSearchParams(location.search).get('module')||'';
 if(Object.hasOwn(moduleNames,requestedModule))active=requestedModule;
 else if(Object.hasOwn(moduleNames,hashModule))active=hashModule;
 setHeader(active);
 for(const button of nav.querySelectorAll('button[data-module]')){const selected=button.dataset.module===active;button.classList.toggle('active',selected);if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')}
 authenticate();
})();
