const ROOT_ID='ieum-experience-root';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function root(){return document.getElementById(ROOT_ID)}
function toast(msg){let t=document.querySelector('.ieum-toast2');if(!t){t=document.createElement('div');t.className='ieum-toast2';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),1900)}
function getContext(){
  const r=root();
  const title=r?.querySelector('.ix-result.compact h1')?.textContent?.replace(/\s+/g,' ').trim()||'';
  const name=(title.match(/^(.+?) 님과/)||[])[1]||'상대';
  const confirm=r?.querySelector('.ix-confirm small')?.textContent?.trim()||'전북 · 주말';
  const route=r?.querySelector('.ix-confirm strong')?.textContent?.trim()||'카페 → 산책';
  const opener=r?.querySelector('#ix-opener')?.textContent?.trim()||'안녕하세요! 반가워요 :)';
  return {name,confirm,route,opener};
}
function patchComplete(){
  const r=root(); if(!r)return;
  const compact=r.querySelector('.ix-result.compact');
  if(!compact||compact.dataset.aiPatched==='1')return;
  const label=compact.querySelector('span');
  if(!label||!label.textContent.includes('첫 약속 초안 저장'))return;
  compact.dataset.aiPatched='1';
  const home=compact.querySelector('[data-ix="result-home"]');
  if(home){home.removeAttribute('data-ix');home.dataset.aiRoom='open';home.innerHTML='AI와 첫 대화 준비하기 <span>→</span>'}
  const old=compact.querySelector('[data-ix="old-date"]');
  if(old){old.removeAttribute('data-ix');old.dataset.aiRoom='home';old.textContent='나중에 할게요 · 홈으로'}
  const hint=document.createElement('p');hint.className='ai-room-hint';hint.textContent='매칭 다음이 더 어렵다면, 첫 멘트부터 데이트 당일까지 AI가 옆에서 도와드려요.';
  home?.insertAdjacentElement('beforebegin',hint);
}
function roomMarkup(ctx,unlocked=false){
  return `<div class="ai-room">
    <section class="ai-room-hero">
      <div><span class="ai-room-kicker">✦ AI AVATAR MODE</span><h1>${esc(ctx.name)} 님과의 첫 대화,<br>혼자 준비하지 않아도 돼요.</h1><p>상대의 취향과 약속 정보를 바탕으로 첫 멘트부터 예상 반응, 다음 답장, 데이트 당일 대화 주제까지 정리했어요.</p></div>
      <span class="ai-room-premium">PREMIUM</span>
    </section>
    <section class="ai-room-context"><div><small>예정된 첫 약속</small><b>${esc(ctx.confirm)}</b></div><div><small>데이트 초안</small><b>${esc(ctx.route)}</b></div></section>
    <section class="ai-room-grid">
      <article class="ai-coach-card featured"><span>01 · 첫 멘트</span><h3>부담 없이 대화 시작하기</h3><p class="ai-script">“${esc(ctx.opener)}”</p><button data-ai-room="copy" data-copy="${esc(ctx.opener)}">문구 복사</button></article>
      <article class="ai-coach-card"><span>02 · 예상 반응</span><h3>${esc(ctx.name)} 님은 이렇게 답할 가능성이 있어요</h3><p>“저도 카페 좋아해요 ㅎㅎ 요즘은 조용한 곳 자주 가는 편이에요.”</p><div class="ai-prob"><b>AI 예상</b><span>취향·대화 성향 기반</span></div></article>
      <article class="ai-coach-card"><span>03 · 다음 답장</span><h3>대화를 약속으로 자연스럽게</h3><p class="ai-script">“저도 조용한 곳 좋아해요. 혹시 요즘 자주 가는 카페 있으면 추천해주세요 :)”</p><button data-ai-room="copy" data-copy="저도 조용한 곳 좋아해요. 혹시 요즘 자주 가는 카페 있으면 추천해주세요 :)">문구 복사</button></article>
      <article class="ai-coach-card"><span>04 · 대화 가이드</span><h3>오늘 잘 맞을 이야기</h3><div class="ai-topic-list"><i>카페</i><i>주말 취향</i><i>영화·음악</i></div><p>질문은 한 번에 하나씩. 첫 대화에서 연애관이나 사적인 질문을 깊게 묻기보다 공통 취향부터 시작해요.</p></article>
    </section>
    <section class="ai-room-danger"><div><span>⚠ 피하면 좋은 흐름</span><b>“왜 답장이 늦어요?” · 과한 신상 질문 · 첫 대화부터 미래 관계 압박</b></div><p>상대가 부담을 느낄 수 있는 표현을 AI가 미리 걸러줘요.</p></section>
    <section class="ai-premium-zone ${unlocked?'unlocked':''}">
      <div class="ai-premium-copy"><span>AI DATE COACH · PREMIUM</span><h2>${unlocked?'프리미엄 코치가 열렸어요.':'여기서부터는 AI가 한 단계 더 개입해요.'}</h2><p>${unlocked?'예상 답장 시뮬레이션, 당일 대화 카드, 데이트 종료 멘트까지 체험할 수 있어요.':'상대의 반응을 미리 시뮬레이션하고, 상황별 답장과 데이트 당일 코칭까지 제공하는 유료 기능이에요.'}</p></div>
      ${unlocked?`<div class="ai-premium-cards"><div><small>상대가 대화를 짧게 끝낸다면</small><b>억지로 이어가기보다 “오늘 하루 어땠어요?”처럼 열린 질문 1개만 남겨요.</b></div><div><small>데이트 당일</small><b>처음 10분: 장소·음식 → 중반: 취미 → 마지막: 다음 만남 의사 순으로 자연스럽게.</b></div><div><small>데이트 종료 멘트</small><b>“오늘 생각보다 시간 빨리 갔네요. 조심히 들어가요 :)”</b></div></div>`:`<button class="ai-premium-btn" data-ai-room="unlock">Premium 체험하기</button>`}
    </section>
    <div class="ai-room-actions"><button class="ai-room-main" data-ai-room="date">데이트 루트 다시 보기</button><button class="ai-room-sub" data-ai-room="home">오늘의 잇음으로</button></div>
    <p class="ai-room-note">아바타 모드는 상대를 조종하는 기능이 아니라, 내 대화를 대신하지 않으면서 첫 만남의 부담을 줄이는 AI 코칭 기능입니다.</p>
  </div>`
}
function openRoom(){
  const r=root(); if(!r)return;
  const ctx=getContext();
  r.dataset.aiName=ctx.name;r.dataset.aiConfirm=ctx.confirm;r.dataset.aiRoute=ctx.route;r.dataset.aiOpener=ctx.opener;
  const main=r.querySelector('.ix-main');
  const top=r.querySelector('.ix-topbar strong');
  if(top)top.textContent='AI 데이트 준비실';
  if(main)main.innerHTML=roomMarkup(ctx,false);
}
function storedContext(){const r=root();return {name:r?.dataset.aiName||'상대',confirm:r?.dataset.aiConfirm||'전북 · 주말',route:r?.dataset.aiRoute||'카페 → 산책',opener:r?.dataset.aiOpener||'안녕하세요! 반가워요 :)'}}
function goHome(){root().innerHTML='';document.documentElement.classList.remove('ieum-locked');document.body.classList.remove('ieum-locked');location.hash='discover'}
function goDates(){root().innerHTML='';document.documentElement.classList.remove('ieum-locked');document.body.classList.remove('ieum-locked');location.hash='dates'}

const obs=new MutationObserver(()=>patchComplete());
const start=()=>{const r=root();if(r){obs.observe(r,{childList:true,subtree:true});patchComplete()}else setTimeout(start,80)};start();

document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-ai-room]');if(!t)return;
  const a=t.dataset.aiRoom;
  if(a==='open'){e.preventDefault();e.stopPropagation();openRoom();return}
  if(a==='home'){e.preventDefault();e.stopPropagation();goHome();return}
  if(a==='date'){e.preventDefault();e.stopPropagation();goDates();return}
  if(a==='unlock'){e.preventDefault();const main=root()?.querySelector('.ix-main');if(main)main.innerHTML=roomMarkup(storedContext(),true);toast('Premium 데모가 열렸어요 ✨');return}
  if(a==='copy'){e.preventDefault();try{await navigator.clipboard.writeText(t.dataset.copy||'');toast('문구를 복사했어요')}catch{toast('복사할 문구를 길게 눌러주세요')}return}
},true);
