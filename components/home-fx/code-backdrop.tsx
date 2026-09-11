import type { ReactNode } from "react";

/**
 * About 슬롯의 배경 — 이 사이트의 소스가 화면 뒤로 계속 흘러 내려간다.
 *
 * **왜 흐르나.** Life의 사진 벽과 같은 이유다(life-entrance.tsx의 FlowingWall
 * 주석). 멈춰 있으면 "코드 스크린샷 한 장"으로 읽히고, 천천히 흐르면 화면
 * 밖에도 계속 이어진다는 뜻이 된다. 방향도 거기와 같은 아래쪽이다 — 두 섹션이
 * 한 페이지에서 반대로 흐르면 스크롤 방향이 어느 쪽인지 헷갈린다.
 *
 * **왜 서버 컴포넌트인가.** 아래의 하이라이터와 원본 문자열은 한 번 돌아 고정된
 * 결과를 내는데, home-sections.tsx가 "use client"라 거기서 import하면 토크나이저와
 * 원본이 통째로 Intro 번들에 실린다. ContactSection과 같은 처리다 — home-content.tsx가
 * 서버에서 만들어 완성된 ReactNode로 넘긴다.
 *
 * **왜 innerHTML인가.** 결과가 span 수백 개인데, 이걸 React 엘리먼트로 만들면
 * 그 트리가 통째로 RSC 페이로드에 직렬화된다. 상호작용도 상태도 없는 순수 장식이라
 * 문자열 한 벌이 훨씬 싸다. 원본은 아래 SOURCE 상수뿐이고 바깥에서 들어오는 값이
 * 없으므로 주입 경로가 없다.
 */

/**
 * 배경에 흐르는 코드. 지어낸 코드가 아니라 components/home-fx/geometry.ts —
 * 지금 이 배경이 얹혀 있는 핀 고정 스크롤을 계산하는 바로 그 파일이다.
 * 발췌라 앞뒤가 이어지지 않아도 되고, 순서도 원본과 다르다(아래 참고).
 *
 * **주석은 영어만 쓴다. 한국어 주석을 번역해 넣지 말 것.** 원본은 두 언어가
 * 섞여 있지만 여기 걸린 코드는 /en 방문자도 읽는다. 번역해 채우면 통일은
 * 되지만 리포에 없는 코드가 되고, 그 순간 "진짜 내 소스가 흐른다"는 이 배경의
 * 유일한 근거가 사라진다. 그래서 **원래 영어로 쓰인 구간만 골라** 옮겼다 —
 * 잘라낸 자리는 있어도 고쳐 쓴 문장은 하나도 없다.
 *
 * **순서를 바꾼 이유.** 화면에 65줄이 다 보이지 않는다. 900px 뷰포트 기준
 * 프레임에 35줄이 들어오고 위아래 페이드를 빼면 또렷한 건 5~28번 줄뿐이며,
 * 흐름이 11.7px/s라 잠깐 머무는 사람에게는 사실상 정지된 한 화면이다. 원본
 * 순서로 두면 그 자리를 구간별 선형보간(interpolateClamped) 본문이 절반 넘게
 * 차지했다 — 정확하지만 누구나 쓰는 유틸이라 보여 줄 게 없다. 그래서 도메인이
 * 한눈에 들어오는 Slot 타입과 측정된 상수들을 그 띠로 올리고, 보간 함수는 맨
 * 아래로 내렸다.
 *
 * **길이가 기하의 일부다.** 아래 트랙은 같은 내용을 세 벌 쌓아 한 벌 높이만큼
 * 움직이므로(globals.css의 code-backdrop-flow 주석), 한 벌이 벽 높이의 절반보다
 * 커야 구멍이 안 생긴다. 지금 65줄 × 24.7px = 1606px이라 뷰포트가 3277px가 될
 * 때까지 버틴다. 줄을 덜어낼 때는 이 여유를 확인할 것.
 *
 * 백틱은 이스케이프한다 — 원본 주석이 `viewportUnit`처럼 백틱을 쓰는데 그대로
 * 두면 이 템플릿 리터럴이 거기서 끝난다. String.raw를 못 쓰는 이유도 같다
 * (거기서는 이스케이프의 역슬래시가 화면에 그대로 나온다).
 */
