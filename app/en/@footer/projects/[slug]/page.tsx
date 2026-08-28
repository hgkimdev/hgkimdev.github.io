import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/lib/i18n/dictionaries";

// /projects/[slug]는 진짜 페이지라 Blog 존 상세 글처럼 푸터로 끝을 맺는다.
// 병렬 라우트 슬롯이라 app/(ko)/@footer/projects/[slug]/page.tsx와 같은
// 이유로 필요하다 — 대응하는 슬롯 파일이 없으면 default.tsx(null)로 떨어져
// 푸터가 안 보인다.
export default function ProjectFooter() {
  const dict = getDictionary("en");
  return <SiteFooter footerText={dict.footer(new Date().getFullYear())} />;
}
