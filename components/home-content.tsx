import { HomeSections } from "@/components/home-sections";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { homeSectionKeys } from "@/lib/nav";
import { getAboutContent } from "@/lib/content/about";
import { getLifeCategories } from "@/lib/content/life";
import { getProjectGroups } from "@/lib/content/projects";
import { ContactSection } from "@/components/contact-section";
import { CodeBackdrop } from "@/components/home-fx/code-backdrop";
import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";

export function HomeContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  // indexOf + slice instead of split(): split() breaks on every occurrence,
  // so a marker that appears twice would drop everything after the second
  // one (only [0]/[1] are ever rendered below).
  const markerIndex = dict.home.intro.indexOf(dict.home.aiAgentMarker);
  const introParts: [string, string] | null =
    markerIndex === -1
      ? null
      : [
          dict.home.intro.slice(0, markerIndex),
          dict.home.intro.slice(markerIndex + dict.home.aiAgentMarker.length),
        ];
  const sections = homeSectionKeys.map((key) => ({
    key,
    label: dict.nav[key].label,
    description: dict.nav[key].description,
    locale,
    body: key === "about" ? getAboutContent(locale).paragraphs : undefined,
    life:
      key === "life" ? { categories: getLifeCategories(locale) } : undefined,
    projects:
      key === "projects" ? { groups: getProjectGroups(locale) } : undefined,
    // 연락 채널은 언어 중립이라 모든 로케일에서 실제 콘텐츠를 낸다.
    // key prop: 이 JSX는 homeSectionKeys.map() 콜백 안에서 만들어져서, 단일
    // 자식으로만 쓰여도 React가 "리스트 안에서 생성됨"으로 인식해 key를
    // 요구한다(SectionContent 렌더 시 "passed a child from HomeContent" 경고).
    content: key === "contact" ? <ContactSection key="contact" /> : undefined,
    // ContactSection과 같은 이유로 여기서 만든다(위 주석). key prop도 같은
    // 이유다 — map 콜백 안에서 만들어진 JSX라 React가 리스트 원소로 본다.
    backdrop:
      key === "about" ? <CodeBackdrop key="about-backdrop" /> : undefined,
  }));

  const hero = (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
      <p className="text-sm font-medium text-muted-foreground">
        {dict.home.greeting}
      </p>
      {/* break-keep: 기본 줄바꿈 규칙은 한글을 음절 사이 아무 데서나 끊는다 —
          실측으로 "…엔지니어" / "입니다."로 갈라졌다. 본문(ESSAY_TEXT)이 같은
          이유로 이미 break-keep을 쓴다. */}
      <h1 className="text-3xl font-bold tracking-tight break-keep text-pretty sm:text-4xl">
        <TextType
          as="span"
          text={dict.home.heading}
          typingSpeed={60}
          pauseDuration={4000}
          loop={false}
          showCursor
        />
      </h1>
      {/* 같은 이유. 여기서는 "있어" / "요."로 갈려 17px짜리 줄이 남았다. */}
      <p className="max-w-xl break-keep text-pretty text-muted-foreground">
        {introParts ? (
          <>
            {introParts[0]}
            {/* 알약이 줄을 넘어 쪼개지면 배경만 두 조각으로 남는다. */}
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 whitespace-nowrap">
              <ShinyText
                text={dict.home.aiAgentMarker}
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