const SOURCE = `// Pinned-scroll geometry, lifted out of components/home-sections.tsx so the
// per-section effects in ./effects.tsx can key themselves to exactly the same
// windows the layer crossfade uses. Pure math over scroll progress — no React,
// no DOM.

export type Slot = {
  start: number; // progress at which this slot is fully opaque
  end: number; // progress at which the next slot takes over (=== next.start)
  weight: number; // viewports of scroll runway
  isFirst: boolean;
  isLast: boolean;
};

// Every motion constant here is measured in *viewports of scroll* — the only
// unit that stays meaningful once slots have different weights.
export const RAMP_VIEWPORTS = 0.35; // layer crossfade length
export const DRIFT_PX = 16;
export const REVEAL_LEAD_VIEWPORTS = 0.35; // beat after arrival before para 2
export const REVEAL_DUR_VIEWPORTS = 0.7; // one paragraph's fade-up
export const REVEAL_DWELL_VIEWPORTS = 0.35; // all-revealed hold before the out-ramp

export function buildSlots(weights: number[]) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  // A \`totalWeight\`-viewport container only scrolls \`totalWeight - 1\` viewports
  // past the sticky frame, so one viewport of scroll is 1/(totalWeight - 1) of
  // progress.
  const viewportUnit = totalWeight > 1 ? 1 / (totalWeight - 1) : 1;
  const offsets = [0];
  for (const w of weights) offsets.push(offsets[offsets.length - 1] + w);
  const slots: Slot[] = weights.map((weight, i) => ({
    weight,
    start: offsets[i] * viewportUnit,
    end: offsets[i + 1] * viewportUnit,
    isFirst: i === 0,
    isLast: i === weights.length - 1,
  }));
  // \`ramp\` is a constant 0.35 viewports of scroll, NOT 0.35 of a slot: a slot
  // with weight 3 must not get a 1.05-viewport crossfade that eats a third of
  // its reveal runway.
  const ramp = RAMP_VIEWPORTS * viewportUnit;
  return { slots, offsets, totalWeight, viewportUnit, ramp };
}

// The scroll wheel is the clock in this file, so every ease is a shaping
// function over a 0..1 window, never a duration.
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function interpolateClamped(
  v: number,
  input: number[],
  output: number[],
): number {
  if (v <= input[0]) return output[0];
  const last = input.length - 1;
  if (v >= input[last]) return output[last];
  for (let i = 0; i < last; i++) {
    if (v <= input[i + 1]) {
      const t = (v - input[i]) / (input[i + 1] - input[i]);
      return output[i] + t * (output[i + 1] - output[i]);
    }
  }
  return output[last];
}`;

/**
 * 토큰 종류별 클래스. 색은 globals.css의 Tokyo Night 토큰이 준다.
 * 평범한 식별자와 구두점은 감싸지 않는다 — 노드 수가 40% 줄고, 어차피
 * 이 불투명도에서는 본문색과 구분되지 않는다.
 */
const KEYWORDS = new Set([
  "import",
  "export",
  "from",
  "type",
  "const",
  "let",
  "function",
  "return",
  "if",
  "else",
  "for",
  "of",
  "in",
  "new",
  "interface",
  "default",
  "async",
  "await",
  "typeof",
  "as",
  "void",
  "null",
  "undefined",
  "true",
  "false",
]);

const TYPES = new Set(["number", "string", "boolean", "Slot"]);

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 배경 장식용 초경량 토크나이저. 정확한 TS 파서일 필요가 없다 — 22% 불투명도로
 * 흐르는 글자에서 틀린 색 하나는 보이지 않고, Shiki를 여기 끌어오면 이 장식
 * 하나 때문에 빌드에 문법 정의가 통째로 들어온다(블로그 본문은 이미 Shiki를
 * 쓰지만 거기는 실제로 읽는 코드다).
 */
const TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/gm;

function highlight(line: string) {
  let out = "";
  let cursor = 0;
  for (const match of line.matchAll(TOKEN)) {
    const [token, comment, str, num, word] = match;
    const at = match.index;
    out += escapeHtml(line.slice(cursor, at));
    cursor = at + token.length;
    if (comment) out += `<i class="cb-c">${escapeHtml(comment)}</i>`;
    else if (str) out += `<i class="cb-s">${escapeHtml(str)}</i>`;
    else if (num) out += `<i class="cb-n">${num}</i>`;
    else if (word) {
      // 여는 괄호가 바로 뒤에 오면 호출/정의로 본다. `if (`처럼 예약어가 앞설
      // 때가 있으므로 예약어 판정이 먼저다.
      if (KEYWORDS.has(word)) out += `<i class="cb-k">${word}</i>`;
      else if (TYPES.has(word)) out += `<i class="cb-t">${word}</i>`;
      else if (line[cursor] === "(") out += `<i class="cb-f">${word}</i>`;
      else out += word;
    }
  }
  return out + escapeHtml(line.slice(cursor));
}

