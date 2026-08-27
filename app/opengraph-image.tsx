import { ImageResponse } from "next/og";

// output: 'export' requires metadata routes to opt into static generation
// explicitly in this Next.js version, or the build fails collecting page data.
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social-preview image for every route that doesn't define its own.
// Kept to the site's own already-shipped copy (root layout's title/description)
// rather than inventing new marketing copy for the image.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 108, fontWeight: 700, letterSpacing: -3 }}>
          hgkim
        </div>
        <div style={{ fontSize: 34, color: "#a1a1aa" }}>
          나라는 사람을 소개하는 공간
        </div>
      </div>
    ),
    size,
  );
}
