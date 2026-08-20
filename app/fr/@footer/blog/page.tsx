import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/lib/i18n/dictionaries";

// blog 존에서만 푸터가 붙는다. 레이아웃은 두 존이 공유해야 하므로(헤더가
// 살아 있어야 ZoneSwitcher의 layoutId 필이 존 사이를 미끄러진다) 푸터만
// 병렬 슬롯으로 떼어냈다. 경로가 곧 조건이라 런타임에 pathname을 볼 일이
// 없고, 홈 쪽 산출물에는 푸터가 JS로도 페이로드로도 들어가지 않는다.
export default function BlogFooter() {
  const dict = getDictionary("fr");
  return <SiteFooter footerText={dict.footer(new Date().getFullYear())} />;
}
