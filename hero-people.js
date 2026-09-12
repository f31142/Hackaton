import { SAMPLE_USER } from './data.js';
import { readState, recommend, escapeHTML as esc } from './core.js';

const storage={getItem:key=>localStorage.getItem(key)};
const page=document.getElementById('content');

function card(m,index){
  const p=m.person;
  const label=index===0?'오늘의 1순위':`${index+1}순위`;
  return `<button class="hero-person hero-person-${index+1}" data-action="detail" data-id="${p.id}" aria-label="${esc(p.name)} 프로필 보기">
    <div class="hero-person-photo portrait-bg p${p.photo}"></div>
    <div class="hero-person-shade"></div>
    <span class="hero-person-rank">${label}</span>
    <div class="hero-person-info">
      <div><b>${esc(p.name)}</b><small>${p.age}</small></div>
      <em>${m.score}</em>
    </div>
  </button>`;
}

function upgradeHero(){
  if(location.hash && location.hash!=='#discover')return;
  const old=page.querySelector('.ieum-revolution .ieum-hero-stat');
  if(!old)return;
  const state=readState(storage);
  const user=state.profile||SAMPLE_USER;
  const matches=recommend(user,{hidden:state.hidden}).slice(0,3);
  if(!matches.length)return;
  const wrap=document.createElement('div');
  wrap.className='ieum-hero-people';
  wrap.innerHTML=`<div class="hero-people-head"><span>오늘의 잇음</span><small>AI가 고른 3명</small></div><div class="hero-people-grid">${matches.map(card).join('')}</div>`;
  old.replaceWith(wrap);
}

let queued=false;
function sync(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;upgradeHero()})}
new MutationObserver(sync).observe(page,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(sync,40));
setTimeout(sync,100);
