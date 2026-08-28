"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { LifeCoverMedia, LifeMedia } from "@/content/life";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
 *
 * 재생 시작 직후 정중앙에 뜨는 재생/일시정지 버튼은 그 어느 쪽으로도 못
 * 없앤다. CHROME_HIDE_AT의 주석 참고 — CoverPoster가 덮어서 가린다.
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
    // 재생 위치를 받고(usePosterCover) 음소거를 토글하려고(useMuteCommand)
    // 켠다.
    //
    // 짝으로 쓰라는 origin 파라미터는 뺐다. window.location.origin은 정적
    // export의 프리렌더 시점에 없어서 src가 하이드레이션 전후로 갈리기
    // 때문이다. 받는 쪽은 e.origin으로 거르고 있고, 이 플레이어에 남이 명령을
    // 보내봐야 할 수 있는 건 배경 영상을 음소거하거나 멈추는 정도다.
    enablejsapi: "1",
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
 * 새 embed UI가 스스로 사라지는 시점(초).
 *
 * 재생이 시작되면 화면 정중앙에 56x56 재생/일시정지 버튼이 뜬다. 클래스가
 * `player-control-play-pause-icon`으로, 클래식 플레이어의 `ytp-*`가 아니다 —
 * controls=0이 겨냥하는 게 `ytp` 컨트롤 바라서 이 UI에는 닿지 않는다.
 * controls 없음/controls=2/modestbranding/showinfo=0까지 전부 실측해봤지만
 * 어떤 조합으로도 안 꺼진다. 정중앙이라 CHROME_CROP_SCALE로도 못 밀어낸다 —
 * 확대의 기준점이 바로 그 지점이다.
 *
 * 남는 방법은 사라질 때까지 덮는 것뿐이다. 실측하면 currentTime 4.0쯤에
 * 사라지는데, 기준이 벽시계가 아니라 currentTime이다 — 초반 버퍼링으로
 * 실제 경과가 5초를 넘어도 사라지는 지점은 t=4.0 그대로였다. 그래서 타이머가
 * 아니라 재생 위치로 판단한다. 0.5초는 여유분.
 */
const CHROME_HIDE_AT = 4.5;
/**
 * 루프가 처음으로 되돌아가면 같은 UI가 그대로 다시 뜬다(실측: 되돌아간 뒤
 * t=0~4.0에 재노출). 되돌아간 것을 메시지로 알고 나서 덮으면 이미 늦으므로,
 * 끝에 이만큼 남았을 때 미리 덮어둔다.
 */
const SEAM_LEAD = 1.2;
// 위젯을 찌르는 간격. 답이 오면 멈춘다.
const HANDSHAKE_PING_MS = 250;
/**
 * 핸드셰이크가 끝내 안 먹었을 때 덮개를 걷는 시한.
 *
 * 이게 없으면 메시지가 오지 않는 환경에서 영상이 영영 정지 이미지에 덮인
 * 채로 남는다 — 버튼이 잠깐 보이는 것보다 나쁜 결과다. 재생 시작까지 걸리는
 * 시간 + CHROME_HIDE_AT을 넉넉히 넘겨 잡았다.
 */
const NO_MESSAGE_FALLBACK_MS = 10000;

/**
 * 음소거 상태를 플레이어에 반영한다.
 *
 * URL의 mute=1은 자동재생을 통과하려고 반드시 필요하므로 영상은 늘 음소거로
 * 시작한다. 소리를 켜는 건 여기서 명령으로만 한다.
 *
 * ready(=iframe load)와 videoId도 같이 의존하는 게 핵심이다. 항목을 바꾸면
 * 새 iframe이 다시 mute=1로 시작하므로, 사용자가 소리를 켜둔 상태였다면
 * 새로 올라온 플레이어에 다시 켜줘야 한다.
 */
function useMuteCommand(
  ref: RefObject<HTMLIFrameElement | null>,
  videoId: string | null,
  ready: boolean,
  muted: boolean,
) {
  useEffect(() => {
    if (!videoId || !ready) return;
    ref.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: muted ? "mute" : "unMute",
        args: [],
      }),
      EMBED_ORIGIN,
    );
  }, [ref, videoId, ready, muted]);
}

