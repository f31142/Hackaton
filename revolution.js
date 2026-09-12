import { SAMPLE_USER } from './data.js';
import { recommend, reasons, readState, escapeHTML as esc } from './core.js';

const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
const page=document.getElementById('content');
let queued=false;

function matchCopy(m){
  const p=m.person;
  const reasonList=reasons(m);
  const area=m.areas[0]||p.city;
  const time=m.times[0]||'시간 조율 필요';
  const overlap=m.interests.slice(0,2).join(' · ')||'새로운 취향';
  return {
    area,time,overlap,
    headline:m.areas.length&&m.times.length?'이번 주, 실제로 만나기 좋은 인연이에요.':m.areas.length?'생활권이 가까운 인연이에요.':'새로운 생활권까지 넓혀본 인연이에요.',
    reason:`${reasonList[0]} ${reasonList[1]} ${reasonList[2]}`
  };
}

function miniCard(m,index){
  const p=m.person;
  const copy=matchCopy(m);
  const rank=index===0?'가장 잘 맞아요':index===1?'두 번째 잇음':'새로운 가능성';
  return `<article class="ieum-mini-card">
    <button class="ieum-card-hit" data-action="detail" data-id="${p.id}" aria-label="${esc(p.name)} 프로필 보기"></button>
    <div class="ieum-mini-photo portrait-bg p${p.photo}" role="img" aria-label="가상의 ${esc(p.name)} 프로필 사진"></div>
    <div class="ieum-mini-body">
      <div class="ieum-mini-top"><span class="ieum-rank">${rank}</span><span class="ieum-score">${m.score}</span></div>
      <h3>${esc(p.name)} <small>${p.age}</small></h3>
      <p>${esc(p.city)} · ${esc(p.job)}</p>
      <div class="ieum-mini-tags"><span>${esc(copy.area)}</span><span>${esc(copy.time)}</span></div>
    </div>
  </article>`;
}

