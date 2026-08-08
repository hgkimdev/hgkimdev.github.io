# 프로젝트 스펙

## 컨셉

이 프로젝트는 단순한 포트폴리오나 이력서 웹사이트가 아니다.

목표는 **'나라는 사람을 가장 자연스럽게 소개하는 디지털 공간'**을 만드는 것이다. 방문자가 5~10분 정도 둘러본 뒤, 나의 성격, 가치관, 취미, 관심사, 개발 역량, 현재 집중하고 있는 일까지 입체적으로 이해할 수 있어야 한다.

친구, 협업자, 사업 파트너 그리고 관심 있는 사람이 모두 편하게 볼 수 있는 개인 브랜드 사이트를 지향한다.

## 핵심 원칙

- 이력서처럼 보이지 않는다.
- SNS처럼 단편적인 정보만 보여주지 않는다.
- 스토리텔링 중심으로 구성한다.
- 개발자로서의 개성과 기술력을 자연스럽게 드러낸다.
- 방문자가 탐험하는 재미를 느낄 수 있도록 인터랙티브한 요소를 적극 활용한다. Intro 존은 한 번 훑어보는 스토리텔링 경험이라 애니메이션 비중을 과감하게 가져가도 되지만, Blog 존은 글을 반복해서 읽는 공간이라 가독성·로딩 속도가 우선이며 과도한 애니메이션은 지양한다.
- 불필요한 개인정보는 공개하지 않는다.
- 정적 사이트(GitHub Pages)에서도 동작할 수 있도록 우선 설계한다.

## 사이트 구조 (Intro 존 / Blog 존, 두 개의 독립된 헤더)

사이트는 완전히 분리된 두 "존"으로 나뉜다.

- **Intro 존**: Home(`/`) 하나. "나를 소개하는" 3개 섹션(About/Life/Contact)을 앵커로 이어붙인 단일 스크롤 페이지. Now·Timeline은 유지보수 부담과 다른 섹션과의 내용 중복(타임라인은 이력서 형식에 가깝고, Now의 "지금 배우는 것"은 Life의 언어 카테고리와 겹침) 때문에 별도 섹션으로 두지 않기로 함. 버킷리스트는 Life의 여행 카테고리로 흡수.
- **Blog 존**: `/blog`, `/projects`와 각각의 상세 라우트(`/blog/[slug]`, `/projects/[slug]`). 콘텐츠가 계속 쌓이는 성격이라 Intro에서 완전히 분리했다.

두 존은 **각자 다른 헤더 nav 목록**을 가진다 (`lib/nav.ts`의 `introNavItems` / `blogNavItems`). Intro 존 nav는 전부 Home 섹션으로 스크롤하는 앵커 링크, Blog 존 nav(Blog/Projects)는 전부 그 존 안에서 실제 페이지를 로드하는 일반 링크다 — 존 밖으로 튕겨나가는 항목이 섞이지 않도록 Blog nav에는 Blog/Projects만 둔다. 현재 경로로 존을 판별해(`getZone`) 같은 `SiteHeader` 컴포넌트가 알맞은 nav 목록을 렌더링한다.

존 사이의 전환은 헤더 nav 항목이 아니라 **별도의 세그먼트 토글**(`ZoneSwitcher`, "소개 | 블로그")로 이루어진다. 언어 스위처·테마 토글과 같은 줄, 헤더 오른쪽 컨트롤 영역에 위치.

Contact는 두 존 헤더 nav 어디에도 없다. Blog nav 안에 텍스트 링크로 두면 다른 항목(Blog/Projects)과 달리 혼자 Intro로 튕겨나가서 어색했기 때문. 대신:

- **Intro 존**: Home 스크롤의 마지막 섹션(`#contact`)이 곧 연락 수단.
- **Blog 존 푸터**: GitHub·Instagram·Email 아이콘을 상시 노출(`components/site-footer.tsx`, `getZone`으로 판별). Intro 존 푸터에는 넣지 않는다 — 어차피 Home 최하단에 Contact 섹션이 있어서 푸터에 또 두면 중복이기 때문.

