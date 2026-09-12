import test from 'node:test';
import assert from 'node:assert/strict';
import { PEOPLE, SAMPLE_USER } from '../data.js';
import { FESTIVALS } from '../local-guide.js';
import { createMeeting, transitionMeeting, activeMeeting, readMeetings, saveMeetings } from '../meeting-core.js';
import { normalizePlan, routesFor, festivalsOn, itinerary, routeForPlan, readExtra, saveExtra, coachPlan } from '../experience-core.js';
import { buildPrompt } from '../ai.js';
import { createFeatures } from '../feature-ui.js';

const now=new Date('2026-09-12T12:00:00Z');
const input={personId:'seoyeon',fromName:'체험',message:'산책과 함께 커피 한 잔 어때요?',city:'전주',date:'2026-10-03',time:'13:00'};
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};

test('request, recipient acceptance, reload, cancellation and re-request retain actual state',()=>{
  const store=storage(), pending=createMeeting([],input,'test-1',now);
  assert.equal(pending[0].status,'pending');assert.equal(pending[0].message,input.message);
  assert.throws(()=>createMeeting(pending,input,'duplicate',now),/진행 중/);
  const accepted=transitionMeeting(pending,'test-1','accepted',now);
  assert.equal(pending[0].status,'pending');assert.equal(accepted[0].status,'accepted');
  assert.ok(saveMeetings(store,accepted));assert.deepEqual(readMeetings(store),accepted);
  assert.throws(()=>transitionMeeting(accepted,'test-1','declined',now),/이미 처리/);
  const cancelled=transitionMeeting(accepted,'test-1','cancelled',now);
  assert.equal(activeMeeting(cancelled,'seoyeon'),undefined);
  assert.equal(createMeeting(cancelled,input,'test-2',now).length,2);
});
test('decline is final; malformed input and failed persistence never report success',()=>{
  const pending=createMeeting([],{...input,date:'',time:''},'open-date',now);
  const declined=transitionMeeting(pending,'open-date','declined',now);
  assert.equal(declined[0].status,'declined');
  assert.throws(()=>transitionMeeting(declined,'open-date','accepted',now));
  for(const bad of [{message:' '},{personId:'unknown'},{date:'2026-09-11'},{date:'2026-02-30'},{time:'25:00'}])assert.throws(()=>createMeeting([],{...input,...bad},'bad',now));
  assert.equal(saveMeetings({setItem(){throw Error('quota')}},pending),false);
  assert.deepEqual(readMeetings({getItem:()=>'{broken'}),[]);
  assert.deepEqual(readMeetings({getItem:()=>JSON.stringify([{...pending[0],personId:'missing'}])}),[]);
});
test('history trimming retains active meetings while repeated completed requests accumulate',()=>{
  let requests=createMeeting([],input,'active',now);
  for(let i=0;i<40;i++){requests=createMeeting(requests,{...input,personId:'haneul'},`closed-${i}`,now);requests=transitionMeeting(requests,`closed-${i}`,'declined',now);}
  assert.equal(requests.length,30);assert.equal(activeMeeting(requests,'seoyeon').id,'active');
});
test('festival routes require the matching city and inclusive start/end dates',()=>{
  const offset=(d,n)=>new Date(Date.parse(d)+n*86400000).toISOString().slice(0,10);
  for(const f of FESTIVALS){
    for(const d of [f.start,f.end])assert.ok(routesFor(f.city,d).some(r=>r.festivalId===f.id));
    for(const d of ['',offset(f.start,-1),offset(f.end,1),'2026-02-30'])assert.ok(!festivalsOn(f.city,d).some(x=>x.id===f.id));
    assert.ok(!routesFor('전주',f.start).some(r=>r.festivalId===f.id));
    const p=normalizePlan({city:f.city,date:f.start,routeId:`festival-${f.id}`,personId:'seoyeon'});
    assert.equal(routeForPlan(p).festivalId,f.id);
    assert.ok(itinerary(p).some(s=>s.kind==='festival'&&s.name===f.name));
    for(const change of [{date:''},{date:offset(f.end,1)},{city:'전주'}])assert.ok(!itinerary({...p,...change}).some(s=>s.kind==='festival'));
  }
});
test('saved festival courses and avatar guidance preserve the event, date and selected partner',()=>{
  const store=storage(), f=FESTIVALS.find(f=>f.city==='군산'), p=normalizePlan({city:f.city,date:f.start,routeId:`festival-${f.id}`,personId:'haneul'});
  const extra=readExtra(store);extra.planner=p;extra.routes=[p];assert.ok(saveExtra(store,extra));
  assert.deepEqual(readExtra(store).routes,[p]);
  assert.match(coachPlan(SAMPLE_USER,PEOPLE[2],p).invitation,/군산시간여행축제/);
  const prompt=JSON.stringify(buildPrompt('avatar',SAMPLE_USER,PEOPLE[2],{date:p.date,route:routeForPlan(p),steps:itinerary(p)}));
  assert.ok(prompt.includes(f.name));assert.ok(prompt.includes(f.start));
});
test('dates show all upcoming festivals even with Jeonju selected and connect a accepted request to planning',()=>{
  const store=storage();
  const features=createFeatures({storage:store,state:()=>({likes:[],hidden:[],plans:[],profile:null}),user:()=>SAMPLE_USER,render(){},navigate(){},showModal(){},modalHead:()=>'',btn:(label)=>label,toast(){},showAI(){},copy(){},intro:()=>'',meetingPanel:()=>''});
  const markup=features.dates();assert.match(markup,/다가오는 지역 축제/);assert.match(markup,/축제 둘러볼 지역/);
  features.planMeeting({...input,personId:'haneul',city:'군산',date:'2026-10-03',time:'14:30'});
  const dateMarkup=features.dates();assert.match(dateMarkup,/이 날짜에 열리는 축제/);assert.match(dateMarkup,/festival-gunsan-2026/);
  assert.equal(features.extra.planner.personId,'haneul');assert.equal(features.extra.planner.start,'14:30');
});
