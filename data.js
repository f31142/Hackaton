export const CITIES = ['전주','익산','군산','완주','정읍','남원','김제','진안','무주','장수','임실','순창','고창','부안'];
export const TIMES = ['평일 낮','평일 저녁','토요일 오후','토요일 저녁','일요일 오후'];
export const INTERESTS = ['카페','산책','독서','영화','맛집','전시','여행','운동','음악','사진','요리','반려동물'];
export const QUESTIONS = [
  {id:'pace',title:'마음이 가는 사람과는',options:['천천히 알아가고 싶어요','자연스럽게 흐르는 대로','좋으면 솔직하게 표현해요'],tags:['천천히 알아가기','자연스러운 만남','솔직한 마음 표현']},
  {id:'contact',title:'편안한 연락의 온도는',options:['짧게, 자주 연락해요','바쁠 때는 각자에게 집중해요','하루 끝에 깊은 대화가 좋아요'],tags:['짧게 자주 연락','서로의 시간 존중','하루 끝 깊은 대화']},
  {id:'weekend',title:'둘만의 주말이 생긴다면',options:['카페나 산책으로 여유롭게','전시와 맛집, 새로운 곳으로','운동이나 여행으로 활동적으로'],tags:['여유로운 주말','새로운 취향 발견','활동적인 주말']},
  {id:'plan',title:'함께하는 약속은',options:['미리 정하면 마음이 편해요','큰 틀만 정해도 좋아요','그날 마음 가는 대로 좋아요'],tags:['미리 정하는 약속','유연한 계획','가벼운 즉흥 여행']},
  {id:'conflict',title:'생각이 다를 때 나는',options:['그 자리에서 차분히 이야기해요','조금 정리한 뒤 대화해요','먼저 상대의 이야기를 들어요'],tags:['차분하게 바로 대화','생각을 정리한 뒤 대화','먼저 듣는 대화']}
];
export const SAMPLE_USER = {name:'나',age:25,city:'전주',areas:['전주','완주'],seeking:'all',times:['평일 저녁','토요일 오후'],interests:['카페','산책','독서'],answers:{pace:0,contact:1,weekend:0,plan:1,conflict:2},note:''};
export const PEOPLE = [
  {id:'seoyeon',name:'서연',age:25,gender:'woman',city:'전주',areas:['전주','완주'],job:'브랜드 디자이너',photo:0,mbti:'INFP',quote:'좋은 카페를 찾으면, 같이 갈 사람부터 떠올라요.',about:'평일에는 디자인을 하고, 주말에는 책과 커피 사이에 있어요. 서두르지 않고 서로의 일상에 스며들고 싶어요.',interests:['카페','산책','독서','사진'],times:['평일 저녁','토요일 오후'],answers:{pace:0,contact:1,weekend:0,plan:1,conflict:2}},
  {id:'jieun',name:'지은',age:27,gender:'woman',city:'익산',areas:['익산','전주'],job:'출판 편집자',photo:1,mbti:'INFJ',quote:'책 속 밑줄 친 문장을 나누는 사이가 좋아요.',about:'작은 책방에서 한참 시간을 보내곤 해요. 다른 취향도 궁금해하며 들어주는 사람을 만나고 싶어요.',interests:['독서','전시','카페','영화'],times:['토요일 오후','일요일 오후'],answers:{pace:0,contact:2,weekend:1,plan:0,conflict:1}},
  {id:'haneul',name:'하늘',age:24,gender:'woman',city:'군산',areas:['군산','익산'],job:'공간 디자이너',photo:2,mbti:'ISFP',quote:'걷다 보면 대화도 조금 더 편해지더라고요.',about:'바닷바람과 영화, 오래된 동네를 좋아해요. 주말에는 카메라를 들고 새로운 길을 걸어요.',interests:['산책','사진','영화','여행'],times:['평일 저녁','토요일 저녁'],answers:{pace:1,contact:1,weekend:2,plan:2,conflict:2}},
  {id:'doyun',name:'도윤',age:27,gender:'man',city:'완주',areas:['완주','전주'],job:'소프트웨어 개발자',photo:3,mbti:'ISFJ',quote:'산책하다 발견한 작은 가게에 같이 가요.',about:'새로운 맛집을 찾아가는 걸 좋아하지만, 익숙한 동네를 걷는 시간도 소중해요. 편하게 웃을 수 있는 사이면 좋겠어요.',interests:['산책','카페','음악','요리'],times:['평일 저녁','토요일 오후'],answers:{pace:0,contact:1,weekend:0,plan:0,conflict:2}},
  {id:'junho',name:'준호',age:25,gender:'man',city:'전주',areas:['전주','익산'],job:'대학원생',photo:4,mbti:'INTP',quote:'취향이 달라도, 서로의 이야기는 궁금했으면.',about:'새로 나온 영화와 전시를 챙겨봐요. 서로의 바쁜 시간을 존중하면서 함께할 약속은 꼭 지키고 싶어요.',interests:['영화','전시','독서','카페'],times:['토요일 오후','일요일 오후'],answers:{pace:1,contact:2,weekend:1,plan:1,conflict:0}},
  {id:'minjae',name:'민재',age:29,gender:'man',city:'남원',areas:['남원','전주'],job:'로컬 브랜드 운영',photo:5,mbti:'ENFP',quote:'계획에 없던 주말 여행, 같이 떠날래요?',about:'전북의 새로운 풍경을 찾는 게 취미예요. 일할 땐 집중하고 쉬는 날에는 밖에서 에너지를 채워요.',interests:['여행','운동','맛집','사진'],times:['평일 낮','토요일 저녁','일요일 오후'],answers:{pace:2,contact:0,weekend:2,plan:2,conflict:0}}
];
export const NAV = [{id:'discover',label:'오늘의 이음',icon:'compass'},{id:'likes',label:'관심',icon:'heart'},{id:'dates',label:'데이트',icon:'calendar'},{id:'profile',label:'내 프로필',icon:'user'}];
