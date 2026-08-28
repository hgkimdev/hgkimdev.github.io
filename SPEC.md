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

- **Intro 존**: Home(`/`) 하나. "나를 소개하는" 4개 섹션(About/Projects/Life/Contact)을 앵커로 이어붙인 단일 스크롤 페이지. Projects는 원래 Blog 존의 페이지였지만, 계속 쌓이는 아카이브라기보다 "내가 뭘 만드는 사람인가"를 보여주는 자기소개의 일부라 About과 Life 사이로 옮겼다. Now·Timeline은 유지보수 부담과 다른 섹션과의 내용 중복(타임라인은 이력서 형식에 가깝고, Now의 "지금 배우는 것"은 Life의 언어 카테고리와 겹침) 때문에 별도 섹션으로 두지 않기로 함. 버킷리스트는 Life의 여행 카테고리로 흡수.
- **Blog 존**: `/blog`와 상세 라우트(`/blog/[slug]`). 콘텐츠가 계속 쌓이는 성격이라 Intro에서 완전히 분리했다.

두 존은 **각자 다른 헤더 nav 목록**을 가진다 (`lib/nav.ts`의 `introNavItems` / `blogNavItems`). Intro 존 nav는 전부 Home 섹션으로 스크롤하는 앵커 링크다. **Blog 존 nav는 비어 있다** — Projects가 Intro로 옮겨간 뒤 Blog 하나만 남았는데, 지금 보고 있는 페이지를 가리키는 항목 하나짜리 목록은 소음이다. 브랜드가 이미 `hgkim /blog`로 존을 표시하고 나가는 길은 `ZoneSwitcher`가 맡으므로 목록이 할 일이 없다. **브랜드 링크는 자기 존의 첫 화면으로 간다** — Intro 존에서는 `/`, Blog 존에서는 `/blog`. Blog에서 누르면 Intro로 튕기는 동작은 이름 옆에 붙은 `/blog`와 어긋나고, 존을 나가는 일은 어차피 ZoneSwitcher가 맡는다. 현재 경로로 존을 판별해(`getZone`) 같은 `SiteHeader` 컴포넌트가 알맞은 nav 목록을 렌더링하며, 항목이 없으면 `<nav>`도 모바일 햄버거도 렌더링하지 않는다(빈 서랍이 열리지 않도록).

존 사이의 전환은 헤더 nav 항목이 아니라 **별도의 세그먼트 토글**(`ZoneSwitcher`, "소개 | 블로그")로 이루어진다. 언어 스위처·테마 토글과 같은 줄, 헤더 오른쪽 컨트롤 영역에 위치.

Contact는 두 존 헤더 nav 어디에도 없다. Blog nav 안에 텍스트 링크로 두면 같은 줄의 다른 항목과 달리 혼자 Intro로 튕겨나가서 어색했기 때문. 대신:

- **Intro 존**: Home 스크롤의 마지막 섹션(`#contact`)이 곧 연락 수단.
- **Blog 존 푸터**: GitHub·Instagram·Email 아이콘을 상시 노출(`components/site-footer.tsx`, `getZone`으로 판별). Intro 존은 `SiteFooter`가 아예 렌더링되지 않는다(빈 카피라이트 줄도 없음) — 어차피 Home 스크롤의 마지막 슬롯이 Contact라 그 자체로 페이지의 자연스러운 끝이기 때문.

