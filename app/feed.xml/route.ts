import { buildFeed } from "@/lib/feed";

// sitemap.ts·robots.ts와 같은 이유 — output: 'export'는 라우트 핸들러가
// 정적이라고 선언해야 빌드 타임에 파일로 구워 준다. 정적 export에서
// 라우트 핸들러는 GET만 지원하고 Request를 읽을 수 없다.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildFeed("ko"), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
