export const MAX_NAME_LENGTH = 30;

// Trim, collapse whitespace, drop control characters, cap the length.
export function cleanName(raw: string): string {
  return raw
    .replace(/\p{Cc}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim();
}

// "Sam" when free, otherwise "Sam (2)", "Sam (3)", ... Comparison ignores case.
export function disambiguate(base: string, taken: Iterable<string>): string {
  const used = new Set([...taken].map((n) => n.toLowerCase()));
  if (!used.has(base.toLowerCase())) return base;
  let n = 2;
  while (used.has(`${base} (${n})`.toLowerCase())) n++;
  return `${base} (${n})`;
}

// A stable color per name, so people keep their color across visits.
// Names are shown as white text on this color (stamps, cursors), so each hue
// is darkened just enough for WCAG AA contrast (4.5:1) with white. Blues and
// purples stay bright; yellows and greens come out deeper.
export function colorForName(name: string): string {
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  const hue = hash % 360;
  let lightness = 50;
  while (lightness > 20 && contrastWithWhite(hue, SATURATION, lightness) < MIN_CONTRAST) lightness--;
  return `hsl(${hue} ${SATURATION}% ${lightness}%)`;
}

const SATURATION = 65;
const MIN_CONTRAST = 4.6; // a hair above 4.5 to absorb rounding

function contrastWithWhite(h: number, s: number, l: number): number {
  const [r, g, b] = hslToRgb(h, s / 100, l / 100).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (luminance + 0.05);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  // Round to 8-bit like the browser does, so the check matches what's drawn.
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255) / 255) as [number, number, number];
}
