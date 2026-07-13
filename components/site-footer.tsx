"use client";

import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { SiGithub, SiInstagram } from "@icons-pack/react-simple-icons";

import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { getZone } from "@/lib/nav";

const socialLinks = [
  {
    key: "github",
    href: "https://github.com/hgkimdev",
    label: "GitHub",
    Icon: SiGithub,
    external: true,
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/hgkim_2/",
    label: "Instagram",
    Icon: SiInstagram,
    external: true,
  },
  {
    key: "email",
    href: "mailto:hgkimdev@proton.me",
    label: "Email",
    Icon: Mail,
    external: false,
  },
] as const;

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const zone = getZone(pathname, locale);

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground">
        {zone === "blog" && (
          <div className="flex items-center gap-4">
            {socialLinks.map(({ key, href, label, Icon, external }) => (
              <a
                key={key}
                href={href}
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <Icon size={18} color="currentColor" />
              </a>
            ))}
          </div>
        )}
        <p>{dict.footer(new Date().getFullYear())}</p>
      </div>
    </footer>
  );
}
