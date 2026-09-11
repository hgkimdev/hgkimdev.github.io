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

/**
 * Life 입구의 배경 벽에 쓰는 폭.
 *
 * 벽은 한 열이 240px쯤이라 원본(여행 사진 1500~2000px, 최대 659KB)을 그대로
 * 쓰면 폭으로 8배, 넓이로 69배짜리 그림을 매번 축소해 그리게 된다. 스무 장이면
 * 원본 합계가 10MB고 디코드된 비트맵은 그 몇 배다 — 계속 흐르는 벽에서는 그
 * 래스터화가 이따금 프레임을 잡아먹는다.
 *
 * 이름을 `-wall480`으로 따로 두는 건 thumb(=480)이 4:3으로 자르기 때문이다.
 * 벽은 원본 비율이 그대로여야 해서 폭만 줄인다. 같은 사진이 블로그 글에도
 * 쓰이면(travel-05가 그렇다) 한 이름에 성격이 다른 두 파일이 겹친다.
 */
export const WALL_WIDTH = 480;
const LIFE_DIR = path.join(PUBLIC_DIR, "life");

/**
 * Projects 입구의 프리뷰 상자에 쓰는 폭.
 *
 * 상자는 목록 옆에서 아무리 커도 465px이므로(바깥 칸이 68rem에서 멈춘다)
 * 2배인 960이면 레티나까지 덮는다. 원본은 1920px짜리 스크린샷이라 그대로
 * 내보내면 가장 큰 상자에서도 표시 폭의 4배를 받는다.
 *
 * 이름을 `-shot800`으로 따로 두는 이유는 wall480과 같다 — thumb/body는
 * 블로그 글이 참조하는 이미지에만 붙는 이름이고, 여기 원본은 그 목록에
 * 잡히지 않는다(글이 참조하지 않으므로).
 */
export const SHOT_WIDTH = 960;
const PROJECTS_DIR = path.join(PUBLIC_DIR, "projects");

export function shotVariantPath(src) {
  return `/_blog/${flattenKey(src)}-shot${SHOT_WIDTH}.webp`;
}

/**
 * public/projects 아래의 래스터 그림.
 *
 * svg는 뺀다 — Clawd 픽셀 아트가 그렇고, 벡터는 굽는 의미가 없을 뿐 아니라
 * 래스터로 바꾸면 오히려 계단이 생긴다.
 */
function collectShotSources() {
  if (!existsSync(PROJECTS_DIR)) return [];
  return readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
    .map((entry) => `/projects/${entry.name}`);
}

export function wallVariantPath(src) {
  return `/_blog/${flattenKey(src)}-wall${WALL_WIDTH}.webp`;
}

/** public/life 아래의 모든 그림. 하위 폴더(travel)까지 훑는다. */
function collectLifeSources(dir = LIFE_DIR) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectLifeSources(full));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name))
      out.push("/" + path.relative(PUBLIC_DIR, full).split(path.sep).join("/"));
  }
  return out;
}

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

async function bakeWall(built, skipped) {
  for (const src of collectLifeSources()) {
    const input = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
    const outRel = wallVariantPath(src);
    const output = path.join(PUBLIC_DIR, outRel.replace(/^\//, ""));
    if (
      existsSync(output) &&
      statSync(output).mtimeMs >= statSync(input).mtimeMs
    ) {
      skipped++;
      continue;
    }
    await sharp(input)
      .resize({ width: WALL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(output);
    built++;
  }
  return [built, skipped];
}

async function bakeShots(built, skipped) {
  for (const src of collectShotSources()) {
    const input = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
    const outRel = shotVariantPath(src);
    const output = path.join(PUBLIC_DIR, outRel.replace(/^\//, ""));
    if (
      existsSync(output) &&
      statSync(output).mtimeMs >= statSync(input).mtimeMs
    ) {
      skipped++;
      continue;
    }
    // 폭만 줄인다. 상자가 16:10이고 그림마다 비율이 달라도 자르는 건 표시
    // 시점의 object-fit이 한다 — 스크린샷은 어디를 남길지가 그림마다 달라
    // 기계적으로 자르면 UI가 잘린다.
    await sharp(input)
      .resize({ width: SHOT_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(output);
    built++;
  }
  return [built, skipped];
}

async function main() {
  const sources = collectSources();

  mkdirSync(OUT_DIR, { recursive: true });
  let built = 0;
  let skipped = 0;
  [built, skipped] = await bakeWall(built, skipped);
  [built, skipped] = await bakeShots(built, skipped);

  if (sources.length === 0) {
    console.log(`[blog-images] 생성 ${built}개, 최신이라 건너뜀 ${skipped}개 (블로그 참조 이미지 없음)`);
    return;
  }

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
