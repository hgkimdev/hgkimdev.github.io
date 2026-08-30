import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  experimental: {
    viewTransition: true,
    // @icons-pack/react-simple-icons re-exports ~3400 icons from a single
    // barrel file; only a couple are used. lucide-react is optimized by
    // Next.js by default, this one isn't.
    optimizePackageImports: ["@icons-pack/react-simple-icons"],
  },
};

export default nextConfig;