| 헤더/푸터 항목    | 존            | 종류        | 콘텐츠 성격                                           |
| ----------------- | ------------- | ----------- | ----------------------------------------------------- |
| (헤더)            | Intro         | 히어로      | 한 줄 소개 + 현재 상태 요약                           |
| `#about`          | Intro         | 앵커        | 개발을 시작한 계기·이유·삶의 철학이 담긴 짧은 에세이. 마지막 문단은 "그래서 요즘은 —"으로 현재 하고 있는 것을 한두 줄 언급해 Life로 넘어가는 다리 역할(Now 섹션의 기능만 가볍게 흡수, 문장 하나 수준이라 유지보수 부담 없음) |
| `#projects`       | Intro         | 앵커        | 만든 것들. Blog 존에서 옮겨온 섹션                     |
| `#life`           | Intro         | 앵커        | 개인적인 면을 인터랙티브 카테고리로 나눈 로그 (아래 참고) |
| `#contact`        | Intro         | 앵커        | 연락 링크 (이메일 등 민감정보 노출 지양, SNS/폼 위주) |
| GitHub/IG/Email    | Blog(푸터)    | 외부 링크   | Blog 존 전용 소셜 아이콘 (Intro 존에는 없음)          |
| `/blog`        | Blog          | 페이지      | 생각/배움 기록 목록 (개별 글은 `/blog/[slug]`, 분류는 `/blog/category/[category]`·`/blog/tag/[tag]`). 목록 페이지에는 제목만 두고 설명 문구를 붙이지 않는다 — 사이드바의 분류와 목록 자체가 이미 무엇이 있는지 말한다 |

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
- **컬렉션형** (`content/blog/*.md`) — 여러 항목, frontmatter로 메타데이터(title, date, category, tags, summary, cover, draft) 관리, 상세 페이지 자동 생성. 파일 이름이 곧 slug. `_`로 시작하는 파일은 목록에서 제외(`_template.md`가 새 글의 원본). frontmatter는 YAML이라 값 안의 콜론은 반드시 따옴표로 감싸야 한다 — `summary: "output: export 환경에서..."`를 그냥 적었다가 파서가 통째로 실패한 적이 있어서, 로더가 파일 이름과 원인을 붙여 다시 던진다
  - **draft**: `draft: true`인 글은 dev에서만 보이고 `next build`에는 나가지 않는다. 쓰는 중인 글을 미리 보는 것과 공개 시점을 frontmatter 한 줄로 가른다
  - **cover(썸네일)**: 목록 왼쪽에 붙는 썸네일. frontmatter에 `cover`를 적으면 그것을 쓰고, **없으면 본문의 첫 이미지를 자동으로 가져온다** — "글에 이미지가 있으면 목록에도 보인다"가 기본 동작이고, 다른 그림을 내세우고 싶을 때만 `cover`를 적는다. raw HTML은 파이프라인에서 통과시키지 않으므로 마크다운 이미지 문법만 본다
  - **빈 목록 대비**: `output: 'export'`는 동적 라우트가 최소 한 경로를 만들어 내기를 요구해서(빈 배열이면 "generateStaticParams가 없다"고 보고 빌드가 멈춘다), 공개 글이 0편이면 `__no-posts` 자리표시자 경로 하나를 내보내고 그 페이지에서 `notFound()`를 부른다. 첫 글이 공개되면 저절로 사라진다
### 글 분류 축 (카테고리 + 태그, 2단)

velog·티스토리·워드프레스·네이버를 실제로 띄워 확인한 결과, 분류는 글에 붙은 라벨이 아니라 **사이드바에 상시 고정된 항해 장치**다. velog(`글/시리즈/소개` 탭 + 좌측 "태그 목록 전체보기(54) React(28)…")는 카테고리를 아예 두지 않는데, 그래서 큰 덩어리 구조화가 안 된다는 게 알려진 약점이다. 티스토리는 반대로 사이드바에 카테고리 목록(전체글/생각정리/회고/도서/…)을 세운다.

여기서는 둘 다 쓴다 — **카테고리는 책의 장, 태그는 책 뒤 색인**.

