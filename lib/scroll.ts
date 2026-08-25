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
