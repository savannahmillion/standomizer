import { useEffect, useSyncExternalStore } from "react";
import { CURSOR_ANCHORS, type CursorAnchor, type CursorPosition } from "../shared/messages";

// Other people's cursors live outside React state so that frequent updates
// only re-render the cursor overlay, not the whole app.

export type RemoteCursor = CursorPosition & { at: number };

const cursors = new Map<string, RemoteCursor>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export const cursorStore = {
  set(userId: string, cursor: CursorPosition | null) {
    if (cursor) cursors.set(userId, { ...cursor, at: Date.now() });
    else cursors.delete(userId);
    emit();
  },
  clear() {
    cursors.clear();
    emit();
  },
  entries: () => [...cursors],
};

export function useCursorStore() {
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
  );
  return cursorStore.entries();
}

// Layout elements cursors are anchored to. Mark them with data-cursor-anchor.
export function anchorElement(anchor: CursorAnchor): HTMLElement | null {
  return document.querySelector(`[data-cursor-anchor="${anchor}"]`);
}

const SEND_EVERY_MS = 50; // ~20 updates per second

// Sends this person's cursor position while `enabled`.
export function useCursorSender(send: (cursor: CursorPosition | null) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let lastSent = 0;
    let pending: CursorPosition | null | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = () => {
      timer = undefined;
      if (pending === undefined) return;
      send(pending);
      pending = undefined;
      lastSent = Date.now();
    };

    const queue = (cursor: CursorPosition | null) => {
      pending = cursor;
      const wait = SEND_EVERY_MS - (Date.now() - lastSent);
      if (wait <= 0) flush();
      else timer ??= setTimeout(flush, wait);
    };

    const onMove = (e: PointerEvent) => queue(locate(e.clientX, e.clientY));
    const onLeave = () => queue(null);

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      clearTimeout(timer);
      send(null);
    };
  }, [send, enabled]);
}

// The most specific anchor under the point, or null if outside them all.
function locate(clientX: number, clientY: number): CursorPosition | null {
  for (const anchor of CURSOR_ANCHORS) {
    const r = anchorElement(anchor)?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) continue;
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) continue;
    return { anchor, x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  }
  return null;
}
