"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { contactChannels, type ContactChannel } from "@/content/contact";
import { contactIcons } from "@/components/contact-icons";
import { useSlotFx } from "@/components/home-fx/effects";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";

// hover 중에만 돈다 — ShinyText와 달리 handle을 실제 글자로 수렴시켜야 해서
// CSS만으로는 안 되고 rAF로 프레임마다 표시 문자열을 새로 그린다. 비활성일
// 때는 effect에서 setState로 리셋하지 않고 원본 text를 그대로 반환한다 —
// scrambled는 다음 hover에서 프레임 0부터 다시 계산되므로 남아 있어도 무해하다.
function useScramble(text: string, active: boolean) {
  const [scrambled, setScrambled] = useState(text);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let frame = 0;
    const total = 14;
    function tick() {
      frame++;
      const revealCount = Math.floor((frame / total) * text.length);
      // 첫 글자부터 확정되며 오른쪽으로 진행 — 배경 마퀴가 왼쪽에서 들어와
      // 오른쪽으로 흐르는 방향과 맞춘 것.
      setScrambled(
        text
          .split("")
          .map((c, i) =>
            i < revealCount
              ? c
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
          )
          .join(""),
      );
      if (frame < total) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, text]);

  return active ? scrambled : text;
}

const marqueeStyle: CSSProperties = {
  animationName: "contact-marquee",
  animationDuration: "40s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
};

function ContactRow({
  channel,
  index,
  count,
}: {
  channel: ContactChannel;
  index: number;
  count: number;
}) {
  const { key, href, label, handle, external } = channel;
  const Icon = contactIcons[key];
  // 핀 고정 스크롤 안에서는 Home의 섹션 연출이 이 행의 등장 방식을 정한다(li 자체에
  // 걸려야 divide-y 구분선까지 같이 따라온다). 밖에서는 그냥 li다.
  const { Item } = useSlotFx();
  const [hovered, setHovered] = useState(false);
  const scrambled = useScramble(handle, hovered);
  const repeatedLabel = Array.from({ length: 8 }, () => label.toUpperCase()).join("   ·   ");

  return (
    <Item
      index={index}
      count={count}
      className="group relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 배경 마퀴: 이 바깥 div가 absolute inset-0로 잘라내는 창이고, 안쪽
          트랙은 w-fit으로 콘텐츠(반복 라벨 두 벌) 너비만큼만 잡는다 —
          contact-marquee 키프레임 주석 참고. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          style={marqueeStyle}
          className="flex h-full w-fit items-center whitespace-nowrap text-4xl font-bold tracking-tight text-foreground/[0.05] transition-colors duration-300 group-hover:text-foreground/[0.1] motion-reduce:[animation-name:none] sm:text-5xl [@media(max-height:620px)]:text-3xl"
        >
          <span className="pr-8">{repeatedLabel}</span>
          <span className="pr-8">{repeatedLabel}</span>
        </div>
      </div>
      <a
        href={href}
        className="relative flex items-center gap-4 px-2 py-5 [@media(max-height:620px)]:py-3"
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        <Icon size={18} color="currentColor" />
        <span className="font-medium text-foreground">{label}</span>
        <span className="ml-auto font-mono text-sm text-muted-foreground">{scrambled}</span>
      </a>
    </Item>
  );
}

export function ContactSection() {
  return (
    <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
      {contactChannels.map((channel, index) => (
        <ContactRow
          key={channel.key}
          channel={channel}
          index={index}
          count={contactChannels.length}
        />
      ))}
    </ul>
  );
}
