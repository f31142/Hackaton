import test from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_USER, PEOPLE, QUESTIONS} from '../data.js';
import {match,recommend,normalizeProfile,readState,saveState,escapeHTML,draftOpener,profileSummary} from '../core.js';
import {buildPrompt} from '../ai.js';

test('recommendations actually change with lifestyle answers and available regions and times',()=>{
  const first=recommend(SAMPLE_USER);
  assert.equal(first[0].person.id,'seoyeon');
  const changed={...SAMPLE_USER,city:'남원',areas:['남원'],times:['평일 낮'],interests:['여행','운동','사진'],answers:{...PEOPLE[5].answers}};
  assert.equal(recommend(changed)[0].person.id,'minjae');
  assert.notEqual(profileSummary(changed).title,profileSummary(SAMPLE_USER).title);
});
test('filters are hard constraints, including full exclusion and explicit user preferences',()=>{
  assert.ok(recommend(SAMPLE_USER,{gender:'man'}).every(m=>m.person.gender==='man'));
  assert.ok(recommend({...SAMPLE_USER,seeking:'woman'}).every(m=>m.person.gender==='woman'));
  assert.ok(recommend(SAMPLE_USER,{sameTime:true,sameArea:true}).every(m=>m.times.length&&m.areas.length));
  assert.equal(recommend(SAMPLE_USER,{city:'무주'}).length,0);
  assert.equal(recommend(SAMPLE_USER,{minAge:40}).length,0);
  assert.equal(recommend(SAMPLE_USER,{hidden:PEOPLE.map(p=>p.id)}).length,0);
});
test('compatibility exposes observed overlaps rather than invented times or probabilities',()=>{
  const m=match(SAMPLE_USER,PEOPLE[0]);assert.equal(m.traits.length,5);assert.deepEqual(m.times,['평일 저녁','토요일 오후']);
  assert.equal(match({...SAMPLE_USER,times:['평일 낮']},PEOPLE[0]).times.length,0);
  assert.equal(match({...SAMPLE_USER,areas:['무주']},PEOPLE[0]).areas.length,0);
});
test('profile validation rejects missing, underage, invalid and incomplete answers',()=>{
  for(const p of [null,{}, {...SAMPLE_USER,name:''},{...SAMPLE_USER,age:18},{...SAMPLE_USER,age:20.5},{...SAMPLE_USER,times:[]},{...SAMPLE_USER,answers:{}},{...SAMPLE_USER,city:'서울'}])assert.equal(normalizeProfile(p),null);
  const normalized=normalizeProfile({...SAMPLE_USER,name:'  테스트  ',areas:['전주','전주','서울'],interests:['카페','카페','invalid']});
  assert.equal(normalized.name,'테스트');assert.deepEqual(normalized.areas,['전주']);assert.deepEqual(normalized.interests,['카페']);
});
test('broken or blocked storage cannot break the app and unknown profile IDs are removed',()=>{
  assert.equal(readState({getItem(){throw Error('blocked');}}).profile,null);
  assert.deepEqual(readState({getItem:()=>'{broken'}).likes,[]);
  const s=readState({getItem:()=>JSON.stringify({profile:SAMPLE_USER,likes:['seoyeon','invalid'],hidden:['invalid'],plans:[{personId:'unknown',city:'전주',time:'평일 저녁'}]})});
  assert.deepEqual(s.likes,['seoyeon']);assert.deepEqual(s.plans,[]);
  assert.equal(saveState({setItem(){throw Error('quota');}},s),false);
});
test('user strings are escaped and AI prompts send relevant preferences without names or age',()=>{
  assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
  const u={...SAMPLE_USER,name:'PRIVATE_NAME',age:45,note:'교대 근무라 주말 시간이 유동적이에요.'};
  const prompt=JSON.stringify(buildPrompt('reason',u,PEOPLE[0]));
  assert.ok(prompt.includes(u.note));assert.ok(!prompt.includes(u.name));assert.ok(!prompt.includes('45'));
  assert.ok(QUESTIONS.every(q=>prompt.includes(q.options[u.answers[q.id]])));
  assert.match(draftOpener(u,PEOPLE[0]),/카페/);
});
