import { ViewTransition } from "react";

// Navigation transitions are a plain full-viewport crossfade on the root
// snapshot (see globals.css). This boundary exists only to *activate* a view
// transition when the route content swaps — React needs a <ViewTransition>
// around the mutation to call document.startViewTransition at all. The
// wrapper div's auto-assigned view-transition-name is voided in CSS
// (.page-vt) so the page content stays inside the root snapshot instead of
// getting its own geometry-morphing group, which is what used to play as a
// fake scroll-to-top when the pages had different scroll positions.
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <div className="page-vt">{children}</div>
    </ViewTransition>
  );
}
