import type { LifeCategoryKey } from "@/content/life";

// content/life.ts의 lifeCategories 영어 번역. src·id 등 언어 무관 필드는
// 여기 없다 — lib/content/life.ts의 getLifeCategories(locale)가 항목 id로
// 매칭해 텍스트만 덮어씌운다. 사진의 alt는 텍스트라 여기 있지만(item의 alt),
// 사진 배열 자체는 복제하지 않고 src를 키로 문자열만 갈아끼운다.

type ItemTranslation = {
  title: string;
  meta: string;
  why: string[];
  tags?: string[];
  levelStatus?: string;
  /**
   * 사진·표지 alt 번역. media 자체는 로케일마다 복제하지 않고 alt 문자열만
   * 갈아끼운다. 키는 배열 인덱스가 아니라 media의 src다 — 사진을 중간에
   * 끼워 넣거나 순서를 바꿔도 짝이 조용히 어긋나지 않는다. 여기 없는 src는
   * ko 원문 alt를 그대로 쓴다(번역을 빠뜨려도 alt가 비지는 않도록).
   */
  alt?: Record<string, string>;
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
        alt: {
          "/life/travel/travel-01.jpg": "The glass pyramid at the Louvre",
          "/life/travel/travel-02.jpg":
            "The Louvre and a fountain seen from the Tuileries Garden",
          "/life/travel/travel-03.jpg": "Stained glass at Sainte-Chapelle",
          "/life/travel/travel-04.jpg": "A back street in the evening",
          "/life/travel/travel-05.jpg": "Mont-Saint-Michel at sunset",
          "/life/travel/travel-06.jpg":
            "Night view from the ramparts of Mont-Saint-Michel",
          "/life/travel/travel-07.jpg":
            "A cemetery park covered in autumn leaves",
          "/life/travel/travel-08.jpg":
            "A fountain and pond along a tree-lined path",
          "/life/travel/travel-09.jpg":
            "A city overlooked by a hilltop cathedral",
          "/life/travel/travel-10.jpg": "A riverside walkway at sunset",
          "/life/travel/travel-11.jpg":
            "A tower rising from the water in a canal town",
          "/life/travel/travel-12.jpg":
            "Swans on a lake at the foot of a mountain",
          "/life/travel/travel-13.jpg": "A person looking out over the canal",
          "/life/travel/travel-14.jpg": "A modern building made of glass",
          "/life/travel/travel-15.jpg": "A riverbank under an overcast sky",
          "/life/travel/travel-16.jpg": "A narrow, worn alleyway",
          "/life/travel/travel-17.jpg": "A square with trees and a statue",
          "/life/travel/travel-18.jpg": "Mediterranean sea cliffs",
          "/life/travel/travel-19.jpg": "Turquoise water and coastal cliffs",
          "/life/travel/travel-20.jpg": "On the coastal path",
          "/life/travel/travel-21.jpg": "An evening alley lit by neon signs",
          "/life/travel/travel-22.jpg": "A narrow alley under a sunset sky",
          "/life/travel/travel-23.jpg": "A harbor town seen from the hillside",
        },
      },
    },
    wish: { label: "Next up", entries: ["UK", "Finland", "Denmark", "Italy"] },
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
        // 표지 사진은 국내판 실물이라 출판사 이름은 그대로 옮긴다.
        alt: {
          "/life/1984.jpg": "Cover of George Orwell's 1984, Minumsa edition",
        },
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
        alt: {
          "/life/meditations.jpg":
            "Cover of Marcus Aurelius's Meditations, Hyeondaejiseong edition",
        },
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
        alt: {
          "/life/egu.jpg":
            "Cover of Cambridge's English Grammar in Use, 5th edition, British English",
        },
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
