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
  '/api/quote','/api/bookings','/api/properties/:id/calendar'
 ]);
 assert(config.rewrites.every(route=>route.destination.startsWith('https://jrnp-backend.vercel.app/api/')));
});
