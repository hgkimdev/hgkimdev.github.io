import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { PageNavKey } from "@/lib/nav";

export function PagePlaceholder({
  locale,
  navKey,
}: {
  locale: Locale;
  navKey: PageNavKey;
}) {
  const dict = getDictionary(locale);
  const { label, description } = dict.nav[navKey];

  return (
    <section className="flex min-h-[70vh] flex-col justify-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {label}
      </h1>
      <p className="max-w-xl text-muted-foreground">{description}</p>
      <p className="text-sm text-muted-foreground">{dict.comingSoon}</p>
    </section>
  );
}
