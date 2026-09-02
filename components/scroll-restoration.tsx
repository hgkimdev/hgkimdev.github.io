"use client";

import { useEffect } from "react";

// Where we stash a history entry's scroll position, inside that entry's own
// `history.state` (so it travels with the entry and dies with it).
const KEY = "__scrollY";

// Give layout up to ~2s to grow tall enough to reach the saved position, and
// once it can, keep re-asserting the position for a few frames — React may
// still be committing, and a late layout pass can otherwise nudge us off it.
const MAX_FRAMES = 120;
const HOLD_FRAMES = 8;
// If the document height stops changing and we still can't reach the saved
// position, stop waiting for the full timeout and settle for the closest one.
const STABLE_FRAMES = 20;

// Coalesce the per-scroll writes; `replaceState` is cheap but not free, and
// browsers rate-limit it.
const SAVE_DEBOUNCE_MS = 200;

type ScrollState = Record<string, unknown> & { [KEY]?: number };

declare global {
  interface Window {
    /** Set by the inline script in app/layout.tsx — see the comment there. */
    __initialScrollY?: number;
  }
}

/**
 * Restores scroll position on back/forward navigation.
 *
 * Next's App Router does not manage popstate scroll itself (there is no
 * scrollRestoration handling anywhere in next/dist/client) — it leaves it to
 * the browser's native restoration. That does not work on this site: Home is
 * a ~780svh pinned-scroll page and a project detail page is barely 1.5
 * viewports, so on `back` the browser applies its restore while the DOM is
 * still the short detail page and *clamps* the position to that page's
 * maximum scroll. Measured on the static export: leaving Home at scrollY
 * 3265, back landed at 669 on desktop (detail height 1469 − viewport 800)
 * and 342 on mobile (1186 − 844) — i.e. near the top of the intro. Whether
 * Home happened to render before the restore decided the outcome, which is
 * why it looked intermittent.
 *
 * So we take over: `history.scrollRestoration` is set to "manual" in the
 * inline script in app/layout.tsx (early, before the browser can run its own
 * restore), we record the position on the current history entry as the user
 * scrolls, and on the way back we wait for the document to actually grow
 * tall enough before scrolling to it.
 */
export function ScrollRestoration() {
  useEffect(() => {
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let restoreFrame: number | undefined;
    let restoreObserver: ResizeObserver | undefined;

    const stopRestore = () => {
      if (restoreFrame !== undefined) cancelAnimationFrame(restoreFrame);
      restoreFrame = undefined;
      restoreObserver?.disconnect();
      restoreObserver = undefined;
    };

    const save = () => {
      clearTimeout(saveTimer);
      const state = (history.state ?? {}) as ScrollState;
      if (state[KEY] === window.scrollY) return;
      try {
        history.replaceState({ ...state, [KEY]: window.scrollY }, "");
      } catch {
        // Some browsers rate-limit replaceState; the next scroll re-tries.
      }
    };

    const onScroll = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, SAVE_DEBOUNCE_MS);
    };

    // Capture phase: record where we were *before* Next starts swapping the
    // route out from under us. This only reads scroll position — it never
    // moves the page.
    const onClickCapture = () => save();

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const restoreTo = (target: number) => {
      stopRestore();
      let frames = 0;
      let held = 0;
      let stableFor = 0;
      let lastHeight = -1;

      /** Scrolls only when the target is actually reachable — scrolling to a
       * partway position while the document is still short would paint a
       * wrong frame, which is the flicker we are trying to avoid. */
      const apply = () => {
        if (maxScroll() < target) return false;
        // `instant` matters: <html> has scroll-smooth (app/layout.tsx), and a
        // smooth restore would animate up through the page.
        window.scrollTo({ top: target, left: 0, behavior: "instant" });
        return true;
      };

      // A ResizeObserver callback runs after layout but *before* paint, so
      // when the destination finally lays out tall this lands us on the right
      // position within that same frame — the first frame the reader sees of
      // the restored page is already correct, even on a slow device where the
      // rAF loop below would be a frame late.
      restoreObserver = new ResizeObserver(() => {
        apply();
      });
      // Observe <body>, not <html>: the root element is `h-full` (see
      // app/layout.tsx), so its own box is always exactly the viewport and
      // never reports a resize — it is the body that grows with the content.
      restoreObserver.observe(document.body);

      const step = () => {
        frames += 1;
        const height = document.documentElement.scrollHeight;
        stableFor = height === lastHeight ? stableFor + 1 : 0;
        lastHeight = height;

        if (apply()) {
          held += 1;
        } else if (stableFor >= STABLE_FRAMES) {
          // The page settled but can't reach the saved position (it is
          // genuinely shorter now, e.g. the viewport grew). Take the closest
          // position instead of waiting out the full timeout.
          window.scrollTo({ top: maxScroll(), left: 0, behavior: "instant" });
          stopRestore();
          return;
        }

        if (held < HOLD_FRAMES && frames < MAX_FRAMES) {
          restoreFrame = requestAnimationFrame(step);
        } else {
          stopRestore();
        }
      };

      // First pass runs synchronously: React commits the popstate navigation
      // before our listener runs, so the destination may already be laid out.
      step();
    };

    const onPopState = () => {
      const target = (history.state as ScrollState | null)?.[KEY];
      if (typeof target === "number") {
        restoreTo(target);
        return;
      }
      // No recorded position for this entry. A hash URL should still land on
      // its anchor, so leave those to the browser/Next.
      if (!window.location.hash) restoreTo(0);
    };

    // A back navigation that crosses a full document load (e.g. the detail
    // page was reloaded first) arrives as a fresh page load, not a popstate.
    // The entry still carries the position we saved before leaving, but by
    // now Next's router has overwritten `history.state` with its own — so use
    // the copy the inline script in app/layout.tsx took before that happened.
    const initial = window.__initialScrollY;
    delete window.__initialScrollY;
    if (typeof initial === "number" && initial > 0) restoreTo(initial);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", save);
    document.addEventListener("click", onClickCapture, true);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("click", onClickCapture, true);
      clearTimeout(saveTimer);
      stopRestore();
    };
  }, []);

  return null;
}
