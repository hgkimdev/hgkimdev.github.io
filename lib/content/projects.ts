import { cache } from "react";
import { projectGroups, type ProjectGroup } from "@/content/projects";
import { projectGroupsEn } from "@/content/projects.en";
import type { Locale } from "@/lib/i18n/config";

/**
 * 로케일별 Project 그룹. ko는 원본 그대로, 그 외는 content/projects.en.ts의
 * 텍스트 번역을 항목 id로 매칭해 덮어씌운다 — media·links·stack 등
 * 언어 무관 필드는 항상 원본(ko) 것을 쓴다.
 */
// cache()로 감싸는 이유: 같은 빌드 패스 안에서 generateMetadata·페이지
// 컴포넌트가 각자 이 함수를 부른다. cache가 없으면 호출마다 병합을 다시 한다.
export const getProjectGroups = cache((locale: Locale): ProjectGroup[] => {
  if (locale === "ko") return projectGroups;

  return projectGroups.map((group) => {
    const t = projectGroupsEn[group.key];
    return {
      ...group,
      label: t.label,
      teaser: t.teaser,
      // 원본에 status가 없는 그룹(Claude 도구)은 번역에도 없다. `??`가 아니라
      // 그대로 넣는 이유 — 없음이 곧 "상태를 안 붙인다"는 뜻이라 되살리면 안 된다.
      status: t.status,
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
});
