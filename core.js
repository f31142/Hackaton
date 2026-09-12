import { PEOPLE, QUESTIONS, CITIES, TIMES, INTERESTS } from './data.js?v=ieum5';
export const STORAGE_KEY = 'meetrust:v2';
export const intersect = (a=[],b=[]) => a.filter(x=>b.includes(x));
export function match(user,person) {
  const traits = QUESTIONS.filter(q=>user.answers[q.id]===person.answers[q.id]);
  const areas = intersect(user.areas,person.areas);
  const times = intersect(user.times,person.times);
  const interests = intersect(user.interests,person.interests);
  // Internal ordering only. This is not a psychological diagnosis or match probability.
  const score = traits.length*6 + Math.min(interests.length,3)*4 + (areas.length?25:0) + (times.length?25:0) + (person.city===user.city?8:0);
  return {person,traits,areas,times,interests,score};
}
export function recommend(user,filters={}) {
  return PEOPLE.filter(p=>!filters.hidden?.includes(p.id))
    .filter(p=>!user.seeking||user.seeking==='all'||p.gender===user.seeking)
    .filter(p=>!filters.city||filters.city==='전체'||p.areas.includes(filters.city))
    .filter(p=>!filters.gender||filters.gender==='all'||p.gender===filters.gender)
    .filter(p=>p.age>=(filters.minAge||19)&&p.age<=(filters.maxAge||99))
    .map(p=>match(user,p))
    .filter(m=>!filters.sameTime||m.times.length>0)
    .filter(m=>!filters.sameArea||m.areas.length>0)
    .sort((a,b)=>b.score-a.score||a.person.id.localeCompare(b.person.id));
}
export function reasons(m) {
  return [m.traits.length?`${m.traits[0].tags[m.person.answers[m.traits[0].id]]}를 선호해요`: '서로 다른 관계의 속도를 알아가 보세요',m.interests.length?`${m.interests.slice(0,2).join('와 ')} 이야기를 나눌 수 있어요`:'새로운 취향을 나눌 수 있어요',m.areas.length&&m.times.length?`${m.areas[0]}에서 ${m.times[0]}에 만날 수 있어요`:!m.times.length?'만날 수 있는 시간을 먼저 맞춰보세요':'서로 편한 만남 지역을 먼저 정해보세요'];
}
export function profileSummary(user) {
  const tags=QUESTIONS.map(q=>q.tags[user.answers[q.id]]);
  return {title:user.answers.pace===0?'천천히, 깊어지는 사이':user.answers.pace===2?'마음을 솔직하게 나누는 사이':'함께하며 자연스러워지는 사이',tags,body:`${tags[2]}을 좋아하고, ${tags[1]}을 편하게 느끼는 편이에요. ${tags[3]}과 ${tags[4]}를 중요하게 생각해요.`};
}
export function draftOpener(user,person) {
  const common=intersect(user.interests,person.interests);
  const topic=common[0]||person.interests[0];
  const questions={카페:'요즘 자주 가는 카페가 있으세요?',산책:'가장 좋아하는 산책길이 어디예요?',독서:'최근에 읽은 책 중에 추천하고 싶은 책이 있나요?',영화:'최근에 본 영화 중에 기억에 남는 작품이 있나요?',전시:'최근에 다녀온 전시 중에 좋았던 곳이 있나요?',여행:'다시 가고 싶은 여행지가 있으세요?',음악:'요즘 자주 듣는 노래가 궁금해요.',사진:'어떤 풍경을 사진에 담는 걸 좋아하세요?',운동:'요즘 즐겨 하는 운동이 있으세요?',맛집:'최근에 발견한 맛집이 있으세요?',요리:'가장 자신 있는 요리가 궁금해요.',반려동물:'반려동물과 함께하는 일상이 궁금해요.'};
  return `안녕하세요! ${common.length?`저도 ${topic} 좋아해서 반가웠어요. `:`${topic} 좋아하신다는 소개가 눈에 들어왔어요. `}${questions[topic]||'어떤 계기로 좋아하게 되셨어요?'}`;
}
export function normalizeProfile(p) {
  if(!p||typeof p!=='object') return null;
  if(typeof p.name!=='string'||!p.name.trim()||!Number.isInteger(Number(p.age))||p.age<19||p.age>99||!CITIES.includes(p.city)) return null;
  const clean=(a,valid)=>Array.isArray(a)?[...new Set(a)].filter(x=>valid.includes(x)):[];
  const areas=clean(p.areas,CITIES),times=clean(p.times,TIMES),interests=clean(p.interests,INTERESTS);
  if(!areas.includes(p.city)) areas.unshift(p.city);
  if(!times.length||!interests.length||!p.answers||QUESTIONS.some(q=>![0,1,2].includes(p.answers[q.id]))) return null;
  return {name:p.name.trim().slice(0,16),age:Number(p.age),city:p.city,areas:areas.slice(0,3),times,interests:interests.slice(0,5),seeking:['all','woman','man'].includes(p.seeking)?p.seeking:'all',answers:Object.fromEntries(QUESTIONS.map(q=>[q.id,p.answers[q.id]])),note:typeof p.note==='string'?p.note.trim().slice(0,300):''};
}
export function readState(storage) {
  try {const raw=JSON.parse(storage.getItem(STORAGE_KEY)||'{}');return {profile:normalizeProfile(raw.profile),likes:Array.isArray(raw.likes)?raw.likes.filter(id=>PEOPLE.some(p=>p.id===id)):[],hidden:Array.isArray(raw.hidden)?raw.hidden.filter(id=>PEOPLE.some(p=>p.id===id)):[],plans:Array.isArray(raw.plans)?raw.plans.filter(p=>PEOPLE.some(x=>x.id===p.personId)&&CITIES.includes(p.city)&&TIMES.includes(p.time)).slice(0,20):[]};}
  catch{return {profile:null,likes:[],hidden:[],plans:[]};}
}
export function saveState(storage,state) {try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function escapeHTML(value) {return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
