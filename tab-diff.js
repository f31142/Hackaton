import { PEOPLE, SAMPLE_USER } from './data.js';
import { readState, recommend, match, profileSummary, escapeHTML as esc } from './core.js';

const EXTRA_KEY='ieum:extra:v1';
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
const page=document.getElementById('content');
const experienceRoot=()=>document.getElementById('ieum-experience-root');

function extras(){try{return JSON.parse(localStorage.getItem(EXTRA_KEY)||'{}')}catch{return {}}}
function state(){return readState(storage)}
function person(id){return PEOPLE.find(p=>p.id===id)}
function toast(msg){let t=document.querySelector('.ieum-toast2');if(!t){t=document.createElement('div');t.className='ieum-toast2';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._r);t._r=setTimeout(()=>t.classList.remove('show'),2100)}

function topMatches(s){const u=s.profile||SAMPLE_USER;return recommend(u,{hidden:s.hidden}).slice(0,6)}
function metric(label,value,sub=''){return `<div class="role-metric"><small>${label}</small><b>${value}</b>${sub?`<span>${sub}</span>`:''}</div>`}

function enhanceDiscover(){
  if(location.hash&&location.hash!=='#discover')return;
  const rev=page?.querySelector('.ieum-revolution');
  if(!rev||rev.querySelector('.discover-role-note'))return;
  const note=document.createElement('div');
  note.className='discover-role-note';
  note.innerHTML='<b>오늘의 잇음 = 사람을 발견하는 곳</b><span>AI가 사람을 많이 보여주기보다, 지금 실제로 이어질 가능성이 높은 3명만 정리해요.</span>';
  const hero=rev.querySelector('.ieum-hero');
  hero?.insertAdjacentElement('afterend',note);
}

function comparisonData(s){
  const u=s.profile||SAMPLE_USER;
  const rec=topMatches(s);
  let ids=s.likes.filter(id=>person(id));
  let demo=false;
  if(ids.length<2){ids=rec.slice(0,2).map(m=>m.person.id);demo=true}
  const people=ids.slice(0,2).map(id=>person(id)).filter(Boolean);
  const matches=people.map(p=>match(u,p));
  return {matches,demo};
}
function compareCard(m,index){
  if(!m)return '';
  const p=m.person;
  return `<article class="compare-person ${index===0?'best':''}">
    <div class="compare-head"><div class="role-avatar portrait-bg p${p.photo}"></div><div><small>${index===0?'AI 우선 후보':'비교 후보'}</small><h3>${esc(p.name)} <em>${p.age}</em></h3><p>${esc(p.city)} · ${esc(p.job)}</p></div><strong>${m.score}</strong></div>
    <div class="compare-facts">${metric('생활권',m.areas[0]||'조율 필요',m.areas.length?'겹침':'')}${metric('가능 시간',m.times[0]||'조율 필요',m.times.length?'함께 가능':'')}${metric('공통 취향',`${m.interests.length}개`,m.interests.slice(0,2).join(' · ')||'새 취향')}</div>
  </article>`
}
function enhanceLikes(){
  if(location.hash!=='#likes')return;
  if(!page||page.querySelector('.likes-diff'))return;
  const intro=page.querySelector('.page-intro');if(!intro)return;
  const s=state();const {matches,demo}=comparisonData(s);const winner=matches.slice().sort((a,b)=>b.score-a.score)[0];
  const box=document.createElement('section');box.className='likes-diff';
  box.innerHTML=`<div class="diff-head"><div><span class="diff-kicker">DECIDE YOUR IEUM</span><h2>관심은 저장함보다,<br>“누구를 실제로 만나볼지” 결정하는 곳.</h2><p>저장한 후보를 생활권·시간·취향으로 비교하고, AI가 지금 만나기 쉬운 사람을 한 명 먼저 짚어줘요.</p></div><div class="diff-count"><b>${s.likes.length}</b><span>저장한 사람</span></div></div>
  ${demo?'<div class="demo-inline">아직 관심에 2명이 없어 오늘의 잇음 상위 2명으로 비교 미리보기를 보여드려요.</div>':''}
  <div class="compare-grid">${matches.map(compareCard).join('')}</div>
  <div class="ai-priority"><div><span>AI PRIORITY</span><b>${winner?`${esc(winner.person.name)} 님을 먼저 만나보는 걸 추천해요.`:'후보를 저장하면 우선순위를 정리해드려요.'}</b><p>${winner?`${winner.areas.length?'생활권이 겹치고, ':''}${winner.times.length?'가능 시간도 맞으며, ':''}공통 취향 ${winner.interests.length}개를 함께 볼 수 있어요.`:'오늘의 잇음에서 마음이 가는 사람을 저장해보세요.'}</p></div><button data-like-ai>추천 이유 더 보기</button></div>
  <div class="role-actions"><button data-action="navigate" data-view="discover">오늘의 잇음 더 보기</button><button class="primary" data-action="navigate" data-view="dates">소개 요청하고 약속 준비</button></div>`;
  intro.insertAdjacentElement('afterend',box);
}

