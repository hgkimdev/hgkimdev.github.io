import { lifeCategories, type LifeCategory } from "@/content/life";
import { lifeCategoriesEn } from "@/content/life.en";
import type { Locale } from "@/lib/i18n/config";

/**
 * 로케일별 Life 카테고리. ko는 원본 그대로, 그 외는 content/life.en.ts의
 * 텍스트 번역을 항목 id로 매칭해 덮어씌운다 — media·id·tags 구조 등
 * 언어 무관 필드는 항상 원본(ko) 것을 쓴다.
 */
export function getLifeCategories(locale: Locale): LifeCategory[] {
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
        };
      }),
    };
  });
}
