'use strict';(()=>{const data={family:{name:'Stylish & Perfect for Families',location:'PHOENIX, ARIZONA',summary:'4 bedrooms · 3 bathrooms · Up to 8 guests',description:'Four true bedrooms for up to eight guests: a king primary suite, three queen bedrooms and three bathrooms. Gather around the full kitchen and dining areas, then enjoy the fenced backyard, shaded patio, outdoor dining and fire pit.',amenities:['4 bedrooms','3 bathrooms','Up to 8 guests'],dir:'loma-linda',url:'/phoenix-family-vacation-rental.html',max:8},ensuite:{name:'Modern All-En-Suite Home',location:'PHOENIX, ARIZONA',summary:'3 bedrooms · 3.5 bathrooms · Up to 6 guests',description:'All three bedrooms have private full en-suite bathrooms, with an additional half bath for shared spaces. With a full kitchen, workspace, laundry and front and back patios, this home offers privacy and room for up to six guests. There is no pool or spa.',amenities:['Three en-suite bedrooms','Dedicated workspace','Two patios'],dir:'mitchell-en-suite',url:'/phoenix-en-suite-vacation-home.html',max:6},pool:{name:'Palm Haven Pool House',location:'PHOENIX, ARIZONA',summary:'Private pool · Queen bed · 1 bathroom · 2 guests',description:'A private pool-house retreat for two with a queen sleeping area, one full bathroom and a compact kitchenette. Enjoy the pool, Baja shelf, patio and fire pit. The pool is not heated, and spa use or heat requires advance written approval from JRNP.',amenities:['Private pool','Baja shelf','Spa by request'],dir:'palm-haven-clean',url:'/phoenix-pool-house.html',max:2},studio:{name:'Detached Studio Guesthouse',location:'PHOENIX, ARIZONA',summary:'Private studio · Queen bed · 1 bathroom · 2 guests',description:'A detached Phoenix studio for up to two guests, with a queen sleeping area, full kitchen, full-size refrigerator, stove, oven, microwave and private bathroom. Enjoy your own entrance, keypad access and patio seating.',amenities:['Detached studio','Private entrance','Keypad access'],dir:'mitchell-studio',url:'/phoenix-detached-studio-guesthouse.html',max:2},lake:{name:'Weiss Lake House with Private Dock',location:'CEDAR BLUFF, ALABAMA',summary:'3 bedrooms · 2 bathrooms · Up to 6 guests',description:'A three-bedroom, two-bath lake home for up to six guests, with two queen beds and one double/full bed. Gather in the full kitchen or covered outdoor dining area, then enjoy lake views, a fire pit and a private dock. Water levels and dock conditions vary seasonally.',amenities:['Private dock','Covered patio','Fire pit','3 bedrooms'],dir:'weiss-lake',url:'/weiss-lake-house-private-dock.html',max:6}};const key=document.body.dataset.property||new URLSearchParams(location.search).get('property');const p=data[key];if(!p){location.replace('/jrnp-next/#collection');return}
const pageSEO={
 family:['Phoenix Family Vacation Rental | 4BR & Fire Pit | JRNP','Stay in a 4-bedroom Phoenix family vacation rental with 3 baths, a full kitchen, fenced backyard, shaded patio and fire pit. Sleeps up to eight guests.'],
 ensuite:['Phoenix Vacation Home | 3 En-Suite Bedrooms | JRNP','Enjoy a Phoenix vacation home with 3 private en-suite bedrooms, 3.5 bathrooms, a full kitchen, workspace and two patios. Sleeps up to six guests.'],
 pool:['Palm Haven Private Pool House in Phoenix | JRNP Rentals','Escape to Palm Haven, a Phoenix pool house for two with a private unheated pool, Baja shelf, queen sleeping area and kitchenette. Spa by prior written approval.'],
 studio:['Phoenix Detached Studio Guesthouse with Kitchen | JRNP','Stay in a detached Phoenix studio guesthouse for two, with a queen bed, full kitchen, keypad entry, private bathroom and patio. Hosted by JRNP Rentals.'],
 lake:['Weiss Lake Vacation Home with Private Dock | JRNP Rentals','Explore a 3-bedroom Weiss Lake vacation home in Cedar Bluff, Alabama, with a private dock, covered patio and fire pit. Lake levels vary seasonally.'],
};
document.title=pageSEO[key][0];
const descriptionMeta=document.querySelector('meta[name="description"]');
if(descriptionMeta)descriptionMeta.content=pageSEO[key][1];
const set=(id,value)=>document.getElementById(id).textContent=value;set('location',p.location);set('name',p.name);set('summary',p.summary);set('detail-title',p.name);const descriptionElement=document.getElementById('description');if(!descriptionElement.children.length)descriptionElement.textContent=p.description;const amenityGroups={
family:[
 ['Bedrooms & bathrooms','4 bedrooms · 4 beds · Sleeps up to 8','Primary suite — King bed · Private en-suite bathroom','Second suite — Queen bed · Private en-suite bathroom','Third bedroom — Queen bed · Shared hall bathroom','Fourth bedroom — Queen bed · Shared hall bathroom','3 bathrooms total','Primary bathroom with soaking tub and walk-in shower'],
 ['Comfort & connectivity','Wi-Fi / internet','Air conditioning','Heating','Washer and dryer','Iron','Hair dryer','Dedicated workspace'],
 ['Kitchen & dining','Full kitchen','Refrigerator','Microwave','Coffee maker','Dishwasher','Cooking basics and cookware','Indoor dining area'],
 ['Backyard & outdoor living','Large private fenced backyard','Shaded covered patio','Outdoor seating','Outdoor dining','Propane BBQ grill','Fire pit','Outdoor lawn games'],
 ['Parking & arrival','Guest-use parking','Driveway parking','Street parking where permitted','Self-check-in and exact access instructions shared after confirmation'],
 ['Safety & entertainment','Smoke detector','Carbon monoxide detector','First-aid kit','Fire extinguisher','Smart TV · Bring your own streaming subscriptions','Board games','Books','Bluetooth speaker'],
 ['Stay details & house rules','Check-in from 4:00 PM','Checkout by 10:00 AM','No pets','No smoking','No parties','Registered guests only','Please notify JRNP if arriving after 10:00 PM']
],
ensuite:[
 ['Bedrooms & private bathrooms','3 bedrooms · 3 beds · Sleeps up to 6','Primary suite — King bed · Private full bathroom','Second suite — Queen bed · Private full bathroom','Third suite — Queen bed · Private full bathroom','All three bedrooms are en-suite','Additional half bath for shared areas · 3.5 baths total'],
 ['Comfort & connectivity','Wi-Fi / internet','Air conditioning','Heating','Washer and dryer','Iron','Hair dryer','Dedicated workspace'],
 ['Kitchen & dining','Full kitchen','Refrigerator','Microwave','Coffee maker','Dishwasher','Cooking basics','Kitchen and dining area'],
 ['Patios & outdoor living','Front patio','Back patio','Private outdoor area','Propane BBQ grill','Outdoor dining','No pool or spa at this home'],
 ['Parking & arrival','Driveway parking','Street parking where permitted','Guest-use home and courtyard areas','Arrival instructions provided after confirmation'],
 ['Safety & entertainment','Smoke detector','Carbon monoxide detector','First-aid kit','Fire extinguisher','Smart TV','Board games','Streaming access via guest subscriptions'],
 ['Stay details & house rules','Check-in from 4:00 PM','Checkout by 10:00 AM','No pets','No smoking','No parties','Registered guests only','Please notify JRNP if arriving after 10:00 PM']
],
pool:[
 ['Sleeping & bathroom','Private studio-style pool house · Sleeps up to 2','Queen bed in the open-plan sleeping area','1 private full bathroom'],
 ['Pool, spa & outdoor retreat','Private outdoor pool · Not heated','Baja shelf with poolside lounging','Private spa · Advance written approval required for use or heating','Poolside patio and outdoor lounge seating','Fire pit','Privacy landscaping'],
 ['Compact kitchenette','Kitchenette · Not a full kitchen','Refrigerator','Microwave','Sink','Coffee maker','Blender'],
 ['Comfort & entertainment','Wi-Fi / internet','Air conditioning','Heating','Smart TV · Bring your own streaming subscriptions','Hair dryer','Iron'],
 ['Parking & safety','On-site driveway parking','Smoke detector','Carbon monoxide detector','First-aid kit','Fire extinguisher'],
 ['Stay details & house rules','Check-in from 4:00 PM','Checkout by 10:00 AM','Pool is not heated','Spa arrangements require prior written confirmation from JRNP','No pets','No smoking','No parties','Please notify JRNP if arriving after 10:00 PM']
],
studio:[
 ['Studio sleeping & bath','Private detached open-plan studio · Sleeps up to 2','Queen bed','Living and sleeping area combined','1 private full bathroom'],
 ['Full kitchen & dining','Full kitchen · Not a kitchenette','Full-size refrigerator','Stove','Oven','Microwave','Sink','Coffee maker','Everyday meal-preparation area'],
 ['Comfort & entertainment','Wi-Fi / internet','Air conditioning','Heating','Iron','Hair dryer','Smart TV','Books','Bluetooth speaker'],
 ['Private outdoor spaces','Detached guesthouse','Private entrance','Keypad self-entry','Private patio with seating','Cactus garden'],
 ['Parking & safety','Street parking where permitted','Smoke detector','Carbon monoxide detector','First-aid kit'],
 ['Stay details & house rules','Check-in from 4:00 PM','Checkout by 10:00 AM','Direct bookings limited to 2 guests','No pets','No smoking','No parties','Guesthouse entry instructions shared after confirmation','Please notify JRNP if arriving after 10:00 PM']
],
lake:[
 ['Bedrooms & bathrooms','3 bedrooms · 3 beds · Sleeps up to 6','Upstairs bedroom · Queen bed','Main-floor bedroom · Queen bed','Second main-floor bedroom · Double / full bed','2 bathrooms total','Upstairs suite has a private en-suite bathroom','Main-floor bedrooms use the other bathroom'],
 ['Comfort & connectivity','Wi-Fi / internet','Air conditioning','Heating','Washer and dryer','Iron','Hair dryer','Dedicated workspace'],
 ['Kitchen & dining','Full kitchen','Refrigerator','Microwave','Coffee maker','Dishwasher','Cooking basics and cookware','Indoor dining area'],
 ['Lakeside outdoor living','Private dock with direct lake access','Lake views','Covered outdoor dining','Patio / deck','Fire pit','BBQ grill','Dock and lake levels may vary with weather and season'],
 ['Parking & safety','Guest-use driveway parking','Smoke detector','Carbon monoxide detector','First-aid kit','Fire extinguisher','Boat lift is not included in guest use'],
 ['Entertainment & lake time','Smart TV','Board games','Books','Fishing and boating access via the lake','Outdoor gathering areas'],
 ['Arrival & house rules','Checkout by 10:00 AM','Confirm property-specific check-in time with JRNP before arrival','Exact address and access instructions follow an approved reservation','Supervise children and guests around the water and dock','No pets','No smoking','No parties','Please notify JRNP if arriving after 10:00 PM']
]
};const amenityRoot=document.getElementById('amenities');const amenityCards=amenityGroups[key];const amenityCount=document.getElementById('amenity-count');if(amenityCount)amenityCount.textContent=amenityCards.reduce((sum,group)=>sum+group.length-1,0)+' property-specific features and stay details across '+amenityCards.length+' categories.';for(let i=0;i<amenityCards.length;i++){const [title,...features]=amenityCards[i];const section=document.createElement('section');section.className='amenity-group';const heading=document.createElement('h3');heading.className='amenity-group-title';const number=document.createElement('span');number.className='amenity-group-number';number.textContent=String(i+1).padStart(2,'0');heading.append(number,document.createTextNode(title));const list=document.createElement('ul');list.className='amenity-feature-list';for(const label of features){const li=document.createElement('li');li.textContent=label;list.append(li)}section.append(heading,list);amenityRoot.append(section)};const marketplaceIds={family:{airbnb:'688518367336089503',vrbo:'2980013'},ensuite:{airbnb:'782869192321131934',vrbo:'3163736'},pool:{airbnb:'1412445380372870166'},studio:{airbnb:'741362493135982493',vrbo:'3077209'},lake:{airbnb:'808012501126446680',vrbo:'4551743'}};const marketplaceContainer=document.getElementById('listing-marketplace-links');if(marketplaceContainer){const listingChannels=marketplaceIds[key];for(const [network,id] of Object.entries(listingChannels)){const a=document.createElement('a');a.className='listing-marketplace-link listing-marketplace-'+network;a.href=network==='airbnb'?'https://www.airbnb.com/rooms/'+id:'https://www.vrbo.com/'+id;a.target='_blank';a.rel='noopener noreferrer';a.textContent='View on '+(network==='airbnb'?'Airbnb':'Vrbo')+' ↗';marketplaceContainer.append(a)}};
/* JRNP Next property-curated local guide. Links and descriptions sourced from visitor agencies, venue websites, and the Cherokee County Chamber. No distances from private homes are asserted. */
const guideAttractions={
  zoo:{type:'FAMILY OUTING',name:'Phoenix Zoo',detail:'Explore animal habitats and family-friendly paths in Papago Park.',url:'https://www.phoenixzoo.org/visit/'},
  desert:{type:'DESERT GARDENS',name:'Desert Botanical Garden',detail:'Walk among Sonoran Desert plants, art installations and seasonal displays.',url:'https://dbg.org/visit/'},
  papago:{type:'SCENIC OUTDOORS',name:'Papago Park',detail:'Discover red-rock buttes, short trails and classic desert scenery.',url:'https://www.phoenix.gov/administration/departments/parks/activities-facilities/trails/papago-park.html'},
  science:{type:'HANDS-ON LEARNING',name:'Arizona Science Center',detail:'Interactive exhibits and science experiences for curious visitors of all ages.',url:'https://www.azscience.org/visit/'},
  heard:{type:'CULTURE & ART',name:'Heard Museum',detail:'Experience Indigenous art, history and contemporary exhibitions in central Phoenix.',url:'https://heard.org/plan/'},
  mim:{type:'MUSIC & CULTURE',name:'Musical Instrument Museum',detail:'Discover instruments and music traditions from around the world.',url:'https://mim.org/plan-your-visit/'},
  fishing:{type:'ON THE WATER',name:'Weiss Lake fishing',detail:'Crappie and bass fishing draw anglers throughout the year. Bring appropriate gear and check Alabama licensing and water conditions.',url:'https://cherokee-chamber.org/visit/fishing/'},
  canyon:{type:'SCENIC DAY TRIP',name:'Little River Canyon National Preserve',detail:'Choose a scenic overlook, waterfall viewpoint or marked hiking trail. Check park alerts before setting out.',url:'https://www.nps.gov/liri/planyourvisit/things2do.htm'},
  rock:{type:'HIKING & VIEWS',name:'Cherokee Rock Village',detail:'Enjoy sweeping Lookout Mountain views, walking trails and striking rock formations.',url:'https://alabama.travel/places-to-go/cherokee-rock-village/'},
  furnace:{type:'LOCAL HISTORY',name:'Cornwall Furnace Park',detail:'Visit a historic furnace site and take a short nature walk or picnic break in Cedar Bluff.',url:'https://cherokee-chamber.org/visit/things-to-do/'},
  slackland:{type:'LAKE DAY-USE',name:'Slackland Beach',detail:'Explore Alabama Power’s designated Weiss Lake day-use area, with a protected swimming area and picnic facilities.',url:'https://apcshorelines.com/recreation/the-preserves-weiss-lake/'}
};
const guideDining={
  bianco:{type:'WOOD-FIRED PIZZA',name:'Pizzeria Bianco',detail:'Phoenix favorite for artisan wood-fired pizza; downtown and Town & Country locations.',url:'https://www.pizzeriabianco.com/'},
  chelseas:{type:'SOUTHWESTERN DINING',name:'Chelsea’s Kitchen',detail:'A desert-inspired menu and inviting patio in the Arcadia area.',url:'https://chelseaskitchenaz.com/'},
  littlemiss:{type:'LOCAL BARBECUE',name:'Little Miss BBQ',detail:'Slow-smoked meats; check opening times and availability before visiting.',url:'https://littlemissbbq.com/'},
  cibo:{type:'CASUAL ITALIAN',name:'Cibo Urban Pizzeria',detail:'Wood-fired pizza at a historic downtown Phoenix bungalow.',url:'https://www.cibophoenix.com/'},
  tonys:{type:'CEDAR BLUFF · PIZZA',name:'Tony’s Pizza & Subs',detail:'Casual pizza, pasta, subs and salads in Cedar Bluff.',url:'https://members.cherokee-chamber.org/list/member/tony-s-pizza-subs-cedar-bluff-578'},
  decks:{type:'LEESBURG · DINING',name:'Decks & Docks',detail:'A local dining option listed by the Cherokee County Chamber of Commerce.',url:'https://members.cherokee-chamber.org/list/category/restaurants-74'},
  woodys:{type:'CEDAR BLUFF · DINING',name:'Woody’s On Weiss',detail:'A lakeside-area restaurant listed by the Cherokee County Chamber of Commerce.',url:'https://members.cherokee-chamber.org/list/category/restaurants-74'},
  coffee:{type:'CENTRE · COFFEE',name:'Dammed Good Coffee Company',detail:'A local coffee stop in Centre for a morning outing.',url:'https://members.cherokee-chamber.org/list/ql/restaurants-food-beverages-46'}
};
const curatedGuides={
 family:{intro:'Family-friendly Phoenix outings and a few favorite dining options across the city. These are destination ideas, not claims about walking distance from the home.',activities:['zoo','papago','desert','science'],dining:['bianco','chelseas','littlemiss']},
 ensuite:{intro:'For couples, work trips and adult groups: Phoenix arts, desert experiences and restaurants worth planning around. Distances will vary by destination.',activities:['heard','desert','mim','papago'],dining:['bianco','chelseas','cibo']},
 pool:{intro:'Pair your private pool-house stay with a garden visit, easy desert scenery or a cultural afternoon around Phoenix.',activities:['desert','papago','heard'],dining:['chelseas','bianco','littlemiss']},
 studio:{intro:'A flexible Phoenix city guide for longer stays, work trips or couples, with culture, museums and casual dining.',activities:['heard','science','mim','papago'],dining:['cibo','littlemiss','bianco']},
 lake:{intro:'Make the most of Northeast Alabama with a little fishing, shoreline time, scenic trails and Cherokee County food stops. Check seasonal conditions and each destination before leaving.',activities:['fishing','canyon','rock','furnace','slackland'],dining:['tonys','decks','woodys','coffee']}
};
const guideContent=curatedGuides[key];
const guideIntro=document.getElementById('local-guide-intro');if(guideIntro)guideIntro.textContent=guideContent.intro;
const guideTitle=document.getElementById('local-guide-title');if(guideTitle)guideTitle.textContent=key==='lake'?'Explore Weiss Lake & beyond.':'Make Phoenix your own.';
const guideElement=(tag,className,content)=>{const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node};
const appendGuideItems=(containerId,ids,catalog)=>{const root=document.getElementById(containerId);if(!root)return;for(const id of ids){const place=catalog[id];const item=guideElement('article','local-guide-card');const eyebrow=guideElement('p','local-guide-card-type',place.type);const name=guideElement('h4','local-guide-card-title',place.name);const description=guideElement('p','local-guide-card-description',place.detail);const link=guideElement('a','local-guide-card-link','Explore details ↗');link.href=place.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','View details for '+place.name+' (opens in a new tab)');item.append(eyebrow,name,description,link);root.append(item)}};
appendGuideItems('local-guide-activities',guideContent.activities,guideAttractions);
appendGuideItems('local-guide-dining',guideContent.dining,guideDining);
if(key==='lake'){const levelPanel=document.getElementById('lake-level-guide');if(levelPanel)levelPanel.hidden=false}

const originalPhotos=['cover.jpg',...Array.from({length:19},(_,i)=>(i+1)+'.jpg')].map(x=>'/assets/images/'+p.dir+'/'+x);
const photoOrder={
 family:[0,11,6,3,5,1,9,7,16,17,10,13,14,19,4,2,15,8,18],
 ensuite:[15,16,10,12,4,14,19,11,1,2,3,6,18,5,9,17,13,7,8,0],
 pool:[6,7,0,16,17,11,13,10,3,19,18,14,5,4,8,9,15,12,2],
 studio:[10,6,5,9,12,8,3,14,13,18,11,1,4,7,17,15,2,19,0],
 lake:[2,18,19,3,5,6,12,1,4,17,7,16,10,14,8,11,13,15,0,9]
};
const photoSequence=photoOrder[key];
const photos=photoSequence.map(i=>originalPhotos[i]);
const galleryAlt={
 family:['Bright open-plan living room at the family vacation home','White kitchen with breakfast island and seating','Queen bedroom with warm accent pillows','Queen bedroom with blue curtains and natural light','Bathroom vanity and shower in the family home'],
 ensuite:['Bright living room at the all-en-suite Phoenix home','Full kitchen with modern island and dining','Bedroom suite with private bathroom','Queen bedroom with blue drapes','Walk-in en-suite bathroom'],
 pool:['Private pool and Baja shelf at Palm Haven','Poolside water and shallow lounging area','Pool-house kitchenette and patio entrance','Queen sleeping area with leafy accent wall','Private pool-house bathroom and shower'],
 studio:['Open studio living room and full kitchen','Queen sleeping area and studio lounge','Full kitchen with stove, oven and refrigerator','Queen bed and nightstands','Private studio bathroom'],
 lake:['Vaulted lake-house living room','Open kitchen and dining room','Queen bedroom overlooking the lawn','Lake-house bathroom and glass shower','Sunset views from the private Weiss Lake dock']
};const gallery=document.getElementById('gallery'),viewer=document.getElementById('viewer'),viewImg=document.getElementById('viewer-image');let index=0;function show(i){index=(i+photos.length)%photos.length;viewImg.src=photos[index];viewImg.alt=p.name+' photo '+(index+1);set('viewer-count',(index+1)+' / '+photos.length)}photos.slice(0,5).forEach((src,i)=>{const b=document.createElement('button');b.type='button';b.className='gallery-tile';const img=document.createElement('img');img.src=src;img.alt=galleryAlt[key][i]||p.name+' property photo '+(i+1);img.loading=i===0?'eager':'lazy';img.addEventListener('error',()=>{b.classList.add('missing-photo');img.hidden=true});b.appendChild(img);if(i===4){const label=document.createElement('span');label.textContent='View all '+photos.length+' photos ↗';b.appendChild(label)}b.addEventListener('click',()=>{show(i);viewer.showModal()});gallery.appendChild(b)});const roomTours={
family:[
['Living room',0,'A bright gathering space with generous sectional seating.'],
['Kitchen',11,'An open kitchen with island seating.'],
['Bedroom',1,'A restful bedroom with warm, contemporary details.'],
['Patio',8,'A private outdoor lounge for relaxed afternoons.'],
['Bathroom',5,'A bathroom with a shower and tub.'],
['Laundry',4,'An in-home washer and dryer.']
],
ensuite:[
['Living room',15,'A sunlit living area with inviting seating.'],
['Kitchen and dining',16,'A spacious kitchen and dining area.'],
['Bedroom suite',10,'A private bedroom with thoughtful finishes.'],
['En-suite bathroom',4,'A bathroom with a glass-enclosed shower.'],
['Outdoor patio',7,'A paved space with room to unwind outside.']
],
pool:[
['Pool and Baja shelf',6,'A private pool with a shallow lounging ledge.'],
['Pool after dark',9,'The pool and outdoor lighting in the evening.'],
['Covered outdoor space',0,'An outdoor counter and seating area.'],
['Bedroom',19,'A restful private bedroom.'],
['Bathroom',17,'A bathroom with a glass shower.']
],
studio:[
['Studio living',6,'An airy living and sleeping space.'],
['Kitchen',5,'A private, fully pictured kitchen area.'],
['Bathroom',18,'A bathroom with a shower.'],
['Private patio',19,'Outdoor seating by the studio entrance.'],
['Private entrance',0,'The exterior entrance and outdoor approach.']
],
lake:[
['Lakefront living',2,'A vaulted living area with views toward the lake.'],
['Kitchen and dining',12,'A kitchen with a dining table for shared meals.'],
['Bedroom',19,'One of the home\'s furnished bedrooms.'],
['Bathroom',3,'A bathroom with a walk-in shower.'],
['Covered patio',15,'A sheltered outdoor dining area.'],
['Private dock',5,'A dock overlooking Weiss Lake at sunset.']
]
};const roomContainer=document.getElementById('rooms');roomContainer.textContent='';for(const [title,photoIndex,description] of roomTours[key]){const card=document.createElement('button');card.type='button';card.className='room-tour-card';card.setAttribute('aria-label','View '+title+' photo in full screen');const photo=document.createElement('img');photo.src=originalPhotos[photoIndex];photo.alt=title+' at '+p.name;photo.loading='lazy';const copy=document.createElement('span');copy.className='room-tour-copy';const top=document.createElement('span');top.className='room-tour-kicker';top.textContent='PHOTO TOUR / VIEW FULL SCREEN ↗';const heading=document.createElement('span');heading.className='room-tour-title';heading.textContent=title;const detail=document.createElement('span');detail.className='room-tour-description';detail.textContent=description;copy.append(top,heading,detail);card.append(photo,copy);card.addEventListener('click',()=>{const position=photoSequence.indexOf(photoIndex);show(position<0?0:position);viewer.showModal()});roomContainer.appendChild(card)};document.querySelector('.close-viewer').addEventListener('click',()=>viewer.close());document.querySelector('.photo-prev').addEventListener('click',()=>show(index-1));document.querySelector('.photo-next').addEventListener('click',()=>show(index+1));viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1)});const checkin=document.getElementById('checkin'),checkout=document.getElementById('checkout'),guests=document.getElementById('guests');const calendarJump=document.querySelector('.detail-hero-book');if(calendarJump)calendarJump.addEventListener('click',event=>{event.preventDefault();document.getElementById('dates').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});checkin.focus({preventScroll:true})});const listingUrl=new URL(location.href);listingUrl.hash='';if(location.pathname.endsWith('/home.html')){listingUrl.search='?property='+encodeURIComponent(key)}else{listingUrl.search=''}const exactLink=listingUrl.toString();const sharePanel=document.querySelector('.listing-share');if(sharePanel){const fb=sharePanel.querySelector('.listing-social-facebook');const wa=sharePanel.querySelector('.listing-social-whatsapp');fb.href='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(exactLink);wa.href='https://api.whatsapp.com/send?text='+encodeURIComponent(p.name+' — JRNP Rentals '+exactLink);fb.hidden=false;wa.hidden=false;const status=document.getElementById('listing-share-status');const copy=document.getElementById('listing-copy-link');copy.hidden=false;copy.addEventListener('click',async()=>{try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(exactLink)}else{const field=document.createElement('textarea');field.value=exactLink;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw Error('Clipboard unavailable')}status.textContent='Link copied'}catch(error){status.textContent='Copy unavailable. You can copy this page address from your browser.'}});const native=document.getElementById('listing-native-share');if(typeof navigator.share==='function'){native.hidden=false;native.addEventListener('click',async()=>{try{await navigator.share({title:p.name+' | JRNP Rentals',url:exactLink});status.textContent='Shared'}catch(error){if(error.name!=='AbortError')status.textContent='Sharing unavailable. Try Copy link.'}})}}const today=new Date();const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);checkin.min=localToday;checkout.min=localToday;guests.max=String(p.max);guests.value=String(Math.min(2,p.max));const passed=new URLSearchParams(location.search);const passedIn=passed.get('checkIn'),passedOut=passed.get('checkOut'),passedGuests=Number(passed.get('guests'));if(/^\d{4}-\d{2}-\d{2}$/.test(passedIn||'')&&passedIn>=localToday)checkin.value=passedIn;if(/^\d{4}-\d{2}-\d{2}$/.test(passedOut||'')&&passedOut>(checkin.value||localToday))checkout.value=passedOut;if(Number.isInteger(passedGuests)&&passedGuests>=1&&passedGuests<=p.max)guests.value=String(passedGuests);if(checkin.value)checkout.min=checkin.value;checkin.addEventListener('change',()=>{checkout.min=checkin.value||localToday;if(checkout.value&&checkout.value<=checkin.value)checkout.value=''});document.getElementById('dates').addEventListener('submit',e=>{e.preventDefault();const error=document.getElementById('date-error');if(!checkin.value||!checkout.value||checkout.value<=checkin.value){error.textContent='Please select a valid check-in and later check-out date.';return}const count=Number(guests.value);if(!Number.isInteger(count)||count<1||count>p.max){error.textContent='Please enter between 1 and '+p.max+' guests.';return}error.textContent='';document.dispatchEvent(new CustomEvent('jrnp:quote-request',{detail:{propertyKey:key,checkIn:checkin.value,checkOut:checkout.value,guests:count}}))})})();