function behaviorScores(p){
  if(!p?.answers)return [{n:'약속 계획성',v:0},{n:'연락 독립성',v:0},{n:'관계 속도',v:0},{n:'갈등 대화력',v:0}];
  const a=p.answers;
  return [
    {n:'약속 계획성',v:[88,66,38][a.plan]??60},
    {n:'연락 독립성',v:[36,84,58][a.contact]??60},
    {n:'관계 속도',v:[42,66,88][a.pace]??60},
    {n:'갈등 대화력',v:[86,70,78][a.conflict]??60}
  ];
}
function completion(p,x){
  if(!p)return 15;
  let v=55;if(x.photo)v+=15;if(x.mbti)v+=10;if(p.note)v+=10;if((p.interests||[]).length>=3)v+=10;return Math.min(v,100)
}
function enhanceProfile(){
  if(location.hash!=='#profile')return;
  if(!page||page.querySelector('.profile-diff'))return;
  const intro=page.querySelector('.page-intro');if(!intro)return;
  const s=state(),x=extras(),p=s.profile;const scores=behaviorScores(p);const complete=completion(p,x);const summary=p?profileSummary(p):null;
  const box=document.createElement('section');box.className='profile-diff';
  box.innerHTML=`<div class="diff-head"><div><span class="diff-kicker">AI KNOWS ME</span><h2>내 프로필은 꾸미는 곳보다,<br>AI가 “나를 더 잘 알게 하는 곳”.</h2><p>사진·MBTI·생활권뿐 아니라 행동 설문을 계속 다듬을수록 오늘의 잇음과 데이트 코칭이 더 구체적으로 바뀌어요.</p></div><div class="profile-complete"><span>프로필 완성도</span><b>${complete}%</b><i><em style="width:${complete}%"></em></i></div></div>
  <div class="profile-role-grid"><article class="behavior-card"><div class="role-card-title"><span>BEHAVIOR PROFILE</span><h3>${summary?esc(summary.title):'먼저 내 성향을 알려주세요'}</h3></div><div class="behavior-list">${scores.map(s=>`<div><span>${s.n}</span><b>${s.v}</b><i><em style="width:${s.v}%"></em></i></div>`).join('')}</div><small>설문 응답을 서비스 내부 표현으로 시각화한 데모 지표예요.</small></article>
  <article class="profile-control"><div>${metric('MBTI',x.mbti||'미설정')}${metric('주 생활권',p?.city||'미설정')}${metric('만남 가능 시간',p?.times?.[0]||'미설정')}</div><button data-action="survey">내 정보 다시 알려주기</button></article>
  <article class="profile-ai-card"><span>AI PROFILE COACH</span><h3>“나는 어떤 만남에서 편할까?”</h3><p>${summary?esc(summary.body):'행동 설문을 마치면 AI가 내 관계 속도와 편한 상대의 특징을 정리해줘요.'}</p><button data-profile-ai>AI 아바타로 내 성향 보기</button></article>
  <article class="plan-card"><span>MY PLAN</span><h3>현재 플랜 · FREE</h3><p>기본 추천과 첫 멘트는 무료. 예상 반응·상황별 답장·당일 코칭은 Premium 아바타 모드에서 제공하는 구조예요.</p><button data-profile-ai>Premium 미리보기</button></article></div>`;
  intro.insertAdjacentElement('afterend',box);
}

