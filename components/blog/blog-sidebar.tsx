import {
  TaxonomySection,
  type TaxonomyItem,
} from "@/components/blog/taxonomy-section";
import {
  getCategoryCounts,
  getTagCounts,
  type BlogPost,
} from "@/lib/content/blog";

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
}: {
  allPosts: BlogPost[];
  active: Active;
}) {
  const categories: TaxonomyItem[] = [
    {
      key: "__all",
      label: "전체글",
      count: allPosts.length,
      href: "/blog",
    },
    ...getCategoryCounts(allPosts).map((c) => ({
      key: c.key,
      label: c.label,
      count: c.count,
      href: `/blog/category/${c.key}`,
    })),
  ];

  const tags: TaxonomyItem[] = getTagCounts(allPosts).map((t) => ({
    key: t.key,
    label: t.label,
    count: t.count,
    href: `/blog/tag/${t.key}`,
  }));

  return (
    <aside className="flex min-w-0 flex-col gap-2.5 self-start min-[900px]:sticky min-[900px]:top-[calc(var(--header-height)+2rem)] min-[900px]:gap-7">
      <TaxonomySection
        heading="카테고리"
        items={categories}
        activeKey={
          active.type === "all"
            ? "__all"
            : active.type === "category"
              ? active.key
              : undefined
        }
      />
      <TaxonomySection
        heading="태그"
        items={tags}
        activeKey={active.type === "tag" ? active.key : undefined}
        pageSize={TAG_PAGE_SIZE}
      />
    </aside>
  );
}
