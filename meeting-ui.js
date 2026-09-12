import { CITIES, PEOPLE } from './data.js?v=ieum5';
import { match, draftOpener, escapeHTML as esc } from './core.js?v=ieum5';
import { koreaToday } from './experience-core.js?v=ieum5';
import { icon } from './icons.js?v=ieum5';
import { readMeetings, saveMeetings, activeMeeting, createMeeting } from './meeting-core.js?v=ieum5';

export function createMeetings({storage,user,render,showModal,modalHead,btn,toast}) {
  let requests = readMeetings(storage).filter(request => request.status === 'pending');
  const person = id => PEOPLE.find(p => p.id === id);
  const badge = () => '<span class="meeting-status pending">요청 보냄</span>';
  const detail = request => `${esc(request.city)} · ${request.date || '날짜 조율'} · ${request.time || '시간 조율'}`;
  const demoNote = '<p class="helper meeting-demo">가상 프로필과의 만남 체험이에요. 실제 상대에게 전송되지 않아요.</p>';

  function commit(next) {
    if (!saveMeetings(storage,next)) {
      toast('요청을 저장하지 못했어요. 브라우저 저장 공간을 확인하고 다시 시도해 주세요.');
      return false;
    }
    requests = next;
    render();
    return true;
  }

  function card(request) {
    const p = person(request.personId);
    return `<article class="meeting-card"><div class="meeting-card-top"><h3>${esc(p.name)} 님과의 만남</h3>${badge()}</div><p class="helper">${detail(request)}</p><p class="meeting-message">${esc(request.message)}</p><button class="text-button accent" data-action="meeting-detail" data-id="${request.id}">요청 확인 ${icon('arrow')}</button></article>`;
  }

  function panel(showEmpty = false) {
    if (!requests.length && !showEmpty) return '';
    return `<section class="content-panel meeting-panel"><div class="section-header"><div><span class="source-tag">첫 인사 다음, 우리 만남</span><h2>만남 요청함 <span class="count">${requests.length}</span></h2></div>${requests.length?btn('전체 요청 보기','meetings','','secondary small'):''}</div>${requests.length?`<div class="meeting-cards">${requests.slice(0,3).map(card).join('')}</div>`:'<p class="helper">마음이 가는 프로필에서 첫 대화를 준비하고 만남을 요청해 보세요. 보낸 요청은 이곳에서 다시 확인할 수 있어요.</p>'}</section>`;
  }

  function showInbox() {
    showModal(`<div class="modal-inner">${modalHead('만남 요청함','내가 보낸 만남 요청을 한눈에 확인해요.')}${requests.length?requests.map(card).join(''):'<p class="body-copy">아직 보낸 요청이 없어요. 프로필의 첫 대화 준비에서 만남을 제안해 보세요.</p>'}${demoNote}</div>`);
  }

  function showForm(personId, message = '') {
    const p = person(personId);
    if (!p) return;
    const existing = activeMeeting(requests,personId);
    if (existing) {
      showDetail(existing.id);
      return;
    }
    const m = match(user(),p), city = m.areas[0] || p.city;
    showModal(`<div class="modal-inner meeting-form">${modalHead(`${esc(p.name)} 님에게 만남 요청`,'첫 인사와 함께, 편한 만남을 제안해 보세요.')}<div class="field"><label for="meeting-message">함께 보낼 첫 인사</label><textarea id="meeting-message" class="draft-text" maxlength="1800">${esc(message || draftOpener(user(),p))}</textarea></div><div class="field"><label for="meeting-city">만나고 싶은 지역</label><select id="meeting-city">${CITIES.map(c=>`<option value="${c}" ${c===city?'selected':''}>${c}</option>`).join('')}</select></div><div class="form-grid"><div class="field"><label for="meeting-date">날짜 <span class="helper">선택</span></label><input id="meeting-date" type="date" min="${koreaToday()}"></div><div class="field"><label for="meeting-time">시간 <span class="helper">선택</span></label><input id="meeting-time" type="time"></div></div><p class="helper">날짜와 시간을 비우면 나중에 함께 정할 수 있어요.</p>${demoNote}<p id="meeting-error" class="error-message" role="alert"></p><div class="modal-footer">${btn('돌아가기','opener',`data-id="${p.id}"`,'secondary')}${btn('만남 요청 보내기','meeting-send',`data-id="${p.id}"`)}</div></div>`);
  }

  function showDetail(id) {
    const request = requests.find(r=>r.id===id);
    if (!request) {
      showInbox();
      return;
    }
    const p = person(request.personId);
    showModal(`<div class="modal-inner meeting-result">${modalHead('만남이 요청되었습니다',`${esc(p.name)} 님에게 보낸 만남 요청이에요.`)}<div class="meeting-result-icon pending">${icon('heart')}</div>${badge()}<div class="meeting-summary"><h3>${esc(p.name)} 님에게 보낸 첫 인사</h3><p class="meeting-full-message">${esc(request.message)}</p><p class="helper">${detail(request)}</p></div><p class="helper">요청이 저장됐어요. 만남 요청함에서 다시 확인할 수 있어요.</p><div class="action-group meeting-actions">${btn('요청 취소','meeting-cancel',`data-id="${id}"`,'secondary')}</div><button class="text-button" data-action="meetings">만남 요청함 보기</button>${demoNote}</div>`);
  }

  function handleAction(action,target) {
    const id = target.dataset.id;
    switch (action) {
      case 'meetings':
        showInbox();
        break;
      case 'meeting-new':
        showForm(id);
        break;
      case 'meeting-detail':
        showDetail(id);
        break;
      case 'meeting-send': {
        const input = {
          personId:id,
          fromName:user().name,
          message:document.getElementById('meeting-message').value.trim(),
          city:document.getElementById('meeting-city').value,
          date:document.getElementById('meeting-date').value,
          time:document.getElementById('meeting-time').value
        };
        try {
          const next = createMeeting(requests,input,crypto.randomUUID());
          if (commit(next)) showDetail(next[0].id);
        } catch (error) {
          document.getElementById('meeting-error').textContent = error.message;
        }
        break;
      }
      case 'meeting-cancel': {
        const next = requests.filter(request => request.id !== id);
        if (next.length === requests.length) {
          toast('이미 취소된 요청이에요.');
          showInbox();
          break;
        }
        if (commit(next)) {
          toast('만남 요청을 취소했어요. 요청함에서도 삭제됐어요.');
          showInbox();
        }
        break;
      }
      default:
        return false;
    }
    return true;
  }

  function reset() {
    if (!saveMeetings(storage,[])) {
      toast('만남 요청 기록을 지우지 못했어요.');
      return false;
    }
    requests=[];
    return true;
  }

  return {panel,showForm,handleAction,reset,get count(){return requests.length;}};
}
