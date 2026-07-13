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
  zoneLabels: { intro: string; blog: string };
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
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
  },
  en: {
    brand: "hgkim",
    metaDescription: "A space introducing who I am",
    nav: {
      about: { label: "About Me", description: "My story and values" },
      now: { label: "Now", description: "What I'm learning and focused on" },
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
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
  },
  fr: {
    brand: "hgkim",
    metaDescription: "Un espace pour me présenter",
    nav: {
      about: { label: "About Me", description: "Mon histoire et mes valeurs" },
      now: {
        label: "Now",
        description: "Ce que j'apprends et sur quoi je me concentre",
      },
      projects: {
        label: "Projects",
        description: "Projets et expérience de développement",
      },
      life: {
        label: "Life",
        description:
          "Voyages, livres et films, apprentissage des langues — la vie en dehors du travail",
      },
      blog: { label: "Blog", description: "Réflexions et choses apprises" },
      timeline: {
        label: "Timeline",
        description: "Liste de rêves et chronologie de vie",
      },
      contact: { label: "Contact", description: "Me contacter" },
    },
    home: {
      greeting: "Salut, je suis hgkim 👋",
      heading: "Je construis un espace qui me présente, naturellement.",
      intro:
        "En ce moment, je construis ce site lui-même. Jetez un œil aux sections ci-dessous.",
    },
    comingSoon: "Bientôt disponible.",
    themeToggleLabel: "Changer de thème",
    menuLabel: "Ouvrir le menu",
    readMore: "En savoir plus",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Créé avec Next.js.`,
  },
  ja: {
    brand: "hgkim",
    metaDescription: "私を紹介する空間",
    nav: {
      about: { label: "About Me", description: "私の物語と価値観" },
      now: {
        label: "Now",
        description: "今学んでいること、力を入れていること",
      },
      projects: { label: "Projects", description: "プロジェクトと開発経験" },
      life: {
        label: "Life",
        description: "旅行、本や映画、語学学習など仕事以外の生活",
      },
      blog: { label: "Blog", description: "考えたことと学んだこと" },
      timeline: {
        label: "Timeline",
        description: "バケットリストと人生年表",
      },
      contact: { label: "Contact", description: "お問い合わせ" },
    },
    home: {
      greeting: "こんにちは、hgkimです 👋",
      heading: "自分らしさを自然に伝える場所を作っています。",
      intro:
        "今はこのサイト自体を作っている最中です。下のセクションをひとつずつご覧ください。",
    },
    comingSoon: "準備中です。",
    themeToggleLabel: "テーマ切り替え",
    menuLabel: "メニューを開く",
    readMore: "詳しく見る",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
