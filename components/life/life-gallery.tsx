"use client";

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCoverflow, Keyboard } from "swiper/modules";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "photoswipe/style.css";

import type { LifeGalleryMedia } from "@/content/life";

/**
 * 여행 사진첩. Swiper의 Coverflow effect(검증된 캐러셀 라이브러리)로 넘겨보고,
 * 클릭하면 PhotoSwipe(검증된 라이트박스 라이브러리)가 전체화면으로 연다.
 * 둘 다 직접 짠 물리 계산이 아니라 널리 쓰이는 오픈소스 구현이다.
 */
export function LifeTravelGallery({ media }: { media: LifeGalleryMedia }) {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    // gallery는 DOM 루트만 있으면 된다 — PhotoSwipe가 children 셀렉터로
    // 내부를 훑으므로 SwiperSlide 밑에 몇 겹이 있든 상관없다.
    const lightbox = new PhotoSwipeLightbox({
      gallery: el,
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();
    return () => lightbox.destroy();
  }, [media]);

  return (
    <div
      ref={galleryRef}
      // life-overlay.tsx의 항목 전환 스와이프(터치 전용)가 이 안에서는
      // 끼어들지 않아야 한다 — 안 그러면 사진을 넘기려는 손짓이 항목을
      // 넘겨버린다. useItemSwipe가 이 속성을 보고 걸러낸다.
      data-swipe-ignore
      // 폰(max-md)에서 이 상자는 "18rem 액자 + 위아래 여백"인 19.5rem을
      // 기본으로 잡되 **줄어들 수 있는** 칸이다(basis + shrink). 여행 항목은
      // 제목·메타·본문·버킷리스트를 다 지나야 사진첩이 나오는데, 예전처럼
      // 액자 높이를 뷰포트 비율(40vh)로 고정하면 위의 글이 길어질수록 사진이
      // 아래로 밀려 화면 밖에 걸쳤다 — 실측(360px 폭): 660에서 한글 149px,
      // 영어 172px이 잘려 스크롤해야 끝이 보였다(영어는 본문이 한 줄 더
      // 접힌다). 줄어드는 칸으로 두면 모자란 만큼만 액자가 작아지고(그래서
      // `--slide-h`가 이 칸을 기준으로 한 `100%`다), 남으면 18rem에서 멈춘다.
      //
      // md 이상은 예전 값 그대로다 — 거기서는 칸이 남아돌아 줄일 이유가 없다.
      className="mt-6 w-full max-w-2xl [--slide-h:min(100%,18rem)] [--slide-w:auto] max-md:mt-4 max-md:flex max-md:min-h-[7rem] max-md:shrink max-md:basis-[19.5rem] max-md:flex-col md:[--slide-h:clamp(14rem,40vh,18rem)] md:[--slide-w:clamp(11rem,30vw,14rem)]"
      style={{ touchAction: "pan-y" }}
    >
      <Swiper
        modules={[EffectCoverflow, Keyboard, A11y]}
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        loop={media.photos.length > 2}
        keyboard={{ enabled: true }}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: true,
        }}
        // 폰에서는 이 칸이 위 상자의 남는 높이를 받아(flex-1) 액자 높이의
        // 기준이 된다. 액자가 이 칸보다 낮을 때(18rem에서 멈출 때)를 위해
        // 가운데로 세운다.
        //
        // `w-full`이 빠지면 안 된다. swiper/css의 `.swiper`에는 좌우 `margin:
        // auto`가 있는데, flex 항목이 교차축에 auto 마진을 가지면 stretch가
        // 적용되지 않는다 — 폭이 내용 기준(슬라이드 23장을 옆으로 이어붙인
        // 4968px, 실측)으로 잡히면서 사진첩이 통째로 화면 밖으로 밀려나
        // 아무것도 보이지 않는다. 폭을 명시하면 그 경로를 아예 타지 않는다.
        className="!py-6 max-md:!py-3 max-md:min-h-0 max-md:w-full max-md:flex-1 max-md:[&_.swiper-wrapper]:items-center"
      >
        {media.photos.map((photo) => (
          <SwiperSlide
            key={photo.src}
            className="overflow-hidden rounded-sm"
            // width/height는 인라인 style로 준다. swiper/css가 컴포넌트
            // 파일에서 임포트되는 탓에 Tailwind 유틸리티보다 캐스케이드상
            // 나중에 실려 `.swiper-slide { width: 100% }` 쪽이 이겨버린다 —
            // 인라인 style은 그 순서와 무관하게 항상 이긴다.
            style={{
              width: "var(--slide-w)",
              height: "var(--slide-h)",
              // 폰에서는 높이가 남는 칸(`100%`)이고 폭이 `auto`라, 이 비율이
              // 폭을 정한다 — md 이상의 고정값(14rem x 18rem)과 같은 세로 액자.
              aspectRatio: "3 / 4",
              boxShadow: "0 18px 26px rgba(0,0,0,0.55)",
            }}
          >
            <a
              href={photo.src}
              data-pswp-width={photo.width}
              data-pswp-height={photo.height}
              className="block h-full w-full cursor-zoom-in"
              aria-label={photo.alt}
            >
              {/* next/image를 쓰지 않는 이유는 life-media.tsx의 같은 주석 참고 —
                  정적 export(images.unoptimized)라 최적화가 없다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="pointer-events-none h-full w-full object-cover"
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
