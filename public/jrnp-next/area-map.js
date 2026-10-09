'use strict';
/* Public approximate areas, copied as facts (not presentation) from published JRNP locality disclosures.
   These are NOT house pins. Intersection-level locations require separately verified owner-approved map data. */
(()=>{
 const key=document.body.dataset.property || new URLSearchParams(location.search).get('property');
 const areas=Object.freeze({
  family:{region:'Arcadia Lite / Biltmore area, Phoenix',query:'Arcadia Lite Biltmore Phoenix Arizona'},
  ensuite:{region:'Biltmore / Arcadia area, Phoenix',query:'Biltmore Arcadia Phoenix Arizona'},
  pool:{region:'Melrose / Central Phoenix',query:'Melrose District Central Phoenix Arizona'},
  studio:{region:'Biltmore / Arcadia area, Phoenix',query:'Biltmore Arcadia Phoenix Arizona'},
  lake:{region:'Weiss Lake near Cedar Bluff, Alabama',query:'Weiss Lake Cedar Bluff Alabama'}
 });
 const info=Object.hasOwn(areas,key)?areas[key]:null;
 const frame=document.getElementById('jrnp-area-frame'),link=document.getElementById('jrnp-area-link');
 const label=document.getElementById('jrnp-area-label');
 if(!info||!frame||!link||!label)return;
 label.textContent=info.region;
 const search='https://www.google.com/maps?q='+encodeURIComponent(info.query);
 frame.src=search+'&output=embed';
 frame.title='Approximate '+info.region+' map; not the exact rental location';
 link.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(info.query);
 const fb=document.createElement('a');fb.className='jrnp-map-fallback';fb.href=link.href;fb.target='_blank';fb.rel='noopener noreferrer';fb.textContent='Open neighborhood map in Google Maps ↗';
 frame.closest('.jrnp-area-framebox')?.insertAdjacentElement('afterend',fb);
 const groups=key==='lake'?[['Arriving by air','Chattanooga Metropolitan Airport (CHA) · Birmingham-Shuttlesworth International Airport (BHM)'],['Around the lake','Weiss Lake boating and fishing · Cherokee Rock Village · Cedar Bluff and Centre'],['Day-trip ideas','Little River Canyon National Preserve · DeSoto State Park · Fort Payne']]:key==='pool'?[['Arriving by air','Phoenix Sky Harbor International Airport (PHX)'],['Explore the neighborhood','Melrose District · Heard Museum · Roosevelt Row · Phoenix Art Museum'],['Day-trip ideas','Superstition Mountains · Sedona · Flagstaff']]:[['Arriving by air','Phoenix Sky Harbor International Airport (PHX)'],['Explore nearby','Papago Park · Desert Botanical Garden · Old Town Scottsdale · Camelback Mountain'],['Day-trip ideas','Superstition Mountains · Sedona · Prescott']];
 const host=document.querySelector('.jrnp-area-copy');
 if(host&&!host.querySelector('.jrnp-neighborhood-guide')){
  const guide=document.createElement('div');guide.className='jrnp-neighborhood-guide';
  groups.forEach(([title,body])=>{const section=document.createElement('section');section.className='jrnp-neighborhood-detail';const heading=document.createElement('h3');heading.textContent=title;const para=document.createElement('p');para.textContent=body;section.append(heading,para);guide.append(section)});
  const disclaimer=document.createElement('p');disclaimer.className='jrnp-neighborhood-note';disclaimer.textContent='Regional suggestions, not walking distances. Routes and travel times vary. Exact arrival directions are provided after booking.';guide.append(disclaimer);host.append(guide);
 }
})();
