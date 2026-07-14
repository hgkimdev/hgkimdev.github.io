import { HomeSections } from "@/components/home-sections";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";

const AI_AGENT_MARKER = "AI 에이전트";

export function HomeContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const introParts = dict.home.intro.includes(AI_AGENT_MARKER)
    ? dict.home.intro.split(AI_AGENT_MARKER)
    : null;

  return (
    <div className="flex flex-col">
      <section className="relative left-1/2 flex min-h-[calc(100vh-var(--header-height))] w-screen -translate-x-1/2 flex-col justify-center overflow-hidden">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
          <p className="text-sm font-medium text-muted-foreground">
            {dict.home.greeting}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <TextType
              text={dict.home.heading}
              typingSpeed={60}
              pauseDuration={4000}
              loop={false}
              showCursor
            />
          </h1>
          <p className="max-w-xl text-muted-foreground">
            {introParts ? (
              <>
                {introParts[0]}
                <span className="rounded-full bg-foreground/5 px-2 py-0.5">
                  <ShinyText
                    text={AI_AGENT_MARKER}
                    className="font-medium"
                    color="var(--muted-foreground)"
                    shineColor="var(--foreground)"
                  />
                </span>
                {introParts[1]}
              </>
            ) : (
              dict.home.intro
            )}
          </p>
        </div>
      </section>

      <HomeSections locale={locale} />
    </div>
  );
}
