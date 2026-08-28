import { projectGroups, type ProjectGroup } from "@/content/projects";
import { projectGroupsEn } from "@/content/projects.en";
import type { Locale } from "@/lib/i18n/config";

/**
 * 로케일별 Project 그룹. ko는 원본 그대로, 그 외는 content/projects.en.ts의
 * 텍스트 번역을 항목 id로 매칭해 덮어씌운다 — media·links·stack 등
 * 언어 무관 필드는 항상 원본(ko) 것을 쓴다.
 */
export function getProjectGroups(locale: Locale): ProjectGroup[] {
  if (locale === "ko") return projectGroups;

  return projectGroups.map((group) => {
    const t = projectGroupsEn[group.key];
    return {
      ...group,
      label: t.label,
      teaser: t.teaser,
      items: group.items.map((item) => {
        const it = t.items[item.id];
        return {
          ...item,
          title: it.title,
          meta: it.meta,
          why: it.why,
          tags: it.tags ?? item.tags,
        };
      }),
    };
  });
}
