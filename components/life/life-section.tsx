"use client";

import { useState } from "react";

import type { LifeCategory, LifeCategoryKey } from "@/content/life";
import { LifeEntrance } from "@/components/life/life-entrance";
import { LifeOverlay } from "@/components/life/life-overlay";

/**
 * Life 섹션 전체 — 입구(스크롤 안)와 탐색 오버레이(스크롤 밖)를 잇는다.
 *
 * 어느 카테고리가 열렸는지만 여기서 들고 있는다. 오버레이는 Dialog라
 * 포털로 body에 붙으므로, 이 컴포넌트가 핀 고정 레이어 안에 있어도
 * (= 스크롤에 따라 opacity가 깎여도) 오버레이는 영향을 받지 않는다.
 */
export function LifeSection({
  categories,
  animateIn,
}: {
  categories: LifeCategory[];
  animateIn?: boolean;
}) {
  const [openKey, setOpenKey] = useState<LifeCategoryKey | null>(null);

  return (
    <>
      <LifeEntrance
        categories={categories}
        animateIn={animateIn}
        onOpen={setOpenKey}
      />
      <LifeOverlay
        categories={categories}
        openKey={openKey}
        onOpenKeyChange={setOpenKey}
      />
    </>
  );
}
