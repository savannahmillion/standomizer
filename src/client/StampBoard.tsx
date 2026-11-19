import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { Board } from "../shared/daily";
import type { PublicUser } from "../shared/messages";
import type { Stamp, StampEmoji } from "../shared/stamps";
import { STAMP_EMOJIS } from "../shared/stamps";
import { EmojiWheel, type WheelMode } from "./EmojiWheel";
import { FullEmojiPicker } from "./FullEmojiPicker";

type Props = {
  board: Board;
  stamps: Stamp[];
  users: PublicUser[];
  myId: string | null;
  onStamp: (x: number, y: number) => void;
  onRemove: () => void;
  onSetEmoji: (emoji: StampEmoji) => void;
};

const NUDGE = 0.02; // arrow-key step, as a fraction of the image
const BIG_NUDGE = 0.08; // with Shift

export function StampBoard({ board, stamps, users, myId, onStamp, onRemove, onSetEmoji }: Props) {
  const canvas = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null); // width / height, once loaded
  const [wheel, setWheel] = useState<{ at: { x: number; y: number }; mode: WheelMode } | null>(null);
  const [fullPicker, setFullPicker] = useState<{ at: { x: number; y: number } } | null>(null);
  const lastPointer = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const byId = new Map(users.map((u) => [u.id, u]));
  const me = myId ? byId.get(myId) : undefined;
  const myStamp = stamps.find((s) => s.userId === myId);

  useEffect(() => {
    setImageFailed(false);
    setAspect(null);
  }, [board.image.url]);

  // Remember where the pointer is, so holding E opens the wheel right there.
  useEffect(() => {
    const onMove = (e: globalThis.PointerEvent) => (lastPointer.current = { x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Hold E (anywhere outside a text field) to open the emoji wheel.
  useEffect(() => {
    if (!me) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() !== "e" || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target instanceof Element && target.closest("input, textarea, [contenteditable]")) return;
      if (fullPicker) return; // typing "e" in the picker's search box
      e.preventDefault();
      setWheel((w) => w ?? { at: lastPointer.current, mode: "hold" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [me, fullPicker]);

  const closeWheel = useCallback(() => setWheel(null), []);
  const closeFullPicker = useCallback(() => setFullPicker(null), []);
  const pickEmoji = useCallback(
    (emoji: StampEmoji) => {
      onSetEmoji(emoji);
      setWheel(null);
      setFullPicker(null);
    },
    [onSetEmoji],
  );
  // "+" on the wheel: swap the wheel for the full picker, opened in the same spot.
  const openFullPicker = useCallback(() => {
    setFullPicker({ at: wheel?.at ?? lastPointer.current });
    setWheel(null);
  }, [wheel]);

  function relative(e: { clientX: number; clientY: number }) {
    const r = canvas.current!.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - r.left) / r.width),
      y: clamp01((e.clientY - r.top) / r.height),
    };
  }

  function click(e: MouseEvent) {
    if (!me) return;
    const { x, y } = relative(e);
    onStamp(x, y);
  }

  function keyDown(e: KeyboardEvent) {
    if (!me) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!myStamp) onStamp(0.5, 0.5);
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      if (myStamp) onRemove();
      return;
    }
    const step = e.shiftKey ? BIG_NUDGE : NUDGE;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    const from = myStamp ?? { x: 0.5, y: 0.5 };
    onStamp(clamp01(from.x + move[0]), clamp01(from.y + move[1]));
  }

  const stampedNames = stamps.map((s) => byId.get(s.userId)?.name).filter(Boolean);

  return (
    <div className="stamp-board">
      <h2 className="question" data-testid="question">
        {board.question}
      </h2>

      <div className="stage">
        <div
          ref={canvas}
          className={me ? "canvas can-stamp" : "canvas"}
          data-cursor-anchor="board"
          role="application"
          tabIndex={me ? 0 : -1}
          aria-label={`${board.image.alt}. ${
            stampedNames.length ? `Stamped: ${stampedNames.join(", ")}. ` : ""
          }Click or press Enter to stamp; arrow keys move your stamp; Delete removes it; hold E to pick an emoji.`}
          onClick={click}
          onKeyDown={keyDown}
          onPointerMove={(e: PointerEvent) => me && e.pointerType === "mouse" && setHover(relative(e))}
          onPointerLeave={() => setHover(null)}
          style={
            aspect
              ? // Fill the panel, but never taller than 70% of the window.
                { width: `min(100%, calc(70vh * ${aspect}))`, aspectRatio: String(aspect) }
              : undefined
          }
        >
          {imageFailed ? (
            <div className="image-missing">{board.image.alt}</div>
          ) : (
            <img
              src={board.image.url}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                if (w && h) setAspect(w / h);
              }}
              onError={() => setImageFailed(true)}
            />
          )}

          {stamps.map((s) => {
            const user = byId.get(s.userId);
            if (!user) return null;
            const mine = s.userId === myId;
            return (
              <div
                // Re-key on position so the pop animation replays when it moves.
                key={`${s.userId}:${s.x}:${s.y}`}
                className={mine ? "stamp mine" : "stamp"}
                style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, "--ring": user.color } as React.CSSProperties}
                data-testid={`stamp-${user.name}`}
              >
                <span className="stamp-emoji">{user.emoji}</span>
                <span className="stamp-name" style={{ background: user.color }}>
                  {user.name}
                </span>
              </div>
            );
          })}

          {me && hover && !wheel && !fullPicker && (
            <div className="stamp-preview" style={{ left: `${hover.x * 100}%`, top: `${hover.y * 100}%` }} aria-hidden>
              {me.emoji}
            </div>
          )}

          {board.image.credit && (
            <a
              className="credit"
              href={board.image.creditUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {board.image.credit}
            </a>
          )}
        </div>
      </div>

      {me && (
        <div className="dock">
          <button
            type="button"
            className="dock-emoji"
            aria-label={`Your stamp: ${me.emoji}. Pick a different emoji`}
            aria-haspopup="dialog"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setWheel({ at: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, mode: "click" });
            }}
            data-testid="dock-emoji"
          >
            {me.emoji}
          </button>
          <div className="dock-text">
            <strong>{myStamp ? "Stamped!" : "Click the picture to stamp"}</strong>
            <span className="hint-pointer">
              Hold <kbd>E</kbd> or click your emoji to change it
            </span>
            <span className="hint-touch">Tap your emoji to change it</span>
          </div>
          {myStamp && (
            <button type="button" className="secondary take-back" onClick={onRemove}>
              Take it back
            </button>
          )}
        </div>
      )}

      {wheel && me && (
        <EmojiWheel
          at={wheel.at}
          mode={wheel.mode}
          emojis={board.emojis ?? STAMP_EMOJIS}
          current={me.emoji}
          onPick={pickEmoji}
          onMore={openFullPicker}
          onClose={closeWheel}
        />
      )}

      {fullPicker && me && <FullEmojiPicker at={fullPicker.at} onPick={pickEmoji} onClose={closeFullPicker} />}
    </div>
  );
}

function clamp01(v: number) {
  return Math.min(Math.max(v, 0), 1);
}
