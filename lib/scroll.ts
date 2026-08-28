// A Link away from a deep scroll position on a long page (e.g. mid Projects
// list on Home) onto a much shorter page can make the sticky header
// momentarily "unstick" during the DOM swap — old tall page gone, new short
// page in, scrollY still at the old depth — before the browser clamps
// scrollY to the new document height. Anything using Framer Motion's
// layoutId across that swap (the ZoneSwitcher's active pill) measures that
// transient rect and visibly jumps from it. Call `resetScrollForNavigation`
// synchronously in the click handler, before Next.js processes the
// navigation, to avoid it.

export function isPlainLeftClick(event: React.MouseEvent): boolean {
  // Modified clicks (cmd/ctrl/shift/alt, non-primary button) open in a new
  // tab/window — the current page doesn't navigate, so it must not scroll
  // either.
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function resetScrollForNavigation() {
  // `behavior: "instant"` matters here — <html> has scroll-smooth (see
  // app/layout.tsx), so a plain window.scrollTo(0, 0) would itself animate,
  // drifting through the transition window instead of resetting before
  // Motion measures anything.
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

/** True if `href` stays on the current page — same pathname+search, at most
 * a different #hash — i.e. an in-page anchor jump rather than a route
 * change. Shared by every navigation entry point (real <a> clicks and
 * router.push/replace calls) so they all agree on when a reset is actually
 * needed and don't fight the anchor-scroll case. */
export function isSamePageHref(href: string): boolean {
  const target = new URL(href, window.location.href);
  return (
    target.pathname === window.location.pathname &&
    target.search === window.location.search
  );
}

/**
 * The one function every navigation trigger should call before it actually
 * navigates. `components/scroll-reset-on-nav.tsx` calls this for <a> clicks;
 * `lib/router.ts`'s useAppRouter calls it for router.push/replace — so a new
 * navigation trigger only has to go through one of those two, not
 * remember this fix on its own.
 */
export function resetScrollBeforeNavigatingTo(href: string) {
  if (window.scrollY === 0) return;
  if (isSamePageHref(href)) return;
  resetScrollForNavigation();
}