/**
 * 지금 포스터로 덮어야 하는지.
 *
 * enablejsapi=1로 띄운 embed는 "listening" 메시지를 받으면 그때부터 재생
 * 정보를 postMessage로 흘려보낸다(currentTime이 약 265ms마다, duration도
 * 같이). IFrame Player API 스크립트를 받지 않고 재생 위치를 아는 방법이다 —
 * 스크립트를 들이면 이 배경 하나 때문에 유튜브 JS를 통째로 받게 된다.
 *
 * 핸드셰이크는 iframe이 load된 뒤에 건다 — 그 전에는 찌를 상대가 없다.
 *
 * playerState는 일부러 안 본다. 그걸 조건에 넣으면 영상 중간에 버퍼링이
 * 걸릴 때마다 포스터가 번쩍인다. currentTime만 보면 버퍼링 중에는 값이
 * 멈춰 있을 뿐이라 덮개도 가만히 있는다.
 */
function usePosterCover(
  ref: RefObject<HTMLIFrameElement | null>,
  videoId: string | null,
  startAt: number,
  /** iframe이 YouTube 문서를 다 받았는지. 그 전에는 찌를 상대가 없다. */
  ready: boolean,
) {
  // boolean이 아니라 "어느 영상의 덮개를 걷었는지"를 들고 있는다. boolean이면
  // 항목이 바뀔 때 effect 본문에서 되돌려야 하는데 그건 렌더 연쇄라
  // react-hooks/set-state-in-effect가 막는다. id로 두면 videoId가 바뀌는
  // 순간 저절로 다시 덮인 상태가 된다 — 되돌릴 것이 없다.
  const [uncoveredId, setUncoveredId] = useState<string | null>(null);
  // 메시지를 한 번이라도 받았는지. 폴백 타이머와 메시지 구독이 서로 다른
  // effect라 state가 아니라 ref로 나눠 갖는다.
  const heardRef = useRef(false);

  // 핸드셰이크가 끝내 안 먹었을 때의 안전장치. iframe이 load되는지와 무관하게
  // 마운트 시점부터 재는 게 핵심이다 — load 자체가 안 되는 경우까지 덮는다.
  useEffect(() => {
    if (!videoId) return;
    heardRef.current = false;
    const fallback = setTimeout(() => {
      if (!heardRef.current) setUncoveredId(videoId);
    }, NO_MESSAGE_FALLBACK_MS);
    return () => clearTimeout(fallback);
  }, [videoId]);

  useEffect(() => {
    if (!videoId || !ready) return;

    // start로 건너뛰고 시작해도 UI는 "재생이 시작된 지점"부터 4초간 뜬다.
    const revealAt = startAt + CHROME_HIDE_AT;
    let duration = 0;
    let pingId: ReturnType<typeof setInterval> | undefined;

    function stopPinging() {
      if (pingId) clearInterval(pingId);
      pingId = undefined;
    }

    function onMessage(e: MessageEvent) {
      if (e.origin !== EMBED_ORIGIN) return;
      let data: unknown;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      // 여기까지 왔으면 embed가 말을 걸어온 것이다 — 핸드셰이크 성공.
      heardRef.current = true;
      stopPinging();

      const info = (data as { info?: unknown })?.info;
      if (!info || typeof info !== "object") return;
      const { currentTime, duration: dur } = info as {
        currentTime?: number;
        duration?: number;
      };
      // duration은 모든 메시지에 실려오지 않으므로 본 값을 기억해둔다.
      if (typeof dur === "number" && dur > 0) duration = dur;
      if (typeof currentTime !== "number") return;

      const nearSeam = duration > 0 && currentTime > duration - SEAM_LEAD;
      setUncoveredId(currentTime >= revealAt && !nearSeam ? videoId : null);
    }

    // load 이후에만 찌른다. 그 전 contentWindow는 about:blank(= 우리 origin)라
    // EMBED_ORIGIN을 target으로 쏘면 브라우저가 콘솔에 에러를 남긴다. 던지는
    // 게 아니라 찍기만 해서 try/catch로도 못 막는다.
    //
    // target을 "*"로 두면 에러는 사라지지만 핸드셰이크가 아무 프레임에나
    // 나간다. 배경 영상 하나 때문에 그걸 열어둘 이유는 없다.
    function ping() {
      ref.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        EMBED_ORIGIN,
      );
    }

    window.addEventListener("message", onMessage);
    ping();
    // load가 떴다고 프레임 안의 위젯이 리스너를 이미 건 것은 아니다.
    // 답이 올 때까지 짧게 반복해 찌른다.
    pingId = setInterval(ping, HANDSHAKE_PING_MS);

    return () => {
      window.removeEventListener("message", onMessage);
      stopPinging();
    };
  }, [ref, videoId, startAt, ready]);

  return uncoveredId !== videoId;
}