- **카테고리**: `공부`(study) / `일상`(daily) / `생각`(think). 한 글에 하나, 개수 고정. key가 곧 URL이라 바꾸면 링크가 깨진다
- **태그**: 한 글에 여럿, 글에서 자유롭게 자란다. 실제로 쓰인 태그만 페이지가 생긴다
- 사이드바 개수는 **언제나 전체 글 기준**이다. 걸러진 목록에서도 숫자가 흔들리면 목차 역할을 못 한다
- 태그 slug는 공백·슬래시·**점**을 하이픈으로 바꾼다. `Next.js`를 그대로 두면 `next.js`가 되고 Next가 확장자 있는 파일 경로로 봐서 trailingSlash를 무시한 채 308로 튕긴다
- 한글 태그는 그대로 쓴다. export가 `out/blog/tag/기록/index.html`을 만들고 정적 호스트가 퍼센트 인코딩을 풀어 찾아간다 — 실제로 확인함

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
- **주의 (sticky 헤더 + Motion layoutId)**: 깊게 스크롤한 긴 페이지에서 짧은 페이지로 넘어가면, DOM이 바뀐 직후와 브라우저가 `scrollY`를 새 문서 높이에 맞춰 자르기 전 사이에 sticky 헤더가 잠깐 문서 아래쪽에 있는 것처럼 측정된다. 그 순간을 `layoutId`(ZoneSwitcher 활성 필)가 재면 그 차이만큼 세로로 튄다 — 실측: 상세 글 하단(scrollY 1655)에서 목록으로 이동하자 필에 `translateY(1628px)`가 걸리고 스프링으로 800ms에 걸쳐 되돌아왔다. Motion은 레이아웃을 **페이지 좌표**로 재기 때문에 sticky 요소의 스크롤 오프셋을 알지 못한다(`layoutRoot`도 시도했지만 효과가 없었다). 해결은 네비게이션 **직전에** 스크롤을 0으로 되돌리는 것이고(`lib/scroll.ts`), 원래 ZoneSwitcher 링크에만 걸려 있던 것을 `components/scroll-reset-on-nav.tsx`의 document 단위 capture 리스너로 옮겼다 — 헤더 브랜드·목록 행·사이드바처럼 같은 조건을 만드는 링크가 계속 늘어서, 링크마다 핸들러를 다는 방식은 새 링크가 빠뜨리기 쉬웠다. 같은 문서 안의 앵커 이동(`#section`)과 외부 링크는 건드리지 않는다
- **주의 (View Transitions 스코프)**: 테마 토글의 wipe 애니메이션과 존 전환의 헤더 고정(anchor)은 서로 다른 트랜지션인데, 하나에만 적용돼야 할 CSS가 둘 다에 적용되면 안 됨. `types` on `startViewTransition` + CSS `:active-view-transition-type()`로 스코프하는 게 "정석"이지만, 이 환경에서는 그 pseudo-class가 실제로 매치되지 않는 것을 확인함(컴파일된 CSS에서 통째로 사라짐 — `:not(...)`으로 감싸면 오히려 항상 true가 돼서 더 넓게 적용되는 역효과 발생, 실제로 헤더가 테마 전환 때도 계속 먼저 스냅되는 버그로 나타났었음). 대신 `<html data-transition-kind="theme"|"zone">`을 각 트리거(`ThemeToggle`/`ZoneSwitcher`)가 직접 세팅하고 CSS에서 속성 셀렉터로 읽는 방식으로 우회. 같은 이유로 `next/link`의 `transitionTypes` prop도 안 씀(검증만 되고 실제 네비게이션엔 전달 안 되는 죽은 prop — `node_modules/next/dist/client/link.js`의 `linkClicked` 호출부 확인) — 존 전환 방향은 `ZoneSwitcher`가 `<html data-zone-nav>`를 직접 설정해서 처리
- 라우트 전환 시 스크롤 점프 이슈: `html`에 `scroll-smooth`를 쓰면 Next.js가 라우트 전환 시 스크롤 위치를 리셋하는 동작과 충돌해서 페이지 전환 중 불필요하게 스크롤이 애니메이션되는 문제가 있었음 → `<html data-scroll-behavior="smooth">` 추가로 해결 (Next.js가 콘솔에 직접 안내하는 메시지)
- 반응형: 모바일/데스크톱 모두 대응, 빠른 로딩과 접근성 우선
- 다국어: `/`(한국어, 기본) + `/en/*`(영어) 구조. `app/(ko)/`, `app/en/` route group/폴더로 분리, 각각 자체 `layout.tsx`. `lib/i18n/dictionaries.ts` 경량 자체 dictionary 사용 (미들웨어 불필요, static export 호환). 불어·일본어는 한때 지원했으나 정리했다 — 한국어·영어만 유지하기로 결정
- 스크롤: `html`에 `scroll-smooth`, 각 섹션에 `scroll-mt-*`로 sticky 헤더 높이만큼 앵커 이동 시 오프셋 보정

## 디자인 방향

미니멀하지만 따뜻한 느낌. Intro 존은 스크롤/마우스 인터랙션과 애니메이션을 적극적으로 활용해 탐색하는 재미 자체를 경험으로 만든다. Blog 존은 같은 미니멀·따뜻한 톤을 유지하되 인터랙션은 절제해 콘텐츠 가독성을 우선한다.

**본문 폭은 존마다 다르다.** Intro는 `max-w-4xl`(896px), Blog 목록은 사이드바가 붙어 1152px이다. `<main>`은 두 존이 함께 쓰는 레이아웃이라 페이지가 자기 폭을 직접 정할 수 없어서, 목록 페이지가 `data-zone-wide`를 달고 `main:has([data-zone-wide])`가 반응한다(globals.css). 글 상세는 한 편을 처음부터 끝까지 읽는 화면이라 사이드바 없이 896px 안에서 본문을 38rem으로 좁힌다.

Blog 존의 절제된 인터랙션은 구체적으로 세 가지다 — 목록 행의 왼쪽 여백·제목 밑줄, 사이드바 링크의 색 전환, 글 상단의 읽기 진행바(헤더 아래 1.5px, 카테고리 색). 900px 미만에서 사이드바는 사라지지 않고 **가로로 스크롤하는 한 줄**로 바뀐다(축마다 한 줄, 라벨은 줄 왼쪽에 붙박이).

