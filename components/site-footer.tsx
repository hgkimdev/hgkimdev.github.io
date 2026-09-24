// 서버 컴포넌트다. 예전에는 "use client" + usePathname으로 스스로 존을 보고
// intro면 null을 반환했는데, 그러면 푸터가 한 줄도 안 그려지는 홈에서도
// 컴포넌트와 아이콘 세 개가 클라이언트 번들에 실려 와 하이드레이트됐다.
//
// 이제 "어느 존에서 보일지"는 라우터가 정한다 — app/*/@footer 슬롯을 볼 것.
// 여기 남은 건 생김새뿐이라 아이콘 SVG도 서버에서 HTML로 굳는다.
import { Rss } from "lucide-react";

import { contactChannels } from "@/content/contact";
import { contactIcons } from "@/components/contact-icons";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function SiteFooter({
  footerText,
  locale,
}: {
  footerText: string;
  locale: Locale;
}) {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          {contactChannels.map(({ key, href, label, external }) => {
            const Icon = contactIcons[key];
            return (
              <a
                key={key}
                href={href}
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <Icon size={18} color="currentColor" />
              </a>
            );
          })}

          {/* 연락처와 같은 줄이다 — GitHub·Instagram·Email과 성격이 같은,
              나를 따라오는 채널이다. 줄에 fill 기반(simple-icons)과 stroke
              기반(lucide Mail)이 이미 섞여 있어 lucide Rss가 겉돌지 않는다.

              좁은 화면에서 피드로 가는 길은 이것 하나뿐이다. 사이드바 쪽
              링크는 900px 아래에서 빠진다(blog-sidebar.tsx 참고).

              aria-label을 사전으로 빼지 않는다 — RSS는 번역되는 낱말이
              아니라 형식 이름이고, 두 로케일에서 같은 글자다. */}
          <a
            href={localizeHref("/feed.xml", locale)}
            aria-label="RSS"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Rss size={18} color="currentColor" />
          </a>
        </div>
        <p>{footerText}</p>
      </div>
    </footer>
  );
}
