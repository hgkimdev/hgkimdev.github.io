"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import type { ProjectGroup, ProjectGroupKey } from "@/content/projects";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { useSlotFx } from "@/components/home-fx/effects";

/**
 * Projects 슬롯의 본문 — 왼쪽 목록 + 오른쪽 프리뷰 상자.
 *
 * 원래는 담백한 텍스트 행 목록이었다. 그때 근거는 "Life가 사진, Contact가
 * 마퀴를 쓰니 Projects는 절제한다"였는데, Life가 **활자 목차 + 배경 사진 벽**
 * 으로 다시 만들어지면서 그 전제가 뒤집혔다. 셋 다 "번호 + 이름 + 한 줄 +
 * 구분선"이 되었고, 그중 Projects만 얹힌 장치가 없어서 절제가 아니라 Life에서
 * 사진만 뺀 축소판으로 읽혔다. 1440x835 한 화면에 세 행이 220px만 쓰고
 * 위아래가 각각 280px씩 비는 것도 같은 문제의 다른 얼굴이다.
 *
 * 그래서 **목록 옆에 상자 하나**를 세운다. 행에 손이 닿으면 그 그림으로
 * 바뀐다. leerob.com이 쓰는 형태(좌: 텍스트 목록 / 우: 큰 그림 하나)이고,
 * 사진을 여러 장 늘어놓는 Life의 벽과 달리 한 번에 한 장만 보여주므로 두
 * 섹션이 같은 언어를 쓰지 않는다.
 *
 * **왜 hover로 펼치지 않나.** Life의 목차 줄은 손이 닿으면 아래로 항목
 * 제목들이 펼쳐진다. 여기서도 스택 칩을 그렇게 펼치면 두 섹션이 같은
 * 제스처를 갖게 되므로, 칩과 기간은 **처음부터 늘 보이게** 두고 hover가 하는
 * 일은 상자를 바꾸는 것 하나로 남긴다. 늘 보이는 칩이 빈 화면을 채우는
 * 몫까지 한다.
 *
 * 각 행은 진짜 링크다 — `/projects/{group.key}`로 이동하는 페이지 전환이지,
 * Life처럼 같은 화면 위에 여는 오버레이가 아니다.
 */

/**
 * 프리뷰에 쓸 파생본 경로. scripts/build-blog-images.mjs가 구워 둔다.
 *
 * 상자는 화면 폭에 따라 최대 465px로 서고 원본은 1920px짜리 스크린샷이다. 파일이 없으면(스크립트를 아직 안 돌렸으면)
 * onError가 원본으로 되돌린다 — life-entrance의 wallVariant와 같은 장치다.
 *
 * svg는 굽지 않는다(벡터라 구울 것이 없다). 그래서 그대로 돌려준다.
 */
