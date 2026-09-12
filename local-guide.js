// Curated planning ideas; times are editable planning allowances, never live travel estimates.
const guide = 'https://tour.jb.go.kr/';
const route = (id, city, title, mood, meet, meal, cafe, sight, note, source = guide, movie = true) =>
  ({ id, city, title, mood, meet, meal, cafe, sight, note, source, movie });

export const ROUTES = [
  route('jeonju-hanok','전주','한옥 골목에서 천천히','산책','한옥마을 경기전 앞','한옥마을 비빔밥·한식','외할머니솜씨','전주한옥마을 · 오목대','한옥마을 안에서 걷는 코스예요. 영화는 시내 이동이 추가돼요.','https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000038&dataSid=15535&paging=ok&startPage=1'),
  route('jeonju-movie','전주','영화 한 편, 객리단길 한 바퀴','영화','전주 객사 풍패지관 앞','객리단길 파스타·양식','객리단길 로스터리 카페','전주 객사 · 객리단길','영화관과 식당을 지도에서 골라 짧은 시내 동선으로 맞춰보세요.','https://tour.jeonju.go.kr/'),
  route('gunsan-lake','군산','은파호수에 마음을 놓고','산책','은파호수공원 물빛광장','은파호수공원 인근 한식','은파호수공원 호수뷰 카페','은파호수공원 · 물빛다리','호수 주변에서 여유롭게 보내요. 시내 영화관은 별도 이동이 필요해요.','https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=886599bb-4248-4919-a23e-138a61fc2557'),
  route('gunsan-island','군산','선유도, 바다를 따라','여행','선유도해수욕장 공영주차장','선유도 해산물 식당','선유도 바다뷰 카페','선유도해수욕장 · 장자도','섬 안에서 보내는 드라이브 코스예요. 군산 시내·은파호수와 분리했어요.','https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=886599bb-4248-4919-a23e-138a61fc2557',false),
  route('gunsan-town','군산','오래된 동네, 새로운 이야기','사진','군산 초원사진관 앞','군산 월명동 한식','군산 월명동 카페','군산 시간여행마을','골목을 걸으며 사진을 남겨보세요.','https://festival.gunsan.go.kr/'),
  route('iksan-history','익산','미륵사지에서 나누는 이야기','전시','국립익산박물관 입구','익산 금마면 한식','익산 미륵사지 주변 카페','익산 미륵사지','박물관과 유적을 함께 둘러보세요. 영화 선택 시 익산 시내 이동을 고려해 주세요.','https://www.iksan.go.kr/tour'),
  route('iksan-garden','익산','아가페정원, 초록빛 오후','산책','익산 아가페정원 입구','익산 황등면 식당','익산 황등면 카페','익산 아가페정원','방문 가능한 날짜와 관람 안내를 먼저 확인해 주세요.','https://www.iksan.go.kr/tour'),
  route('wanju-art','완주','삼례에서 발견하는 취향','전시','삼례문화예술촌 입구','완주 삼례읍 식당','삼례문화예술촌 주변 카페','완주 삼례문화예술촌','전시 운영일을 확인하고 카페에서 감상을 나눠보세요.','https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=2d487d60-656a-409d-8440-e1c3431ac522'),
  route('jeongeup-forest','정읍','내장산 아래 느긋한 하루','산책','내장산 탐방안내소 앞','내장산 입구 산채정식','정읍 내장산 주변 카페','내장산 산책길','가볍게 걸을 구간을 함께 정해요. 계절과 날씨에 따라 탐방 안내를 확인해 주세요.'),
  route('namwon-river','남원','광한루와 요천, 다정한 산책','산책','광한루원 정문 앞','남원 광한루원 인근 한식','남원 요천 주변 카페','광한루원 · 요천','관람 가능한 시간에 광한루원을 둘러보고 요천을 걸어요.'),
  route('gimje-field','김제','벽골제의 넓은 하늘 아래','전시','벽골제 입구','김제 벽골제 인근 한식','김제 벽골제 주변 카페','김제 벽골제','농경문화박물관 운영일과 관람 시간을 확인해 주세요.','https://www.gimje.go.kr/index.gimje?menuCd=DOM_000001803003000000'),
  route('jinan-mountain','진안','마이산을 바라보는 오후','여행','마이산 북부 관광안내소','진안 마이산 북부 식당','진안 마이산 북부 카페','진안 마이산 북부 산책길','산행 대신 북부 주변 산책을 기본으로 잡았어요. 탑사까지 이동은 별도로 계획해 주세요.','https://www.jinan.go.kr/festival/page/festival01/festival01_03.jsp',false),
  route('muju-bandi','무주','반디랜드에서 호기심 한 조각','전시','무주 반디랜드 입구','무주 설천면 식당','무주 설천면 카페','무주 반디랜드','시설별 운영 시간과 전시·체험 예약 여부를 확인해 주세요.',guide,false),
  route('jangsu-lake','장수','의암호를 따라 느리게','산책','장수 의암공원 입구','장수읍 한우·한식','장수읍 카페','장수 의암공원 · 논개사당','공원 산책과 장수읍 식사로 여유 있게 구성했어요.'),
  route('imsil-cheese','임실','치즈마을, 함께 만드는 하루','체험','임실치즈테마파크 입구','임실 치즈요리 식당','임실치즈테마파크 주변 카페','임실치즈테마파크 · 임실치즈마을','치즈 만들기는 사전 예약을 확인해요. 테마파크와 마을 사이에는 차량 이동이 필요해요.','https://www.imsilfestival.com/',false),
  route('imsil-lake','임실','옥정호 위로, 두 사람의 산책','여행','옥정호 출렁다리 입구','임실 운암면 한식','옥정호 호수뷰 카페','옥정호 출렁다리 · 붕어섬생태공원','치즈마을 코스와 분리한 옥정호 중심 일정이에요. 출입 가능 시간을 확인해 주세요.','https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=556eb654-417b-4416-8b30-45e817c71a57',false),
  route('sunchang-forest','순창','강천산, 초록 사이로','산책','강천산 군립공원 입구','순창 강천산 입구 한식','순창 팔덕면 카페','순창 강천산 산책길','둘 다 편하게 걸을 수 있는 구간을 정하고 탐방 통제 여부를 확인해요.',guide,false),
  route('gochang-town','고창','읍성 돌담 따라 걷는 날','사진','고창읍성 입구','고창읍 한식','고창읍성 주변 카페','고창읍성','읍성과 시내를 중심으로 걸어요. 성곽길이 부담스럽다면 안쪽 산책길도 좋아요.','https://www.gochang.go.kr/'),
  route('buan-sea','부안','채석강에서 바다 한 장','여행','격포해수욕장 공영주차장','부안 격포항 해산물 식당','부안 격포 바다뷰 카페','부안 채석강 · 격포해수욕장','물때와 출입 가능 구간을 확인해요. 바위 구간은 날씨에 따라 생략해도 좋아요.','https://encykorea.aks.ac.kr/Article/E0055605',false),
];