/**
 * 항목 뒤에 깔리는 배경 한 겹.
 *
 * 영상이 있으면 틀고, 없으면(여행·책·언어) 정지 이미지를 아주 느리게 민다.
 * reduced-motion일 때는 영상이 있어도 정지 이미지로 간다 — 자동재생이야말로
 * 그 설정이 피하려는 것이기 때문.
 */
export function LifeMediaBackground({
  media,
  muted = true,
}: {
  media: LifeMedia;
  muted?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const useVideo = !prefersReducedMotion;
  const videoId = media.kind === "youtube" && useVideo ? media.id : null;
  const startAt = (media.kind === "youtube" && media.start) || 0;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const ready = loadedId === videoId;
  const covered = usePosterCover(iframeRef, videoId, startAt, ready);
  useMuteCommand(iframeRef, videoId, ready, muted);

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
      ? thumbnailSrc(media.id)
      : media.kind === "image"
        ? media.src
        : media.kind === "gallery"
          ? (media.cover ?? media.photos[0]?.src ?? null)
          : null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {videoId ? (
        <>
          <iframe
            key={videoId}
            ref={iframeRef}
            src={embedSrc(videoId, startAt || undefined)}
            title=""
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            onLoad={() => setLoadedId(videoId)}
            className={iframeCover}
            style={{ scale: CHROME_CROP_SCALE }}
          />
          {/* YouTube UI가 떠 있는 동안 iframe을 덮는다. 배율을 영상과 똑같이
              맞춰야 걷힐 때 화면이 튀지 않는다 — object-cover만 걸면 영상보다
              넓은 화각이라 크로스페이드가 줌으로 보인다. */}
          <CoverPoster
            key={`poster-${videoId}`}
            id={videoId}
            covered={covered}
            className={imgCover}
          />
        </>
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

      {/* 스크림은 꽉 찬 그림 위에서만 의미가 있다. 깔린 게 없으면 배경색
          위에 같은 배경색을 겹치는 셈이라 그리지 않는다.

          글이 놓이는 왼쪽은 거의 불투명하게, 오른쪽은 배경이 비치도록.
          왼쪽이 충분히 불투명해야 본문 글자색을 토큰 그대로 둘 수 있다.

          값은 다크 모드 기준으로 잡혀 있다 — 어둡게 덮으면 영상의 색이 살아
          남지만 희게 덮으면 어떤 색이든 흰색 쪽으로 섞여 채도가 빠진다.
          그래서 오버레이는 라이트 테마에서도 다크 토큰으로 그린다
          (life-overlay.tsx의 Dialog.Popup에 붙은 `dark`). 여기서 `background`가
          늘 어두운 색인 것은 그 덕분이다. */}
      {videoId || stillSrc ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/30" />
        </>
      ) : null}
    </div>
  );
}

function thumbnailSrc(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

/**
 * 썸네일이 없을 때 i.ytimg.com이 대신 주는 회색 판의 가로 폭.
 *
 * maxres가 없는 영상을 요청하면 404가 오는데, 몸통이 비어 있지 않다 —
 * 120x90짜리 회색 JPEG가 `Content-Type: image/jpeg`로 멀쩡히 실려온다.
 * 브라우저는 디코드에 성공했으므로 error가 아니라 load를 쏜다(실측). 그래서
 * onError만 걸어둔 폴백은 영영 실행되지 않고, 화면에는 그 회색 판이 전체
 * 화면으로 늘어난 채 남는다. 크기로 걸러내는 수밖에 없다.
 */
const YT_PLACEHOLDER_WIDTH = 120;

/**
 * YouTube UI가 떠 있는 동안 iframe을 덮는 한 장.
 *
 * 상태(maxres -> hq 폴백)를 들고 있어야 해서 컴포넌트로 뺐다. 부모에서
 * key를 갈아 끼우면 항목이 바뀔 때 폴백 여부도 같이 초기화된다.
 *
 * 페이드가 비대칭인 게 중요하다. 걷을 때는 느긋해도 되지만 덮을 때는
 * 빨라야 한다 — 루프 이음매에서 버튼이 뜨기 전에 덮개가 이미 올라와
 * 있어야 하기 때문.
 */
function CoverPoster({
  id,
  covered,
  className,
}: {
  id: string;
  covered: boolean;
  className: string;
}) {
  const [src, setSrc] = useState(() => thumbnailSrc(id));

  // 일부 영상은 maxres 썸네일이 없다. hq로 한 단계 내려가고, 그것마저 없으면
  // 아무것도 그리지 않는다 — 회색 판을 띄우느니 영상을 그냥 보여주는 게 낫다.
  function downgrade() {
    setSrc((prev) =>
      prev.includes("maxresdefault")
        ? prev.replace("maxresdefault", "hqdefault")
        : "",
    );
  }

  if (!src) return null;

  return (
    // next/image를 쓰지 않는다: 정적 export(images.unoptimized)라 최적화가
    // 없고, 외부 호스트라 remotePatterns 설정만 늘어난다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      // 진짜 로드 실패(네트워크 등).
      onError={downgrade}
      // 로드에 성공해도 끝이 아니다. YT_PLACEHOLDER_WIDTH 주석 참고 —
      // 없는 썸네일은 "성공한 회색 판"으로 도착하므로 크기를 봐야 한다.
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= YT_PLACEHOLDER_WIDTH) downgrade();
      }}
      className={`${className} transition-opacity ease-out ${
        covered ? "opacity-100 duration-200" : "opacity-0 duration-700"
      }`}
      style={{ scale: CHROME_CROP_SCALE }}
    />
  );
}

