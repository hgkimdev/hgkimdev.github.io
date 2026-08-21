// 콘텐츠 상태
//
// 실제 내용: 카테고리·항목 구성, 제목, meta(연도·저자·시기), 그리고 언어의
// 영어 항목과 게임의 오버워치 "왜"·태그. YouTube ID는 전부 공식 채널
// 영상으로 확인해 넣었다.
//
// 아직 자리 채우기: 위 둘을 뺀 모든 항목의 `why` 문장과 여행의 `wish` 목록.
// 형태를 보려고 지어낸 문장이므로 실제 내용으로 교체해야 한다. 1인칭으로
// 쓰여 있어서 그대로 두면 사이트 주인이 하지 않은 말이 그의 말로 올라간다.
//
// 배경 그림: 영화·게임은 예고편, 책은 표지가 있다. 여행·언어는
// `kind: "none"`이라 입구 액자와 오버레이 배경이 비어 있다 — 사진을 넣으면
// 그대로 붙는다.
//
// 표지는 교보문고 상품 이미지를 받아 `public/life/`에 두었다(가로 1200px).

/** 입구에 놓이는 한 줄. About 마지막 문단에서 넘어오는 자리다. */
export const lifeIntro = "일 밖의 문화생활";

export type LifeCategoryKey =
  "travel" | "books" | "movies" | "games" | "languages";

/**
 * 항목 뒤에 깔리는 배경. 영화·게임은 예고편이 있지만 여행·책·언어는 없다.
 * YouTube 전용으로 만들면 다섯 카테고리 중 두 개만 살고 나머지는 빈 화면이
 * 되므로, 처음부터 종류를 나눠 둔다.
 */
/**
 * 세워둔 책 한 권.
 *
 * `href`가 있으면 표지가 눌리는 물건이 된다. 지금 넣어둔 건 교보문고
 * 미리보기 주소로, 로그인 없이 본문 몇 쪽을 넘겨볼 수 있는 페이지다.
 * 상품 페이지가 아니라 미리보기를 가리키는 건 여기가 "사세요"가 아니라
 * "이런 책이다"를 보여주는 자리이기 때문이다.
 *
 * 주소 형태: `https://product.kyobobook.co.kr/book/preview/<상품코드>`
 * 상품코드는 같은 책이라도 판본마다 다르다 — 표지로 쓴 바로 그 판의
 * 코드를 넣어야 미리보기의 표지와 화면의 표지가 맞는다.
 */
export type LifeCoverMedia = {
  kind: "cover";
  src: string;
  alt: string;
  href?: string;
};

export type LifeMedia =
  | { kind: "youtube"; id: string; start?: number }
  /** 배경으로 꽉 채우는 사진. 여행 사진처럼 잘려도 되는 그림. */
  | { kind: "image"; src: string; alt: string }
  /**
   * 오른쪽에 한 권 세워두는 책 표지. 사진과 나눠 둔 건 그리는 방식이 아니라
   * 그림의 성격이 다르기 때문이다 — 표지는 판형이 정해져 있고 제목·출판사가
   * 인쇄돼 있어서 배경으로 늘리면 잘린다. LifeCoverPlate 주석 참고.
   */
  | LifeCoverMedia
  | { kind: "none" };

