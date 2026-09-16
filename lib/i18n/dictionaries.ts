import type { Locale } from "@/lib/i18n/config";
import type { NavKey } from "@/lib/nav";

type Dictionary = {
  brand: string;
  metaDescription: string;
  nav: Record<NavKey, { label: string; description: string }>;
  home: {
    greeting: string;
    heading: string;
    intro: string;
    /** intro 안에서 ShinyText로 강조할 부분 문자열. intro에 그대로 등장해야
     * 한다 — home-content.tsx가 indexOf로 잘라서 감싼다. */
    aiAgentMarker: string;
  };
  comingSoon: string;
  themeToggleLabel: string;
  readMore: string;
  zoneLabels: { intro: string; blog: string };
  footer: (year: number) => string;
  blog: {
    categories: {
      language: string;
      dev: string;
      reading: string;
      daily: string;
      think: string;
    };
    allPosts: string;
    categoriesHeading: string;
    tagsHeading: string;
    empty: string;
    postList: string;
    comments: string;
    prevPage: string;
    nextPage: string;
    /** "{n}"이 페이지 번호로 치환되는 템플릿. 클라이언트 컴포넌트로 넘어가야
     * 해서 함수가 아니라 문자열이다 — 함수는 서버→클라이언트 경계를 못
     * 건넌다. */
    pageLabel: string;
  };
  life: {
    close: string;
    unmute: string;
    mute: string;
    /** category.label을 받아 "{label} 목록/list" 형태의 aria-label을 만든다. */
    itemListAria: (categoryLabel: string) => string;
    bookshelfPhotoLabel: string;
    /** 책 표지 링크의 aria-label. 새 창으로 여는 교보문고 미리보기. */
    bookPreviewAria: (title: string) => string;
  };
  projects: {
    /** 데모 영상 iframe의 title. */
    demoVideoAria: (title: string) => string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ko: {
    brand: "hgkim",
    metaDescription: "나라는 사람을 소개하는 공간",
    nav: {
      about: { label: "About Me", description: "나의 이야기와 가치관" },
      projects: { label: "Projects", description: "프로젝트와 개발 경험" },
      life: {
        label: "Life",
        description: "여행, 책과 영화, 외국어 학습 등 일 외의 삶",
      },
      blog: { label: "Blog", description: "생각과 배운 점" },
      contact: { label: "Contact", description: "연락하기" },
    },
    home: {
      greeting: "안녕하세요 👋",
      heading: "호기심 많은 프로덕트 엔지니어입니다.",
      // `\u00a0`(줄바꿈 없는 공백)은 오타가 아니다. 모바일에서 이 문장은 두 줄이
      // 되는데(390px 화면의 본문 칸이 358px, 문장은 알약 패딩까지 370px),
      // 그냥 두면 "여러" / "서비스들을"로 수식어와 피수식어가 갈린다. 붙여두면
      // 끊을 수 있는 자리가 "함께" 뒤 하나만 남아 부사구 | 목적어+서술어로
      // 갈린다. 한 줄에 들어가는 폭(430px~)에서는 보통 공백과 똑같이 보인다.
      intro: "AI 에이전트와 함께 여러\u00a0서비스들을 만들어보고 있어요.",
      aiAgentMarker: "AI 에이전트",
    },
    comingSoon: "준비 중입니다.",
    themeToggleLabel: "테마 전환",
    readMore: "자세히 보기",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
    blog: {
      categories: {
        language: "언어공부",
        dev: "개발",
        reading: "독서",
        daily: "일상",
        think: "생각",
      },
      allPosts: "전체글",
      categoriesHeading: "카테고리",
      tagsHeading: "태그",
      empty: "아직 여기 쌓인 글이 없습니다.",
      postList: "글 목록",
      comments: "댓글",
      prevPage: "이전 페이지",
      nextPage: "다음 페이지",
      pageLabel: "{n}페이지",
    },
    life: {
      close: "닫기",
      unmute: "소리 켜기",
      mute: "소리 끄기",
      itemListAria: (categoryLabel) => `${categoryLabel} 목록`,
      bookshelfPhotoLabel: "책장 사진",
      bookPreviewAria: (title) => `교보문고에서 『${title}』 미리보기 (새 창)`,
    },
    projects: {
      demoVideoAria: (title) => `${title} 데모 영상`,
    },
  },
  en: {
    brand: "hgkim",
    metaDescription: "A space introducing who I am",
    nav: {
      about: { label: "About Me", description: "My story and values" },
      projects: {
        label: "Projects",
        description: "Projects and dev experience",
      },
      life: {
        label: "Life",
        description:
          "Travel, books & movies, language learning — life outside work",
      },
      blog: { label: "Blog", description: "Thoughts and things I've learned" },
      contact: { label: "Contact", description: "Get in touch" },
    },
    home: {
      greeting: "Hi, I'm hgkim 👋",
      // ko와 같은 처리. 역할 이름이 통째로 둘째 줄로 내려가 "I'm a curious" /
      // "product engineer."가 된다.
      heading: "I'm a curious product\u00a0engineer.",
      intro: "I'm building various services together with AI agents.",
      aiAgentMarker: "AI agents",
    },
    comingSoon: "Coming soon.",
    themeToggleLabel: "Toggle theme",
    readMore: "Read more",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
    blog: {
      categories: {
        language: "Language",
        dev: "Dev",
        reading: "Reading",
        daily: "Daily",
        think: "Thoughts",
      },
      allPosts: "All posts",
      categoriesHeading: "Categories",
      tagsHeading: "Tags",
      empty: "No posts here yet.",
      postList: "Post list",
      comments: "Comments",
      prevPage: "Previous page",
      nextPage: "Next page",
      pageLabel: "Page {n}",
    },
    life: {
      close: "Close",
      unmute: "Unmute",
      mute: "Mute",
      itemListAria: (categoryLabel) => `${categoryLabel} list`,
      bookshelfPhotoLabel: "Bookshelf photo",
      bookPreviewAria: (title) =>
        `Preview 『${title}』 on Kyobo Book Center (opens in new window)`,
    },
    projects: {
      demoVideoAria: (title) => `${title} demo video`,
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

// Server-only helper: reduces `dict.nav` (label + description per key) down
// to just the labels the header nav actually renders, so client
// components can take this small record as a prop instead of importing the
// full multi-locale `dictionaries` object themselves.
export function getNavLabels(locale: Locale): Record<NavKey, string> {
  const dict = dictionaries[locale];
  return Object.fromEntries(
    Object.entries(dict.nav).map(([key, value]) => [key, value.label]),
  ) as Record<NavKey, string>;
}
