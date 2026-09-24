import { Rss } from "lucide-react";

import {
  TaxonomySection,
  type TaxonomyItem,
} from "@/components/blog/taxonomy-section";
import {
  getCategoryCounts,
  getTagCounts,
  type BlogPost,
} from "@/lib/content/blog";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

// 태그는 글이 쌓일수록 끝없이 늘어난다. 데스크톱 세로 목록에서 한 번에
// 보여줄 개수 — 넘으면 페이저가 붙는다.
const TAG_PAGE_SIZE = 10;

type Active =
  | { type: "all" }
  | { type: "category"; key: string }
  | { type: "tag"; key: string };

/**
 * 분류를 화면에 고정해 두는 항해 장치. velog·티스토리·워드프레스가 모두
 * 쓰는 형태이고, 글에 붙은 라벨과 다른 점은 스크롤해도 축이 사라지지
 * 않는다는 것이다.
 *
 * 개수는 언제나 전체 글 기준으로 센다. 지금 보고 있는 목록이 걸러진
 * 목록이어도 사이드바 숫자가 흔들리면 안 된다 — 그러면 "공부 6"이 페이지마다
 * 다른 값이 되어 목차 역할을 못 한다.
 *
 * 서버 컴포넌트다. 카운트 계산은 파일을 읽는 일이라 여기서 끝내고, 접기·페이징
 * 상태를 들고 있는 TaxonomySection에는 직렬화되는 값만 넘긴다(href를 함수로
 * 넘길 수 없으므로 문자열로 만들어서 준다).
 */
export function BlogSidebar({
  allPosts,
  active,
  locale,
}: {
  allPosts: BlogPost[];
  active: Active;
  locale: Locale;
}) {
  const dict = getDictionary(locale);

  const categories: TaxonomyItem[] = [
    {
      key: "__all",
      label: dict.blog.allPosts,
      count: allPosts.length,
      href: localizeHref("/blog", locale),
    },
    ...getCategoryCounts(allPosts, locale).map((c) => ({
      key: c.key,
      label: c.label,
      count: c.count,
      href: localizeHref(`/blog/category/${c.key}`, locale),
    })),
  ];

  const tags: TaxonomyItem[] = getTagCounts(allPosts).map((t) => ({
    key: t.key,
    label: t.label,
    count: t.count,
    href: localizeHref(`/blog/tag/${t.key}`, locale),
  }));

  const paginationLabels = {
    prevPage: dict.blog.prevPage,
    nextPage: dict.blog.nextPage,
    pageLabel: dict.blog.pageLabel,
  };

  return (
    <aside className="flex min-w-0 flex-col gap-2.5 self-start min-[900px]:sticky min-[900px]:top-[calc(var(--header-height)+2rem)] min-[900px]:gap-7">
      <TaxonomySection
        heading={dict.blog.categoriesHeading}
        items={categories}
        activeKey={
          active.type === "all"
            ? "__all"
            : active.type === "category"
              ? active.key
              : undefined
        }
        paginationLabels={paginationLabels}
      />
      <TaxonomySection
        heading={dict.blog.tagsHeading}
        items={tags}
        activeKey={active.type === "tag" ? active.key : undefined}
        pageSize={TAG_PAGE_SIZE}
        paginationLabels={paginationLabels}
      />

      {/* 분류 축의 꼬리. 헤딩과 같은 mono 활자를 쓰되 밑줄을 위로 돌려서
          "세 번째 축"이 아니라 목록의 끝으로 읽히게 한다.

          좁은 화면에서는 아예 빼고 푸터 쪽 아이콘 하나에 맡긴다. 900px
          아래에서 사이드바는 가로로 스크롤하는 칩 한 줄이 되는데, 거기
          한 줄을 더 만들면 높이를 항목 수와 무관하게 유지하려고 가로
          스크롤을 고른 이유가 무너진다(taxonomy-section.tsx 참고).

          next/link가 아니라 <a>다 — /feed.xml은 라우트가 아니라 빌드 때
          구워지는 정적 파일이라 클라이언트 내비게이션의 대상이 아니다. */}
      <a
        href={localizeHref("/feed.xml", locale)}
        className="hidden items-center gap-1.5 border-t border-border/60 pt-3.5 font-mono text-xs tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground min-[900px]:flex"
      >
        <Rss size={13} aria-hidden />
        RSS
      </a>
    </aside>
  );
}
