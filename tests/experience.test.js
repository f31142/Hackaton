import test from 'node:test';
import assert from 'node:assert/strict';
import {CITIES,PEOPLE,SAMPLE_USER} from '../data.js';
import {ROUTES,FESTIVALS} from '../local-guide.js';
import {readExtra,saveExtra,EXTRA_KEY,LEGACY_EXTRA_KEY,normalizePlan,normalizeMBTI,validPhoto,routesFor,itinerary,planKey,coachPlan,canUseAvatar,koreaToday,upcomingFestivals,festivalStatus,festivalICS} from '../experience-core.js';
import {validateImage} from '../profile-media.js';
import {buildPrompt} from '../ai.js';

test('all 14 regions have distinct usable routes, with separate island and lake trips',()=>{
  for(const city of CITIES){assert.ok(routesFor(city).length);for(const r of routesFor(city)){assert.ok(r.meet&&r.meal&&r.cafe&&r.sight);assert.match(r.source,/^https:\/\//);}}
  assert.equal(new Set(ROUTES.map(r=>r.id)).size,ROUTES.length);
  assert.notEqual(routesFor('군산')[0].sight,routesFor('군산')[1].sight);
  const wrongCity=normalizePlan({city:'임실',routeId:'gunsan-island',movie:true});
  assert.equal(wrongCity.routeId,'imsil-cheese');assert.equal(wrongCity.movie,false);
});
test('movie changes the timeline and optional lodging starts off and can be removed',()=>{
  const p=normalizePlan({city:'전주',start:'13:00'}), base=itinerary(p), full=itinerary({...p,movie:true,stay:true});
  assert.deepEqual(base.map(s=>s.kind),['meet','meal','cafe','sight']);
  assert.deepEqual(full.map(s=>s.kind),['meet','movie','meal','cafe','sight','stay']);
  assert.equal(base[1].at,'13:20');assert.equal(full[2].at,'15:50');
  assert.ok(itinerary({...p,start:'23:30'}).some(s=>s.at.startsWith('다음 날')));
  assert.ok(!itinerary({...p,movie:true,stay:false}).some(s=>s.kind==='stay'));
});
test('saved extras migrate old photo and MBTI, round-trip routes, and recover invalid storage',()=>{
  const values=new Map([[LEGACY_EXTRA_KEY,JSON.stringify({photo:'data:image/png;base64,AAAA',mbti:'infp'})]]);
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const extra=readExtra(storage);assert.equal(extra.mbti,'INFP');assert.ok(extra.photo);assert.equal(extra.trial,false);
  extra.routes=[normalizePlan({city:'군산',routeId:'gunsan-island',personId:'haneul',date:'2026-10-03',start:'11:00',stay:true})];extra.trial=true;extra.festivals=['gunsan-2026'];
  assert.equal(saveExtra(storage,extra),true);assert.deepEqual(readExtra(storage),extra);
  values.set(EXTRA_KEY,JSON.stringify({...extra,routes:[...extra.routes,...extra.routes,{routeId:'unknown'}],festivals:['bad']}));
  assert.equal(readExtra(storage).routes.length,1);assert.deepEqual(readExtra(storage).festivals,[]);
  assert.equal(readExtra({getItem(){throw Error('blocked')}}).photo,'');
  assert.equal(saveExtra({setItem(){throw Error('quota')}},extra),false);
});
test('invalid dates, images, and personality values never become stored profile data',()=>{
  assert.equal(normalizeMBTI('infj'),'INFJ');assert.equal(normalizeMBTI('<img>'),'');
  assert.equal(normalizePlan({date:'2026-02-30',start:'25:00'}).date,'');assert.equal(normalizePlan({start:'25:00'}).start,'13:00');
  assert.equal(validPhoto('data:image/svg+xml;base64,AAAA'),false);assert.equal(validPhoto('https://example.com/me.jpg'),false);
  assert.throws(()=>validateImage({type:'image/svg+xml',size:100}));assert.throws(()=>validateImage({type:'image/png',size:11*1024*1024}));assert.throws(()=>validateImage({type:'image/png',size:0}));
  assert.doesNotThrow(()=>validateImage({type:'image/webp',size:100}));
});
test('avatar advice actually uses partner, route, tone, and response scenario; premium is explicit',()=>{
  const p=normalizePlan({city:'군산',routeId:'gunsan-island'});
  const a=coachPlan(SAMPLE_USER,PEOPLE[0],p), b=coachPlan(SAMPLE_USER,PEOPLE[2],p,'light','busy');
  assert.notEqual(a.opener,b.opener);assert.notEqual(a.pace,b.pace);assert.notEqual(a.invitation,b.invitation);
  assert.match(a.invitation,/선유도/);assert.match(b.scenario.next,/서두르지/);
  assert.match(a.coordination,/공통 생활권이 아니/);assert.equal(canUseAvatar({trial:false}),false);assert.equal(canUseAvatar({trial:true}),true);assert.equal(canUseAvatar({trial:'true'}),false);
  assert.notEqual(planKey({...p,stay:true}),planKey({...p,stay:false}));
});
test('generated avatar prompt uses selected places and partner while excluding photo and identity',()=>{
  const p=normalizePlan({city:'임실'}), route=ROUTES.find(r=>r.id===p.routeId);
  const u={...SAMPLE_USER,name:'PRIVATE_NAME',photo:'PRIVATE_PHOTO',mbti:'INFP'};
  const context={route,steps:itinerary(p),tone:'calm',scenario:'busy'};
  const a=JSON.stringify(buildPrompt('avatar',u,PEOPLE[0],context)), b=JSON.stringify(buildPrompt('avatar',u,PEOPLE[2],context));
  assert.notEqual(a,b);assert.ok(a.includes('임실치즈'));assert.ok(a.includes('busy'));assert.ok(a.includes('INFP'));assert.ok(!a.includes('PRIVATE_'));assert.ok(a.includes('가상의 대화 연습'));
});
test('festival reminders use the Korean day, exclude ended events, and handle the start day',()=>{
  const now=new Date('2026-09-17T15:01:00Z');assert.equal(koreaToday(now),'2026-09-18');
  assert.equal(festivalStatus(FESTIVALS[0],now),'진행 중');
  assert.equal(festivalStatus(FESTIVALS[0],new Date('2026-09-17T02:00:00Z')),'내일 시작');
  assert.ok(!upcomingFestivals('전체',new Date('2026-09-20T15:01:00Z')).some(f=>f.id==='jinan-2026'));
  assert.equal(upcomingFestivals('전주',now).length,0);assert.ok(upcomingFestivals('군산',now).every(f=>f.city==='군산'));
  assert.equal(upcomingFestivals('전체',new Date('2027-01-01')).length,0);
});
test('calendar export has an exclusive final date, one-day alarm, correct escaping and UTF-8 folding',()=>{
  const ics=festivalICS({...FESTIVALS[0],name:'축제, 함께; 가요\n다음 줄'},new Date('2026-09-12T00:00:00Z'));
  assert.match(ics,/DTSTART;VALUE=DATE:20260918/);assert.match(ics,/DTEND;VALUE=DATE:20260921/);assert.match(ics,/TRIGGER:-P1D/);
  assert.match(ics.replace(/\r\n /g,''),/축제\\, 함께\\; 가요\\n다음 줄/);
  for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75);
  const yearEnd=festivalICS({...FESTIVALS[0],end:'2026-12-31'});assert.match(yearEnd,/DTEND;VALUE=DATE:20270101/);
});
