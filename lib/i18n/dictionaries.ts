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
  };
  comingSoon: string;
  themeToggleLabel: string;
  menuLabel: string;
  readMore: string;
  footer: (year: number) => string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  ko: {
    brand: "hgkim",
    metaDescription: "나라는 사람을 소개하는 공간",
    nav: {
      about: { label: "About Me", description: "나의 이야기와 가치관" },
      now: { label: "Now", description: "지금 배우고 집중하는 것" },
      projects: { label: "Projects", description: "프로젝트와 개발 경험" },
      life: {
        label: "Life",
        description: "여행, 책과 영화, 외국어 학습 등 일 외의 삶",
      },
      blog: { label: "Blog", description: "생각과 배운 점" },
      timeline: {
        label: "Timeline",
        description: "버킷리스트와 인생 타임라인",
      },
      contact: { label: "Contact", description: "연락하기" },
    },
    home: {
      greeting: "Hi, I'm hgkim 👋",
      heading: "나라는 사람을 자연스럽게 소개하는 공간을 만들고 있어요.",
      intro:
        "지금은 이 사이트 자체를 만드는 중이에요. 아래 섹션들을 하나씩 둘러보세요.",
    },
    comingSoon: "준비 중입니다.",
    themeToggleLabel: "테마 전환",
    menuLabel: "메뉴 열기",
    readMore: "자세히 보기",
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
  },
  en: {
    brand: "hgkim",
    metaDescription: "A space introducing who I am",
    nav: {
      about: { label: "About Me", description: "My story and values" },
      now: { label: "Now", description: "What I'm learning and focused on" },
      projects: { label: "Projects", description: "Projects and dev experience" },
      life: {
        label: "Life",
        description: "Travel, books & movies, language learning — life outside work",
      },
      blog: { label: "Blog", description: "Thoughts and things I've learned" },
      timeline: {
        label: "Timeline",
        description: "Bucket list and life timeline",
      },
      contact: { label: "Contact", description: "Get in touch" },
    },
    home: {
      greeting: "Hi, I'm hgkim 👋",
      heading: "Building a space that introduces who I am, naturally.",
      intro:
        "Right now I'm building this site itself. Take a look around the sections below.",
    },
    comingSoon: "Coming soon.",
    themeToggleLabel: "Toggle theme",
    menuLabel: "Open menu",
    readMore: "Read more",
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
