// 콘텐츠 상태
//
// `why` 문단은 전부 각 레포 README에 본인이 이미 써둔 문장을 옮기거나(Langport는
// 거의 그대로, Claudocs는 영문 원문을 한국어로 옮김) 사실(생성일·언어 통계)만
// 조합한 것이다. Claude 관련 도구 2종은 README가 한두 줄뿐이라 "무엇을 하는
// 도구인지"만 담고 왜 만들었는지는 의도적으로 비워뒀다 — 자잘한 CLI
// 도구라 동기 서사까지 붙일 필요는 없다는 판단(본인 확인 완료).
//
// meta의 날짜는 `gh api repos/hgkimdev/<repo>`의 created_at/pushed_at.
//
// `ProjectGroupKey`는 그대로 `/projects/<key>` URL 슬러그로도 쓰인다 —
// `app/(ko)/projects/[slug]/page.tsx`의 `generateStaticParams` 참고.
//
// 배경 그림: Claudocs만 유튜브 데모(README에 링크된 공식 데모 영상)가 있고, 상세
// 페이지에 보통의(자동재생 없는) 임베드로 들어간다. 나머지 셋은 `kind: "none"`.

import type { LifeMedia } from "@/content/life";

export type ProjectId =
  "claudocs" | "langport" | "claude-rpg-statusline" | "personal-astrologer";

export type Project = {
  id: ProjectId;
  /** 목록과 상세 페이지 본문 양쪽에 쓰이는 이름 */
  title: string;
  /** 제목 아래 한 줄. 기간·성격 */
  meta: string;
  /** 소개 문단. 줄바꿈은 편집 판단이므로 배열로 명시 */
  why: string[];
  /** 기술 스택 칩 */
  stack?: string[];
  /** why 아래에 붙는 짧은 상태 칩 ("아카이브", "비공개 레포" 등) */
  tags?: string[];
  links: { github?: string; demo?: string };
  media: LifeMedia;
};

export type ProjectGroupKey = "claudocs" | "langport" | "claude-tools";

export type ProjectGroup = {
  key: ProjectGroupKey;
  label: string;
  /** 입구 행 목록에 보이는 한 줄 */
  teaser: string;
  /**
   * Home 입구에서 목록 옆 상자에 걸리는 그림. 행에 손이 닿으면 이 그림으로
   * 바뀐다(components/projects/projects-entrance.tsx).
   *
   * 항목(Project)이 아니라 **그룹**이 든다 — 상자는 목록의 한 줄과 짝이고,
   * "Claude 도구"는 한 줄에 도구 두 개가 들어 있기 때문이다.
   *
   * alt는 없다. 이 상자는 바로 옆 줄이 이미 이름과 한 줄 소개로 말한 것을
   * 그림으로 되풀이하는 자리라 스크린리더에는 같은 말이 두 번 들린다.
   * 그래서 장식으로 두고 aria-hidden으로 감춘다 — Life의 사진들은 그 자체가
   * 내용이라 alt를 붙이는 것과 반대 경우다.
   */
  preview: { src: string };
  /**
   * Home 입구 목록의 줄 끝에 붙는 **현재 상태**. 없으면 아무것도 안 붙는다.
   *
   * 항목의 `tags`와 일부러 따로 둔다. 둘은 다른 사실이다 — `tags`는 상세
   * 페이지에서 "레포가 비공개다" 같은 사정을 설명하고(Langport에 GitHub
   * 링크가 없는 이유가 그것이다), 여기 `status`는 훑고 지나가는 사람에게
   * "이게 지금 살아 있나"만 말한다. 같은 필드로 묶으면 한쪽을 고칠 때마다
   * 다른 쪽 문장이 따라 바뀐다.
   *
   * Claude 도구 2종에는 없다. 그 줄은 도구가 둘이라 하나의 상태로 묶이지
   * 않고, 자잘한 CLI 도구라 상태를 물을 자리도 아니다.
   */
  status?: string;
  /** Claudocs·Langport는 1개, Claude 도구는 2개 */
  items: Project[];
};

