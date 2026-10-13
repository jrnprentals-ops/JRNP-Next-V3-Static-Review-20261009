'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const listings=[
 ['public/jrnp-next/phoenix-family-vacation-rental.html','public/phoenix-family-vacation-rental.html'],
 ['public/jrnp-next/phoenix-en-suite-vacation-home.html','public/phoenix-en-suite-vacation-home.html'],
 ['public/jrnp-next/weiss-lake-private-dock-vacation-home.html','public/weiss-lake-house-private-dock.html'],
 ['public/jrnp-next/phoenix-detached-studio-guesthouse.html','public/phoenix-detached-studio-guesthouse.html'],
 ['public/jrnp-next/phoenix-private-pool-house.html','public/phoenix-pool-house.html']
];

test('guest pages enable honest production request-to-book copy',()=>{
 assert.equal(read('public/index.html'),read('public/jrnp-next/index.html'));
 assert.doesNotMatch(read('public/index.html'),/data-bq124-release-guard/);
 for(const [canonical,alias] of listings){
  const html=read(canonical);
  assert.equal(read(alias),html);
  assert.doesNotMatch(html,/data-bq124-release-guard|LOCAL STAGING|test request|staging testing only/i);
  assert.match(html,/REQUEST TO BOOK \/ HOST REVIEW/);
  assert.match(html,/no payment is charged now/i);
  assert.match(html,/availability-snapshot\.js/);
 }
});

test('booking request uses the production endpoint and stable idempotency header',()=>{
 const js=read('public/jrnp-next/booking-ui.js');
 assert.match(js,/fetch\('\/api\/bookings'/);
 assert.match(js,/'Idempotency-Key':idempotencyKey/);
 assert.match(js,/typeof result\.bookingId!=='string'/);
 assert.match(js,/requestSuccess\.textContent='Request '\+result\.bookingId/);
 assert.doesNotMatch(js,/\/api\/staging\/requests|Save test request|Staging reference/);
});

test('calendar adapter fails closed and routes expose only required backend paths',()=>{
 const adapter=read('public/jrnp-next/availability-snapshot.js');
 assert.match(adapter,/skipSync=1/);
 assert.match(adapter,/day\.blocked===true\|\|day\.available===false/);
 assert.match(adapter,/availabilityComplete:false/);
 assert.doesNotMatch(adapter,/status:'available'/);
 const config=JSON.parse(read('vercel.json'));
 assert.deepEqual(config.rewrites.map(route=>route.source),[
  '/api/quote','/api/bookings','/api/support/messages','/api/guest/:path*','/api/properties/:id/calendar'
 ]);
 assert(config.rewrites.every(route=>route.destination.startsWith('https://jrnp-backend.vercel.app/api/')));
});

test('My Stay serves the secure OTP portal through a narrowly scoped guest API proxy',()=>{
 const html=read('public/my-stay.html');
 const js=read('public/jrnp-next/my-stay.js');
 const css=read('public/jrnp-next/my-stay.css');
 const config=JSON.parse(read('vercel.json'));
 assert.match(html,/Your stay,[\s\S]*all in one place/);
 assert.match(html,/name="otpCode"[\s\S]*autocomplete="one-time-code"/);
 assert.match(html,/my-stay\.css/);
 assert.match(html,/my-stay\.js/);
 assert.match(html,/noindex,nofollow,noarchive/);
 assert.doesNotMatch(html,/<style\b/i);
 assert([...html.matchAll(/<script\b[^>]*>/gi)].every(match=>/\ssrc=/.test(match[0])),'My Stay CSP requires external scripts');
 assert.doesNotMatch(html,/This page is unavailable|Private workspace and test services|last four (?:digits|phone)|My Stay security code/i);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(new Set(ids).size,ids.length,'My Stay IDs must be unique');
 for(const asset of ['public/jrnp-next/assets/brand/logo-jrnp.png','public/jrnp-next/assets/favicon.ico','public/jrnp-next/style.css','public/jrnp-next/my-stay.css','public/jrnp-next/my-stay.js'])assert(fs.existsSync(path.join(root,asset)),asset+' missing');
 for(const endpoint of ['/api/guest/auth/request-code','/api/guest/auth/verify-code','/api/guest/reservation','/api/guest/reservation/profile','/api/guest/reservation/wifi-qr'])assert(js.includes(endpoint),endpoint+' missing');
 assert.match(js,/URL\.revokeObjectURL/);
 assert.match(js,/await response\.text\(\)\.catch/);
 assert.doesNotMatch(js,/error:text\.slice/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/font-size:16px/);
 const guestProxy=config.rewrites.find(route=>route.source==='/api/guest/:path*');
 assert.deepEqual(guestProxy,{source:'/api/guest/:path*',destination:'https://jrnp-backend.vercel.app/api/guest/:path*'});
});

test('static production headers protect the site and My Stay without constraining existing pages',()=>{
 const config=JSON.parse(read('vercel.json'));
 const global=config.headers.find(rule=>rule.source==='/(.*)');
 const portal=config.headers.find(rule=>rule.source==='/my-stay.html');
 const values=rule=>Object.fromEntries(rule.headers.map(header=>[header.key,header.value]));
 const globalHeaders=values(global),portalHeaders=values(portal);
 assert.equal(globalHeaders['Strict-Transport-Security'],'max-age=63072000; includeSubDomains; preload');
 assert.equal(globalHeaders['X-Content-Type-Options'],'nosniff');
 assert.equal(globalHeaders['X-Frame-Options'],'SAMEORIGIN');
 assert.equal(globalHeaders['Referrer-Policy'],'strict-origin-when-cross-origin');
 assert.equal(globalHeaders['Permissions-Policy'],'camera=(), microphone=(), geolocation=(), payment=()');
 assert.equal(portalHeaders['Cache-Control'],'private, no-store, max-age=0');
 assert.equal(portalHeaders['X-Robots-Tag'],'noindex, nofollow, noarchive');
 assert.match(portalHeaders['Content-Security-Policy'],/script-src 'self'/);
 assert.match(portalHeaders['Content-Security-Policy'],/connect-src 'self'/);
 assert(!globalHeaders['Content-Security-Policy'],'global CSP would break legacy inline assets');
});

test('guest messaging saves to the production support endpoint',()=>{
 const html=read('public/jrnp-next/contact.html');
 const js=read('public/jrnp-next/guest-pages.js');
 assert.doesNotMatch(html,/data-bq124-release-guard|This preview|Open my email app|Staging preview/i);
 assert.match(html,/jrnp-contact-topic/);
 assert.match(html,/jrnp-contact-checkin/);
 assert.match(js,/fetch\('\/api\/support\/messages'/);
 assert.match(js,/'Idempotency-Key':idempotencyKey/);
 assert.match(js,/No reservation or payment was created/);
});