export type LifeItem = {
  id: string;
  /** 목록과 본문 양쪽에 쓰이는 이름 */
  title: string;
  /** 제목 아래 한 줄. 저자·감독·연도·시기 */
  meta: string;
  /** "왜 기억에 남는지". 줄바꿈은 편집 판단이므로 배열로 명시 */
  why: string[];
  /**
   * why 아래에 붙는 짧은 칩. meta가 "무엇인지"(저자·연도)라면 이쪽은
   * "나와 어떤 사이인지"다. 칩 하나가 그 자체로 읽혀야 하므로 라벨을
   * 따로 두지 않는다  
   */
  tags?: string[];
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
    wish: { label: "다음엔", entries: ["핀란드", "덴마크", "이탈리아"] },
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
          "감시와 통제 그 자체보다 더 섬뜩했던 것은,",
          "전체주의 사회와 군중심리가 사람들의 사고방식마저",
          "지배하여 '1+1=3'이라는 거짓을 결국 당연한 진실로",
          "받아들이게 만드는 과정이었다.",
        ],
        // 민음사 세계문학전집 77, 정회성 옮김.
        media: {
          kind: "cover",
          src: "/life/1984.jpg",
          alt: "조지 오웰 『1984』 민음사 판 표지",
          href: "https://product.kyobobook.co.kr/book/preview/S000000620214",
        },
      },
      {
        id: "meditations",
        title: "명상록",
        meta: "마르쿠스 아우렐리우스 · 2세기",
        why: [
          "이 책을 통해 내가 통제할 수 있는 것과",
          "통제할 수 없는 것을 구분하는 법을 배웠다.",
          "통제할 수 없는 것에 계속해서 집착하기보다,",
          "내가 지금 할 수 있는 일에 집중하는 것이",
          "중요하다는 것을 깨닫게 해준 책이었다.",
        ],
        // 현대지성 클래식 18, 박문재 옮김.
        media: {
          kind: "cover",
          src: "/life/meditations.jpg",
          alt: "마르쿠스 아우렐리우스 『명상록』 현대지성 판 표지",
          href: "https://product.kyobobook.co.kr/book/preview/S000001897778",
        },
      },
    ],
  },
  {
    key: "movies",
    label: "영화",
    teaser: "몇 번을 다시 본 것들",
    items: [
      {
        id: "spirited-away",
        title: "센과 치히로의 행방불명",
        meta: "미야자키 하야오 · 2001",
        // TODO: 본인 문장으로 채울 것. 지어낸 1인칭을 넣지 않으려고 비워 둔다.
        why: [
          "낯선 세상속에서도 자신을 잃지 않고 고난과 역경을 이겨낸 성장서사",
          "자신의 이름을 잊고 사는 현대사회 어른들을 위한 이야기이기도 하다.",
        ],
        // 지브리 북미 배급사 "GKIDS Films" 공식 채널의 예고편.
        media: { kind: "youtube", id: "GAp2_0JJskk" },
      },
      {
        id: "dark-waters",
        title: "다크 워터스",
        meta: "토드 헤인즈 · 2019",
        // TODO: 본인 문장으로 채울 것. 지어낸 1인칭을 넣지 않으려고 비워 둔다.
        why: [
          "자신의 신념을 끝까지 밀고 나가는 것은 어렵고 외로운 길이지만,",
          "결국 포기하지 않고 행동하면 변화가 찾아온다.",
        ],
        // 배급사 "Focus Features" 공식 채널의 예고편.
        media: { kind: "youtube", id: "RvAOuhyunhY" },
      },
      {
        id: "weathering-with-you",
        title: "날씨의 아이",
        meta: "신카이 마코토 · 2019",
        why: [
          "'전체를 위해 개인을 희생해야 하는가' 라는 질문앞에",
          "세상을 구하는 대신 한 사람을 택하는 이야기.",
          "뻔한 희생과 선택 대신 낭만으로 점철된 영화.",
        ],
        // 한국 배급사 "미디어캐슬" 공식 채널의 5주년 재개봉 메인 예고편.
        //
        // 같은 채널의 2019년 예고편(ILQl1Q4jizc)을 쓰다 바꿨다. 그쪽은 업로드
        // 화질이 낮아 maxres/sd 썸네일이 아예 없고(최대 480x360), 배경으로
        // 확대하면 눈에 띄게 뭉갠다. 이 영상은 1080p라 둘 다 해결된다.
        media: { kind: "youtube", id: "H2x4Nyk68Pc" },
      },
    ],
  },
  {
    key: "games",
    label: "게임",
    teaser: "또 다른 형태의 예술작품",
    items: [
      {
        id: "botw",
        title: "젤다의 전설: 야생의 숨결",
        meta: "닌텐도 · 2017",
        why: [
          "자유도 높은 오픈월드 게임이",
          "이렇게 재미있을 수 있다는 걸",
          "처음으로 알려준 게임.",
        ],
        media: { kind: "youtube", id: "zw47_q9wbBE" },
      },
      {
        id: "totk",
        title: "젤다의 전설: 왕국의 눈물",
        meta: "닌텐도 · 2023",
        why: ["같은 지도를 다시 주고도", "완전히 새로운 경험을 선사하는 게임."],
        media: { kind: "youtube", id: "uHGShqcAHlQ" },
      },
      {
        id: "overwatch",
        title: "오버워치",
        meta: "블리자드 · 2016",
        why: [
          "팀원들이 받쳐주고 내가 캐리할 때는 이만한 게임이 없다.",
          "매칭이 엉망이면 그만큼 어려워지는 게임이기도 하고.",
        ],
        tags: ["프레야 메인"],
        // 한국 공식 "오버워치" 채널의 프레야 게임플레이 트레일러.
        media: { kind: "youtube", id: "JDr5VYfuLXY" },
      },
    ],
  },
  {
    key: "languages",
    label: "언어",
    teaser: "나의 세계를 넓혀주는 렌즈",
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
          "여행 중 한마디라도 알아듣고 싶어서 시작했다.",
          "지금은 듀오링고로 잊지 않을 정도로만 하고 있다.",
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
