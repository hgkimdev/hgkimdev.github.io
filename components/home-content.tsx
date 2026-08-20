import { HomeSections } from "@/components/home-sections";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { homeSectionKeys } from "@/lib/nav";
import { getAboutContent } from "@/lib/content/about";
import { lifeCategories, lifeIntro } from "@/content/life";
import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";

const AI_AGENT_MARKER = "AI 에이전트";

export function HomeContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const introParts = dict.home.intro.includes(AI_AGENT_MARKER)
    ? dict.home.intro.split(AI_AGENT_MARKER)
    : null;
  const sections = homeSectionKeys.map((key) => ({
    key,
    label: dict.nav[key].label,
    description: dict.nav[key].description,
    body:
      key === "about" && locale === "ko"
        ? getAboutContent().paragraphs
        : undefined,
    // About과 같은 규칙: 한국어 원문만 있는 콘텐츠는 ko에서만 붙이고, 나머지
    // 로케일은 기존 placeholder로 떨어진다.
    life:
      key === "life" && locale === "ko"
        ? { categories: lifeCategories, intro: lifeIntro }
        : undefined,
  }));

  const hero = (
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
  );

  return (
    <HomeSections
      hero={hero}
      sections={sections}
      comingSoonText={dict.comingSoon}
    />
  );
}
