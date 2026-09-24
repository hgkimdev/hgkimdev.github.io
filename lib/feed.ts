import { getAllPosts } from "@/lib/content/blog";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absoluteUrl, feedUrl, siteName } from "@/lib/seo";

// 한 번의 스캔으로 치환한다. "&"를 따로 먼저 바꾸는 방식은 그 다음
// 치환들이 방금 만든 &amp;의 &를 다시 잡아 &amp;amp;로 부푼다.
const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

/**
 * RSS 2.0의 pubDate는 RFC 822 날짜다. frontmatter의 date는 YYYY-MM-DD라
 * 시각도 타임존도 없으므로 UTC 자정으로 고정해 읽는다 — 그냥
 * `new Date("2026-04-09")`로 둬도 UTC로 해석되지만, 빌드 머신의 타임존에
 * 기대지 않는다는 뜻을 코드에 남긴다. toUTCString()이 내는 RFC 1123
 * 형식("Thu, 09 Apr 2026 00:00:00 GMT")은 RFC 822의 2자리 연도를 4자리로
 * 넓힌 것으로, RSS 명세가 명시적으로 권하는 쪽이다.
 */
function rfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

// RSS의 <language>는 RFC 1766 코드다. 로케일 이름이 그대로 맞아떨어지지만
// 앞으로 "pt-br" 같은 지역 붙은 로케일이 생기면 여기서 갈라진다.
const feedLanguages: Record<Locale, string> = {
  ko: "ko",
  en: "en",
};

/**
 * 블로그 RSS 2.0 피드.
 *
 * 전문이 아니라 요약만 싣는다. 본문 HTML은 shiki가 코드 토큰마다 색을
 * 인라인 style로 박아 두고 다크 테마 색은 `--shiki-dark` 변수로만 실려
 * 있는데, 그 변수를 꺼내 쓰는 건 globals.css다 — 피드 리더에는 그 CSS가
 * 없으니 다크 리더에서 코드블록만 라이트 색으로 뜬다. 본문 이미지 경로도
 * 전부 상대경로라 절대화가 따로 필요하다. 요약+링크는 이 둘을 다 피하고,
 * 댓글이 있는 본 사이트로 읽는 사람을 보낸다.
 *
 * 초고 필터링은 따로 하지 않는다 — getAllPosts가 프로덕션 빌드에서
 * draft: true를 이미 걸러낸다(lib/content/blog.ts의 includeDrafts).
 */
export function buildFeed(locale: Locale): string {
  const posts = getAllPosts(locale);
  const dict = getDictionary(locale);

  const channelTitle = `Blog · ${siteName}`;
  const channelLink = absoluteUrl(localizeHref("/blog", locale));
  const self = feedUrl(locale);

  // 빌드 시각이 아니라 최신 글의 날짜다. 빌드 시각을 쓰면 글이 하나도 안
  // 바뀐 재배포마다 피드가 달라졌다고 주장하게 된다. 글이 0편이면 아예
  // 빼는 게 맞다 — 마지막으로 바뀐 시점이 없으니까.
  const lastBuildDate = posts[0] ? rfc822(posts[0].date) : null;

  const items = posts.map((post) => {
    const url = absoluteUrl(localizeHref(`/blog/${post.slug}`, locale));
    const categories = [dict.blog.categories[post.category], ...post.tags];

    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      // guid는 항목의 정체성이고 우리는 그걸 주소로 삼는다. 그래서 글을
      // 공개한 뒤 slug를 바꾸면 리더는 같은 글을 새 글로 다시 띄운다
      // (giscus의 pathname 매핑이 댓글을 잃는 것과 같은 뿌리의 제약이다).
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${rfc822(post.date)}</pubDate>`,
      ...(post.summary
        ? [`      <description>${escapeXml(post.summary)}</description>`]
        : []),
      ...categories.map(
        (category) => `      <category>${escapeXml(category)}</category>`,
      ),
      "    </item>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    // atom 네임스페이스는 아래 <atom:link rel="self">를 위해서만 쓴다.
    // 피드 자신의 주소를 피드 안에 적어 두는 관례로, RSS 2.0에는 대응하는
    // 요소가 없어서 Atom 것을 빌려 오며 W3C Feed Validator가 없으면 경고한다.
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channelTitle)}</title>`,
    `    <link>${escapeXml(channelLink)}</link>`,
    `    <description>${escapeXml(dict.nav.blog.description)}</description>`,
    `    <language>${feedLanguages[locale]}</language>`,
    `    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />`,
    ...(lastBuildDate ? [`    <lastBuildDate>${lastBuildDate}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
