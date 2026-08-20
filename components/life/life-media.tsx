"use client";

import { motion, useReducedMotion } from "motion/react";

import type { LifeMedia } from "@/content/life";

// youtube-nocookie.com은 재생 전까지 쿠키를 심지 않는다. 소개용 사이트에
// 굳이 방문자 추적을 얹을 이유가 없어 기본값으로 쓴다.
const EMBED_ORIGIN = "https://www.youtube-nocookie.com";

/**
 * 영상 위에 얹히는 YouTube UI를 최대한 지운다.
 *
 * 주의: `modestbranding`은 더 이상 동작하지 않는다(YouTube가 2023년경 무력화).
 * 문서에 남아 있어 넣어두는 사람이 많지만 기대하면 안 된다. 실제로 효과가
 * 있는 건 controls=0(하단 바 + 우하단 로고), iv_load_policy=3(주석),
 * cc_load_policy=0(자막 자동 표시), rel=0(관련 영상) 정도다.
 *
 * 상단 제목 바와 종료 화면은 파라미터로 못 없앤다 — 확대해서 화면 밖으로
 * 밀어내는 수밖에 없다(CHROME_CROP_SCALE).
 */
function embedSrc(id: string, start?: number) {
  const params = new URLSearchParams({
    autoplay: "1",
    // 소리 있는 자동재생은 브라우저가 막는다. 배경 영상이니 음소거가 맞다.
    mute: "1",
    controls: "0",
    loop: "1",
    // loop=1은 playlist에 같은 id가 있어야 실제로 반복된다 (YouTube 스펙).
    playlist: id,
    playsinline: "1",
    rel: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    cc_load_policy: "0",
    ...(start ? { start: String(start) } : {}),
  });
  return `${EMBED_ORIGIN}/embed/${id}?${params}`;
}

// 영상: 가장자리에 붙는 YouTube UI(상단 제목 바 등)를 화면 밖으로 밀어내야
// 해서 넉넉히 확대한다. 확대할수록 크롬은 잘 잘리지만 화질이 깎인다.
const CHROME_CROP_SCALE = 1.3;
// 스틸: 잘라낼 UI가 없으니 검은 띠만 걷어내는 최소값.
const STILL_SCALE = 1.04;

/**
 * 항목 뒤에 깔리는 배경 한 겹.
 *
 * 영상이 있으면 틀고, 없으면(여행·책·언어) 정지 이미지를 아주 느리게 민다.
 * reduced-motion일 때는 영상이 있어도 정지 이미지로 간다 — 자동재생이야말로
 * 그 설정이 피하려는 것이기 때문.
 */
export function LifeMediaBackground({ media }: { media: LifeMedia }) {
  const prefersReducedMotion = useReducedMotion();
  const useVideo = !prefersReducedMotion;

  // iframe은 object-fit이 안 먹으므로 16:9 상자를 화면보다 크게 잡아 덮는
  // 고전적인 방법을 쓴다. img는 object-cover 한 줄이면 되므로 같은 트릭을
  // 쓰면 안 된다 — Tailwind preflight의 `img { max-width: 100% }`가 vh 기반
  // 너비를 조용히 잘라서 의도한 크기가 나오지도 않는다.
  const iframeCover =
    "pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full " +
    "w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0";
  const imgCover =
    "pointer-events-none absolute inset-0 h-full w-full object-cover";

  const stillSrc =
    media.kind === "youtube"
      ? `https://i.ytimg.com/vi/${media.id}/maxresdefault.jpg`
      : media.kind === "image"
        ? media.src
        : null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {media.kind === "youtube" && useVideo ? (
        <iframe
          key={media.id}
          src={embedSrc(media.id, media.start)}
          title=""
          tabIndex={-1}
          allow="autoplay; encrypted-media; picture-in-picture"
          className={iframeCover}
          style={{ scale: CHROME_CROP_SCALE }}
        />
      ) : stillSrc ? (
        // 정지 이미지는 아주 느리게 밀어준다. 완전히 멈춰 있으면 배경이라기보다
        // 벽지처럼 보이고, 빠르면 글에서 시선을 뺏는다.
        <motion.img
          key={stillSrc}
          src={stillSrc}
          alt=""
          className={imgCover}
          initial={{ scale: STILL_SCALE }}
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [STILL_SCALE, STILL_SCALE + 0.09] }
          }
          transition={{
            duration: 24,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ) : null}

      {/* 글이 놓이는 왼쪽은 거의 불투명하게, 오른쪽은 배경이 비치도록.
          왼쪽이 충분히 불투명해야 본문 글자색을 토큰 그대로 둘 수 있다.

          값은 다크 모드 기준으로 잡혀 있다 — 어둡게 덮으면 영상의 색이 살아
          남지만 희게 덮으면 어떤 색이든 흰색 쪽으로 섞여 채도가 빠진다.
          그래서 오버레이는 라이트 테마에서도 다크 토큰으로 그린다
          (life-overlay.tsx의 Dialog.Popup에 붙은 `dark`). 여기서 `background`가
          늘 어두운 색인 것은 그 덕분이다. */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/30" />
    </div>
  );
}
