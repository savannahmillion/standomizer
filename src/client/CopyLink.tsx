import { useEffect, useState } from "react";

// Copies the room link so it's easy to share with the team.
export function CopyLink() {
  const [result, setResult] = useState<"copied" | "failed" | null>(null);

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(null), 2000);
    return () => clearTimeout(timer);
  }, [result]);

  async function copy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setResult("copied");
    } catch {
      setResult(legacyCopy(url) ? "copied" : "failed");
    }
  }

  return (
    <button type="button" className="copy-link secondary" onClick={copy} data-testid="copy-link">
      {result === "copied" ? "copied!" : result === "failed" ? "couldn't copy" : "copy link"}
    </button>
  );
}

// For browsers that block the Clipboard API: copy from a hidden text field.
function legacyCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}
