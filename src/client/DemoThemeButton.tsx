import { useEffect, useState } from "react";

// Demo only, not a team feature: Cmd+Shift+D (Ctrl+Shift+D on Windows/Linux)
// shows or hides a small button in the bottom-right corner that switches the
// room to the next theme, for showing themes off. Nothing advertises it.
export function DemoThemeButton({ onNextTheme }: { onNextTheme: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey || e.altKey || e.key.toLowerCase() !== "d") return;
      e.preventDefault(); // e.g. stop the browser's own Cmd+Shift+D (bookmark all tabs)
      setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!visible) return null;
  return (
    <button
      type="button"
      className="demo-theme-button"
      onClick={onNextTheme}
      aria-label="Next theme (demo)"
      title="Next theme (demo)"
      data-testid="demo-next-theme"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4.5h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
