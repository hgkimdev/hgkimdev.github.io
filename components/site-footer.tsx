import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-muted-foreground">
        {dict.footer(new Date().getFullYear())}
      </div>
    </footer>
  );
}
