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
- 방문자가 탐험하는 재미를 느낄 수 있도록 인터랙티브한 요소를 적극 활용하되, 과도한 애니메이션은 지양한다.
- 불필요한 개인정보는 공개하지 않는다.
- 정적 사이트(GitHub Pages)에서도 동작할 수 있도록 우선 설계한다.

## 사이트 구조 (단일 스크롤 홈 + 앵커, 상세만 개별 라우트)

Home(`/`, `/en`) 한 페이지 안에 아래 7개 섹션을 앵커(`#about` 등)로 세로로 이어붙인다. 헤더 nav는 각 섹션으로 스크롤 이동하는 앵커 링크. 개별 글/프로젝트가 생기면 그때 `/projects/[slug]`, `/blog/[slug]` 같은 상세 전용 라우트만 별도로 추가한다 (공유 가능한 URL 확보 목적, 목록 자체는 Home 안에 유지).

| 앵커          | 섹션                        | 콘텐츠 성격                                           |
| ------------- | --------------------------- | ----------------------------------------------------- |
| (헤더)        | Home 히어로                 | 한 줄 소개 + 현재 상태 요약                           |
| `#about`      | About Me                    | 스토리, 가치관                                        |
| `#now`        | Now                         | 지금 배우고 집중하는 것 (nownownow.com 스타일)        |
| `#projects`   | Projects                    | 프로젝트 목록 (개별 상세는 `/projects/[slug]`)        |
| `#life`       | Life                        | 여행, 책과 영화, 외국어 학습 등을 묶은 로그            |
| `#blog`       | Blog / Notes                | 생각/배움 기록 목록 (개별 글은 `/blog/[slug]`)        |
| `#timeline`   | Bucket List / Life Timeline | 인생 타임라인 + 버킷리스트 항목                       |
| `#contact`    | Contact                     | 연락 링크 (이메일 등 민감정보 노출 지양, SNS/폼 위주) |

## 콘텐츠 데이터 모델

로컬 Markdown/MDX 기반, 성격에 따라 세 패턴으로 나눈다.

- **문서형** (`content/{about,now}.md`) — About/Now처럼 단일 페이지, frontmatter 최소화
- **컬렉션형** (`content/{projects,blog}/*.md`) — 여러 항목, frontmatter로 메타데이터(title, date, tags, cover 등) 관리, 상세 페이지 자동 생성
- **로그형** (`content/life/*.md` 또는 구조화 데이터, category: travel/books/language) — 짧고 잦은 기록. Bucket List/Timeline도 항목이 짧아 구조화 데이터(YAML/JSON)가 markdown보다 적합할 수 있음

## 기술 설정

- 스택: Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui(base 프리셋, Nova) + Motion(구 Framer Motion)
- `next.config.ts`: `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true` (유저 페이지 루트 배포라 `basePath` 불필요)
- 배포: GitHub Pages, GitHub Actions로 자동 배포 (`actions/configure-pages` → `next build` → `actions/upload-pages-artifact` → `actions/deploy-pages`), 레포 Settings → Pages → Source = "GitHub Actions"
- URL: `https://hgkimdev.github.io` (유저 페이지, 레포 `hgkimdev/hgkimdev.github.io`, public 전환 완료)
- 기존 블로그는 `hgkimdev/blog` 레포로 이전됨 (콘텐츠 보존, 별도 주소로 재배포 필요)
- 인터랙션: 스크롤/마우스 기반 연출 (예: Framer Motion), "탐험하는 재미"를 주되 과도하지 않게
- 다크모드: 헤더 토글, `prefers-color-scheme` 초기값 존중 + `localStorage` 저장
- 반응형: 모바일/데스크톱 모두 대응, 빠른 로딩과 접근성 우선
- 다국어: `/`(한국어, 기본) + `/en/*`(영어) 구조. `app/(ko)/`, `app/en/` route group으로 분리, 각각 자체 `layout.tsx`. `lib/i18n/dictionaries.ts` 경량 자체 dictionary 사용 (미들웨어 불필요, static export 호환)
- 스크롤: `html`에 `scroll-smooth`, 각 섹션에 `scroll-mt-*`로 sticky 헤더 높이만큼 앵커 이동 시 오프셋 보정

## 디자인 방향

미니멀하지만 따뜻한 느낌. 과도한 애니메이션은 지양하되 스크롤/마우스 인터랙션으로 탐색의 재미를 준다.

## 진행 방식

1. 공통 레이아웃/네비게이션 (헤더, 푸터, 다크모드, 다국어) + 단일 스크롤 Home(7개 앵커 섹션) — 완료
2. 각 섹션에 실제 콘텐츠 채우기 (About/Now부터 시작)
3. Projects/Blog에 실제 항목이 쌓이면 `/projects/[slug]`, `/blog/[slug]` 상세 라우트 추가
4. GitHub Pages 배포 파이프라인 구성
