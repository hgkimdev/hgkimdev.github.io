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
// 배경 그림: 영화·게임은 예고편, 책·여행은 각각 표지·갤러리 사진이 있다.
// 언어는 영어만 책 표지를 재활용해 채웠다 — 프랑스어(듀오링고 커스텀
// 그래픽)는 시도했다가 어울리지 않아 되돌렸고, 일본어는 아직 시작 전이라
// 둘 다 `kind: "none"`으로 남아 있다 — 입구 액자와 오버레이 배경이 비어
// 있다.
//
// 표지는 서점(교보문고·알라딘) 상품 이미지를 받아 `public/life/`에
// 두었다. 대체로 가로 1200px지만, 알라딘 표지(egu.jpg)처럼 서점이
// 그보다 작은 이미지만 제공하는 경우도 있다 — LifeCoverPlate가 높이
// 기준으로 그리므로 실사용에는 문제없다.

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

/** 갤러리 한 장. width/height는 원본 리사이즈본의 실제 픽셀 크기 — PhotoSwipe가
 * 이미지를 받기 전에 확대 애니메이션의 목표 크기를 알아야 해서 미리 박아둔다. */
export type LifeGalleryPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * 여러 장을 넘겨보는 사진첩. 배경으로 한 장만 까는 `image`와 달리, 본문
 * 옆에 인터랙티브한 캐러셀로 선다 — LifeTravelGallery 참고.
 */
export type LifeGalleryMedia = {
  kind: "gallery";
  /**
   * 오버레이 배경 전용 대표 그림. 없으면 첫 장(photos[0])을 쓴다.
   * 배경은 object-cover로 화면 전체를 덮는 가로 상자라 세로 사진을 넣으면
   * 크게 확대돼 화질이 흐려 보인다 — 촬영 순서상 첫 장이 세로일 때 이 필드로
   * 가로 사진을 대신 지정한다. photos 배열의 촬영 시각 순서는 건드리지 않는다.
   */
  cover?: string;
  /**
   * 입구 타일 전용 대표 그림. 없으면 cover, 그것도 없으면 photos[0]을 쓴다.
   * 입구 타일과 오버레이 배경에 서로 다른 사진을 걸고 싶을 때만 지정한다.
   */
  tileCover?: string;
  photos: LifeGalleryPhoto[];
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
  | LifeGalleryMedia
  | { kind: "none" };

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/**
 * 언어 카테고리 전용. meta의 자유 텍스트를 배지로 그리기 위해 구조화한 값 —
 * status는 기존 meta 문구를 그대로 옮긴 것이지 새로 지어낸 카피가 아니다.
 * cefr이 null이면 아직 스케일에 오르지 않은 상태다.
 */
export type LifeLanguageLevel = {
  status: string;
  cefr: CefrLevel | null;
};

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
  /** 언어 카테고리에만 채운다. 있으면 meta 대신 배지로 그린다. */
  level?: LifeLanguageLevel;
  media: LifeMedia;
};