/**
 * 한 벌. 줄 번호는 원본의 줄 번호가 아니라 1부터 다시 센다 — 세 벌이 이어져
 * 흐르므로 이음매에서 번호가 튀지 않으려면 벌마다 같아야 한다. 정작 그
 * 이음매는 화면 밖 페이드 안에 있어서, 번호는 "코드처럼 보이게" 하는 장치일 뿐이다.
 */
const COPY = SOURCE.split("\n")
  .map(
    (line, i) =>
      `<span class="cb-g">${String(i + 1).padStart(2, " ")}</span>${highlight(line)}`,
  )
  .join("\n");

const TRACK = `${COPY}\n${COPY}\n${COPY}`;

export function CodeBackdrop(): ReactNode {
  return (
    <div
      aria-hidden
      /* 가로는 Life 벽과 같다 — SectionContent의 상자는 본문 폭(max-w-4xl)이고
       그 50%가 곧 남는 여백이라, `calc(50% - 50vw)`가 정확히 뷰포트
       가장자리에 닿는다.

       세로는 다르다. Life 벽은 프레임보다 큰 판(118dvh)을 잡지만, 여기서는
       **프레임과 정확히 같아야** 한다. 아래위 페이드가 이 판의 끝에 붙어
       있어서, 판이 프레임보다 크면 페이드가 보이지 않는 자리로 밀려나고
       글자가 프레임 모서리에서 획 중간에 잘린다(실제로 그렇게 나왔다).
       사진 벽은 잘려도 사진이지만 코드는 잘리면 고장 난 것처럼 보인다.

       프레임(= 레이어의 상자)은 `100dvh - 헤더`인데, 이 판의 기준점인
       SectionContent는 그 레이어 안에서 `justify-center`에 `pb-헤더`를
       받으므로 프레임 한가운데보다 헤더의 **절반**만큼 위에 앉는다. top에
       그만큼 도로 더해 두 중심을 맞춘다. */
      className="pointer-events-none absolute -z-10 top-[calc(50%+var(--header-height)/2)] left-[calc(50%-50vw)] right-[calc(50%-50vw)] h-[calc(100dvh-var(--header-height))] -translate-y-1/2 overflow-hidden"
    >
      <pre className="code-backdrop">
        <code
          className="code-backdrop-track"
          dangerouslySetInnerHTML={{ __html: TRACK }}
        />
      </pre>

      {/* 위아래 페이드. mask-image가 아니라 배경색 그라디언트 두 장인 것도 Life
        벽과 같은 이유다 — 마스크를 쓰면 흐르는 트랙이 그 마스크 표면 안에서
        매 프레임 다시 칠해진다. 뒤가 늘 단색 배경이라 결과는 같다. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      {/* 글 뒤를 비우는 스크림. Life 벽은 여기서 가장자리가 분명한 불투명 판을
          썼는데, 거기서 반투명 겹이 실패한 건 사진이 "흐릿한 유령"이 되기
          때문이었다. 글자는 다르다 — 옅어지면 획이 배경으로 사라질 뿐 중간
          상태가 남지 않는다.

          실제로 여기서도 불투명한 판을 한 번 대 봤다. 번호부터 본문 끝까지
          확실히 비워 주지만, 글 상자가 넓어서(max-w-4xl) 화면에 남는 코드가
          왼쪽 띠 하나뿐이 된다 — 배경이 "코드가 흐른다"에서 "위아래에 코드
          띠가 있다"로 바뀐다. 그래서 가운데조차 완전히 덮지 않는 이 그라디언트로
          되돌렸다. 대가는 "01 / 04" 뒤로 코드가 비친다는 것이고, 그건 감수한다.

          중심이 판의 한가운데가 아닌 이유는 판 자체의 기하와 같다(위 주석) —
          글 덩어리가 프레임 중앙보다 헤더의 절반만큼 위에 앉는다. */}
      <div className="code-backdrop-scrim absolute inset-0" />
    </div>
  );
}
