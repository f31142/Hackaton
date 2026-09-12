import { CITIES, PEOPLE } from './data.js?v=ieum5';
import { match, draftOpener } from './core.js?v=ieum5';
import { ROUTES, FESTIVALS } from './local-guide.js?v=ieum5';

export const EXTRA_KEY = 'ieum:features:v3';
export const LEGACY_EXTRA_KEY = 'ieum:extra:v1';
export const MBTIS = ['ENFP','ENFJ','ENTP','ENTJ','ESFP','ESFJ','ESTP','ESTJ','INFP','INFJ','INTP','INTJ','ISFP','ISFJ','ISTP','ISTJ'];
export const normalizeMBTI = value => MBTIS.includes(String(value).toUpperCase()) ? String(value).toUpperCase() : '';
export const validPhoto = value => typeof value === 'string' && value.length <= 1800000 && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value);
export function festivalsOn(city, date) {
  if (!validDate(date)) return [];
  return FESTIVALS.filter(f => f.city === city && f.start <= date && date <= f.end);
}
export function festivalRoute(festival) {
  return {id:`festival-${festival.id}`,city:festival.city,title:`${festival.name}, 함께 즐기는 하루`,mood:'지역 축제',
    meet:festival.place,meal:`${festival.place} 주변 식당`,cafe:`${festival.place} 주변 카페`,sight:festival.name,
    note:'일별 프로그램과 운영 시간을 공식 안내에서 확인하고, 혼잡한 시간에는 여유를 두고 이동해요.',
    source:festival.url,movie:false,festivalId:festival.id};
}
export const routesFor = (city, date='') => [...ROUTES.filter(r => r.city === city),...festivalsOn(city,date).map(festivalRoute)];
export function normalizePlan(raw = {}) {
  if (!raw || typeof raw !== 'object') raw = {};
  const city = CITIES.includes(raw.city) ? raw.city : '전주';
  const date = validDate(raw.date) ? raw.date : '';
  const route = routesFor(city,date).find(r => r.id === raw.routeId) || routesFor(city,date)[0];
  return { city, routeId:route.id, movie:raw.movie === true && route.movie, stay:raw.stay === true,
    start:/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(raw.start) ? raw.start : '13:00',
    date, personId:PEOPLE.some(p => p.id === raw.personId) ? raw.personId : '' };
}
export function routeForPlan(input) { const plan=normalizePlan(input); return routesFor(plan.city,plan.date).find(r=>r.id===plan.routeId); }
export function readExtra(storage) {
  let raw = {};
  try { raw = JSON.parse(storage.getItem(EXTRA_KEY) || storage.getItem(LEGACY_EXTRA_KEY) || '{}') || {}; } catch {}
  const seen = new Set();
  return { photo:validPhoto(raw.photo) ? raw.photo : '', mbti:normalizeMBTI(raw.mbti), trial:raw.trial === true,
    planner:normalizePlan(raw.planner || {}),
    routes:Array.isArray(raw.routes) ? raw.routes.filter(r => r && routesFor(r.city,r.date).some(x => x.id === r.routeId) && PEOPLE.some(p => p.id === r.personId)).map(normalizePlan).filter(r => { const key = planKey(r); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0,20) : [],
    festivals:Array.isArray(raw.festivals) ? [...new Set(raw.festivals)].filter(id => FESTIVALS.some(f => f.id === id)) : [] };
}
export function saveExtra(storage, extra) { try { storage.setItem(EXTRA_KEY, JSON.stringify(extra)); return true; } catch { return false; } }
export const planKey = p => [p.personId,p.city,p.routeId,p.movie,p.stay,p.start,p.date].join('|');
export function itinerary(input) {
  const plan = normalizePlan(input), route = routeForPlan(plan);
  const steps = [{kind:'meet',label:'만나는 곳',name:route.meet,minutes:20,tip:'찾기 쉬운 입구에서 만나요.'}];
  if (plan.movie) steps.push({kind:'movie',label:'영화',name:`${route.city} 영화관`,minutes:150,tip:'상영작과 시간을 함께 고른 뒤 예약해요. 이동 여유를 포함한 예시예요.'});
  steps.push({kind:'meal',label:'함께 식사',name:route.meal,minutes:70,tip:'못 먹는 음식과 좋아하는 메뉴를 먼저 물어봐요.'});
  if(route.festivalId)steps.push({kind:'festival',label:'축제 즐기기',name:route.sight,minutes:120,tip:route.note});
  steps.push({kind:'cafe',label:'커피 한 잔',name:route.cafe,minutes:70,tip:'지도의 최근 리뷰와 영업시간을 보고 골라요.'});
  if(!route.festivalId)steps.push({kind:'sight',label:'지역 명소',name:route.sight,minutes:80,tip:route.note});
  if (plan.stay) steps.push({kind:'stay',label:'숙박 · 선택',name:`${route.city} 숙박업소`,minutes:0,tip:'하루가 더 아쉽다면? 두 사람 모두 원할 때 위치와 객실을 함께 골라요.'});
  let elapsed = Number(plan.start.slice(0,2))*60 + Number(plan.start.slice(3));
  return steps.map(step => { const day = Math.floor(elapsed / 1440); const at = `${day ? '다음 날 ' : ''}${String(Math.floor(elapsed%1440/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`; elapsed += step.minutes; return {...step,at}; });
}
export function routeText(plan, person) {
  const r = routeForPlan(plan);
  return `${person.name} 님과 ${plan.city}에서 · ${r.title}\n${plan.date || '날짜 미정'} · ${plan.start} 시작\n${itinerary(plan).map(s => `${s.at} ${s.label} — ${s.name}`).join('\n')}\n시간은 계획 예시이며 실제 예약이나 확정 약속이 아닙니다.`;
}
export function coachPlan(user, person, plan, tone='warm', scenario='open') {
  const m=match(user,person), r=routeForPlan(plan);
  const topic=m.interests[0]||person.interests[0];
  const invitation=tone==='light' ? `${r.city}에서 ${r.cafe} 같이 가볼래요? 커피 마시고 괜찮으면 ${r.sight}도 둘러봐요!` : tone==='calm' ? `괜찮으시면 ${r.city}에서 커피 한 잔 하실래요? ${r.cafe}에서 이야기 나누고 싶어요.` : `${r.cafe}에서 커피 한 잔 어때요? 이야기하다가 둘 다 괜찮으면 ${r.sight}도 같이 둘러보고 싶어요.`;
  const scenarios={
    open:{label:'대화를 이어갈 때',reply:`저도 ${topic} 좋아해요. ${r.city}에서 만나면 좋겠네요.`,next:`반가워요! ${m.times[0] ? `${m.times[0]}은 어떠세요?` : '어느 시간대가 편하세요?'} 장소는 같이 골라봐요.`},
    short:{label:'답장이 짧을 때',reply:'네, 좋아요.',next:`편하게 생각해 주세요. ${topic} 중에 요즘 특히 좋아하는 게 있으세요?`},
    busy:{label:'시간이 안 맞을 때',reply:'그날은 조금 어려울 것 같아요.',next:'알려줘서 고마워요. 괜찮으실 때 편한 날짜를 알려주세요. 서두르지 않아도 좋아요.'},
  };
  const pace=person.answers.pace===0?'상대는 천천히 알아가기를 선택했어요. 짧은 첫 만남을 제안해 보세요.':person.answers.pace===2?'상대는 솔직한 표현을 선택했어요. 함께하고 싶은 이유를 짧게 말해보세요.':'상대는 자연스러운 만남을 선택했어요. 계획을 가볍게 제안해 보세요.';
  return {topic,opener:draftOpener(user,person),invitation,scenario:scenarios[scenario]||scenarios.open,pace,
    routeReason: m.interests.length ? `함께 좋아하는 ${m.interests.slice(0,2).join('·')} 이야기를 카페에서 시작해 보세요.` : `상대가 좋아하는 ${topic}에 대해 물어보며 취향을 알아가 보세요.`,
    coordination:!m.areas.includes(r.city)?`${r.city}은 두 사람의 공통 생활권이 아니에요. 이동이 괜찮은지 먼저 물어보세요.`:!m.times.length?'겹치는 시간대가 아직 없어요. 날짜를 정하기 전에 가능한 시간을 맞춰보세요.':`${r.city} 생활권과 ${m.times[0]} 시간이 겹쳐요. 구체적인 날짜는 함께 정해요.`};
}
export const canUseAvatar = extra => extra.trial === true;
export function validDate(value) { return typeof value==='string' && /^20\d{2}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value; }
export function koreaToday(now=new Date()) { return new Date(now.getTime()+9*3600000).toISOString().slice(0,10); }
export function upcomingFestivals(city='전체',now=new Date()) { const today=koreaToday(now); return FESTIVALS.filter(f=>f.end>=today&&(city==='전체'||f.city===city)).sort((a,b)=>a.start.localeCompare(b.start)); }
export function festivalStatus(f,now=new Date()) { const today=koreaToday(now); if(f.end<today)return '종료'; if(f.start<=today)return '진행 중'; const days=Math.round((Date.parse(f.start)-Date.parse(today))/86400000); return days===1?'내일 시작':`D-${days}`; }
const icsEscape = value => String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
function foldLine(line) { const out=[]; let part='',size=0; for(const char of line) { const n=new TextEncoder().encode(char).length; if(size+n>75){out.push(part);part=' ';size=1;}part+=char;size+=n; }out.push(part);return out.join('\r\n'); }
export function festivalICS(f,now=new Date()) {
  if(!validDate(f.start)||!validDate(f.end))throw new Error('Invalid event date');
  const end=new Date(Date.parse(f.end)+86400000).toISOString().slice(0,10).replaceAll('-','');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//IEUM//Jeonbuk Dates//KO','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    `UID:${f.id}@ieum.local`,`DTSTAMP:${now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,
    `DTSTART;VALUE=DATE:${f.start.replaceAll('-','')}`,`DTEND;VALUE=DATE:${end}`,`SUMMARY:${icsEscape(f.name)}`,`LOCATION:${icsEscape(f.place)}`,`DESCRIPTION:${icsEscape('전북 잇음에서 저장한 축제입니다. 방문 전 공식 일정을 확인해 주세요.\n'+f.url)}`,
    'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY',`DESCRIPTION:${icsEscape(f.name+' 하루 전 알림')}`,'END:VALARM','END:VEVENT','END:VCALENDAR'].map(foldLine).join('\r\n')+'\r\n';
}