export type LifeCategory = {
  key: LifeCategoryKey;
  label: string;
  /** 입구 화면의 타일에 보이는 한 줄 */
  teaser: string;
  items: LifeItem[];
  /**
   * 입구 타일 대표 그림을 고를 항목의 id. 없으면 items[0]을 쓴다.
   * 목록 순서(=발매·개봉 연도순)와 타일 대표 그림이 다를 때만 지정한다 —
   * 게임은 연도순으로 오버워치(2016)가 맨 앞이지만 타일은 젤다의 전설
   * 그림을 쓰고 싶은 경우처럼.
   */
  tileItemId?: string;
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
        // 2023년 11월, 파리 -> 몽생미셸 -> 파리 -> 리옹 -> 안시 -> 니스 순.
        // 촬영 시각(EXIF DateTimeOriginal) 순서 그대로다. width/height는
        // public/life/travel/에 저장된 리사이즈본(최대 2000px) 실측치.
        media: {
          kind: "gallery",
          // 오버레이 배경은 리옹 푸르비에르 언덕 전경(가로라 덜 흐림).
          cover: "/life/travel/travel-09.jpg",
          // 입구 타일은 루브르 유리 피라미드(촬영 순서상 첫 장, 세로).
          tileCover: "/life/travel/travel-01.jpg",
          photos: [
            {
              src: "/life/travel/travel-01.jpg",
              alt: "루브르 박물관 유리 피라미드",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-02.jpg",
              alt: "튈르리 정원에서 본 루브르 박물관과 분수",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-03.jpg",
              alt: "생트샤펠 스테인드글라스",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-04.jpg",
              alt: "저녁 골목길",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-05.jpg",
              alt: "노을 진 몽생미셸 전경",
              width: 2000,
              height: 1500,
            },
            {
              src: "/life/travel/travel-06.jpg",
              alt: "몽생미셸 성벽 위 야경",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-07.jpg",
              alt: "가을 낙엽이 쌓인 묘지 공원",
              width: 2000,
              height: 1500,
            },
            {
              src: "/life/travel/travel-08.jpg",
              alt: "가로수길의 분수와 연못",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-09.jpg",
              alt: "언덕 위 대성당이 내려다보는 도시 전경",
              width: 2000,
              height: 1500,
            },
            {
              src: "/life/travel/travel-10.jpg",
              alt: "노을 지는 강변 산책로",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-11.jpg",
              alt: "운하 마을의 물 위 탑 건물",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-12.jpg",
              alt: "호수 위 백조와 산자락",
              width: 2000,
              height: 1500,
            },
            {
              src: "/life/travel/travel-13.jpg",
              alt: "운하를 바라보는 사람",
              width: 1334,
              height: 2000,
            },
            {
              src: "/life/travel/travel-14.jpg",
              alt: "유리로 지어진 현대 건축물",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-15.jpg",
              alt: "흐린 하늘 아래 강변",
              width: 1501,
              height: 2000,
            },
            {
              src: "/life/travel/travel-16.jpg",
              alt: "좁고 낡은 골목길",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-17.jpg",
              alt: "가로수와 동상이 있는 광장",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-18.jpg",
              alt: "지중해 해안절벽",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-19.jpg",
              alt: "옥빛 바다와 해안절벽",
              width: 1500,
              height: 2000,
            },
            {
              src: "/life/travel/travel-20.jpg",
              alt: "해안 산책로에서",
              width: 2000,
              height: 1500,
            },
            {
              src: "/life/travel/travel-21.jpg",
              alt: "네온 간판이 켜진 저녁 골목",
              width: 2000,
              height: 1500,
            },
            {
              src: "/life/travel/travel-22.jpg",
              alt: "노을빛 하늘 아래 좁은 골목",
              width: 1499,
              height: 2000,
            },
            {
              src: "/life/travel/travel-23.jpg",
              alt: "언덕 위에서 본 항구 마을 전경",
              width: 2000,
              height: 1500,
            },
          ],
        },
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
        id: "whiplash",
        title: "위플래쉬",
        meta: "데미언 셔젤 · 2014",
        why: ["끝까지 관객을 몰아붙이는 미친 영화"],
        // 팬 채널 "AcademyAwardClips" 업로드, 엔딩 드럼 솔로("Caravan") 장면
        // 클립. 공식 업로드가 아니라 저작권 신고로 내려갈 수 있음.
        media: { kind: "youtube", id: "ZZY-Ytrw2co" },
      },
      {
        id: "dark-waters",
        title: "다크 워터스",
        meta: "토드 헤인즈 · 2019",
        why: [
          "자신의 신념을 끝까지 밀고 나가는 것은 어렵고 외로운 길이지만,",
          "결국 포기하지 않고 행동할 때 변화가 찾아온다.",
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
    // 목록은 발매 연도순(오버워치 2016 → 젤다 2017)이지만, 입구 타일
    // 그림은 젤다의 전설을 쓴다.
    tileItemId: "botw",
    items: [
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
        level: { status: "학습 중", cefr: "B1" },
        why: ["명실상부한 국제 비즈니스 언어.", "늘 노력하지만 쉽지 않다."],
        // Cambridge 『English Grammar in Use』 5판(Raymond Murphy, 2019),
        // 영국식 중급판 — 통칭 "파란책". 알라딘 상품 이미지(ISBN
        // 9781108586627), 표지는 475x640이라 다른 책들의 1200px보다
        // 작지만 LifeCoverPlate가 높이 기준(최대 28rem)으로 그려서
        // 확대되지 않는다.
        media: {
          kind: "cover",
          src: "/life/egu.jpg",
          alt: "Cambridge 『English Grammar in Use』 5판 영국식 표지",
        },
      },
      {
        id: "french",
        title: "프랑스어",
        meta: "학습 중 · A1",
        level: { status: "학습 중", cefr: "A1" },
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
        level: { status: "다음 차례", cefr: null },
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
