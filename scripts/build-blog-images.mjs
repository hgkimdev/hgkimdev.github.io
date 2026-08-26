// 블로그 글이 참조하는 로컬 이미지를 정해진 상자 크기로 미리 굽는다.
//
// 정적 export(`output: 'export'`)라 next/image의 최적화가 동작하지 않는다 —
// 원본이 그대로 나가서, 112px 썸네일 자리에 2000px짜리 243KB 파일을 내려받는
// 일이 생긴다. 표시 크기를 CSS로 줄여도 전송량과 디코딩 비용은 그대로다.
//
// 그래서 표시할 상자(16:9)를 먼저 정하고 파일 자체를 그 비율·크기로 굽는다.
// 결과적으로 표시 시점에는 자를 것이 없고, 글마다 원본 비율이 달라도 목록과
// 본문의 이미지 높이가 어긋나지 않는다.
//
// `npm run build`/`npm run dev` 앞에 자동으로 붙는다(package.json의
// prebuild/predev). 산출물은 파생물이라 커밋하지 않는다(.gitignore).
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content/blog");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "_blog");

// 표시 상자의 2배 폭. 목록 썸네일은 최대 144px, 본문은 최대 608px로 그려진다.
//
// 두 변형의 성격이 다르다:
// - thumb: 정해진 상자에 채워 넣는 그림이라 4:3으로 자른다. 16:9는 옆의
//          텍스트 블록보다 한참 낮아 아래가 크게 빈다(실측 81px vs 140px).
// - body:  글 안의 사진은 원본 비율이 곧 내용이다(세로 사진, 스크린샷).
//          자르지 않고 폭만 줄인다.
export const VARIANTS = { thumb: 480, body: 1280 };
const THUMB_RATIO = 4 / 3;

/** 원본 경로 하나가 항상 같은 출력 이름으로 가도록 평평하게 편다. */
export function flattenKey(src) {
  return src.replace(/^\//, "").replace(/\.[^.]+$/, "").replace(/[/\\]/g, "__");
}

export function variantPath(src, width) {
  return `/_blog/${flattenKey(src)}-${width}.webp`;
}

function collectSources() {
  let files;
  try {
    files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const found = new Set();
  for (const file of files) {
    const raw = readFileSync(path.join(BLOG_DIR, file), "utf8");
    // 마크다운 이미지와 frontmatter의 cover 둘 다 본다. raw HTML은 파이프라인이
    // 통과시키지 않으므로 <img>는 찾지 않는다.
    for (const m of raw.matchAll(/!\[[^\]]*\]\(\s*(\S+?)\s*(?:"[^"]*")?\s*\)/g)) {
      found.add(m[1]);
    }
    const cover = raw.match(/^cover:\s*["']?([^"'\n]+)["']?\s*$/m);
    if (cover) found.add(cover[1].trim());
  }

  // 로컬 절대경로만 굽는다. 외부 URL은 우리가 손댈 수 없고, 이미 구운 것은
  // 다시 굽지 않는다.
  return [...found].filter((src) => src.startsWith("/") && !src.startsWith("/_blog/"));
}

async function main() {
  const sources = collectSources();
  if (sources.length === 0) {
    console.log("[blog-images] 참조된 로컬 이미지 없음");
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  let built = 0;
  let skipped = 0;

  for (const src of sources) {
    const input = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
    if (!existsSync(input)) {
      console.warn(`[blog-images] 원본 없음, 건너뜀: ${src}`);
      continue;
    }
    const sourceTime = statSync(input).mtimeMs;

    for (const width of Object.values(VARIANTS)) {
      const outRel = variantPath(src, width);
      const output = path.join(PUBLIC_DIR, outRel.replace(/^\//, ""));

      // 원본이 그대로면 다시 굽지 않는다. 빌드마다 전부 다시 도는 걸 막는다.
      if (existsSync(output) && statSync(output).mtimeMs >= sourceTime) {
        skipped++;
        continue;
      }

      const pipeline = sharp(input);
      if (width === VARIANTS.thumb) {
        // position: "attention"은 대비가 큰 영역을 남기고 자른다. 가운데를
        // 기계적으로 자르면 인물이나 피사체가 잘려 나가는 일이 잦다.
        pipeline.resize(width, Math.round(width / THUMB_RATIO), {
          fit: "cover",
          position: "attention",
        });
      } else {
        // 폭만 제한한다. 높이는 원본 비율을 따라가고, 원본이 이미 작으면
        // 늘리지 않는다.
        pipeline.resize({ width, withoutEnlargement: true });
      }
      await pipeline.webp({ quality: 80 }).toFile(output);
      built++;
    }
  }

  console.log(`[blog-images] 생성 ${built}개, 최신이라 건너뜀 ${skipped}개`);
}

main().catch((error) => {
  console.error("[blog-images] 실패:", error);
  process.exit(1);
});
