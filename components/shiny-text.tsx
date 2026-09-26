import type { CSSProperties } from "react";

/**
 * 글자 위를 하이라이트가 훑고 지나가는 효과.
 *
 * 구동은 전부 CSS 애니메이션이다. 원래는 `useAnimationFrame`으로 매 프레임
 * background-position을 직접 써 넣었는데, 그 방식은 브라우저가 멈춰줄 수가
 * 없다 — JS 루프라 화면 밖이든, opacity 0인 조상 아래에 깔려 있든, 탭을
 * 보고 있는 한 계속 돈다. 이 사이트에서는 그게 특히 나빴다. 홈의 핀 고정
 * 스크롤은 모든 레이어를 항상 마운트해 두므로, 히어로가 한참 전에 사라진
 * 뒤에도 이 루프는 영원히 돌고 있었다.
 *
 * CSS로 넘기면 소유권이 브라우저로 간다. 그리지 않는 요소의 애니메이션은
 * 알아서 건너뛴다. 덤으로 이 파일에는 훅이 하나도 남지 않아 서버 컴포넌트로
 * 렌더된다.
 */
interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  delay?: number;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 2,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  delay = 0,
}) => {
  // speed<=0이면 아래 % 계산과 `${cycle}s`가 0/음수가 되어 애니메이션이
  // 조용히 죽는다. 정지시키고 싶으면 `disabled`를 쓰라는 뜻으로, speed 자체는
  // 항상 양수로 클램프한다.
  const safeSpeed = Math.max(speed, 0.01);

  // 한 주기 = 훑는 시간 + 끝에서 쉬는 시간. CSS의 animation-delay는 첫 회에만
  // 걸리므로 반복되는 쉼에는 못 쓴다. 대신 주기를 늘리고 easing으로 뒷부분을
  // 눌러 붙인다 — linear()가 진행도 1에 먼저 도달한 뒤 그대로 머무르므로,
  // 그 구간이 곧 쉼이다.
  const cycle = safeSpeed + delay;
  const timingFunction =
    delay > 0
      ? `linear(0 0%, 1 ${((safeSpeed / cycle) * 100).toFixed(2)}%, 1 100%)`
      : "linear";

  // 방향은 키프레임을 뒤집지 않고 재생 방향으로 준다. yoyo면 왕복(alternate),
  // 아니면 매번 같은 쪽으로.
  const animationDirection = yoyo
    ? direction === "left"
      ? "alternate"
      : "alternate-reverse"
    : direction === "left"
      ? "normal"
      : "reverse";

  const style: CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: "200% auto",
    // 애니메이션이 꺼져 있을 때 하이라이트가 놓이는 자리. 화면 밖이라 글자는
    // `color` 단색으로 보인다.
    backgroundPosition: "150% center",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    ...(disabled
      ? null
      : {
          animationName: "shiny-text",
          animationDuration: `${cycle}s`,
          animationTimingFunction: timingFunction,
          animationIterationCount: "infinite",
          animationDirection,
        }),
  };

  return (
    <span
      className={`inline-block motion-reduce:[animation-name:none] ${
        pauseOnHover ? "hover:[animation-play-state:paused]" : ""
      } ${className}`}
      style={style}
    >
      {text}
    </span>
  );
};

export default ShinyText;