export const projectGroups: ProjectGroup[] = [
  {
    key: "claudocs",
    label: "Claudocs",
    teaser: "전자 문서 워크스페이스 SaaS",
    // README에 링크된 공식 데모 영상에서 받은 실제 화면(템플릿·문서 목록).
    preview: { src: "/projects/claudocs.jpg" },
    status: "아카이브",
    items: [
      {
        id: "claudocs",
        title: "Claudocs",
        meta: "2025.11 – 2025.12 · 개인 프로젝트, 프로덕션 배포 후 아카이브",
        why: [
          "패스트캠퍼스 백엔드 부트캠프 진행 중 만든 개인 프로젝트.",
          "PDF문서에 서명하고 제출하는 과정이 번거로워서 만들었습니다.",
          "PDF 템플릿에 입력 필드와 서명란을 배치해두면,",
          "워크스페이스 구성원이 채워서 보낸 문서를 받을 수 있고",
          "검토·승인까지 가능한 워크스페이스형 SaaS 입니다.",
          "서비스 자체는 아카이브했지만 깃허브에 소스를 공개해 두었습니다.",
        ],
        stack: ["Ruby on Rails", "JavaScript", "Docker"],
        tags: ["아카이브"],
        links: { github: "https://github.com/hgkimdev/Claudocs" },
        // README에 링크된 공식 데모 영상.
        media: { kind: "youtube", id: "JXLXOtOum9Q" },
      },
    ],
  },
  {
    key: "langport",
    label: "Langport",
    teaser: "당신의 언어교환 모임을 찾아드립니다.",
    // 운영 중인 langport.vercel.app을 띄워 찍은 첫 화면.
    preview: { src: "/projects/langport.jpg" },
    status: "운영 중",
    items: [
      {
        id: "langport",
        title: "Langport",
        meta: "2026.07 – · 개인 프로젝트, langport.vercel.app",
        why: [
          "언어교환 모임에 자주 참석하면서 여러 모임이 Meetup · Instagram · 웹 페이지 등",
          "여러 곳에 흩어져 있어서 찾기 불편하다고 생각하고 있었습니다. 마침 모임에 참석한 어느 여행자와",
          "대화 도중 스카이스케너나 마이리얼트립처럼 여러 곳에 흩어진 모임을 한 곳에서 볼 수 있는 서비스가",
          "있으면 좋겠다는 생각이 들어서 일주일 정도 시간을 들여서 만들었습니다.",
        ],
        stack: [
          "Next.js 16",
          "TypeScript",
          "Tailwind v4",
          "next-intl",
          "shadcn/ui",
          "Framer Motion",
        ],
        tags: ["비공개 레포"],
        // 레포가 비공개라 GitHub 링크 없이 라이브 데모만 건다.
        links: { demo: "https://langport.vercel.app" },
        media: { kind: "none" },
      },
    ],
  },
  {
    key: "claude-tools",
    label: "Claude Code tools",
    teaser: "클로드 코드를 더 즐겁게",
    // 둘 다 CLI 도구라 보여줄 화면이 없다. 대신 Claude Code의 마스코트
    // Clawd를 건다 — 픽셀 데이터·팔레트 모두 Claude Code 실행 파일 안의
    // CLAWD_FRAMES/CLAWD_PAL 원본이다(public/projects/clawd.svg 주석 참고).
    preview: { src: "/projects/clawd.svg" },
    items: [
      {
        id: "claude-rpg-statusline",
        title: "claude-rpg-statusline",
        meta: "2026.07 · Claude Code CLI 도구",
        why: [
          "Claude Code의 사용량 제한을 보여주는 RPG theme Statusline.",
          "토큰과 컨텍스트 한도를 Statusline에서 볼 수 있습니다.",
        ],
        stack: ["Ruby", "Claude Code"],
        links: {
          github: "https://github.com/hgkimdev/claude-rpg-statusline",
        },
        media: { kind: "none" },
      },
      {
        id: "personal-astrologer",
        title: "personal-astrologer",
        meta: "2026.07 · Claude Code CLI 도구",
        why: [
          "Claude Code 위에서 돌아가는 개인 점성술사 템플릿.",
          "출생차트 데이터를 로컬 파일에 채워두면 그걸 근거로 질문에 답해드립니다.",
          "포크해서 자기 데이터로 채우면 누구나 자기 버전으로 쓸 수 있습니다.",
        ],
        stack: ["Python", "Claude Code"],
        tags: ["오락·자기 성찰용"],
        links: { github: "https://github.com/hgkimdev/personal-astrologer" },
        media: { kind: "none" },
      },
    ],
  },
];
