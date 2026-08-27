---
title: Handling Font Loading in Static Exports
date: 2026-08-12
category: study
tags: [Next.js, Performance, Fonts]
summary: "How next/font fetches fonts at build time, and how subsets and preload tags get generated in an output: export environment."
draft: true
---

In a static export environment, nothing can happen at request time. Which format the font ships in, which characters get kept, and which tags get injected into the document — all of it is decided at build time.

## The problem

After deploying the build output to static hosting, I noticed the text on the first screen briefly rendered in a different typeface before switching. There were three candidate causes.

- The font file isn't preloaded, so the request only starts after parsing
- The fallback font's metrics differ from the real font, so layout shifts at the swap
- A character missing from the subset gets requested late as a separate file

The three look the same from the symptoms alone — you can't tell them apart just by looking. You have to check the font request's start time together with the `font-display` value in the Network tab to see which one it is.

## Checking the actual behavior

Opening the build output directly, you can see the generated styles declare a fallback for metric correction alongside the real font.

```css
@font-face {
  font-family: "Geist Fallback";
  src: local("Helvetica Neue");
  ascent-override: 95.9%;
  descent-override: 24.2%;
  size-adjust: 104.1%;
}
```

![Screen showing the start time of a font request in the Network tab](/life/travel/travel-05.jpg)

### Measurement steps

1. Open the first screen with an empty cache
2. Compare the font request's start time against when document parsing finishes
3. Repeat the same steps under a throttled network condition

> Deciding the cause without measuring it leaves behind a change that only looks like a fix. A symptom disappearing and the cause disappearing are not the same thing.

| Item | With preload | Without preload |
| --- | --- | --- |
| Request start | Before parsing | After parsing |
| Layout shift | None | Present |

## What's left

A variable font can cover the whole weight range with a single file, but the file size grows. Which side wins depends on how many weights you actually use, so it has to be measured again for each project. Related background is covered in [MDN's font-display docs](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-display).
