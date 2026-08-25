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
      className="mt-6 w-full max-w-2xl"
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
        className="!py-6"
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
              width: "clamp(11rem, 30vw, 14rem)",
              height: "clamp(14rem, 40vh, 18rem)",
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