/** 표지 높이. 폭은 판형에 맡기고 높이만 정한다 — LifeCoverPlate 주석 참고. */
const COVER_HEIGHT = "clamp(13rem, 44vh, 28rem)";
/**
 * 두께. 높이에 비례시키는 게 핵심이다.
 *
 * 고정 px로 두면 높이가 clamp로 13rem~28rem을 오가는 동안 두께만 그대로라,
 * 큰 화면에서는 종잇장처럼 얇고 작은 화면에서는 벽돌처럼 두꺼워진다.
 * 0.11은 시안에서 300px 높이에 34px가 맞아 보였던 비율이다.
 */
const COVER_THICKNESS = `calc(${COVER_HEIGHT} * 0.11)`;
/** 쉬고 있을 때 / 가리켰을 때 각도. 눌리는 물건이라는 걸 각도로 알린다. */
const COVER_ANGLE = -28;
const COVER_ANGLE_HOVER = -14;

/**
 * 페이지 단면. 종이 한 장이 1.5px, 사이 그늘이 1px인 결을 반복해 그린다.
 * 실제 종이 두께를 흉내내려는 게 아니라, 이 면이 "쌓인 종이"로 읽히기만
 * 하면 된다.
 */
const PAPER_EDGE =
  "repeating-linear-gradient(to right, #efe9db 0 1.5px, #cfc7b4 1.5px 2.5px, #e6dfd0 2.5px 4px)";
/** 책등. 가운데가 밝고 양끝이 어두워야 둥글게 말린 것처럼 보인다. */
const SPINE_SHADING =
  "linear-gradient(to right, rgba(0,0,0,0.55), rgba(255,255,255,0.10) 22%, rgba(0,0,0,0.30) 70%, rgba(0,0,0,0.6)), #16130f";

/**
 * 오른쪽에 세워두는 책 표지 한 권.
 *
 * 표지를 배경으로 꽉 채우지 않는 이유는 두 가지다. 표지는 판형이 정해진
 * 그림이라 object-cover로 늘리면 제목과 출판사 로고가 화면 밖으로 잘리고,
 * 세로로 긴 그림을 가로로 넓은 뷰포트에 맞추는 만큼 크게 확대돼 흐려진다.
 * 원래 비율 그대로 한 권 세워두면 둘 다 생기지 않는다.
 *
 * 크기는 높이로 정한다. 폭으로 정하면 판형이 다른 책마다(1984는 0.58,
 * 명상록은 0.67) 높이가 제각각이 되어 책을 바꿀 때 위아래로 널뛴다.
 *
 * 두께는 CSS 3D로 만든다. 면은 넷이면 충분하다 — 앞표지(그림), 뒤표지(실루엣을
 * 닫는 판), 책등, 그리고 페이지 단면. 두께 방향이 Z라서 앞표지가 +t/2, 뒤표지가
 * -t/2에 서고, 옆면 둘이 자기 모서리를 축으로 90도 접혀 그 사이를 잇는다.
 *
 * 원근은 조상에게 `perspective`를 주는 대신 이 요소의 transform에 직접
 * `perspective()`를 넣는다. 위에 부유 애니메이션 레이어가 끼어 있는데, 그
 * 레이어는 `transform-style: flat`이라 조상의 원근이 여기까지 닿지 않는다.
 */