이건 velog가 쓰는 방식이고, 모바일에서 실제로 띄워 확인한 결과다 — velog는 세로 태그 목록을 `display:none`으로 완전히 숨기고 가로 스크롤 줄로 교체한다(계정 하나는 태그 54개가 한 줄에 들어가 `scrollWidth`가 10,042px다). 티스토리는 카테고리를 햄버거 서랍에 넣고, WordPress 블록 테마는 분류 사이드바 자체를 없애고 글마다 라벨만 붙인다. 뒤 둘은 분류의 발견성이 0이 되므로 "분류를 화면에 상시 고정한다"는 V3 선택과 어긋나서 쓰지 않았다.

핵심은 **줄바꿈을 하지 않는 것**이다. `flex-wrap`으로 접으면 높이가 항목 수에 비례해 자라 글 목록을 아래로 밀어낸다. 실측: 태그 23개 기준 wrap 방식은 사이드바가 147px(칩이 눌려 글자까지 접혔다), 한 줄 스크롤은 **69px**로 항목 수와 무관하게 고정이다.

데스크톱 세로 목록에서 **태그는 10개까지만** 보여주고 `‹ 1 2 3 ›`으로 넘긴다. 카테고리는 개수가 고정이라 페이징하지 않는다. 지금 보고 있는 태그가 든 쪽부터 펼친다.

**사이드바를 접는 기능은 두지 않는다.** 한 번 넣었다가 뺐다 — V3을 고른 이유가 "분류를 화면에 상시 고정한다"인데 접을 수 있게 하면 그 결정과 어긋난다. 글 상단 목록이 접힌 채로 시작하는 것과는 반대 판단이고, 이유도 반대다(그쪽은 읽으러 온 사람 앞을 막지 않는 게 목적).

**모바일에서는 페이징을 걸지 않는다.** 가로 스크롤 한 줄이라 항목이 늘어도 높이가 그대로인데, 거기서 또 페이지를 나누면 스크롤과 페이징이 같은 일을 두 번 한다. 그래서 항목은 **전부 렌더하고 현재 페이지 밖의 것만 데스크톱에서 숨긴다**(`min-[900px]:hidden`) — 뷰포트를 JS로 재지 않아도 되고 하이드레이션 불일치도 생기지 않는다.

`‹ 1 2 3 ›` 페이저는 글 상단 목록과 사이드바 태그가 `components/blog/pagination.tsx`를 공유한다. 사이드바 폭이 12.5rem이라 페이지가 늘면 한 줄에 안 들어가므로 `flex-wrap`으로 접힌다.

구현에서 두 번 걸린 곳:
- **`min-w-0`**: 그리드 아이템은 `min-width:auto`가 기본이라, 없으면 가로 스크롤이 아니라 문서 자체가 넓어진다(390px 화면에서 `scrollWidth`가 1541px이 됐다). `aside`와 각 축 래퍼 양쪽에 필요하다.
- **`shrink-0`은 `li`에**: 스크롤 줄의 flex 자식은 `li`다. 안쪽 `a`에만 주면 `li`가 눌려 칩 글자가 세로로 접힌다(줄 높이 30 → 108px).

**이미지는 상자를 먼저 정하고 파일을 거기에 맞춰 굽는다 (16:9)**

정적 export라 `next/image`의 최적화가 동작하지 않는다 — 표시 크기와 무관하게 원본이 통째로 나간다. 실측: 2000×1500·243KB짜리 사진이 112px 썸네일 자리에 그대로 내려왔다. CSS로 줄여도 전송량과 디코딩 비용은 그대로다. 게다가 본문 이미지는 원본 비율을 따라가서 세로 사진이 섞이면 글마다 높이가 제각각이 된다.

그래서 **목록 썸네일은** 표시할 상자를 4:3으로 고정하고 파일 자체를 그 비율·크기로 미리 굽는다(`scripts/build-blog-images.mjs`, sharp). 표시 시점에는 자를 것이 없고 통일감이 파일 차원에서 보장된다.

**본문 사진은 비율을 건드리지 않는다.** 글 안의 사진은 비율 자체가 내용이라(세로 사진, UI 스크린샷) 상자에 맞춰 자르면 정보가 사라진다. 빌드 때도 폭만 줄이고(`withoutEnlargement`) 자르지 않으며, CSS도 `height: auto`로 원본 비율을 따른다. 한 번 16:9로 잘랐다가 되돌렸다.

