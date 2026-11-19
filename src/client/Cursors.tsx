import { useEffect, useState } from "react";
import type { PublicUser } from "../shared/messages";
import { anchorElement, useCursorStore } from "./cursorStore";

const IDLE_MS = 4000;

// Draws everyone else's cursor on top of the page.
export function Cursors({ users, myId }: { users: PublicUser[]; myId: string | null }) {
  const cursors = useCursorStore();
  const [now, setNow] = useState(() => Date.now());

  // Re-render on scroll/resize (anchors move) and once a second (idle fading).
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 1000);
    window.addEventListener("scroll", tick, true);
    window.addEventListener("resize", tick);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", tick, true);
      window.removeEventListener("resize", tick);
    };
  }, []);

  const byId = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="cursors" aria-hidden>
      {cursors.map(([userId, c]) => {
        const user = byId.get(userId);
        if (!user || userId === myId) return null;
        const r = anchorElement(c.anchor)?.getBoundingClientRect();
        if (!r) return null;
        const idle = Math.max(now, Date.now()) - c.at > IDLE_MS;
        return (
          <div
            key={userId}
            className={idle ? "cursor idle" : "cursor"}
            style={{ transform: `translate(${r.left + c.x * r.width}px, ${r.top + c.y * r.height}px)` }}
            data-testid={`cursor-${user.name}`}
          >
            <svg width="18" height="20" viewBox="0 0 18 20">
              <path d="M1 1 L1 16 L5.5 12 L8.5 19 L11 18 L8 11 L14 11 Z" fill={user.color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="cursor-name" style={{ background: user.color }}>
              {user.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