const ROUTE_PREVIEW={
  전주:['객리단길 식사','한옥마을 산책','전주천 야경'],
  군산:['월명동 카페','근대문화거리','은파호수공원'],
  익산:['영등동 식사','카페','중앙체육공원'],
  임실:['치즈테마파크','지역 식사','전주 방면 선택 코스'],
  남원:['광한루원','요천 산책','한옥 카페'],
  완주:['삼례 카페','삼례문화예술촌','전주 연계 코스']
};
function routePreview(city){const r=ROUTE_PREVIEW[city]||ROUTE_PREVIEW.전주;return `<strong>${city} 데이트 확장 코스</strong><p>${r.join(' → ')} → <em>숙박(선택)</em></p>`}
function enhanceDateOverlay(){
  const r=experienceRoot();if(!r)return;
  const dateCard=r.querySelector('.ix-date-card');
  if(!dateCard||r.querySelector('.date-role-tools'))return;
  const tools=document.createElement('section');tools.className='date-role-tools';
  tools.innerHTML=`<div class="date-role-head"><div><span>DATE EXECUTION</span><h3>약속만 잡지 말고, 실제 만남까지 준비해요.</h3></div><b>전북 데이트 실행</b></div>
  <div class="date-role-grid"><article><span>01 · 지역 코스</span><b>지역을 바꾸면 하루 코스도 바뀌어요.</b><p>식사·카페·명소를 한 번에 이어서 보여줘요.</p></article><article><span>02 · 행사 연동</span><b>지역축제·행사가 있으면 코스에 끼워 넣어요.</b><p>실서비스에서는 지역 일정 데이터를 연결하는 자리예요.</p></article><article><span>03 · AI 아바타</span><b>약속 저장 뒤 첫 멘트부터 코칭.</b><p>예상 반응·다음 답장·당일 대화 가이드까지 이어져요.</p></article></div>
  <div class="date-city-row">${Object.keys(ROUTE_PREVIEW).map((c,i)=>`<button class="${i===0?'active':''}" data-role-city="${c}">${c}</button>`).join('')}</div><div class="date-route-preview">${routePreview('전주')}</div>`;
  dateCard.insertAdjacentElement('afterend',tools);
}
function enhanceDatePage(){
  if(location.hash!=='#dates')return;if(!page||page.querySelector('.date-diff'))return;
  const intro=page.querySelector('.page-intro');if(!intro)return;
  const s=state(),latest=s.plans[0],p=latest?person(latest.personId):null;
  const box=document.createElement('section');box.className='date-diff';box.innerHTML=`<div class="diff-head"><div><span class="diff-kicker">MAKE IT REAL</span><h2>데이트는 매칭 이후를<br>실제로 움직이는 곳.</h2><p>상대·지역·시간을 고르고, 전북 지역 코스와 AI 아바타까지 한 흐름으로 이어집니다.</p></div><div class="diff-count"><b>${s.plans.length}</b><span>저장한 약속</span></div></div>${latest?`<div class="latest-plan"><span>가장 최근 약속</span><b>${esc(p?.name||'상대')} · ${esc(latest.city)} · ${esc(latest.time)}</b></div>`:''}<div class="likes-tools"><div class="likes-tool"><b>지역별 데이트</b><p>전주·군산·익산·임실·남원·완주 코스를 자세히 봐요.</p><button data-up="planner">코스 만들기</button></div><div class="likes-tool"><b>AI 아바타</b><p>첫 멘트부터 당일 대화까지 코칭받아요.</p><button data-up="avatar">아바타 모드</button></div><div class="likes-tool"><b>다가오는 행사</b><p>지역축제·행사를 데이트 코스 추천에 반영하는 영역이에요.</p><button data-date-info>연동 방식 보기</button></div></div>`;intro.insertAdjacentElement('afterend',box)
}

function run(){enhanceDiscover();enhanceLikes();enhanceProfile();enhanceDatePage();enhanceDateOverlay()}
const contentObs=new MutationObserver(()=>{clearTimeout(contentObs._t);contentObs._t=setTimeout(run,35)});if(page)contentObs.observe(page,{childList:true,subtree:true});
const startExperienceObserver=()=>{const r=experienceRoot();if(!r){setTimeout(startExperienceObserver,80);return}const o=new MutationObserver(()=>setTimeout(enhanceDateOverlay,25));o.observe(r,{childList:true,subtree:true});enhanceDateOverlay()};startExperienceObserver();
window.addEventListener('hashchange',()=>setTimeout(run,50));

document.addEventListener('click',e=>{
  const city=e.target.closest('[data-role-city]');if(city){const wrap=city.closest('.date-role-tools');wrap?.querySelectorAll('[data-role-city]').forEach(b=>b.classList.toggle('active',b===city));const preview=wrap?.querySelector('.date-route-preview');if(preview)preview.innerHTML=routePreview(city.dataset.roleCity);return}
  const ai=e.target.closest('[data-like-ai]');if(ai){const s=state();const {matches}=comparisonData(s);const winner=matches.slice().sort((a,b)=>b.score-a.score)[0];toast(winner?`${winner.person.name} 님: 생활권·시간·취향을 합쳐 지금 가장 만나기 쉬운 후보예요.`:'후보를 저장하면 AI가 우선순위를 정리해요.');return}
  if(e.target.closest('[data-profile-ai]')){document.querySelector('[data-up="avatar"]')?.click();return}
  if(e.target.closest('[data-date-info]')){toast('실서비스에서는 전북 지역 행사·축제 일정 데이터를 날짜별로 연결해 코스에 자동 제안합니다.');return}
});
setTimeout(run,120);
