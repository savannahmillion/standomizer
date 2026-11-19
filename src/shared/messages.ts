// Messages sent between the browser and the Room server.
// Everything lives in server memory only; nothing is persisted (see SPEC.md).

import type { Board } from "./daily";
import { isStampEmoji, type Stamp, type StampEmoji } from "./stamps";

export type PublicUser = { id: string; name: string; color: string; emoji: StampEmoji };

// A cursor position, anchored to part of the layout so it lines up across
// screen sizes: "board" is today's image, "room" is the whole room area.
// x and y are 0–1 relative to that element. null means the cursor left the page.
export const CURSOR_ANCHORS = ["board", "room"] as const;
export type CursorAnchor = (typeof CURSOR_ANCHORS)[number];
export type CursorPosition = { anchor: CursorAnchor; x: number; y: number };

// The speaking order. `current` is the index of who's speaking now;
// `current === ids.length` means everyone has gone.
export type SpeakingOrder = { ids: string[]; current: number };

export type ServerMessage =
  | { type: "presence"; users: PublicUser[] }
  | { type: "order"; order: SpeakingOrder | null }
  | { type: "board"; board: Board }
  | { type: "stamps"; stamps: Stamp[] }
  | { type: "cursor"; userId: string; cursor: CursorPosition | null }
  | { type: "joined"; id: string }
  | { type: "error"; message: string };

export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "start" }
  | { type: "next" }
  | { type: "demoNextTheme" } // hidden demo shortcut (Cmd/Ctrl+Shift+D)
  | { type: "placeStamp"; x: number; y: number }
  | { type: "removeStamp" }
  | { type: "setEmoji"; emoji: StampEmoji }
  | { type: "cursor"; cursor: CursorPosition | null };

const isUnit = (v: unknown) => typeof v === "number" && v >= 0 && v <= 1;

export function isClientMessage(value: unknown): value is ClientMessage {
  if (typeof value !== "object" || value === null) return false;
  const msg = value as Record<string, unknown>;
  switch (msg.type) {
    case "join":
      return typeof msg.name === "string";
    case "start":
    case "next":
    case "demoNextTheme":
    case "removeStamp":
      return true;
    case "placeStamp":
      return isUnit(msg.x) && isUnit(msg.y);
    case "setEmoji":
      return isStampEmoji(msg.emoji);
    case "cursor":
      return msg.cursor === null || isCursorPosition(msg.cursor);
    default:
      return false;
  }
}

function isCursorPosition(value: unknown): value is CursorPosition {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (CURSOR_ANCHORS as readonly unknown[]).includes(c.anchor) && isUnit(c.x) && isUnit(c.y);
}
