import { useEffect, useRef, useState } from "react";
// Served from this app (Vite emits it as an asset), not a third-party CDN.
import emojiDataUrl from "emoji-picker-element-data/en/emojibase/data.json?url";

// emoji-picker-element keeps its emoji list, recently used emoji, and skin-tone
// choice in this IndexedDB database. The app promises to store nothing, so it's
// deleted whenever the picker closes (and on page load, in case a tab was
// closed with the picker open). The picker just re-reads the list next time.
const PICKER_DB_NAME = "emoji-picker-element-en";

export function forgetEmojiPickerData() {
  try {
    indexedDB.deleteDatabase(PICKER_DB_NAME); // waits for the picker's connection to close
  } catch {
    // IndexedDB unavailable (e.g. some private modes): nothing was stored anyway.
  }
}

const WIDTH = 352; // emoji-picker-element's default size
const HEIGHT = 435;
const GAP = 12;

type Props = {
  at: { x: number; y: number }; // viewport px to open near
  onPick: (emoji: string) => void;
  onClose: () => void;
};

// Every emoji, with search, categories, and skin tones (emoji-picker-element).
// The element is loaded on first open so it doesn't weigh down the page.
export function FullEmojiPicker({ at, onPick, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const callbacks = useRef({ onPick, onClose });
  callbacks.current = { onPick, onClose };

  useEffect(() => {
    let cancelled = false;
    let picker: HTMLElement | null = null;
    const onClick = (e: Event) => {
      const unicode = (e as CustomEvent<{ unicode?: string }>).detail.unicode;
      if (unicode) callbacks.current.onPick(unicode);
    };

    import("emoji-picker-element/picker.js")
      .then(({ default: Picker }) => {
        if (cancelled || !host.current) return;
        picker = new Picker({ dataSource: emojiDataUrl, locale: "en" });
        picker.classList.add("light"); // the app is light-only; don't follow the OS dark mode
        picker.addEventListener("emoji-click", onClick);
        host.current.append(picker);
        // Focus the search box once the picker has rendered.
        requestAnimationFrame(() => picker?.shadowRoot?.querySelector<HTMLInputElement>("input[type=search]")?.focus());
      })
      .catch(() => !cancelled && setFailed(true));

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && callbacks.current.onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      picker?.removeEventListener("emoji-click", onClick);
      picker?.remove();
      if (picker) forgetEmojiPickerData();
    };
  }, []);

  // Open beside the point, flipping/clamping so it stays on screen.
  const left = clamp(at.x + GAP + WIDTH > window.innerWidth ? at.x - GAP - WIDTH : at.x + GAP, GAP, window.innerWidth - WIDTH - GAP);
  const top = clamp(at.y - HEIGHT / 2, GAP, window.innerHeight - HEIGHT - GAP);

  return (
    <div
      className="picker-backdrop"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={host}
        className="full-picker"
        role="dialog"
        aria-label="Pick any emoji"
        style={{ left, top }}
        data-testid="full-picker"
      >
        {failed && <p className="full-picker-error">Couldn't load the emoji picker.</p>}
      </div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), Math.max(min, max));
}
