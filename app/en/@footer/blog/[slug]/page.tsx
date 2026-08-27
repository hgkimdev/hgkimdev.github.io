import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/lib/i18n/dictionaries";

// Blog 존의 하위 경로도 푸터로 끝난다. 병렬 슬롯은 경로가 정확히 맞아야
// 하므로 `@footer/blog/page.tsx`가 /blog 하나만 담당하고, 상세·분류 라우트는
// 각자 자기 슬롯 파일이 필요하다 — 없으면 default.tsx(null)로 떨어져
// 푸터가 사라진다.
export default function BlogSubpageFooter() {
  const dict = getDictionary("en");
  return <SiteFooter footerText={dict.footer(new Date().getFullYear())} />;
}
