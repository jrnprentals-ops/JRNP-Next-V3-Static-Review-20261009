'use strict';
/* JRNP Next demonstrator: synthetic, deterministic, memory-only. No API, persistence or external actions. */
(()=>{
 const names={overview:'Overview',bookings:'Booking requests',calendar:'Calendar & turnovers',cleanings:'Cleaning & costs',messages:'Guest messaging',listings:'Listings & photos',pricing:'Pricing proposals',guides:'Guest guides',reviews:'Reviews',ai:'AI drafting',automation:'Automations',reports:'Reports & insights',system:'System & access'};
 const homes=[
  {id:'family',name:'Stylish & Perfect for Families',area:'Phoenix · 4 bedrooms · sleeps 8',image:'loma-linda',url:'phoenix-family-vacation-rental.html'},
  {id:'ensuite',name:'Modern All-En-Suite Home',area:'Phoenix · 3 en-suite bedrooms · sleeps 6',image:'mitchell-en-suite',url:'phoenix-en-suite-vacation-home.html'},
  {id:'lake',name:'Weiss Lake House with Private Dock',area:'Cedar Bluff · 3 bedrooms · sleeps 6',image:'weiss-lake',url:'weiss-lake-private-dock-vacation-home.html'},
  {id:'studio',name:'Detached Studio Guesthouse',area:'Phoenix · full kitchen · sleeps 2',image:'mitchell-studio',url:'phoenix-detached-studio-guesthouse.html'},
  {id:'pool',name:'Palm Haven Pool House',area:'Phoenix · unheated private pool · sleeps 2',image:'palm-haven-clean',url:'phoenix-private-pool-house.html'}
 ];
 const seed=()=>({
  bookings:[
   {id:1,title:'Sample inquiry A',property:'family',details:'Oct 22 – Oct 26, 2026 · 4 guests · requests arrival guidance',status:'New · sample'},
   {id:2,title:'Sample inquiry B',property:'lake',details:'Nov 12 – Nov 15, 2026 · 3 guests · asks about changing lake levels',status:'Review · sample'},
   {id:3,title:'Sample inquiry C',property:'studio',details:'Dec 4 – Dec 7, 2026 · 2 guests · awaiting dates',status:'New · sample'}
  ],
  cleanings:[
   {id:4,title:'Mock departure turnover',property:'family',details:'Oct 26 · kitchen, baths, linens, photo check',status:'Scheduled · sample'},
   {id:5,title:'Mock lake-house inspection',property:'lake',details:'Nov 15 · dock safety and patio review',status:'To do · sample'}
  ],
  messages:[
   {id:6,title:'Arrival guide draft',property:'family',details:'Hello Sample Guest, check-in starts at 4 PM. Your confirmed arrival instructions will be supplied securely.',status:'Draft · not sent'},
   {id:7,title:'Dock guidance draft',property:'lake',details:'Hello Sample Guest, please verify current Weiss Lake conditions before boating.',status:'Needs review'}
  ],
  pricing:[{id:8,title:'Sample weekday rate review',property:'ensuite',details:'Illustrative proposal only: compare verified rates across channels before host approval.',status:'Not approved'}],
  guides:[{id:9,title:'Sample arrival guide',property:'pool',details:'Private pool is not heated. Spa requests require JRNP written approval in advance.',status:'Draft · sample'}],
  reviews:[{id:10,title:'Sample guest feedback (invented)',property:'studio',details:'The private entry and kitchen made our stay convenient.',status:'Response needed'}],
  ai:[{id:11,title:'Sample concierge draft',property:'family',details:'Thanks for your question! We can review options and confirm details before your stay.',status:'Draft · not sent'}],
  automation:[{id:12,title:'Arrival-message preview',property:'family',details:'Hypothetical 42-hour arrival reminder. No delivery provider attached.',status:'Disabled · sample'},{id:13,title:'Cleaning reminder preview',property:'lake',details:'Hypothetical local-turnover alert. No schedules triggered.',status:'Disabled · sample'}],
  turnovers:[{id:14,title:'Departure checklist',property:'ensuite',details:'Oct 25 · inspect three en-suite bathrooms',status:'Planned · sample'}],
  listingNotes:{},eventLog:[],serial:20,offset:0
 });
 let state=seed(),redraw=()=>{},notify=()=>{};
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e};
 const add=(node,...children)=>{for(const child of children)if(child)node.append(child);return node};
 const btn=(label,fn,cls='workspace-button')=>{const b=el('button',cls,label);b.type='button';b.addEventListener('click',fn);return b};
 const para=(text,cls='workspace-muted')=>el('p',cls,text);
 const card=(title,details,eyebrow='SAMPLE WORKFLOW')=>add(el('article','workspace-card'),para(eyebrow,'kicker'),el('h3',null,title),para(details));
 const metric=(label,count,explanation)=>add(el('div','workspace-metric'),el('span',null,label),el('strong',null,count),el('small',null,explanation));
 const home=id=>homes.find(h=>h.id===id)||homes[0];
 const field=(label,name,value='',kind='text')=>{const wrapper=el('label','workspace-field');const control=el(kind==='textarea'?'textarea':'input');if(kind!=='textarea')control.type=kind;control.name=name;control.value=value;control.maxLength=kind==='textarea'?1200:140;add(wrapper,el('span',null,label),control);return wrapper};
 const select=(label,name,options)=>{const wrapper=el('label','workspace-field'),s=el('select');s.name=name;for(const [value,text] of options){const opt=el('option',null,text);opt.value=value;s.append(opt)}add(wrapper,el('span',null,label),s);return wrapper};
 const properties=()=>homes.map(h=>[h.id,h.name]);
 function done(message){notify(message);redraw()}
 function sampleTag(parent){parent.prepend(para('ILLUSTRATIVE SAMPLE · NO LIVE DATA OR ACTIONS','workspace-demo-tag'));return parent}
 function records(bucket,config={}){
  const root=el('div'),rows=state[bucket]||[];
  const toolbar=add(el('div','workspace-demo-tools'),para(config.intro||'All examples are invented and remain only in this browser tab.'));
  const search=el('input');search.type='search';search.placeholder='Filter sample records';search.setAttribute('aria-label','Filter sample records');toolbar.append(search);
  root.append(toolbar);
  const layout=el('div','workspace-record-layout'),list=el('div','workspace-record-list');
  function drawList(){
   list.replaceChildren();
   const q=search.value.toLowerCase();
   for(const row of rows.filter(r=>[r.title,r.details,home(r.property).name,r.status].join(' ').toLowerCase().includes(q))){
    const item=add(el('article','workspace-record workspace-demo-record'),
     para('SAMPLE · '+row.status,'workspace-record-status'),el('h3',null,row.title),
     para(home(row.property).name+' · '+row.details,'workspace-record-details'));
    const actions=el('div','workspace-record-actions');
    actions.append(btn(config.advanceLabel||'Advance sample status',()=>{
     const next=config.status||'Reviewed · sample';row.status=next;done('Sample status changed locally. Nothing was submitted.');
    },''));
    actions.append(btn('Edit sample',()=>{
     form.elements.title.value=row.title;form.elements.property.value=row.property;form.elements.details.value=row.details;form.dataset.editId=String(row.id);
     form.querySelector('[type=submit]').textContent='Save sample changes';
     form.scrollIntoView({block:'nearest'});
    },''));
    actions.append(btn('Remove sample',()=>{state[bucket]=state[bucket].filter(r=>r.id!==row.id);done('Sample removed locally.');},''));
    item.append(actions);list.append(item);
   }
   if(!list.childElementCount)list.append(para('No matching sample records. Change the filter or create a practice item.','workspace-empty'));
  }
  const wrap=add(el('aside','workspace-form-wrap'),para('PRACTICE EDITOR · NO PERSISTENCE','kicker'),el('h3',null,config.formTitle||'New sample '+names[bucket].toLowerCase()));
  const form=el('form','workspace-form');
  add(form,field(config.titleLabel||'Practice item title','title'),select('Property','property',properties()),field(config.detailsLabel||'Notes / details','details','','textarea'));
  if(bucket==='bookings'){form.append(field('Arrival date (illustrative)','arrival','2026-11-12','date'),field('Departure date (illustrative)','departure','2026-11-15','date'),field('Guests','guests','2','number'))}
  if(bucket==='pricing')form.append(field('Hypothetical proposal in USD (not a rate)','amount','173','number'),field('Practice comparison source','source','Unverified example'));
  if(bucket==='cleanings')form.append(field('Illustrative cleaning cost (USD)','cost','137','number'),field('Checklist due date','dueDate','2026-10-26','date'));
  if(bucket==='guides')form.append(select('Guide topic','topic',[['arrival','Arrival'],['parking','Parking'],['amenities','Amenities'],['local','Neighborhood suggestions']]));
  if(bucket==='reviews')form.append(select('Practice feedback channel','channel',[['direct','Direct'],['airbnb','Airbnb'],['vrbo','Vrbo']]));
  if(bucket==='messages')form.append(select('Lifecycle draft type','template',[['confirmation','Request acknowledged'],['seven_day','7-day reminder'],['three_day','3-day guide'],['arrival','Check-in day'],['checkout','Checkout'],['post','Review follow-up']]));
  const submit=el('button','workspace-button','Add sample');submit.type='submit';form.append(submit);
  form.append(btn('Clear editor',()=>{form.reset();delete form.dataset.editId;submit.textContent='Add sample'},'workspace-button workspace-reset'));
  form.addEventListener('submit',event=>{
   event.preventDefault();const values=Object.fromEntries(new FormData(form).entries());
   if(!values.title.trim()||!values.details.trim()){notify('Enter a title and description to add a sample.');return}
   if(bucket==='bookings'&&(!values.arrival||!values.departure||values.arrival>=values.departure)){notify('Use an illustrative checkout after arrival.');return}
   if(bucket==='pricing'&&(!Number.isFinite(Number(values.amount))||Number(values.amount)<0)){notify('Enter a nonnegative illustrative amount.');return}
   const details=bucket==='bookings'?values.arrival+' – '+values.departure+' · '+values.guests+' guests · '+values.details:
    bucket==='pricing'?'Hypothetical $'+values.amount+' · source: '+values.source+' · '+values.details:
    bucket==='cleanings'?'Illustrative $'+values.cost+' · due '+values.dueDate+' · '+values.details:
    bucket==='guides'?'Topic '+values.topic+' · '+values.details:
    bucket==='reviews'?'Sample '+values.channel+' feedback · '+values.details:
    bucket==='messages'?'Draft type '+values.template+' · '+values.details:values.details;
   const editing=rows.find(x=>String(x.id)===form.dataset.editId);
   if(editing)Object.assign(editing,{title:values.title,property:values.property,details});
   else rows.unshift({id:++state.serial,title:values.title,property:values.property,details,status:'Draft · sample'});
   form.reset();delete form.dataset.editId;done('Practice record '+(editing?'updated':'added')+' locally. No guest, system or provider contacted.');
  });
  wrap.append(form);layout.append(list,wrap);root.append(layout);search.addEventListener('input',drawList);drawList();return root;
 }
 function overview(){
  const root=el('div'),metrics=el('div','workspace-metrics');
  add(metrics,metric('Illustrative inquiries',state.bookings.length,'Fictional, not reservations'),metric('Turnover samples',state.cleanings.length+state.turnovers.length,'No actual cleaning assigned'),metric('Practice drafts',state.messages.length+state.ai.length+state.guides.length,'Not sent or published'),metric('Real provider actions','0','Always disabled in demo'));
  root.append(metrics);
  const gallery=el('div','workspace-property-grid');
  for(const p of homes){const item=el('div','workspace-property');
   const image=el('img');image.src='/assets/images/'+p.image+'/cover.jpg';image.alt=p.name+' original property photograph';image.loading='lazy';
   add(item,image,para(p.name),el('small',null,p.area));gallery.append(item)}
  root.append(gallery);
  const grid=el('div','workspace-cards');
  for(const id of ['bookings','calendar','messages','cleanings','reports','system']){const c=card(names[id],'Browse '+names[id].toLowerCase()+' with made-up records and safely reversible actions.');c.append(btn('Explore module ↗',()=>window.JRNPDemo.open(id)));grid.append(c)}
  root.append(grid);return root;
 }
 function messagePreview(){
  const root=card('Preview lifecycle message copy','All guest names and schedules are invented. There is no send button, inbox, automation provider, or connection to an external messaging platform.','OFFLINE PRACTICE · NEVER SENT');
  const templates=[
   ['confirmation','Request acknowledgement','We received your inquiry; it is not a confirmed reservation.'],
   ['seven','7-day reminder','Please review your upcoming stay details with the host.'],
   ['three','3-day arrival guide','Your confirmed arrival guide will be shared securely before your stay.'],
   ['forty-two','42-hour arrival details','Please review confirmed access and parking instructions in your secure guest guide.'],
   ['day','Arrival-day reminder','Check-in begins at 4 PM. If arriving after 10 PM, please let us know.'],
   ['checkout','Departure message','Checkout is by 10 AM. Thank you for staying with JRNP.'],
   ['post','Post-stay review request','Thank you for staying with us. We would appreciate a review.']
  ];
  const form=el('form','workspace-form');
  add(form,select('Template','template',templates.map(t=>[t[0],t[1]])),select('Home','home',properties()),field('Practice guest name','guest','Sample Guest'));
  const output=el('pre','workspace-preview-output','Choose a lifecycle stage to view a safe mock message.');
  const b=el('button','workspace-button','Preview sample message');b.type='submit';
  form.append(b);
  form.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(form).entries());const item=templates.find(t=>t[0]===v.template)||templates[0];output.textContent='Subject: '+item[1]+' · SAMPLE\n\nHello '+(v.guest||'Sample Guest')+',\n\n'+item[2]+'\n\n'+home(v.home).name+'\nNicholas & Jose — JRNP Rentals\n\n[SAMPLE ONLY · NOT SENT]';notify('Rendered an offline lifecycle example. No email or booking provider called.');});
  root.append(form,output);
  return root;
 }
 function calendar(){
  const root=el('div');root.append(para('All dates below illustrate scheduling. They do not show Airbnb, Vrbo or direct-booking availability.','workspace-empty'));
  const head=el('div','workspace-calendar-head'),label=el('h3');
  add(head,btn('← Previous',()=>{state.offset--;done('Changed demo month.');},''),label,btn('Next →',()=>{state.offset++;done('Changed demo month.');},''));root.append(head);
  const dt=new Date(Date.UTC(2026,9+state.offset,1)),year=dt.getUTCFullYear(),month=dt.getUTCMonth();
  label.textContent=dt.toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
  const grid=el('div','workspace-calendar-grid');
  for(const name of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])grid.append(el('div','workspace-weekday',name));
  for(let i=0;i<dt.getUTCDay();i++)grid.append(el('div','workspace-calendar-day'));
  const days=new Date(Date.UTC(year,month+1,0)).getUTCDate();
  for(let day=1;day<=days;day++){const b=btn(String(day),()=>{
    document.getElementById('demo-day-info').textContent='Selected '+day+' '+label.textContent+'. Demonstration only—no calendar or provider event created.';
   },'workspace-calendar-day');
   b.append(el('small',null,(day===22||day===26||day===15)?'Sample · '+(day===22?'arrival':day===26?'cleaning':'checklist'):'Select date'));grid.append(b)}
  root.append(grid,para('Select a day to inspect it.','workspace-empty'));root.lastChild.id='demo-day-info';
  const turnover=card('Plan a hypothetical turnover','Create, edit or review sample checklists without creating a real calendar event.');
  turnover.append(records('turnovers',{formTitle:'New turnover checklist',advanceLabel:'Mark practice complete',status:'Complete · sample'}));
  root.append(turnover);return root;
 }
 function listings(){
  const root=el('div','workspace-property-grid');
  for(const p of homes){const c=el('article','workspace-property');
   const photo=el('img');photo.src='/assets/images/'+p.image+'/cover.jpg';photo.alt=p.name+' listing cover photo';photo.loading='lazy';
   add(c,photo,para(p.name),el('small',null,p.area));
   const box=el('div','workspace-demo-property-actions');
   const checkbox=el('input');checkbox.type='checkbox';checkbox.checked=!!state.listingNotes[p.id];checkbox.id='demo-photo-'+p.id;
   const l=el('label');l.htmlFor=checkbox.id;l.append(checkbox,document.createTextNode(' Sample photo checklist reviewed'));
   checkbox.addEventListener('change',()=>{state.listingNotes[p.id]=checkbox.checked;notify('Only the local sample checklist changed.')});
   const link=el('a','workspace-button','View guest listing ↗');link.href='/jrnp-next/'+p.url;
   add(box,l,link);c.append(box);root.append(c)}
  const parent=el('div');parent.append(root,para('Original property photos are displayed; checklist progress is fictional and stored in memory only.'));return parent;
 }
 function ai(){
  const root=el('div','workspace-record-layout');
  const history=add(el('div','workspace-record-list'),card('Example output (not an AI service)','No model or guest-message provider is called. The template is generated locally from fixed, editable sample text.'));
  const wrap=add(el('aside','workspace-form-wrap'),para('OFFLINE SAMPLE WRITER','kicker'),el('h3',null,'Draft an example reply'));
  const form=el('form','workspace-form');
  add(form,select('Home','property',properties()),select('Situation','intent',[['arrival','Arrival question'],['early','Early check-in'],['dock','Dock conditions'],['pool','Spa or pool']]),select('Voice','tone',[['warm','Warm'],['brief','Concise']]),field('Optional context (fake details only)','context','','textarea'));
  const output=el('textarea');output.readOnly=true;output.rows=9;output.setAttribute('aria-label','Sample generated draft');output.placeholder='Generate a sample to see copy here.';
  const generate=el('button','workspace-button','Create offline example');generate.type='submit';
  form.append(generate);
  form.addEventListener('submit',e=>{e.preventDefault();const values=Object.fromEntries(new FormData(form).entries());const phrases={arrival:'Check-in begins at 4 PM. The confirmed arrival guide is provided securely.',early:'Early check-in may be considered by the host; it is not guaranteed.',dock:'Weiss Lake levels vary seasonally. Please check official current water information.',pool:'The pool is unheated, and spa use requires advance written host approval.'};
   output.value=(values.tone==='warm'?'Hello Sample Guest,\n\nThank you for reaching out. ':'Hello Sample Guest,\n\n')+phrases[values.intent]+'\n\n'+(values.context?'Sample context for editing: '+values.context+'\n\n':'')+'Nicholas & Jose — JRNP Rentals\n\n[SAMPLE — NOT SENT]';notify('Offline sample draft generated. No AI/API was called.');
  });
  wrap.append(form,output,btn('Save into demo drafts',()=>{if(!output.value.trim()){notify('Generate a sample first.');return}state.ai.unshift({id:++state.serial,title:'Offline sample reply',property:form.elements.property.value,details:output.value,status:'Draft · not sent'});done('Saved an in-memory AI example.');}));
  root.append(history,wrap);const container=el('div');container.append(root,records('ai',{formTitle:'Edit saved sample drafts'}));return container;
 }
 function automation(){
  const root=el('div','workspace-cards');
  for(const item of state.automation){const c=card(item.title,item.details,item.status);
   const toggle=el('input');toggle.type='checkbox';toggle.checked=item.status.startsWith('Enabled');
   toggle.setAttribute('aria-label','Toggle hypothetical '+item.title);
   toggle.addEventListener('change',()=>{item.status=toggle.checked?'Enabled in demo only':'Disabled · sample';notify('The sample toggle changed. No automation was scheduled.');});
   const line=el('label','workspace-demo-switch');line.append(toggle,document.createTextNode(' Turn on illustrative preview'));
   c.append(line,btn('Simulate a run',()=>{state.eventLog.unshift('Mock run: '+item.title+' · no external requests');done('One simulated local event added. No messages, schedules or jobs ran.');}));
   root.append(c)}
  const log=card('Local simulation log',state.eventLog.length?state.eventLog.join(' | '):'No simulated events yet.');log.append(btn('Clear simulation log',()=>{state.eventLog=[];done('Practice activity cleared.')}));const container=el('div');container.append(root,log);return container;
 }
 function reports(){
  const root=el('div'),metrics=el('div','workspace-metrics');for(const [key,label] of [['bookings','Sample inquiries'],['cleanings','Cleaning examples'],['messages','Message drafts'],['guides','Guide drafts']])metrics.append(metric(label,state[key].length,'Synthetic records only'));
  root.append(metrics);const report=card('Illustrative operations by module','Counts update as you edit or remove sample items. These are not bookings, live reviews or financial performance.');
  const data=['bookings','cleanings','messages','pricing','guides','reviews','ai','automation'];
  for(const key of data){const line=el('div','workspace-report-row'),track=el('div','workspace-report-rail'),bar=el('div','workspace-report-bar');
   bar.style.width=Math.round(state[key].length/Math.max(1,...data.map(k=>state[k].length))*100)+'%';track.append(bar);add(line,el('span',null,names[key]),track,el('strong',null,state[key].length));report.append(line)}
  report.append(btn('Export sample-only CSV',()=>{const csv='Sample module,Count\n'+data.map(k=>names[k]+','+state[k].length).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=el('a');a.href=url;a.download='jrnp-DEMO-SAMPLE-counts.csv';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);notify('Downloaded sample counts only. No guest data.');}));
  const wrapper=el('div','workspace-demo-table-wrap'),table=el('table','workspace-demo-table'),caption=el('caption',null,'Synthetic workload table — sample data only');
  const head=el('thead'),header=el('tr');for(const label of ['Practice module','Sample records','External actions']){const cell=el('th',null,label);cell.scope='col';header.append(cell)}
  head.append(header);table.append(caption,head);
  const body=el('tbody');for(const key of data){const tr=el('tr');for(const value of [names[key],String(state[key].length),'Disabled'])tr.append(el('td',null,value));body.append(tr)}
  table.append(body);wrapper.append(table);root.append(report,wrapper);return root;
 }
 function system(){
  const root=el('div','workspace-cards');
  const a=card('Your environment','Synthetic demo. State exists only in browser memory and resets on page reload.','DEMO · NO SESSION REQUIRED');
  a.append(btn('Reset all demo records',()=>{state=seed();done('All fictional data reset to default examples.');}));
  const b=card('Secure host access','The actual staging Command Center remains protected by server authentication and CSRF checks. The demo does not bypass these checks.','AUTHENTICATION REQUIRED');
  b.append(btn('Go to protected login',()=>window.JRNPDemo.hostLogin()));
  const c=card('Unavailable in demonstration','Real reservation acceptance, provider sends, OTA sync, payments, real prices, persistence, password reset and deployment are intentionally not available.','PRODUCTION ACTIONS DISABLED');
  const d=card('Explore the guest site','Visit the original-photo collection and individual property pages.','PUBLIC STAGING');
  const link=el('a','workspace-button','Open guest collection ↗');link.href='/jrnp-next/';d.append(link);
  root.append(a,b,c,d);return root;
 }
 function render(module){
  let result;
  switch(module){
   case 'overview':result=overview();break;
   case 'calendar':result=calendar();break;
   case 'messages':result=records('messages',{intro:'Sample lifecycle drafts only; no send access.',formTitle:'Create a lifecycle draft',advanceLabel:'Mark draft reviewed',status:'Reviewed · not sent'});result.append(messagePreview());break;
   case 'listings':result=listings();break;
   case 'ai':result=ai();break;
   case 'automation':result=automation();break;
   case 'reports':result=reports();break;
   case 'system':result=system();break;
   default:result=records(module,{
    bookings:{intro:'Fictional travelers only; no booking requests submitted.',titleLabel:'Sample inquiry label',formTitle:'Try a sample booking request',advanceLabel:'Mark mock inquiry reviewed',status:'Reviewed · sample'},
    cleanings:{intro:'Invented turnover checklists; no cleaners dispatched.',formTitle:'New cleaning task',advanceLabel:'Mark task done in demo',status:'Complete · sample'},
    messages:{intro:'Template drafts remain local. Send is intentionally unavailable.',formTitle:'New message draft',advanceLabel:'Mark for sample review',status:'Reviewed · not sent'},
    pricing:{intro:'Hypothetical scenarios—not actual JRNP nightly rates or live offers.',formTitle:'New illustrative pricing proposal',advanceLabel:'Mark proposal for review',status:'Needs approval'},
    guides:{intro:'Practice guide copy only. Private Wi-Fi, access codes and guest instructions are never included.',formTitle:'New guide section'},
    reviews:{intro:'All feedback is invented. Public replies cannot be posted.',formTitle:'Compose a response draft',advanceLabel:'Mark response as reviewed',status:'Reviewed · not published'}
   }[module]||{});break;
  }
  return sampleTag(add(el('section','workspace-demo'),result));
 }
 window.JRNPDemo={render,setCallbacks:(callbacks)=>{redraw=callbacks.redraw;notify=callbacks.notify},open:()=>{},hostLogin:()=>{},reset:()=>{state=seed()}};
})();