export const FESTIVALS = [
  {id:'jinan-2026',city:'진안',name:'진안홍삼축제',start:'2026-09-18',end:'2026-09-20',place:'마이산 북부',tag:'마이산에서 함께',url:'https://www.jinan.go.kr/festival/page/festival01/festival01_03.jsp'},
  {id:'gimje-2026',city:'김제',name:'김제지평선축제',start:'2026-10-01',end:'2026-10-05',place:'벽골제 중심 김제시 일원',tag:'가을 들판의 축제',url:'https://www.gimje.go.kr/'},
  {id:'gunsan-2026',city:'군산',name:'군산시간여행축제',start:'2026-10-02',end:'2026-10-05',place:'군산시간여행마을 일원',tag:'골목에서 만나는 시간여행',url:'https://festival.gunsan.go.kr/'},
  {id:'imsil-2026',city:'임실',name:'임실N치즈축제',start:'2026-10-08',end:'2026-10-11',place:'임실치즈테마파크 · 치즈마을 · 임실읍',tag:'치즈와 함께하는 가을',url:'https://korean.visitkorea.or.kr/kfes/detail/fstvlDetail.do?fstvlCntntsId=c3d27433-8ec5-44a1-afa4-47a43f92e8d8'},
  {id:'sunchang-2026',city:'순창',name:'순창장류축제',start:'2026-10-15',end:'2026-10-18',place:'순창전통고추장민속마을 일원',tag:'맛있는 취향을 나누는 날',url:'https://korean.visitkorea.or.kr/kfes/detail/fstvlDetail.do?fstvlCntntsId=f3026b60-0634-49ef-9ccb-8fb68d0e09a5'},
];
export const GUIDE_CHECKED = '2026-09-12';
export const mapURL = query => `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