export function LifeCoverPlate({
  media,
  title,
  locale,
}: {
  media: LifeCoverMedia;
  title: string;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const prefersReducedMotion = useReducedMotion();

  const faceBase = "absolute top-0 h-full";
  const book = (
    <motion.div
      className="relative"
      style={{
        transformStyle: "preserve-3d",
        transformPerspective: 1400,
        // 각도의 기준을 책등 쪽에 두면 회전이 "책을 정면으로 돌려세우는"
        // 움직임이 된다. 가운데를 기준으로 돌리면 제자리에서 비틀리기만 한다.
        originX: 0.15,
      }}
      initial={{ rotateY: COVER_ANGLE }}
      animate={{ rotateY: COVER_ANGLE }}
      whileHover={prefersReducedMotion ? undefined : { rotateY: COVER_ANGLE_HOVER }}
      whileFocus={prefersReducedMotion ? undefined : { rotateY: COVER_ANGLE_HOVER }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 뒤표지. 그림이 없으니 판형만 남긴다. */}
      <div
        className="absolute inset-0 rounded-l-[2px] rounded-r-sm bg-[#16130f]"
        style={{ transform: `translateZ(calc(${COVER_THICKNESS} / -2))` }}
      />
      {/* 책등: 왼쪽 모서리를 축으로 뒤로 접는다. */}
      <div
        className={`${faceBase} left-0 rounded-l-[2px]`}
        style={{
          width: COVER_THICKNESS,
          background: SPINE_SHADING,
          transformOrigin: "left center",
          transform: `translateZ(calc(${COVER_THICKNESS} / 2)) rotateY(90deg)`,
        }}
      />
      {/* 페이지 단면: 오른쪽 모서리를 축으로 뒤로 접는다. 위아래를 표지보다
          조금 들여야 종이 뭉치가 표지 안에 들어앉은 것처럼 보인다. */}
      <div
        className="absolute right-0"
        style={{
          top: "0.4%",
          height: "99.2%",
          width: COVER_THICKNESS,
          background: PAPER_EDGE,
          boxShadow: "inset 0 0 14px rgba(0,0,0,0.45)",
          transformOrigin: "right center",
          transform: `translateZ(calc(${COVER_THICKNESS} / 2)) rotateY(-90deg)`,
        }}
      />
      {/* 앞표지. 흐름에 남아 있는 유일한 면이라 이 그림이 상자 크기를 정한다.
          max-w-none이 필요하다: Tailwind preflight의 `img { max-width: 100% }`가
          그리드 칸 폭에 맞춰 아래 height로 정한 크기를 조용히 깎는다. */}
      {/* next/image를 쓰지 않는 이유는 CoverPoster 쪽 주석과 같다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.src}
        alt=""
        className="block w-auto max-w-none rounded-l-[2px] rounded-r-sm ring-1 ring-white/10"
        style={{
          height: COVER_HEIGHT,
          transform: `translateZ(calc(${COVER_THICKNESS} / 2))`,
        }}
      />
    </motion.div>
  );

  // 등장(한 번)과 부유(무한)를 두 겹으로 나눈다. 한 요소에 얹으면 Motion이
  // 같은 transform을 두고 다투고, y 키프레임이 initial 값을 무시해 튄다.
  return (
    <motion.div
      key={media.src}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      // 바닥 그림자는 여기 건다. .book에 filter를 걸면 안 된다 — filter는
      // grouping property라 preserve-3d를 flat으로 만들어 면들이 통째로
      // 납작해진다.
      style={{ filter: "drop-shadow(0 18px 26px rgba(0,0,0,0.55))" }}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      >
        {media.href ? (
          // 외부 주소라 next/link를 쓰지 않는다. Link가 얹어주는 프리페치와
          // 클라이언트 라우팅은 같은 앱 안에서만 의미가 있다.
          <a
            href={media.href}
            target="_blank"
            rel="noopener noreferrer"
            // 표지 그림의 alt는 비워 두었으므로 링크 이름을 여기서 준다.
            // 표지만 읽어주면 이게 눌러서 어디로 가는 물건인지 알 수 없다.
            aria-label={dict.life.bookPreviewAria(title)}
            className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
          >
            {book}
          </a>
        ) : (
          book
        )}
      </motion.div>
    </motion.div>
  );
}
