import { HomeSections } from "@/components/home-sections";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function HomeContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col">
      <section className="flex min-h-[80vh] flex-col justify-center gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          {dict.home.greeting}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {dict.home.heading}
        </h1>
        <p className="max-w-xl text-muted-foreground">{dict.home.intro}</p>
      </section>

      <HomeSections locale={locale} />
    </div>
  );
}
