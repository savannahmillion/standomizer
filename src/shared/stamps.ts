// The quick-pick emoji on the wheel, clockwise from the top. The wheel adds a
// "+" at the bottom center that opens a full picker, so people can stamp with
// any emoji. Keep this to an odd count so "+" lands exactly at the bottom.
export const STAMP_EMOJIS = ["😀", "😂", "😍", "😬", "😴", "🫠", "🤯", "🔥", "🎉"] as const;
export const DEFAULT_EMOJI = "😀";

// Any single emoji (including skin tones, flags, and ZWJ sequences like 👩🏽‍💻).
export type StampEmoji = string;

// Unicode's list of recommended emoji. Built with RegExp() because the `v`
// flag needs a newer TypeScript target than we compile to.
const SINGLE_EMOJI = new RegExp("^\\p{RGI_Emoji}$", "v");
const MAX_EMOJI_LENGTH = 32; // UTF-16 units; the longest RGI emoji is well under this

export function isStampEmoji(value: unknown): value is StampEmoji {
  return typeof value === "string" && value.length <= MAX_EMOJI_LENGTH && SINGLE_EMOJI.test(value);
}

// Emoji typed or pasted by people often carry an extra (or missing) invisible
// "show as emoji" character, U+FE0F — the Mac emoji picker adds it to ⛵️ and
// ☕️, for example. Returns the standard form, or null if it isn't an emoji.
export function normalizeEmoji(value: string): StampEmoji | null {
  const ok = (v: string) => v.length <= MAX_EMOJI_LENGTH && SINGLE_EMOJI.test(v);
  if (ok(value)) return value;
  const bare = value.replace(/\uFE0F/g, "");
  if (ok(bare)) return bare;
  const [first, ...rest] = Array.from(bare);
  const withSelector = first ? `${first}\uFE0F${rest.join("")}` : "";
  return ok(withSelector) ? withSelector : null;
}

// A stamp on today's image. x and y are 0–1, relative to the image, so stamps
// land in the same spot on every screen size. One stamp per person.
export type Stamp = { userId: string; x: number; y: number };