| 헤더/푸터 항목    | 존            | 종류        | 콘텐츠 성격                                           |
| ----------------- | ------------- | ----------- | ----------------------------------------------------- |
| (헤더)            | Intro         | 히어로      | 한 줄 소개 + 현재 상태 요약                           |
| `#about`          | Intro         | 앵커        | 개발을 시작한 계기·이유·삶의 철학이 담긴 짧은 에세이. 마지막 문단은 "그래서 요즘은 —"으로 현재 하고 있는 것을 한두 줄 언급해 Life로 넘어가는 다리 역할(Now 섹션의 기능만 가볍게 흡수, 문장 하나 수준이라 유지보수 부담 없음) |
| `#life`           | Intro         | 앵커        | 개인적인 면을 인터랙티브 카테고리로 나눈 로그 (아래 참고) |
| `#contact`        | Intro         | 앵커        | 연락 링크 (이메일 등 민감정보 노출 지양, SNS/폼 위주) |
| GitHub/IG/Email    | Blog(푸터)    | 외부 링크   | Blog 존 전용 소셜 아이콘 (Intro 존에는 없음)          |
| `/blog`        | Blog          | 페이지      | 생각/배움 기록 목록 (개별 글은 `/blog/[slug]`)        |
| `/projects`    | Blog          | 페이지      | 프로젝트 목록 (개별 상세는 `/projects/[slug]`)        |

`#life`의 인터랙티브 카테고리 (각 카테고리는 나열보다 "왜"가 붙는 구체적인 1~2개 위주 — 많이 채우기보다 진짜 할 얘기가 있는 것만):

- **여행**: 최근 혼자 다녀온 프랑스 여행(구체적 에피소드) + 앞으로 가고 싶은 곳(버킷리스트 흡수)
- **책**: 가장 좋아하는 책 1~2권 + 왜 기억에 남는지
- **영화**: 가장 좋아하는 영화 1~2편 + 왜 기억에 남는지
- **게임**: 가장 좋아하는 게임 1~2개 + 왜 기억에 남는지
- **언어**: 현재 배우는 영어·불어, 앞으로 배울 일본어 (Duolingo 연동은 비공식 API 리스크로 보류)

음악·운동·요리는 아직 "왜"가 명확하지 않아 이번 라운드에서는 보류. 나중에 구체적인 이야기가 생기면 카테고리로 추가 가능.

## 콘텐츠 데이터 모델

로컬 Markdown/MDX 기반, 성격에 따라 세 패턴으로 나눈다.

- **문서형** (`content/about.md`) — About처럼 단일 페이지 에세이, frontmatter 최소화
- **컬렉션형** (`content/{projects,blog}/*.md`) — 여러 항목, frontmatter로 메타데이터(title, date, tags, cover 등) 관리, 상세 페이지 자동 생성
- **로그형** (`content/life/*.md` 또는 구조화 데이터, category: travel/books/movies/games/languages) — 카테고리당 1~2개 항목의 짧고 구체적인 기록. 여행 카테고리에 버킷리스트 성격 항목 포함. 항목이 짧아 구조화 데이터(YAML/JSON)가 markdown보다 적합할 수 있음

## 기술 설정

