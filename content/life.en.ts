import type { LifeCategoryKey } from "@/content/life";

// content/life.ts의 lifeCategories 영어 번역. media·id 등 언어 무관 필드는
// 여기 없다 — lib/content/life.ts의 getLifeCategories(locale)가 항목 id로
// 매칭해 텍스트만 덮어씌운다.

type ItemTranslation = {
  title: string;
  meta: string;
  why: string[];
  tags?: string[];
  levelStatus?: string;
};

type CategoryTranslation = {
  label: string;
  teaser: string;
  items: Record<string, ItemTranslation>;
  wish?: { label: string; entries: string[] };
};

export const lifeCategoriesEn: Record<LifeCategoryKey, CategoryTranslation> = {
  travel: {
    label: "Travel",
    teaser: "Cities I walked alone",
    items: {
      france: {
        title: "France",
        meta: "Winter 2023 · Solo · One month",
        why: [
          "By the third day of walking with the map folded away,",
          "the city started to look different.",
          "There were things I could only see by getting lost.",
        ],
      },
    },
    wish: { label: "Next up", entries: ["Finland", "Denmark", "Italy"] },
  },
  books: {
    label: "Books",
    teaser: "Sentences that stayed with me",
    items: {
      "1984": {
        title: "1984",
        meta: "George Orwell · 1949",
        why: [
          "What unsettled me more than the surveillance and control themselves",
          "was how a totalitarian society and crowd psychology could reach",
          "into people's very way of thinking, until they accepted the lie",
          "'1+1=3' as an obvious truth.",
        ],
      },
      meditations: {
        title: "Meditations",
        meta: "Marcus Aurelius · 2nd century",
        why: [
          "This book taught me how to tell apart what I can control",
          "from what I can't.",
          "Rather than clinging to what's outside my control,",
          "it showed me how important it is to focus",
          "on what I can actually do right now.",
        ],
      },
    },
  },
  movies: {
    label: "Movies",
    teaser: "Ones I've watched again and again",
    items: {
      whiplash: {
        title: "Whiplash",
        meta: "Damien Chazelle · 2014",
        why: ["A relentless film that pushes the audience to the very end"],
      },
      "dark-waters": {
        title: "Dark Waters",
        meta: "Todd Haynes · 2019",
        why: [
          "Pushing your convictions all the way through is a hard, lonely path,",
          "but change comes only when you keep acting instead of giving up.",
        ],
      },
      "weathering-with-you": {
        title: "Weathering with You",
        meta: "Makoto Shinkai · 2019",
        why: [
          "Faced with the question of whether the individual should be sacrificed",
          "for the whole, this story chooses one person over saving the world.",
          "A film steeped in romance instead of the usual sacrifice and choice.",
        ],
      },
    },
  },
  games: {
    label: "Games",
    teaser: "Another form of art",
    items: {
      overwatch: {
        title: "Overwatch",
        meta: "Blizzard · 2016",
        why: [
          "When my teammates back me up and I get to carry, nothing beats it.",
          "Though it's just as rough when matchmaking goes badly.",
        ],
        tags: ["Freja main"],
      },
      botw: {
        title: "The Legend of Zelda: Breath of the Wild",
        meta: "Nintendo · 2017",
        why: [
          "The first game that showed me",
          "just how fun a wide-open,",
          "high-freedom open world could be.",
        ],
      },
    },
  },
  languages: {
    label: "Languages",
    teaser: "A lens that widens my world",
    items: {
      english: {
        title: "English",
        meta: "Learning · B1",
        levelStatus: "Learning",
        why: [
          "The de facto international language of business.",
          "I keep at it, but it's never easy.",
        ],
      },
      french: {
        title: "French",
        meta: "Learning · A1",
        levelStatus: "Learning",
        why: [
          "I started because I wanted to understand even a single word while traveling.",
          "These days I just keep it up on Duolingo enough not to forget it.",
        ],
      },
      japanese: {
        title: "Japanese",
        meta: "Up next",
        levelStatus: "Up next",
        why: [
          "Every new language I learn",
          "means more people I can reach.",
          "That's still my biggest motivation.",
        ],
      },
    },
  },
};
