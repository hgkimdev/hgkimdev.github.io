import { HomeSections } from "@/components/home-sections";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { homeSectionKeys } from "@/lib/nav";
import { getAboutContent } from "@/lib/content/about";
import { lifeCategories } from "@/content/life";
import { projectGroups } from "@/content/projects";
import { ContactSection } from "@/components/contact-section";
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
        ? { categories: lifeCategories }
        : undefined,
    projects:
      key === "projects" && locale === "ko"
        ? { groups: projectGroups }
        : undefined,
    // About/Life와 달리 로케일 게이트가 없다: 연락 채널은 언어 중립이라
    // 4개 로케일 전부 실제 콘텐츠를 낸다.
    // key prop: 이 JSX는 homeSectionKeys.map() 콜백 안에서 만들어져서, 단일
    // 자식으로만 쓰여도 React가 "리스트 안에서 생성됨"으로 인식해 key를
    // 요구한다(SectionContent 렌더 시 "passed a child from HomeContent" 경고).
    content: key === "contact" ? <ContactSection key="contact" /> : undefined,
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
