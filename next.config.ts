import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  experimental: {
    // Turbopack이 기본으로 켜는 dev 파일시스템 캐시(v16.1+)는 재시작
    // 체감 속도를 높이는 대신, 저장된 컴파일 결과를 그대로 복원하는
    // 방식이라 CSS 변경이 여러 번 재시작해도 반영 안 되는 무효화 버그를
    // 겪었다. 매번 .next를 지우는 대신 아예 끈다 — 재시작이 느려지는 게
    // 캐시가 틀린 결과를 계속 서빙하는 것보다 낫다.
    turbopackFileSystemCacheForDev: false,
    viewTransition: true,
    // @icons-pack/react-simple-icons re-exports ~3400 icons from a single
    // barrel file; only a couple are used. lucide-react is optimized by
    // Next.js by default, this one isn't.
    optimizePackageImports: ["@icons-pack/react-simple-icons"],
  },
};

export default nextConfig;
