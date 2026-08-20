// 콘텐츠 상태
//
// 실제 내용: 카테고리·항목 구성, 제목, meta(연도·저자·시기), 그리고 언어의
// 영어 항목 "왜". YouTube ID는 전부 공식 채널 영상으로 확인해 넣었다.
//
// 아직 자리 채우기: 영어를 뺀 모든 항목의 `why` 문장과 여행의 `wish` 목록.
// 형태를 보려고 내가 지어낸 문장이므로 실제 내용으로 교체해야 한다.
//
// 배경 그림: 영화·게임만 예고편이 있다. 여행·책·언어는 `kind: "none"`이라
// 입구 액자와 오버레이 배경이 비어 있다 — 사진/표지를 넣으면 그대로 붙는다.

/** 입구에 놓이는 한 줄. About 마지막 문단에서 넘어오는 자리다. */
export const lifeIntro = "일 밖의 취미.";

export type LifeCategoryKey =
  "travel" | "books" | "movies" | "games" | "languages";

/**
 * 항목 뒤에 깔리는 배경. 영화·게임은 예고편이 있지만 여행·책·언어는 없다.
 * YouTube 전용으로 만들면 다섯 카테고리 중 두 개만 살고 나머지는 빈 화면이
 * 되므로, 처음부터 종류를 나눠 둔다.
 */
export type LifeMedia =
  | { kind: "youtube"; id: string; start?: number }
  | { kind: "image"; src: string; alt: string }
  | { kind: "none" };

export type LifeItem = {
  id: string;
  /** 목록과 본문 양쪽에 쓰이는 이름 */
  title: string;
  /** 제목 아래 한 줄. 저자·감독·연도·시기 */
  meta: string;
  /** "왜 기억에 남는지". 줄바꿈은 편집 판단이므로 배열로 명시 */
  why: string[];
  media: LifeMedia;
};

export type LifeCategory = {
  key: LifeCategoryKey;
  label: string;
  /** 입구 화면의 타일에 보이는 한 줄 */
  teaser: string;
  items: LifeItem[];
  /**
   * 여행 카테고리에만 있는 버킷리스트. SPEC상 여행만
   * "다녀온 곳 + 가고 싶은 곳" 두 성격이 섞이므로 타입에서 구분해둔다.
   */
  wish?: { label: string; entries: string[] };
};

export const lifeCategories: LifeCategory[] = [
  {
    key: "travel",
    label: "여행",
    teaser: "혼자 걸었던 도시들",
    items: [
      {
        id: "france",
        title: "프랑스",
        meta: "2023년 겨울 · 혼자 · 한 달",
        why: [
          "지도를 덮고 걷기 시작한 사흘째부터",
          "도시가 다르게 보이기 시작했다.",
          "길을 잃어야만 보이는 것들이 있었다.",
        ],
        media: { kind: "none" },
      },
    ],
    wish: { label: "다음엔", entries: ["리스본", "교토", "아이슬란드"] },
  },
  {
    key: "books",
    label: "책",
    teaser: "오래 남은 문장들",
    items: [
      {
        id: "1984",
        title: "1984",
        meta: "조지 오웰 · 1949",
        why: [
          "감시가 무서운 게 아니라",
          "감시를 당연하게 여기게 되는 과정이 무서웠다.",
        ],
        media: { kind: "none" },
      },
      {
        id: "meditations",
        title: "명상록",
        meta: "마르쿠스 아우렐리우스 · 2세기",
        why: [
          "이천 년 전 사람이 남긴 메모가",
          "오늘 아침의 고민과 거의 같았다.",
        ],
        media: { kind: "none" },
      },
    ],
  },
  {
    key: "movies",
    label: "영화",
    teaser: "몇 번을 다시 본 것들",
    items: [
      {
        id: "interstellar",
        title: "인터스텔라",
        meta: "크리스토퍼 놀란 · 2014",
        why: [
          "몇 번을 다시 봐도",
          "마지막 10분에서 같은 자리에 멈춘다.",
          "시간이 이기지 못하는 게 하나쯤 있다는 게 좋았다.",
        ],
        media: { kind: "youtube", id: "zSWdZVtXT7E" },
      },
      {
        id: "dark-knight",
        title: "다크 나이트",
        meta: "크리스토퍼 놀란 · 2008",
        why: [
          "악당이 이렇게 설득력 있어도 되나 싶었다.",
          "옳은 선택이 늘 이기는 이야기가 아니라서",
          "오히려 오래 남았다.",
        ],
        media: { kind: "youtube", id: "EXeTwQWrcwY" },
      },
      {
        id: "weathering-with-you",
        title: "날씨의 아이",
        meta: "신카이 마코토 · 2019",
        why: [
          "세상을 구하는 대신 한 사람을 택하는 이야기.",
          "그 선택을 끝까지 밀어붙이는 게 좋았다.",
        ],
        // 한국 배급사 "미디어캐슬" 공식 채널의 오리지널 메인 예고편.
        media: { kind: "youtube", id: "ILQl1Q4jizc" },
      },
    ],
  },
  {
    key: "games",
    label: "게임",
    teaser: "가라는 데가 없는 세계",
    items: [
      {
        id: "botw",
        title: "젤다의 전설: 야생의 숨결",
        meta: "닌텐도 · 2017",
        why: [
          "가라는 데가 없는 게임이",
          "이렇게 재미있을 수 있다는 걸",
          "처음 알려준 게임.",
        ],
        media: { kind: "youtube", id: "zw47_q9wbBE" },
      },
      {
        id: "totk",
        title: "젤다의 전설: 왕국의 눈물",
        meta: "닌텐도 · 2023",
        why: ["같은 지도를 다시 주고도", "완전히 새로운 놀이를 만들어냈다."],
        media: { kind: "youtube", id: "uHGShqcAHlQ" },
      },
      {
        id: "overwatch",
        title: "오버워치",
        meta: "블리자드 · 2016",
        why: [
          "혼자 잘해서 이기는 게임이 아니라서 좋다.",
          "다섯 명이 한 번에 맞물리는 순간의 감각은",
          "다른 게임에서 찾지 못했다.",
        ],
        // 한국 공식 "오버워치" 채널의 프레야 게임플레이 트레일러.
        media: { kind: "youtube", id: "JDr5VYfuLXY" },
      },
    ],
  },
  {
    key: "languages",
    label: "언어",
    teaser: "닿을 수 있는 사람을 늘리는 일",
    items: [
      {
        id: "english",
        title: "영어",
        meta: "학습 중 · B1",
        why: ["명실상부한 국제 비즈니스 언어.", "늘 노력하지만 쉽지 않다."],
        media: { kind: "none" },
      },
      {
        id: "french",
        title: "프랑스어",
        meta: "학습 중 · A1",
        why: [
          "파리에서 한마디도 못 알아들었던 게 분해서 시작했다.",
          "지금은 메뉴판 정도는 읽는다.",
        ],
        media: { kind: "none" },
      },
      {
        id: "japanese",
        title: "일본어",
        meta: "다음 차례",
        why: [
          "새 언어를 하나 배울 때마다",
          "닿을 수 있는 사람이 늘어난다.",
          "그게 아직도 제일 큰 동기다.",
        ],
        media: { kind: "none" },
      },
    ],
  },
];
