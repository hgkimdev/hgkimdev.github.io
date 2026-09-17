import type { Metadata } from "next";

import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = { title: "404" };

// 루트 not-found는 루트 레이아웃 안에서만 그려진다 — (ko)/en 레이아웃의
// 헤더·푸터는 이 아래에 있어서 닿지 않는다. 그래서 `<main>` 껍데기도 화면이
// 직접 쓴다. 문구는 로케일을 타지 않으므로 사전을 거치지 않는다(이유는
// not-found-view.tsx).
export default function NotFound() {
  return <NotFoundView />;
}