function shotVariant(src: string) {
  if (src.endsWith(".svg")) return src;
  const key = src
    .replace(/^\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/\//g, "__");
  return `/_blog/${key}-shot960.webp`;
}

/**
 * 넓은 화면인지. life-entrance의 같은 이름 훅과 같은 장치이고 기준(48rem =
 * md)도 같다.
 *
 * 여기서는 **상자를 아예 그릴지 말지**를 가른다. 좁은 화면에는 목록 옆에
 * 상자를 세울 가로 여백이 없고, 손가락으로 보는 화면에는 hover도 오지 않아
 * 기본 항목(DEFAULT_PREVIEW_KEY)의 그림만 붙박이로 남는다. `hidden md:block`으로 숨기는 것과 다르다 —
 * display:none이어도 브라우저는 그림을 받아온다. 좁은 화면이 쓰지도 않을
 * 스크린샷을 받게 하지 않으려면 DOM에 넣지 않아야 한다.
 *
 * **서버 스냅샷이 `false`인 것**이 이 훅의 핵심이다. life-entrance의 같은
 * 훅은 넓은 쪽(true)으로 그리는데, 거기서는 그 값이 "벽에 무엇을 거느냐"만
 * 가르므로 어느 쪽으로 찍어도 받는 파일 수가 같다. 여기서는 값이 곧 "그림을
 * 받느냐"라 다르다 — true로 두면 정적 export된 HTML에 상자가 박힌 채로
 * 나가고, 하이드레이션이 그걸 지우기 전에 브라우저가 이미 다 받아온다(실측:
 * 390px 뷰포트에서 webp 2장 + svg 1장이 그대로 요청됐다).
 *
 * 대신 넓은 화면은 하이드레이션 뒤에야 그림을 받기 시작한다. 상자 자리는
 * 그리드가 CSS로 이미 잡아두고 bg-muted가 깔려 있어 레이아웃은 흔들리지
 * 않는다.
 */
const WIDE_QUERY = "(min-width: 48rem)";

function subscribeWide(onChange: () => void) {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

/**
 * 손이 닿기 전 상자에 걸어 둘 줄.
 *
 * 상자를 비워두지 않는다는 원래 이유는 그대로고(아래 `active` 주석), 어느
 * 줄로 시작할지만 목록 순서에서 떼어낸 값이다. 그래서 content/projects.ts의
 * 배열 순서를 바꿔도 기본 그림은 따라 움직이지 않는다.
 *
 * 이 값이 정하는 것은 **상자에 걸리는 그림뿐**이다. 목록에서 그 줄이 활성으로
 * 보이지는 않는다 — 들여쓰기는 손이 닿았다는 표시이므로, 아무도 닿지 않은
 * 처음에는 어느 줄에도 붙지 않아야 한다.
 *
 * 키를 못 찾으면 첫 줄로 돌아간다 — 그룹 키를 지웠을 때 상자가 빈 채로
 * 남지 않게.
 */
const DEFAULT_PREVIEW_KEY: ProjectGroupKey = "claude-tools";

export function ProjectsEntrance({
  groups,
  locale,
  animateIn = false,
}: {
  groups: ProjectGroup[];
  locale: Locale;
  /** 행이 스스로 등장 애니메이션을 재생할지. Life Poster의 같은 이름 prop과
   * 같은 이유 — 핀 고정 스크롤 안에서는 레이어 크로스페이드가 등장을 이미
   * 맡으므로 reduced-motion 스택 경로에서만 켠다. */
  animateIn?: boolean;
}) {
  // 손이 닿은 줄. 아직 아무도 닿지 않았으면 null이고, 그동안 목록에는 활성
  // 표시가 하나도 없다.
  const [active, setActive] = useState<number | null>(null);

  // 상자에 걸리는 줄. 상자를 비워두면 손이 닿기 전까지 무엇을 하는 자리인지
  // 알 수 없으므로 활성 줄이 없을 때도 한 장은 걸어 둔다 — 어느 것인지는
  // DEFAULT_PREVIEW_KEY가 정한다.
  const fallback = groups.findIndex(
    (group) => group.key === DEFAULT_PREVIEW_KEY,
  );
  const shown = active ?? (fallback === -1 ? 0 : fallback);
  const wide = useWide();

  return (
    // 칸을 넓히는 일은 여기가 아니라 home-sections.tsx의 SectionContent가
    // 한다(Projects 슬롯만 max-w-[68rem]). 제목과 본문이 같은 상자를 써야
    // 가운데 정렬이 유지되기 때문이다 — 자세한 이유는 그쪽 주석에 있다.
    //
    // 상자 폭을 고정(30rem)이 아니라 비율로 잡는 이유: 고정으로 두면 1024px
    // 화면에서 목록 359 / 상자 441이 되어 **읽을 것보다 그림이 커지는** 역전이
    // 났다. 비율이면 어느 폭에서든 목록이 더 넓다.
    <div className="flex flex-col gap-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,44%)] md:items-center md:gap-12">
      <ul className="flex flex-col border-t border-border/60">
        {groups.map((group, index) => (
          <ProjectRow
            key={group.key}
            group={group}
            locale={locale}
            index={index}
            count={groups.length}
            animateIn={animateIn}
            active={index === active}
            onEnter={() => setActive(index)}
          />
        ))}
      </ul>

      {wide ? <Preview groups={groups} active={shown} /> : null}
    </div>
  );
}

/**
 * 그림 상자. 세 장을 모두 겹쳐 두고 불투명도만 바꾼다.
 *
 * 활성 항목만 그리면 전환이 깜빡임이 된다(새 그림이 디코드될 때까지 빈 칸).
 * 겹쳐 두면 이미 받아둔 그림끼리 교차되므로 손을 옮기는 속도로 따라온다.
 *
 * aria-hidden인 이유는 content/projects.ts의 preview 주석에 있다 — 바로 옆
 * 목록이 이미 같은 말을 하고 있다.
 */
function Preview({
  groups,
  active,
}: {
  groups: ProjectGroup[];
  active: number;
}) {
  return (
    <div
      aria-hidden
      // 따로 상한을 두지 않는다. 바깥 칸이 68rem에서 멈추므로 44%인 이 상자도
      // 465px 위로는 자라지 않는다 — 화면이 아무리 커져도 같은 크기다.
      //
      // 바탕을 muted가 아니라 background로 둔다. 스크린샷 둘은 상자를 꽉 채워
      // 이 색이 보이지 않지만, clawd.svg는 배경이 투명이라 이 색이 그대로
      // 캐릭터 주변이 된다 — 페이지와 같은 색이어야 판이 아니라 여백으로
      // 읽힌다. svg 쪽을 투명하게 둔 이유는 그 파일 주석에 있다(테마).
      className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-background"
    >
      {groups.map((group, index) => (
        <Shot
          key={group.key}
          src={group.preview.src}
          active={index === active}
        />
      ))}
    </div>
  );
}

function Shot({ src, active }: { src: string; active: boolean }) {
  const [source, setSource] = useState(() => shotVariant(src));

  return (
    // next/image를 쓰지 않는다: 정적 export(images.unoptimized)라 최적화가
    // 돌지 않고, 파생본은 이미 구워 뒀다. life-media.tsx의 같은 판단과 같다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt=""
      decoding="async"
      onError={() => setSource(src)}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        active ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

function ProjectRow({
  group,
  locale,
  index,
  count,
  animateIn,
  active,
  onEnter,
}: {
  group: ProjectGroup;
  locale: Locale;
  index: number;
  count: number;
  animateIn: boolean;
  active: boolean;
  onEnter: () => void;
}) {
  const number = String(index + 1).padStart(2, "0");
  // 핀 고정 스크롤 안에서는 Home의 섹션 연출이 이 행의 등장 방식을 정한다. 밖(=스택
  // 경로)에서는 passthrough라 아래 `entrance`가 그대로 motion.li에 붙는다.
  const { Item } = useSlotFx();

  const entrance = animateIn
    ? ({
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.4, delay: index * 0.06, ease: "easeOut" },
      } as const)
    : undefined;

  // 스택은 그룹이 아니라 항목이 들고 있다. "Claude 도구"처럼 항목이 둘인
  // 줄에서는 둘의 스택이 겹치므로(둘 다 Claude Code) 중복을 걷어낸다.
  //
  // 세 개까지만 낸다. Langport는 여섯 개(Next.js 16·TypeScript·Tailwind v4·
  // next-intl·shadcn/ui·Framer Motion)라 한 줄을 넘겨 두 줄이 됐고, 그 줄만
  // 높아져 목록의 리듬이 깨졌다. 여기는 무엇으로 만들었는지 훑는 자리지
  // 전부 세는 자리가 아니다 — 나머지는 상세 페이지가 다 보여준다.
  // 배열 순서가 곧 대표성 순서다(content/projects.ts).
  const STACK_LIMIT = 3;
  const stack = [
    ...new Set(group.items.flatMap((item) => item.stack ?? [])),
  ].slice(0, STACK_LIMIT);

  // 상태는 그룹이 직접 든다(content/projects.ts의 `status`). 항목의 `tags`를
  // 긁어모으지 않는 이유는 그 필드 주석에 있다 — 도구 두 개가 묶인 줄에서는
  // 한 항목의 꼬리표가 줄 전체의 상태처럼 읽혔다.
  const status = group.status;

  return (
    <Item index={index} count={count} {...entrance}>
      {/* hover가 하는 일은 셋뿐이다: 이 줄의 아래쪽 구분선 색, 왼쪽 여백,
          화살표 이동. 그리고 옆 상자의 그림이 바뀐다. 포인터가 없는 기기를
          위해 focus-visible에도 똑같이 건다 — 탭으로 훑어도 상자가 따라온다. */}
      <Link
        href={localizeHref(`/projects/${group.key}`, locale)}
        onPointerEnter={onEnter}
        onFocus={onEnter}
        className={`group flex items-start gap-4 border-b border-border/60 py-5 transition-[padding-left,border-color] duration-200 hover:border-foreground/40 hover:pl-2 focus-visible:border-foreground/40 focus-visible:pl-2 focus-visible:outline-none [@media(max-height:620px)]:py-3 ${
          active ? "md:pl-2" : ""
        }`}
      >
        <span className="pt-1 font-mono text-sm text-muted-foreground">
          {number}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
            <span className="text-lg font-semibold tracking-tight break-keep">
              {group.label}
            </span>
            <span className="truncate text-sm break-keep text-muted-foreground">
              {group.teaser}
            </span>
          </span>
          {/* 칩은 늘 보인다(펼치지 않는다) — 위 컴포넌트 주석의 "왜 hover로
              펼치지 않나" 참고. 화면이 낮으면 줄바꿈 한 줄이 아쉬우므로
              숨긴다. */}
          {stack.length > 0 || status ? (
            <span className="flex flex-wrap gap-1.5 [@media(max-height:620px)]:hidden">
              {stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-muted px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
              {/* 채우지 않고 **테두리만** 두른다. 처음에는 반전(bg-foreground)으로
                  칠했는데 대비가 너무 세서, 훑어야 할 이름보다 상태가 먼저
                  눈에 들어왔다. 칠하기 대신 윤곽으로 갈라두면 스택 칩과
                  구분은 되면서 줄의 주인공 자리를 뺏지 않는다. */}
              {status ? (
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
                  {status}
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
        <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
      </Link>
    </Item>
  );
}
