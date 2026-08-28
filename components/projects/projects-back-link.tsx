import { HomeAnchorLink } from "@/components/home-anchor-link";
import type { Locale } from "@/lib/i18n/config";
import { ArrowLeftIcon } from "lucide-react";

export function ProjectsBackLink({ locale }: { locale: Locale }) {
  return (
    <HomeAnchorLink
      anchor="projects"
      locale={locale}
      className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      Projects
    </HomeAnchorLink>
  );
}
