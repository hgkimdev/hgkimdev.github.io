"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

// Module-scoped so a transition started by a later click can tell an earlier
// transition's cleanup not to clear an attribute it just set.
let transitionId = 0;

export function ThemeToggle({ label }: { label: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function applyTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function toggle() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !document.startViewTransition) {
      applyTheme();
      return;
    }

    // `types` on startViewTransition + `:active-view-transition-type()` in
    // CSS would be the "proper" way to scope this, but that pseudo-class
    // isn't actually matching in this environment (verified: the rule gets
    // dropped/never matches). Use a plain attribute instead, same approach
    // as ZoneSwitcher's data-zone-nav.
    document.documentElement.dataset.transitionKind = "theme";
    const id = ++transitionId;
    const transition = document.startViewTransition(applyTheme);
    // Clear the attribute once the wipe is done, otherwise the theme-scoped
    // rules keep matching on later navigations and the header stays merged
    // into the root snapshot (see .site-header in globals.css). Guarded by
    // id: a fast second click starts a new transition (and re-sets the
    // attribute) before this one's `finally` runs, which would otherwise
    // wipe out the newer transition's attribute mid-flight.
    transition.finished.finally(() => {
      if (transitionId === id) {
        delete document.documentElement.dataset.transitionKind;
      }
    });
  }

  return (
    <Button variant="ghost" size="icon" aria-label={label} onClick={toggle}>
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
