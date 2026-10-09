'use strict';
/* One small shared frontend animation layer. Enhances the NEW green/white UI only.
 * Content remains fully visible with JS disabled or prefers-reduced-motion enabled. */
(()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches||typeof window.IntersectionObserver!=='function')return;
  // Gold reveal only after JavaScript is active; reduced-motion and no-JS remain readable.
  const ink=Array.from(document.querySelectorAll('.jrnp-gold-script em,.jrnp-page-gold-script em'));
  if(ink.length){
    const inkObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        entry.target.classList.add('jrnp-ink-visible');
        inkObserver.unobserve(entry.target);
      }
    },{threshold:.05});
    for(const node of ink){node.classList.add('jrnp-ink-ready');inkObserver.observe(node);}
    // iOS WebKit can delay IntersectionObserver delivery after momentum scrolling.
    // A passive viewport check starts the same reveal on the next visible frame.
    let pendingInkCheck=false;
    const showVisibleInk=()=>{
      pendingInkCheck=false;
      for(const node of ink){
        if(node.classList.contains('jrnp-ink-visible'))continue;
        const rect=node.getBoundingClientRect();
        if(rect.width&&rect.height&&rect.bottom>=0&&rect.top<=innerHeight+40){
          node.classList.add('jrnp-ink-visible');
          inkObserver.unobserve(node);
        }
      }
    };
    const queueInkCheck=()=>{
      if(pendingInkCheck)return;
      pendingInkCheck=true;
      window.requestAnimationFrame(showVisibleInk);
    };
    window.addEventListener('scroll',queueInkCheck,{passive:true});
    window.addEventListener('resize',queueInkCheck,{passive:true});
    queueInkCheck();
  }
  // Mobile Safari restores pages from BFCache without replaying CSS on navigation back.
  // Replay only on restored pages; never override the user's Reduce Motion preference.
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    const lines=document.querySelectorAll('.hero-written .hero-script-line');
    if(!lines.length)return;
    for(const line of lines)line.style.animation='none';
    void document.body.offsetWidth;
    window.requestAnimationFrame(()=>{
      for(const line of lines)line.style.removeProperty('animation');
    });
  });
  const selectors=[
    '.collection .property-card','.hosts-section .hosts-card','.how-step',
    '.jrnp-page-content .jrnp-page-panel','.jrnp-page-grid article',
    '.jrnp-page-policy','.jrnp-page-split','.jrnp-page-faq details',
    '.jrnp-page-hosts .hosts-card','.amenity-group','.room-tour-card',
    '.local-guide-card','.jrnp-area-layout','.jrnp-page-nav',
    '.workspace-calendar-head','.command-navigation','.workspace-rail-heading'
  ].join(',');
  const candidates=Array.from(new Set(document.querySelectorAll(selectors)));
  const waiting=new Set();
  const show=element=>{
    if(!waiting.has(element))return;
    element.classList.add('jrnp-motion-visible');
    waiting.delete(element);
  };
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      show(entry.target);
      observer.unobserve(entry.target);
    }
  },{threshold:.06,rootMargin:'0px 0px 38px 0px'});
  for(const element of candidates){
    if(element.closest('[hidden],dialog:not([open]),details:not([open])'))continue;
    const rect=element.getBoundingClientRect();
    if(rect.height===0||rect.width===0||rect.top<innerHeight*.89)continue;
    element.classList.add('jrnp-motion-pending');
    waiting.add(element);
    observer.observe(element);
  }
  // Keyboard focus must never get trapped on an invisible reveal target.
  document.addEventListener('focusin',event=>{
    for(let node=event.target;node&&node!==document;node=node.parentElement){
      if(waiting.has(node)){show(node);observer.unobserve(node);}
    }
  },true);
  const disable=()=>{
    for(const element of waiting)element.classList.add('jrnp-motion-visible');
    waiting.clear();
    observer.disconnect();
  };
  if(typeof reduce.addEventListener==='function')
    reduce.addEventListener('change',event=>{if(event.matches)disable();},{once:true});
  // A tiny calendar transition, only after the existing CMP changes its visible month.
  const calendar=document.querySelector('.workspace-calendar-grid');
  if(calendar&&typeof MutationObserver==='function'){
    const monthObserver=new MutationObserver(records=>{
      if(!records.some(record=>record.type==='childList'))return;
      calendar.classList.remove('jrnp-calendar-enter');
      void calendar.offsetWidth;
      calendar.classList.add('jrnp-calendar-enter');
    });
    monthObserver.observe(calendar,{childList:true});
    window.addEventListener('pagehide',()=>monthObserver.disconnect(),{once:true});
  }
})();