- `npm run build`/`npm run dev` 앞에 자동으로 붙는다(`prebuild`/`predev`). 산출물은 파생물이라 커밋하지 않는다(`.gitignore`의 `/public/_blog/`)
- 두 벌을 굽는다 — 썸네일 480×360(4:3 크롭), 본문 1280w(폭만 제한, 비율 유지). webp q80. 실측 243KB → 8KB / 32KB
- 썸네일 자르기는 `position: "attention"`이다. 가운데를 기계적으로 자르면 피사체가 잘려 나가는 일이 잦다
- 원본이 그대로면 다시 굽지 않는다(mtime 비교)
- 파생물이 없으면(스크립트 미실행, 외부 URL 등) **원본으로 조용히 떨어진다** — `blogImage()`가 `existsSync`로 확인한다. 이미지가 깨지는 대신 최적화만 사라진다
- 썸네일 쪽 CSS에는 `aspect-[4/3]` + `object-cover`를 남겨 둔다. 원본으로 떨어진 경우에도 목록 높이가 어긋나지 않게 하는 안전망
- 썸네일에는 `self-*`가 필요하다. 플렉스 자식은 기본이 stretch라 세로로 늘어나면서 `aspect-*`가 무시된다(실측: 144×140으로 그려졌다). `self-center`를 쓰는데, 좁은 화면에서는 제목이 두 줄로 접혀 텍스트 블록이 167px까지 자라기 때문이다 — 4:3을 유지하면서 거기까지 키우면 썸네일이 화면 폭의 절반을 넘는다. 남는 자리를 위아래로 나누면 "아래가 비었다"로 읽히지 않는다(실측 위 42 / 아래 42)
- 비율 선택: 16:9는 옆 텍스트 블록보다 한참 낮아 아래가 크게 빈다(실측 81px vs 140px, 여백 59px). 4:3에 폭 176px이면 132px이라 8px 차이로 맞아떨어진다

**목록 썸네일**: 이미지가 있는 글만 요약 왼편에 붙는다(176×132, 모바일 112×84). 이미지가 없는 글은 자리를 비워 두지 않고 텍스트가 왼쪽 끝에서 시작한다 — 빈 회색 판을 채워 넣으면 이미지가 있는 글보다 오히려 눈에 띈다. `next/image` 대신 `life-entrance.tsx`처럼 평범한 `img`에 `loading="lazy"`를 쓴다.

**메타 줄에 넣지 않기로 한 것**: 읽는 시간("읽는 데 N분")과 상세 페이지의 `01 / 03` 순번은 넣었다가 뺐다. 읽는 시간은 한글 글자 수를 나눈 추정치라 정확하지도 않으면서 메타 줄만 길게 만들고, 순번은 Projects처럼 항목이 고정된 목록에서나 의미가 있지 계속 쌓이는 블로그에서는 글이 하나 늘 때마다 모든 글의 번호가 밀려서 가리키는 바가 없다. 상세 메타 줄은 `카테고리 · 날짜 · 태그`까지다.

**다른 글로 가는 길은 상단 목록 하나로 모았다**(`components/blog/post-pager.tsx`). 제목만 다섯 개씩 보여주고 `‹ 1 2 3 ›` 로 넘긴다(양 끝에서 화살표는 disabled — 눌러도 아무 일이 없는 버튼을 살려 두면 마지막 페이지인지가 눌러 봐야만 알 수 있다). **기본값은 접힌 상태**이고 `글 목록` 행을 눌러 편다 — 글을 읽으러 들어온 사람에게 제목 다섯 줄을 먼저 들이밀 이유가 없다. 모양은 **본문 폭을 다 쓰는 아코디언 행**(위아래 hairline, 왼쪽 라벨 오른쪽 셰브론, 행 전체가 클릭 영역)이다. 알약 버튼도 만들어 봤지만 테두리 상자가 조용한 읽기 화면에 비해 무거웠다. 펼쳤을 때는 이 행의 아래 테두리를 끈다 — 목록이 자기 위 테두리를 그리므로 가로선 두 줄이 나란히 서면 유독 무거워 보인다(hover에서 border-color를 다시 칠하므로 `hover:border-b-transparent`도 같이 필요하다). 접혀 있을 때는 숨기는 게 아니라 아예 그리지 않는다(숨기기만 하면 링크가 접근성 트리와 탭 순서에 남는다). 본문 아래에 있던 이전/다음 링크는 지웠다 — Projects의 이전/다음은 항목이 셋으로 고정된 순환이라 뜻이 통하지만, 계속 쌓이는 블로그에서 "이전 글"은 그냥 하루 먼저 쓴 글이라 이어서 읽을 이유가 없다. 페이지 넘김은 라우트가 아니라 클라이언트 상태다(읽던 글을 벗어나지 않고 훑어보라고 있는 물건이고, 정적 export에서 페이지 수만큼 라우트를 만들 필요도 없다). 처음 열릴 때는 지금 보고 있는 글이 든 쪽을 편다.

## 진행 방식