function renderRevolution(){
  if(location.hash && location.hash!=='#discover') return;
  if(page.querySelector('.ieum-revolution')) return;

  const state=readState(storage);
  const u=state.profile||SAMPLE_USER;
  const matches=recommend(u,{hidden:state.hidden}).slice(0,3);
  if(!matches.length) return;
  const top=matches[0];
  const p=top.person;
  const copy=matchCopy(top);
  const profileReady=Boolean(state.profile);
  const overlapCount=top.interests.length;

  page.innerHTML=`<div class="ieum-revolution">
    <section class="ieum-hero">
      <div class="ieum-hero-copy">
        <div class="ieum-kicker"><span class="ieum-live-dot"></span> 전북에서 지금 이어질 수 있는 사람</div>
        <h1>좋아요 말고,<br><strong>만남까지.</strong></h1>
        <p>수십 명을 넘겨보지 않아도 돼요.<br>AI가 생활권·시간·관계 성향을 읽고 <b>딱 3명만</b> 골라드려요.</p>
        <div class="ieum-hero-actions">
          <button class="ieum-primary" data-action="${profileReady?'detail':'survey'}" ${profileReady?`data-id="${p.id}"`:''}>${profileReady?'오늘의 인연 보기':'내 인연 찾기'} <span>→</span></button>
          <button class="ieum-quiet" data-action="${profileReady?'survey':'about'}">${profileReady?'내 기준 바꾸기':'어떻게 추천하나요?'}</button>
        </div>
        <div class="ieum-trust"><span>✓ 프로필을 많이 보여주지 않아요</span><span>✓ 실제 만날 수 있는 조건을 먼저 봐요</span></div>
      </div>
      <div class="ieum-hero-stat">
        <span>이번 주 가능한 잇음</span>
        <strong>${matches.filter(m=>m.times.length&&m.areas.length).length}<small>명</small></strong>
        <p>${profileReady?`${esc(u.name)} 님의 생활권과 시간을 기준으로 찾았어요.`:'체험 프로필 기준으로 먼저 보여드릴게요.'}</p>
      </div>
    </section>

    <section class="ieum-section ieum-today">
      <div class="ieum-section-heading">
        <div><span>오늘의 잇음</span><h2>AI가 가장 먼저 추천한 사람</h2></div>
        <div class="ieum-index"><small>잇음 지수</small><strong>${top.score}</strong><span>/ 100</span></div>
      </div>
      <article class="ieum-feature-card">
        <div class="ieum-feature-photo portrait-bg p${p.photo}" role="img" aria-label="가상의 ${esc(p.name)} 프로필 사진">
          <div class="ieum-photo-badge">AI PICK</div>
          <div class="ieum-photo-copy"><h3>${esc(p.name)} <small>${p.age}</small></h3><p>${esc(p.city)} · ${esc(p.job)}</p></div>
        </div>
        <div class="ieum-feature-body">
          <div class="ieum-availability"><span></span>${copy.headline}</div>
          <h3>“${esc(p.quote)}”</h3>
          <div class="ieum-ai-reason">
            <div class="ieum-ai-icon">AI</div>
            <div><b>왜 ${esc(p.name)} 님일까요?</b><p>${esc(copy.reason)}</p></div>
          </div>
          <div class="ieum-facts">
            <div><small>생활권</small><strong>${esc(copy.area)}</strong><span>겹쳐요</span></div>
            <div><small>가능 시간</small><strong>${esc(copy.time)}</strong><span>${top.times.length?'함께 가능':'조율 필요'}</span></div>
            <div><small>공통 취향</small><strong>${overlapCount}<em>개</em></strong><span>${esc(copy.overlap)}</span></div>
          </div>
          <div class="ieum-feature-actions">
            <button class="ieum-primary wide" data-action="navigate" data-view="dates">첫 약속 만들기 <span>→</span></button>
            <button class="ieum-secondary" data-action="detail" data-id="${p.id}">프로필 자세히</button>
          </div>
        </div>
      </article>
    </section>

    <section class="ieum-section">
      <div class="ieum-section-heading simple"><div><span>이번 주의 3명</span><h2>선택지는 적게, 이유는 분명하게.</h2></div><p>많이 보여주는 대신 실제 만날 가능성이 높은 순서로 정리했어요.</p></div>
      <div class="ieum-mini-grid">${matches.map(miniCard).join('')}</div>
    </section>

    <section class="ieum-flow">
      <div class="ieum-flow-title"><span>전북 잇음의 방식</span><h2>소개팅에서 귀찮았던 걸<br>세 단계로 줄였어요.</h2></div>
      <div class="ieum-flow-steps">
        <div><b>01</b><strong>AI가 3명만 고르기</strong><p>취향만 비슷한 사람이 아니라 관계 속도와 일상까지 함께 봐요.</p></div>
        <div><b>02</b><strong>생활권·시간 먼저 맞추기</strong><p>전주·완주처럼 실제 오갈 수 있는 생활권과 겹치는 시간을 우선해요.</p></div>
        <div><b>03</b><strong>첫 약속까지 바로 만들기</strong><p>매칭 뒤 다시 일정과 장소를 묻는 대신 첫 만남 초안까지 한 번에 이어져요.</p></div>
      </div>
    </section>

    <section class="ieum-bottom-cta">
      <div><span>전북 잇음</span><h2>멀리 찾지 마세요.<br>만날 수 있는 사람부터.</h2></div>
      <button class="ieum-primary light" data-action="${profileReady?'navigate':'survey'}" ${profileReady?'data-view="dates"':''}>${profileReady?'이번 주 약속 만들기':'2분 성향 찾기'} <span>→</span></button>
    </section>

    <p class="ieum-demo-note">현재 프로필과 사진은 서비스 시연을 위한 가상 데이터입니다. 잇음 지수는 생활권·시간·취향·설문 응답을 조합한 서비스 내부 추천 점수예요.</p>
  </div>`;
}

function sync(){
  if(queued) return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;renderRevolution();});
}

const observer=new MutationObserver(sync);
observer.observe(page,{childList:true,subtree:false});
window.addEventListener('hashchange',()=>setTimeout(sync,0));
window.addEventListener('storage',()=>setTimeout(sync,0));
setTimeout(sync,0);
