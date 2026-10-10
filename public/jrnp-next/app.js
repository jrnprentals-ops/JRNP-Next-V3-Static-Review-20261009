'use strict';
/* Shared new-design navigation and date-input accessibility. Finder logic has one owner: finder-live.js. */
(() => {
  const toggle=document.querySelector('.menu-toggle');
  const menu=document.querySelector('#mobile-menu');
  if(toggle&&menu){
    toggle.addEventListener('click',()=>{
      const expanded=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!expanded));
      menu.hidden=expanded;
      toggle.textContent=expanded?'Menu ☰':'Close ×';
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      menu.hidden=true;
      toggle.setAttribute('aria-expanded','false');
      toggle.textContent='Menu ☰';
    }));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&!menu.hidden){
        menu.hidden=true;
        toggle.setAttribute('aria-expanded','false');
        toggle.focus();
      }
    });
  }
  const form=document.getElementById('stay-search');
  if(form){
    const checkIn=document.getElementById('stay-in');
    const checkOut=document.getElementById('stay-out');
    const today=new Date();
    const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
    checkIn.min=localToday;
    checkOut.min=localToday;
    checkIn.addEventListener('change',()=>{
      checkOut.min=checkIn.value||localToday;
      if(checkOut.value&&checkOut.value<=checkIn.value)checkOut.value='';
    });
    // Do not attach a second submit handler here: finder-live.js owns filtering and quotes.
  }
  document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{
    img.classList.add('photo-error');
    img.alt='Property photo currently unavailable';
  },{once:true}));
  // Handwritten gold accents: hover/focus on desktop; automatic reveal in view on touch screens.
  const inkSelector='.intro-section h2 em,.section-heading h2 em,.finder-heading h2 em,.destinations h2 em,.closing h2 em,.footer-invite h2 em,.how-intro h2 em,.footer-host-signoff em,.hosts-intro h2 em,.property-script';
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const inkNodes=[...document.querySelectorAll(inkSelector)];
  if(!reducedMotion){
    const touchTriggers=new Map();
    const reveal=node=>node.classList.add('jrnp-ink-visible');
    for(const node of inkNodes){
      const trigger=node.closest('.property-card,.hosts-intro,.footer-invite,.section-heading,.finder-heading,.intro-grid,.destinations,.closing')||node.parentElement;
      if(!trigger)continue;
      node.classList.add('jrnp-ink-ready');
      if(finePointer){
        trigger.addEventListener('pointerenter',()=>reveal(node),{once:true});
        trigger.addEventListener('focusin',()=>reveal(node),{once:true});
      }else{
        if(!touchTriggers.has(trigger))touchTriggers.set(trigger,[]);
        touchTriggers.get(trigger).push(node);
      }
    }
    if(!finePointer){
      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver(entries=>{
          for(const entry of entries){
            if(!entry.isIntersecting)continue;
            for(const node of touchTriggers.get(entry.target)||[])reveal(node);
            observer.unobserve(entry.target);
          }
        },{threshold:.05,rootMargin:'0px 0px 60px 0px'});
        touchTriggers.forEach((value,trigger)=>observer.observe(trigger));
      }else{
        for(const nodes of touchTriggers.values())nodes.forEach(reveal);
      }
    }
  }
  // Authentic original-photo rotation, 15 seconds per visible hero or property card.
  // Source names reference only the verified JRNP Next property JPGs (no generated imagery).
  const photoCollections={
    family:[
      ['/assets/images/loma-linda/cover.jpg','Open living room at Stylish & Perfect for Families'],
      ['/assets/images/loma-linda/11.jpg','White kitchen with breakfast island at the Phoenix family home'],
      ['/assets/images/loma-linda/6.jpg','Sunny queen bedroom at the Phoenix family vacation home']
    ],
    ensuite:[
      ['/assets/images/mitchell-en-suite/15.jpg','Open living room at Modern All-En-Suite Home'],
      ['/assets/images/mitchell-en-suite/16.jpg','Modern kitchen and dining area at the all-en-suite home'],
      ['/assets/images/mitchell-en-suite/10.jpg','Private bedroom suite at Modern All-En-Suite Home']
    ],
    pool:[
      ['/assets/images/palm-haven-clean/6.jpg','Private pool and Baja shelf at Palm Haven Pool House'],
      ['/assets/images/palm-haven-clean/cover.jpg','Pool house kitchenette opening to the patio'],
      ['/assets/images/palm-haven-clean/16.jpg','Queen sleeping area at Palm Haven Pool House']
    ],
    studio:[
      ['/assets/images/mitchell-studio/10.jpg','Open-plan living room and queen sleeping area at the Detached Studio Guesthouse'],
      ['/assets/images/mitchell-studio/5.jpg','Full kitchen with stove, oven and refrigerator at Detached Studio'],
      ['/assets/images/mitchell-studio/9.jpg','Queen bed at Detached Studio Guesthouse']
    ],
    lake:[
      ['/assets/images/weiss-lake/5.jpg','Sunset by the private Weiss Lake dock'],
      ['/assets/images/weiss-lake/2.jpg','Vaulted living room in the Weiss Lake home'],
      ['/assets/images/weiss-lake/15.jpg','Covered outdoor dining area at Weiss Lake House']
    ]
  };
  const showcaseOrder=['family','ensuite','pool','studio','lake'];
  const cardStates=[];
  function setPhoto(state,index){
    state.index=index;
    state.image.src=state.frames[index][0];
    state.image.alt=state.frames[index][1];
    state.image.dataset.currentFrame=String(index);
    if(state.isMain){
      try{sessionStorage.setItem('jrnp-home-hero-photo',String(index))}catch(e){}
      const counter=document.querySelector('.hero-index span');
      if(counter)counter.textContent=String(showcaseOrder.indexOf(state.frames[index][2])+1).padStart(2,'0')+' / 05';
      try{window.sessionStorage.setItem('jrnp-next-hero-position',String(index))}catch(error){/* Storage can be disabled; animation still works. */}
    }
  }
  function nextInitialHeroIndex(){
    try{
      const saved=window.sessionStorage.getItem('jrnp-next-hero-position');
      const n=saved===null?NaN:Number(saved);
      if(Number.isInteger(n)&&n>=0&&n<showcaseOrder.length)return (n+1)%showcaseOrder.length;
    }catch(error){/* Allow private-browsing environments without storage. */}
    return Math.floor(Math.random()*showcaseOrder.length);
  }
  const mainHero=document.querySelector('.hero-photo img');
  if(mainHero){
    const frames=showcaseOrder.map(key=>[photoCollections[key][0][0],photoCollections[key][0][1],key]);
    const state={image:mainHero,frames,index:0,loading:false,isMain:true};
    let previous=-1;
    try{const remembered=sessionStorage.getItem('jrnp-home-hero-photo');if(remembered!==null)previous=Number(remembered)}catch(e){}
    const initial=Number.isInteger(previous)&&previous>=0&&previous<frames.length?(previous+1)%frames.length:Math.floor(Math.random()*frames.length);
    setPhoto(state,reducedMotion?0:initial);
    cardStates.push(state);
  }
  for(const key of showcaseOrder){
    const link=document.querySelector('.property-card[data-property="'+key+'"]');
    const img=link?.querySelector('.property-image img');
    if(!img)continue;
    const state={image:img,frames:photoCollections[key],index:0,loading:false,isMain:false};
    setPhoto(state,0);
    cardStates.push(state);
  }
  function photoIsVisible(img){
    const box=img.getBoundingClientRect();
    return box.bottom>0&&box.top<window.innerHeight&&box.width>0&&!document.hidden;
  }
  function advancePhoto(state){
    if(state.loading||!photoIsVisible(state.image))return;
    const next=(state.index+1)%state.frames.length;
    const target=state.frames[next];
    state.loading=true;
    const preload=new Image();
    preload.decoding='async';
    preload.onload=()=>{
      if(!state.image.isConnected){state.loading=false;return}
      const fade=document.createElement('img');
      fade.className='jrnp-photo-next';
      fade.src=target[0];
      fade.alt='';
      fade.setAttribute('aria-hidden','true');
      state.image.parentElement.appendChild(fade);
      window.requestAnimationFrame(()=>fade.classList.add('is-visible'));
      window.setTimeout(()=>{setPhoto(state,next);fade.remove();state.loading=false},850);
    };
    preload.onerror=()=>{state.loading=false};
    preload.src=target[0];
  }
  if(!reducedMotion&&cardStates.length){
    window.setInterval(()=>{for(const state of cardStates)advancePhoto(state)},15000);
  }
})();
