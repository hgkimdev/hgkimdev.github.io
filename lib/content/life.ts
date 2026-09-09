import { cache } from "react";
import {
  lifeCategories,
  type LifeCategory,
  type LifeMedia,
} from "@/content/life";
import { lifeCategoriesEn } from "@/content/life.en";
import type { Locale } from "@/lib/i18n/config";

/**
 * media에서 alt 문자열만 로케일 것으로 갈아끼운다. src·width·height 같은
 * 구조는 ko 원본 그대로 재사용하므로 사진 배열이 로케일마다 복제되지 않는다.
 * 번역이 없는 src는 원문 alt를 남긴다 — 영어 화면에서 alt가 비는 것보다
 * 한국어 alt라도 있는 편이 낫다.
 */
function translateMediaAlt(
  media: LifeMedia,
  alt: Record<string, string> | undefined,
): LifeMedia {
  if (!alt) return media;

  switch (media.kind) {
    case "image":
    case "cover":
      return alt[media.src] ? { ...media, alt: alt[media.src] } : media;
    case "gallery":
      return {
        ...media,
        photos: media.photos.map((photo) =>
          alt[photo.src] ? { ...photo, alt: alt[photo.src] } : photo,
        ),
      };
    default:
      // youtube·none은 alt를 갖지 않는다.
      return media;
  }
}

/**
 * 로케일별 Life 카테고리. ko는 원본 그대로, 그 외는 content/life.en.ts의
 * 텍스트 번역을 항목 id로 매칭해 덮어씌운다 — src·width·height·id 같은
 * 언어 무관 필드는 항상 원본(ko) 것을 쓴다. media도 구조는 원본을 재사용하고
 * 그 안의 alt 문자열만 번역본으로 바꾼다(translateMediaAlt 참고).
 */
// cache()로 감싸는 이유: 같은 빌드 패스 안에서 여러 곳이 이 함수를 부를 수
// 있다. cache가 없으면 호출마다 병합을 다시 한다.
export const getLifeCategories = cache((locale: Locale): LifeCategory[] => {
  if (locale === "ko") return lifeCategories;

  return lifeCategories.map((category) => {
    const t = lifeCategoriesEn[category.key];
    return {
      ...category,
      label: t.label,
      teaser: t.teaser,
      wish:
        category.wish && t.wish
          ? { label: t.wish.label, entries: t.wish.entries }
          : category.wish,
      items: category.items.map((item) => {
        const it = t.items[item.id];
        return {
          ...item,
          title: it.title,
          meta: it.meta,
          why: it.why,
          tags: it.tags ?? item.tags,
          level:
            item.level && it.levelStatus
              ? { ...item.level, status: it.levelStatus }
              : item.level,
          media: translateMediaAlt(item.media, it.alt),
        };
      }),
    };
  });
});