- 스택: Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui(base 프리셋, Nova) + Motion(구 Framer Motion)
- `next.config.ts`: `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true` (유저 페이지 루트 배포라 `basePath` 불필요)
- 배포: GitHub Pages, GitHub Actions로 자동 배포 (`actions/configure-pages` → `next build` → `actions/upload-pages-artifact` → `actions/deploy-pages`), 레포 Settings → Pages → Source = "GitHub Actions"
- URL: `https://hgkimdev.github.io` (유저 페이지, 레포 `hgkimdev/hgkimdev.github.io`, public 전환 완료)
- 기존 블로그는 `hgkimdev/blog` 레포로 이전됨 (콘텐츠 보존, 별도 주소로 재배포 필요)
- 인터랙션: 스크롤/마우스 기반 연출 (예: Framer Motion). Intro 존은 "탐험하는 재미"를 적극적으로 살려 인터랙티브 효과 비중을 크게 가져간다. Blog 존은 콘텐츠 가독성이 우선이라 절제된 인터랙션만 사용한다.
- 다크모드: 헤더 토글, `prefers-color-scheme` 초기값 존중 + `localStorage` 저장. 전환 시 View Transitions API로 크로스페이드(`document.startViewTransition`)
- Intro/Blog 존 전환: React `ViewTransition`(`next.config.ts`의 `experimental.viewTransition`)으로 메인 콘텐츠 크로스페이드
- **주의 (View Transitions 스코프)**: 테마 토글의 wipe 애니메이션과 존 전환의 헤더 고정(anchor)은 서로 다른 트랜지션인데, 하나에만 적용돼야 할 CSS가 둘 다에 적용되면 안 됨. `types` on `startViewTransition` + CSS `:active-view-transition-type()`로 스코프하는 게 "정석"이지만, 이 환경에서는 그 pseudo-class가 실제로 매치되지 않는 것을 확인함(컴파일된 CSS에서 통째로 사라짐 — `:not(...)`으로 감싸면 오히려 항상 true가 돼서 더 넓게 적용되는 역효과 발생, 실제로 헤더가 테마 전환 때도 계속 먼저 스냅되는 버그로 나타났었음). 대신 `<html data-transition-kind="theme"|"zone">`을 각 트리거(`ThemeToggle`/`ZoneSwitcher`)가 직접 세팅하고 CSS에서 속성 셀렉터로 읽는 방식으로 우회. 같은 이유로 `next/link`의 `transitionTypes` prop도 안 씀(검증만 되고 실제 네비게이션엔 전달 안 되는 죽은 prop — `node_modules/next/dist/client/link.js`의 `linkClicked` 호출부 확인) — 존 전환 방향은 `ZoneSwitcher`가 `<html data-zone-nav>`를 직접 설정해서 처리
- 라우트 전환 시 스크롤 점프 이슈: `html`에 `scroll-smooth`를 쓰면 Next.js가 라우트 전환 시 스크롤 위치를 리셋하는 동작과 충돌해서 페이지 전환 중 불필요하게 스크롤이 애니메이션되는 문제가 있었음 → `<html data-scroll-behavior="smooth">` 추가로 해결 (Next.js가 콘솔에 직접 안내하는 메시지)
- 반응형: 모바일/데스크톱 모두 대응, 빠른 로딩과 접근성 우선
- 다국어: `/`(한국어, 기본) + `/en/*`(영어) + `/fr/*`(불어) + `/ja/*`(일본어) 구조. `app/(ko)/`, `app/en/`, `app/fr/`, `app/ja/` route group/폴더로 분리, 각각 자체 `layout.tsx`. `lib/i18n/dictionaries.ts` 경량 자체 dictionary 사용 (미들웨어 불필요, static export 호환)
- 스크롤: `html`에 `scroll-smooth`, 각 섹션에 `scroll-mt-*`로 sticky 헤더 높이만큼 앵커 이동 시 오프셋 보정

## 디자인 방향

미니멀하지만 따뜻한 느낌. Intro 존은 스크롤/마우스 인터랙션과 애니메이션을 적극적으로 활용해 탐색하는 재미 자체를 경험으로 만든다. Blog 존은 같은 미니멀·따뜻한 톤을 유지하되 인터랙션은 절제해 콘텐츠 가독성을 우선한다.

## 진행 방식

1. 공통 레이아웃/네비게이션 (헤더, 푸터, 다크모드, 다국어 4개 언어) + Home(3개 앵커 섹션) + Blog/Projects 목록 페이지 골격(placeholder) — 완료
2. 각 섹션·페이지에 실제 콘텐츠 채우기 (About부터 시작, Life는 카테고리 인터랙션 구현까지 필요해 다음 순서)
3. Blog/Projects에 실제 항목이 쌓이면 콘텐츠 로딩 파이프라인(Markdown/MDX) 구성 + `/projects/[slug]`, `/blog/[slug]` 상세 라우트 추가
4. GitHub Pages 배포 파이프라인 구성