1. 공통 레이아웃/네비게이션 (헤더, 푸터, 다크모드, 다국어) + Home(앵커 섹션) + Blog 목록 페이지 골격(placeholder) — 완료
2. 각 섹션·페이지에 실제 콘텐츠 채우기 (About 완료, Life는 입구 포스터 월 + 전체화면 오버레이까지 구현 완료 — 콘텐츠 문장은 교체 필요. Projects도 구현 완료 — 다만 Life와는 다른 골격을 쓴다: 입구는 사진 벤토 그리드가 아니라 텍스트 행 목록(Claudocs·Langport·Claude 관련 도구 2종), 클릭하면 Life식 전체화면 오버레이가 아니라 진짜 라우트(`/projects/[slug]`, 뒤로가기 가능, 헤더·푸터 정상 노출, 이전/다음 프로젝트 링크가 있는 케이스 스터디 페이지)로 이동한다. 첫 시도는 Life의 UI를 그대로 재사용했다가 Home을 한 번에 스크롤할 때 사진 카드 그리드가 반복돼 단조롭다는 피드백을 받아 이렇게 바꿨다 — About=에세이, Life=사진 벤토, Projects=텍스트 목록, Contact=마퀴 목록으로 네 섹션이 각자 다른 시각 언어를 갖는다. 콘텐츠는 각 레포 README 기반이고 Claudocs·Langport는 본인 문장으로 교체 완료 — Claude 도구 2종은 자잘한 CLI 도구라 "왜 만들었는지" 서사 없이 최소 사실 기반으로 두기로 함)
3. Blog 구조·파이프라인 — 완료. 마크다운은 `@next/mdx` 대신 `gray-matter` + `unified`(remark-parse/gfm/rehype + rehype-slug/stringify)로 빌드 타임에 HTML로 굽는다. `@next/mdx`는 frontmatter를 기본 지원하지 않고 파일 기반 라우팅이라 `content/blog/*.md`를 수집하는 방식과 결이 안 맞았다. 클라이언트 번들 증가는 0이고, 본문에 raw HTML은 통과시키지 않는다. 라우트는 `/blog`(목록) · `/blog/[slug]`(P3형 상세: 읽기 진행바 + 상단 글 목록 + 메타 줄. Projects와 달리 `← Blog` 백링크는 없다 — 헤더의 `hgkim /blog`가 이미 같은 일을 한다) · `/blog/category/[category]` · `/blog/tag/[tag]`이고 전부 `/projects/[slug]`의 패턴(`generateStaticParams`, `dynamicParams = false`, `@footer` 병렬 슬롯)을 따른다. 슬롯은 경로가 정확히 맞아야 해서 하위 라우트마다 자기 `@footer` 파일이 필요하다. 코드 하이라이팅은 `@shikijs/rehype`(shiki) 듀얼 테마다 — 라이트 **Tokyo Night Light**(#e6e7ed) / 다크 **Tokyo Night**(#1a1b26). 라이트 쪽은 shiki 번들에 없어서 원본 VS Code 테마([enkia/tokyo-night-vscode-theme](https://github.com/enkia/tokyo-night-vscode-theme), MIT)를 `lib/content/themes/`에 벤더링했다 — JSONC를 엄격한 JSON으로 바꾸고, 원본의 오기(`"type": "dark"`)를 고치고, shiki가 안 쓰는 에디터 전용 키를 지웠다(자세한 건 그 폴더의 README). 빌드 타임에 토큰마다 색을 인라인 style로 박으므로 클라이언트에 하이라이터도 테마 CSS도 실리지 않는다. 두 테마 중 라이트를 인라인 style에 넣고 다크는 `--shiki-dark` 변수로 함께 실어 보내며, globals.css의 `.dark .blog-prose .shiki` 규칙이 변수를 꺼내 쓴다(인라인 style을 이겨야 해서 `!important`가 필요하다 — shiki가 안내하는 클래스 기반 다크 모드 방식이다). 테마 토글이 `prefers-color-scheme`가 아니라 클래스로 갈리는 이 사이트에서는 이 방식이라야 전환이 즉시 반영된다. 코드 블록의 배경색은 shiki가 인라인으로 넣으므로 globals.css에서는 상자 모양만 정한다 — 거기서 배경을 또 선언하면 인라인 style에 져서 죽은 규칙이 된다. 댓글은 giscus(아래 참고). **남은 것은 첫 글을 쓰는 일뿐이다.** `content/blog/`의 샘플 3편은 전부 `draft: true`인 자리표시자이므로 실제 글이 생기면 지울 것
4. Blog 다국어 — 완료. Home 인트로(`dict.home`)는 ko 원문을 en으로 직역해 맞췄다. Blog는 Life·Projects와 다른 길을 탔다: `/en/blog`가 `PagePlaceholder` 대신 실제 `BlogShell`/`BlogList`/`BlogSidebar`를 쓰고, `/blog/[slug]`·`/blog/category/[category]`·`/blog/tag/[tag]`도 로케일마다 자기 라우트(및 `@footer` 슬롯)를 갖는다. Blog 존 UI 문구(카테고리/태그/전체글/댓글/페이지네이션)는 컴포넌트에 박아 두는 대신 `dictionaries.ts`의 `blog` 항목으로 옮겼다 — 카테고리 라벨도 `lib/content/blog.ts`의 `blogCategories`(key만 남음) 대신 사전에서 로케일별로 가져온다. 페이지 번호 라벨은 `(n) => string` 함수가 아니라 `"{n}페이지"` 같은 템플릿 문자열이다 — 함수를 클라이언트 컴포넌트(`TaxonomySection`/`Pagination`) props로 넘기면 "Functions cannot be passed directly to Client Components" 빌드 에러가 난다. 글 콘텐츠는 `content/blog/<slug>.md`(ko 원문)와 `<slug>.<locale>.md`(번역) 파일로 나란히 두고, 번역이 없는 글은 그 로케일 목록에 그냥 나타나지 않는다(한국어와 번역이 섞여 보이는 것보다 낫다는 판단) — 지금은 샘플 3편 전부 en 번역이 있다. sitemap·hreflang은 손대지 않았다: `pageAlternates`는 여전히 `/`·`/blog`에만 붙고, 글 상세·카테고리·태그는 자기 자신을 가리키는 canonical만 가진다(§SEO 메타데이터 참고) — 번역이 생겼다고 해서 이 부분을 넓히지는 않았다. (2026-08-28: 불어·일본어 지원을 걷어내고 한국어·영어만 남기기로 결정 — `app/fr/`·`app/ja/`와 `*.fr.md`/`*.ja.md` 번역 파일을 삭제했다)
5. GitHub Pages 배포 파이프라인 구성
6. Home 나머지 존 영어화 — 완료 (2026-08-29). About(`content/about.en.md`)·Life(`content/life.en.ts`)·Projects(`content/projects.en.ts`)를 항목 id로 매칭하는 텍스트 번역 파일로 추가하고, `lib/content/{life,projects}.ts`의 `getLifeCategories(locale)`/`getProjectGroups(locale)`가 ko 원본(media·id 등 언어 무관 필드)에 번역 텍스트만 덮어씌워 돌려준다 — media·photo 배열을 로케일마다 중복시키지 않기 위해서다. `components/home-content.tsx`의 `locale === "ko"` 게이트를 걷어냈고, Life 오버레이·Projects 상세에 박혀 있던 하드코딩 한국어 UI 문구(닫기·소리 켜기/끄기·목록 aria·책장 사진 라벨·교보문고 미리보기 aria·데모 영상 title) 6곳은 `dictionaries.ts`의 `life`/`projects` 항목으로 옮겼다. `/projects/[slug]`도 `app/en/projects/[slug]`로 영어 버전을 냈다(SPEC상 원래는 한국어 전용이었지만 요청으로 확장) — sitemap은 블로그 상세와 같은 기존 규칙대로 ko canonical URL만 유지하고 손대지 않았다. 사진·표지 이미지의 `alt` 텍스트는 번역 범위 밖이라 아직 한국어로 남아 있다.

## 댓글 (giscus)

GitHub Discussions를 저장소로 쓰는 임베드라 정적 사이트에서도 동작한다 — 서버가 필요한 쪽이 전부 GitHub에 있다. `components/blog/giscus-comments.tsx`가 마운트 후 스크립트를 붙이므로 export된 HTML에는 iframe이 없고, `data-loading="lazy"`라 화면에 들어올 때 로드된다.

- 대상 레포: `hgkimdev/hgkimdev.github.io` (사이트 레포와 같다). Discussions를 켜 뒀다
- 카테고리: **Announcements** — 이 카테고리는 메인테이너만 새 토론을 열 수 있어서, 글마다 필요한 토론은 giscus가 첫 댓글 때 만들고 아무나 빈 토론을 양산하지는 못한다
- `repoId`·`categoryId`는 GraphQL로 조회한 값을 컴포넌트에 상수로 박아 뒀다. 공개돼도 되는 값이라 env로 뺄 이유가 없다 — 어차피 스크립트 속성으로 브라우저에 그대로 나간다
- 매핑은 `pathname`. **글을 공개한 뒤 파일 이름(slug)을 바꾸면 그 글의 댓글과 연결이 끊긴다**
- 테마: 사이트가 `prefers-color-scheme`가 아니라 `<html>.dark` 클래스로 갈리므로 giscus의 `preferred_color_scheme`을 쓸 수 없다. MutationObserver로 클래스를 보고 `postMessage`로 giscus에 넘긴다. 다크는 `dark`(#0d1117)가 아니라 `dark_dimmed` — giscus의 dark가 이 사이트 다크 배경보다 훨씬 검어서 댓글창만 구멍처럼 파인다
- **전제 조건**: giscus GitHub App이 이 레포에 설치돼 있어야 한다(<https://github.com/apps/giscus>). 설치 전에는 임베드가 "giscus is not installed on this repository"를 표시한다

## SEO 메타데이터

`lib/seo.ts`에 사이트 URL·OG 기본값·hreflang 헬퍼를 모아 뒀다. 레이아웃·페이지·`sitemap.ts`가 전부 여기서 가져다 쓴다 — 로직이 세 곳 이상에서 반복되길래 뽑았다.

- **`metadataBase`**: 루트 레이아웃에 `https://hgkimdev.github.io`로 고정. 없으면 OG 이미지 같은 상대 경로가 절대 URL로 안 풀린다
- **타이틀 템플릿**: 루트가 `title: { default: "hgkim", template: "%s · hgkim" }`을 잡아 두면 자식이 문자열 타이틀만 적어도(`"Blog"`, `"${post.title} · Blog"`) 자동으로 `"... · hgkim"`이 붙는다. 그래서 en 레이아웃의 `title: "hgkim"` 중복 선언은 지웠다 — 남겨 두면 템플릿이 한 번 더 감싸 `"hgkim · hgkim"`이 됐을 것
- **`openGraph`는 항상 통째로 다시 적어야 한다**: Next의 메타데이터 병합은 얕은 병합이라, 자식이 `openGraph`를 선언하면 부모 쪽 `openGraph`는 필드 단위로 합쳐지지 않고 객체째로 교체된다(`node_modules/next/dist/docs`의 generate-metadata.md에서 확인). 그래서 로케일 레이아웃마다 `locale`만 다르게 주고 싶어도 `siteName`·`type`까지 매번 같이 넣어야 한다 — `lib/seo.ts`의 `openGraphFor(locale)`이 그 전체 객체를 만들어 준다
- **OG 이미지**: `app/opengraph-image.tsx`가 `next/og`의 `ImageResponse`로 빌드 타임에 정적 PNG를 굽는다(모든 라우트의 기본값). 이미지 안 문구는 이미 배포된 루트 메타데이터 문구(`hgkim`, `나라는 사람을 소개하는 공간`)를 그대로 재사용했다 — 이미지용으로 새 카피를 지어내지 않았다. 별도 `twitter-image`는 안 만든다: `twitter:image`가 없으면 트위터 카드 파서가 `og:image`로 떨어지는 게 표준 동작이라 굳이 같은 그림을 두 벌 관리할 이유가 없다
- **`output: 'export'`의 숨은 요구사항**: `sitemap.ts`·`robots.ts`·`opengraph-image.tsx`는 전부 Route Handler 취급이라, `export const dynamic = "force-static"`을 안 적으면 "정적 export인데 이 라우트는 정적으로 설정 안 됐다"고 빌드가 죽는다. 세 파일 모두 이 줄이 있어야 한다
- **hreflang은 `/`·`/blog`에만 붙인다**: 로케일이 실제로 대응하는 페이지는 이 둘뿐이다. 글 상세·카테고리·태그는 일부(번역이 있는 글)는 en 대응판이 있지만, 번역이 없는 글도 있을 수 있어 페이지 단위로 존재를 보장할 수 없다 — 그래서 이 라우트들은 여전히 hreflang을 넣지 않고 자기 자신을 가리키는 `alternates.canonical`만 붙인다(프로젝트 상세는 그대로 한국어 전용). `lib/seo.ts`의 `pageAlternates(path, locale)`이 canonical + 로케일별 alternate + `x-default`(ko) 묶음을 만드는 건 `/`·`/blog`에서만 쓴다
- **`sitemap.ts`**: `trailingSlash: true`라 URL 끝에 `/`를 붙여야 실제로 서빙되는 주소와 일치한다(`lib/seo.ts`의 `absoluteUrl`이 처리). 카테고리·태그는 글이 0편이면(`getCategoryCounts`/`getTagCounts`가 count>0만 남기므로) 사이트맵에서 자동으로 빠진다 — 라우트 자체는 예전 링크를 위해 미리 만들어 두지만(`generateStaticParams`), 빈 페이지를 검색엔진에 알릴 이유는 없다
