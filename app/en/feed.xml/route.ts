import { buildFeed } from "@/lib/feed";

// 로케일마다 피드를 따로 낸다. 번역이 없는 글은 getAllPosts("en")에
// 애초에 안 나타나므로, 한 피드 안에서 두 언어가 섞이는 일이 없다.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildFeed("en"), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
