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
  readMore: string;
  zoneLabels: { intro: string; blog: string };
  footer: (year: number) => string;
  blog: {
    categories: { study: string; daily: string; think: string };
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
      greeting: "Hi, I'm hgkim 👋",
      heading: "호기심 많은 프로덕트 엔지니어입니다.",
      intro: "AI 에이전트와 함께 여러 서비스들을 만들어보고 있어요.",
    },
    comingSoon: "준비 중입니다.",
    themeToggleLabel: "테마 전환",
    readMore: "자세히 보기",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
    blog: {
      categories: { study: "공부", daily: "일상", think: "생각" },
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
      heading: "I'm a curious product engineer.",
      intro: "I'm building various services together with AI agents.",
    },
    comingSoon: "Coming soon.",
    themeToggleLabel: "Toggle theme",
    readMore: "Read more",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
    blog: {
      categories: { study: "Study", daily: "Daily", think: "Thoughts" },
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
  },
  fr: {
    brand: "hgkim",
    metaDescription: "Un espace pour me présenter",
    nav: {
      about: { label: "About Me", description: "Mon histoire et mes valeurs" },
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
      contact: { label: "Contact", description: "Me contacter" },
    },
    home: {
      greeting: "Salut, je suis hgkim 👋",
      heading: "Je suis un ingénieur produit curieux.",
      intro: "Je construis plusieurs services avec des agents IA.",
    },
    comingSoon: "Bientôt disponible.",
    themeToggleLabel: "Changer de thème",
    readMore: "En savoir plus",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Créé avec Next.js.`,
    blog: {
      categories: { study: "Études", daily: "Quotidien", think: "Réflexions" },
      allPosts: "Tous les articles",
      categoriesHeading: "Catégories",
      tagsHeading: "Mots-clés",
      empty: "Aucun article pour l'instant.",
      postList: "Liste des articles",
      comments: "Commentaires",
      prevPage: "Page précédente",
      nextPage: "Page suivante",
      pageLabel: "Page {n}",
    },
  },
  ja: {
    brand: "hgkim",
    metaDescription: "私を紹介する空間",
    nav: {
      about: { label: "About Me", description: "私の物語と価値観" },
      projects: { label: "Projects", description: "プロジェクトと開発経験" },
      life: {
        label: "Life",
        description: "旅行、本や映画、語学学習など仕事以外の生活",
      },
      blog: { label: "Blog", description: "考えたことと学んだこと" },
      contact: { label: "Contact", description: "お問い合わせ" },
    },
    home: {
      greeting: "こんにちは、hgkimです 👋",
      heading: "好奇心旺盛なプロダクトエンジニアです。",
      intro: "AIエージェントと一緒にいろいろなサービスを作っています。",
    },
    comingSoon: "準備中です。",
    themeToggleLabel: "テーマ切り替え",
    readMore: "詳しく見る",
    zoneLabels: { intro: "Intro", blog: "Blog" },
    footer: (year) => `© ${year} hgkim. Built with Next.js.`,
    blog: {
      categories: { study: "勉強", daily: "日常", think: "考え" },
      allPosts: "すべての記事",
      categoriesHeading: "カテゴリー",
      tagsHeading: "タグ",
      empty: "まだ記事がありません。",
      postList: "記事一覧",
      comments: "コメント",
      prevPage: "前のページ",
      nextPage: "次のページ",
      pageLabel: "{n}ページ",
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
