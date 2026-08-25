// 콘텐츠 상태
//
// `why` 문단은 전부 각 레포 README에 본인이 이미 써둔 문장을 옮기거나(Langport는
// 거의 그대로, Claudocs는 영문 원문을 한국어로 옮김) 사실(생성일·언어 통계)만
// 조합한 것이다 — 새로 지어낸 "왜 만들었는지" 서사는 없다. 특히 Claude 관련
// 도구 3종은 README가 한두 줄뿐이라 "무엇을 하는 도구인지"만 담았고, 왜
// 만들었는지는 비어 있다 — 실제 동기를 채워 넣으려면 본인 확인이 필요하다.
//
// meta의 날짜는 `gh api repos/hgkimdev/<repo>`의 created_at/pushed_at.
//
// `ProjectGroupKey`는 그대로 `/projects/<key>` URL 슬러그로도 쓰인다 —
// `app/(ko)/projects/[slug]/page.tsx`의 `generateStaticParams` 참고.
//
// 배경 그림: Claudocs만 유튜브 데모(README에 링크된 공식 데모 영상)가 있고, 상세
// 페이지에 보통의(자동재생 없는) 임베드로 들어간다. 나머지 넷은 `kind: "none"`.

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
  /** Claudocs·Langport는 1개, Claude 도구는 2개 */
  items: Project[];
};

export const projectGroups: ProjectGroup[] = [
  {
    key: "claudocs",
    label: "Claudocs",
    teaser: "혼자 만든 문서 서명 SaaS",
    items: [
      {
        id: "claudocs",
        title: "Claudocs",
        meta: "2025.11 – 2025.12 · 개인 프로젝트, 프로덕션 배포 후 아카이브",
        why: [
          "PDF 템플릿에 입력 필드와 서명란을 배치해두면,",
          "워크스페이스 구성원이 채워서 보낸 문서를 모으고",
          "검토·승인하는 문서 제출 SaaS.",
          "기획부터 배포까지 혼자 만든 인디 프로젝트다.",
          "서비스 자체는 아카이브했지만, 포트폴리오로 소스를 공개해뒀다.",
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
    teaser: "도시를 넘나드는 언어교환 모임 디렉토리",
    items: [
      {
        id: "langport",
        title: "Langport",
        meta: "2026.07 – · 개인 프로젝트, langport.vercel.app",
        why: [
          "언어교환 모임을 도시 × 언어 페어로 큐레이션하는 디렉토리 사이트.",
          "Meetup·Instagram·주최자 사이트에 흩어진 모임을 모아 찾기 쉽게",
          "하되, 참가 신청은 항상 원본 플랫폼에서 처리한다.",
          "다음 모임까지 며칠 남았는지 도착 안내판처럼 보여주는",
          "Upcoming Board가 랜딩의 시그니처이고,",
          "다녀온 모임을 도장으로 모으는 여권(마이페이지)이 리텐션의 축이다.",
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
    label: "Claude 관련 도구",
    teaser: "Claude Code로 만든 것들",
    items: [
      {
        id: "claude-rpg-statusline",
        title: "claude-rpg-statusline",
        meta: "2026.07 · Claude Code CLI 도구",
        why: [
          "Claude Code의 사용량 제한을 게임 스탯으로 바꾸는",
          "RPG 테마 스테이터스라인. HP·MP·EXP 게이지로 표시한다.",
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
          "출생차트 데이터를 로컬 파일에 채워두면 그걸 근거로 질문에 답한다.",
          "포크해서 자기 데이터로 채우면 누구나 자기 버전으로 쓸 수 있다.",
        ],
        stack: ["Python", "Claude Code"],
        tags: ["오락·자기 성찰용"],
        links: { github: "https://github.com/hgkimdev/personal-astrologer" },
        media: { kind: "none" },
      },
    ],
  },
];
