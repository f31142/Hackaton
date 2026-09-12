import { CITIES, PEOPLE } from './data.js?v=ieum5';
import { validDate, koreaToday } from './experience-core.js?v=ieum5';

export const MEETINGS_KEY = 'ieum:meetings:v1';
export const MEETING_STATUS = { pending:'수락 대기', accepted:'수락 완료', declined:'거절됨', cancelled:'요청 취소' };
const active = request => ['pending','accepted'].includes(request.status);
const validTime = value => value === '' || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
export const activeMeeting = (requests, personId) => requests.find(r => r.personId === personId && active(r));
function limitHistory(requests) { let slots=30-requests.filter(active).length; return requests.filter(r=>active(r)||slots-->0); }

function normalizeRequest(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || !/^[\w-]{1,80}$/.test(raw.id)) return null;
  if (!PEOPLE.some(p => p.id === raw.personId) || !CITIES.includes(raw.city) || !Object.hasOwn(MEETING_STATUS, raw.status)) return null;
  if (typeof raw.message !== 'string' || !raw.message.trim() || raw.message.length > 1800) return null;
  if ((raw.date !== '' && !validDate(raw.date)) || typeof raw.time !== 'string' || !validTime(raw.time)) return null;
  if (typeof raw.createdAt !== 'string' || Number.isNaN(Date.parse(raw.createdAt))) return null;
  return { id:raw.id, personId:raw.personId, fromName:String(raw.fromName || '나').slice(0,16),
    message:raw.message.trim(), city:raw.city, date:raw.date, time:raw.time, status:raw.status,
    createdAt:raw.createdAt, updatedAt:typeof raw.updatedAt === 'string' && !Number.isNaN(Date.parse(raw.updatedAt)) ? raw.updatedAt : raw.createdAt };
}

export function readMeetings(storage) {
  try {
    const raw = JSON.parse(storage.getItem(MEETINGS_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    const ids = new Set(), people = new Set();
    return limitHistory(raw.map(normalizeRequest).filter(r => {
      if (!r || ids.has(r.id) || (active(r) && people.has(r.personId))) return false;
      ids.add(r.id); if (active(r)) people.add(r.personId); return true;
    }));
  } catch { return []; }
}

export function saveMeetings(storage, requests) {
  try { storage.setItem(MEETINGS_KEY, JSON.stringify(requests)); return true; } catch { return false; }
}

export function createMeeting(requests, input, id, now = new Date()) {
  if (activeMeeting(requests, input.personId)) throw new Error('이미 진행 중인 만남 요청이 있어요. 요청 상태를 확인해 주세요.');
  if (input.date && (!validDate(input.date) || input.date < koreaToday(now))) throw new Error('오늘 이후의 날짜를 선택하거나 날짜를 비워 주세요.');
  const request = normalizeRequest({...input,id,status:'pending',createdAt:now.toISOString(),updatedAt:now.toISOString()});
  if (!request) throw new Error('인사 문구와 만남 정보를 확인해 주세요.');
  return limitHistory([request,...requests]);
}

export function transitionMeeting(requests, id, nextStatus, now = new Date()) {
  const request = requests.find(r => r.id === id);
  const allowed = { pending:['accepted','declined','cancelled'], accepted:['cancelled'] };
  if (!request || !allowed[request.status]?.includes(nextStatus)) throw new Error('이미 처리된 요청이에요. 현재 상태를 확인해 주세요.');
  return requests.map(r => r.id === id ? {...r,status:nextStatus,updatedAt:now.toISOString()} : r);
}
