import { useEffect, useMemo, useRef, useState } from "react";

const RADIUS = 78; // px from the center to each emoji
const DEAD_ZONE = 22; // px; inside this, nothing is highlighted
const MARGIN = RADIUS + 36; // keep the whole wheel on screen

// The ring: the quick-pick emoji with "+" (open the full picker) halfway
// round. The ring is rotated so "+" always sits exactly at the bottom center,
// however many emoji there are.
const MORE = "more";

function ringFor(emojis: readonly string[]) {
  const half = Math.ceil(emojis.length / 2);
  const slots = [...emojis.slice(0, half), MORE, ...emojis.slice(half)];
  const step = (2 * Math.PI) / slots.length;
  // Screen angles: 0 = right, +π/2 = straight down. Put slot `half` ("+") there.
  const offset = Math.PI / 2 - half * step;
  return { slots, step, offset };
}

export type WheelMode = "hold" | "click";

type Props = {
  at: { x: number; y: number }; // viewport px
  mode: WheelMode; // "hold": release E to pick; "click": click an emoji
  emojis: readonly string[]; // quick picks (today's theme's, or the default set)
  current: string;
  onPick: (emoji: string) => void;
  onMore: () => void; // open the full emoji picker
  onClose: () => void;
};

// A FigJam-style emote wheel: emoji arranged in a ring around the pointer.
// Point toward one to highlight it. "+" at the bottom opens every emoji.
export function EmojiWheel({ at, mode, emojis, current, onPick, onMore, onClose }: Props) {
  const { slots: SLOTS, step, offset } = useMemo(() => ringFor(emojis), [emojis]);
  const center = {
    x: clamp(at.x, MARGIN, window.innerWidth - MARGIN),
    y: clamp(at.y, MARGIN, window.innerHeight - MARGIN),
  };
  const [highlight, setHighlight] = useState<number | null>(() => {
    if (mode !== "click") return null;
    const i = SLOTS.indexOf(current);
    return i === -1 ? 0 : i;
  });
  const highlightRef = useRef(highlight);
  highlightRef.current = highlight;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function choose(i: number) {
    const slot = SLOTS[i];
    if (slot === MORE) onMore();
    else onPick(slot);
  }

  // Point toward an emoji to highlight it.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - center.x;
      const dy = e.clientY - center.y;
      if (Math.hypot(dx, dy) < DEAD_ZONE) return setHighlight(null);
      const n = SLOTS.length;
      const turns = (Math.atan2(dy, dx) - offset) / step; // in slots, from slot 0
      setHighlight(((Math.round(turns) % n) + n) % n);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [center.x, center.y, SLOTS, step, offset]);

  // Hold mode: releasing E picks whatever is highlighted.
  useEffect(() => {
    if (mode !== "hold") return;
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "e") return;
      const i = highlightRef.current;
      if (i === null) onClose();
      else choose(i);
    };
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  });

  // Click mode: keyboard support and focus.
  useEffect(() => {
    if (mode !== "click") return;
    buttons.current[highlightRef.current ?? 0]?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      const n = SLOTS.length;
      const i = highlightRef.current ?? 0;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((i + 1) % n);
        buttons.current[(i + 1) % n]?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((i - 1 + n) % n);
        buttons.current[(i - 1 + n) % n]?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, onClose, SLOTS]);

  return (
    <div
      className="wheel-backdrop"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="wheel"
        role="dialog"
        aria-label="Pick your stamp emoji"
        style={{ left: center.x, top: center.y }}
        data-testid="emoji-wheel"
      >
        <div className="wheel-ring" />
        <div className="wheel-center" aria-hidden>
          {highlight !== null && SLOTS[highlight] !== MORE ? SLOTS[highlight] : current}
        </div>
        {SLOTS.map((emoji, i) => {
          const angle = offset + i * step;
          const x = Math.cos(angle) * RADIUS;
          const y = Math.sin(angle) * RADIUS;
          const more = emoji === MORE;
          const classes = ["wheel-emoji", more && "wheel-more", i === highlight && "highlighted", emoji === current && "current"]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={emoji}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              className={classes}
              style={{ "--x": `${x}px`, "--y": `${y}px`, "--delay": `${i * 18}ms` } as React.CSSProperties}
              aria-label={more ? "More emoji" : `Stamp with ${emoji}`}
              aria-pressed={more ? undefined : emoji === current}
              aria-haspopup={more ? "dialog" : undefined}
              onPointerEnter={() => setHighlight(i)}
              onClick={() => choose(i)}
              data-testid={more ? "wheel-more" : undefined}
            >
              {more ? "+" : emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), Math.max(min, max));
}
