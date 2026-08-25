import { HomeAnchorLink } from "@/components/home-anchor-link";
import { defaultLocale } from "@/lib/i18n/config";
import { ArrowLeftIcon } from "lucide-react";

// /projects/[slug]는 (ko) 라우트 그룹 안에만 있다 — 다른 로케일로 아직
// 안 갈라졌으니 locale은 고정값으로 둔다.
export function ProjectsBackLink() {
  return (
    <HomeAnchorLink
      anchor="projects"
      locale={defaultLocale}
      className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      Projects
    </HomeAnchorLink>
  );
}
