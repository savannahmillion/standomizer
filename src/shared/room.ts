// Rooms live at /r/<name>. "/" is the landing page.

export const MAX_ROOM_NAME_LENGTH = 40;

// "  Design Team! " -> "design-team". Returns "" if nothing usable is left.
export function normalizeRoomName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_ROOM_NAME_LENGTH)
    .replace(/-+$/, "");
}

// The room for a URL path, or null for the landing page (or an unusable name).
export function roomFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/r\/([^/]+)\/?$/);
  if (!match) return null;
  let raw: string;
  try {
    raw = decodeURIComponent(match[1]);
  } catch {
    return null;
  }
  return normalizeRoomName(raw) || null;
}

export function pathForRoom(room: string): string {
  return `/r/${room}`;
}
