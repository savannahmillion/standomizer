# Standomizer — Spec

A small internal web app for our team's standup. People join a shared room, anyone can shuffle the speaking order, and while we wait there's a silly shared board to check in on the team's mood.

Status: **draft v1**.

---

## Goals

- Get from "everyone's here" to "here's the order" in one click.
- Make the room feel alive: you can see who's here, where their cursor is, and how they're feeling.
- Keep it tiny: cheap or free to host, little to maintain, internal only.
- **Remember nothing.** The room only exists while people are in it.

## Non-goals (for v1)

- Accounts, logins, profiles, or history of past standups.
- Listing or discovering rooms — you need to know (or be sent) a room's name.
- Video/audio — this sits alongside whatever call tool we already use.
- Mobile-first design (it should work on a phone, but desktop is the main use).

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Realtime server | **Cloudflare Workers + a Durable Object**, via **PartyServer** (`partyserver` / `partysocket`) | One Durable Object is the room; it holds state in memory and broadcasts over WebSockets. Presence, shuffle, stamps, and cursors are all just message types. |
| Frontend | **Vite + React + TypeScript** | Simple, fast, nothing heavyweight needed. |
| Hosting | **Cloudflare** (Workers + static assets) | Site and realtime server deploy together with `wrangler deploy`. Free tier covers a team. |
| Access control | **None** — an unlisted URL | Narrow, internal user base; nothing sensitive is stored. |
| Themes | One Markdown file per theme in `themes/`, bundled at build time; images in `public/themes/` or `https://` URLs | Add a theme with a pull request; no CMS, API key, or storage service. |

### Alternatives considered

- **Liveblocks** — built-in presence and cursors, but ties us to their data model.
- **Supabase Realtime** — works, but brings a database we don't need.
- **Socket.io on Render/Fly** — more to manage, and free tiers sleep when idle.

---

## Features

### 1. Join the room

- From the landing page (`/`), you enter **your name and the room on one screen** and go straight into the room.
- Opening a room link directly (`/r/<name>`) asks only for your name.
- Nothing is saved in the browser, and your name never goes in the URL: going from the landing page into a room happens without a page reload, so the name is handed over in memory. Back/forward between them works; coming back to a room asks for your name again.
- The join screen previews who's already here ("Already here: Alex, Sam").
- **Clock:** the room header shows Mountain time and, if yours is different, your local time too ("9:41 AM MST · 11:41 AM your time"). It updates on the minute and switches between MST and MDT on its own.
- If your connection drops and comes back, you're re-joined automatically with the same name, emoji, and stamp (the header shows "Reconnecting…" meanwhile).
- The room header shows the room name, a **Copy link** button for sharing, and the browser tab reads "<room> · Standomizer".
- Once joined, your name appears in the **Present** list for everyone in real time.
- Duplicate names are allowed but visually disambiguated (e.g. "Sam (2)").

### 2. Randomizer

- A **Start** button anyone can press.
- Pressing it shuffles everyone currently present into a numbered order, shown to everyone at once.
- A **Next** button advances a highlight to the current speaker. Finished speakers are visually dimmed. On the last speaker it reads **Finish**, then shows "That's everyone! 🎉".
- The current speaker's row is highlighted (no label). There's no Back button: Next only moves forward.
- Anyone who joins after Start is appended to the end of the order.
- Anyone who leaves is removed from the order.
- Pressing Start while an order already exists requires a second press to confirm (the button changes to "Reshuffle? Click again" for a few seconds).
- If the current speaker leaves, the highlight moves to whoever was next. If someone who already spoke leaves, the highlight stays put.
- If someone's connection drops and they're re-joined automatically, they go to the end of the order.

### 3. Daily Stamp Board

Each day has a **theme**: a question and one image to go with it (e.g. "What are you doing at the park?" over a bird's-eye illustration of a park). Everyone picks an emoji and stamps it on the image, with their name, wherever their answer is.

**Themes**

- One Markdown file per theme in `themes/` (e.g. `themes/park.md`), with front matter:

  ```md
  ---
  question: What are you doing at the park?
  image: /themes/park.svg          # https:// URL, or a file in public/
  alt: Illustrated bird's-eye view of a park with a playground, pond, and picnic area
  credit: Artist Name              # optional
  creditUrl: https://example.com   # optional
  contributor: Your Name          # optional
  emojis: 🛝 🧺 ⚽ 🦆 🍦 🌸 🐕 😎 🌳  # optional
  ---
  Notes for editors (not shown).
  ```

- **contributor** (optional): when set, the room shows "theme contributed by Your Name" in small text centered below the main content.
- **emojis** (optional): this theme's emoji wheel, up to 11, written on one line (spaces/commas optional) or as a `- item` list. Non-emoji entries are ignored with a warning; themes without it use the default wheel.
- The file name is the theme id. Files are bundled at build time (`import.meta.glob`), so adding a theme is a pull request with one `.md` file (and optionally an image in `public/themes/`). `themes/README.md` documents the format.
- Images with lots of distinct spots work best: a park from above, a beach, a floor plan, a map.
- Local images in `public/` are preferred (they can't break or be hotlink-blocked). Remote images must be `https://`, allowed to hotlink, and licensed for reuse.
- A theme file with missing fields is skipped with an error in the server log; if no valid themes remain, the server refuses to start.
- Three placeholder themes with hand-drawn SVG illustrations (park, beach, house floor plan) ship until real ones are added.

**Daily pick**

- The server uses **today's date** (in the team's timezone) as a seed to choose the theme. Everyone sees the same board all day, a new one tomorrow, and nothing needs to be stored.
- Themes cycle through the whole list in a shuffled order before any repeats, and the same theme never shows two days in a row.
- "Today" is **Mountain time** (`TEAM_TIMEZONE = "America/Denver"` in `src/shared/team.ts`), so the board changes at midnight MT for everyone.
- A room left open overnight switches to the new board (and clears stamps) on the first activity of the day.
- The image keeps its own aspect ratio, fills the panel width, and is capped at 70% of the window height. If it fails to load, its alt text is shown in its place (still stampable).

**Stamps**

- **Click (or tap) the image to stamp** your emoji there, with your name under it. **One stamp per person**: clicking again moves it; **Take it back** removes it. (Decided: one each, so the board reads as everyone's answer at a glance.)
- While hovering the image, a faded preview of your emoji follows the pointer.
- Everyone sees all stamps live, with a little pop animation when one lands or moves.
- Stamp position is `{ x, y }` from 0 to 1, relative to the image, so it lands in the same spot on every screen size.
- Stamps belong to that day's board; a new day starts with none.
- Keyboard: the image is focusable; Enter stamps the middle, arrow keys move your stamp (Shift for bigger steps), Delete removes it. Its screen-reader label lists who has stamped.

**Emoji picker (FigJam-style emote wheel) — v1, to iterate on**

- A ring pops open around the pointer with today's theme's emoji (from its `emojis:` line), or the default 9 (😀 😂 😍 😬 😴 🫠 🤯 🔥 🎉; `STAMP_EMOJIS` in `src/shared/stamps.ts`), plus a **+** that always sits at the bottom center, for any count:
  - **Hold E** anywhere in the room, point toward a slot, and release E to pick it (release in the middle to cancel).
  - Or **click your emoji** in the dock under the image, then click a slot (arrow keys + Enter work too; Escape closes).
- **+ opens a full emoji picker** ([emoji-picker-element](https://github.com/nolanlawson/emoji-picker-element)): every emoji, with search, categories, skin tones, and a recently-used row. It opens where the wheel was, focuses the search box, uses its light style, and closes with Escape or a click outside. The picker and its emoji data load only the first time someone opens it, and the data is served by the app itself (no third-party CDN).
- Changing your emoji updates your stamp in place. Everyone starts with 😀. The server accepts any single emoji (Unicode's recommended set, including skin tones, flags, and combined emoji like 👩🏽‍💻) and rejects anything else.

### 4. Live cursors

- Everyone else's cursor is shown as an arrow in their color with a name label. Only joined people send cursors.
- Cursor updates are throttled (~20/sec, always sending the latest position) and smoothed with a short animation.
- Positions are anchored to the layout so they line up across screen sizes: over the image they're relative to the image (so a cursor pointing at the pond points at the pond for everyone); elsewhere they're relative to the room area. Outside the room, or when the window loses focus, the cursor is hidden.
- Cursors fade out after 4 seconds without movement, and disappear when the person leaves.
- The server relays cursors to everyone except the sender and never stores them.

---

## Leaving & persistence

Nothing persists. Room state lives only in the Durable Object's memory — never in Durable Object storage or the browser.

The emoji picker library would normally keep its emoji list, recently used emoji, and skin-tone choice in the browser (IndexedDB). The app deletes that database whenever the picker closes and on every page load (`forgetEmojiPickerData` in `src/client/FullEmojiPicker.tsx`), so nothing persists. The app sets no cookies and uses no local/session storage.

Both the landing page (under the form) and the room (at the bottom) say: "Nothing you enter here is tracked or stored, and everything will disappear when you close the browser tab." Keep that sentence true when adding features: no analytics, no persistence, no browser storage.

- When you disconnect, **all your stuff is gone**: your name leaves the Present list, your stamp disappears, and you're removed from the order.
- When the last person leaves, the room is empty; the next person to arrive starts with a blank room.
- Refreshing the page counts as leaving and rejoining (you'll re-enter your name).

---

## Demo shortcut (hidden)

Not a team feature, and not advertised anywhere in the UI. In a room (after joining), **Cmd+Shift+D** / **Ctrl+Shift+D** toggles a subtle round refresh button fixed in the bottom-right corner. Clicking it sends `demoNextTheme`; the server switches that room's board to the next theme in the list (wrapping around), clears stamps, and broadcasts it to everyone in the room. Only joined users can trigger it. The override lasts until midnight MT or until the room empties, then the real daily theme returns.

## Theme

Light only, for everyone. The app ignores the OS dark-mode setting (`color-scheme: light only` in CSS and a matching `<meta>` tag in `index.html`), and the emoji picker is pinned to its light style.

## Accessibility (WCAG 2.2 AA)

- **Text contrast:** all text is at least 4.5:1 against its background, including placeholders, gray "muted" text, finished speakers (gray + strikethrough rather than faded), and button labels. The photo credit sits on a 70% black backing so it stays readable over any image.
- **Name tags:** each person's color is darkened per hue just enough for white text to reach 4.5:1 (`colorForName` in `src/shared/names.ts`), so stamps and cursor labels are readable for every name.
- **Controls:** input and outlined-button borders (`--border-strong`) are at least 3:1 against their background; focus rings use the accent color (≥3:1).
- **Size:** the base text size is 18px (`html { font-size: 112.5% }`). UI text is at least ~15.75px; the smallest text is ~14.6px bold labels drawn on the picture (stamp names, cursor names, photo credit). All sizes are in `rem` and the base is a percentage, so browser zoom and people's own text-size settings still scale everything.
- When changing colors, keep these ratios; the color tokens are in `:root` in `src/client/styles.css`.

## Layout

```
┌──────────────────────────────┬───────────────────────────────┐
│  Present (5)                 │  What are you doing at the    │
│  • Alex  • Sam  • Jo ...     │  park?    (today's question)  │
│                              │  ┌─────────────────────────┐  │
│  [ Start ]                   │  │  🌳   😀Sam    🦆        │  │
│                              │  │     (park image)  🔥Jo  │  │
│  Order                       │  │  😴Alex       🛝         │  │
│  1. Jo      (highlighted)    │  └─────────────────────────┘  │
│  2. Alex                     │  ( 😀 ) Click the picture to  │
│  3. Sam                      │         stamp · Hold E  2/5   │
│  [ Next ]                    │                               │
└──────────────────────────────┴───────────────────────────────┘
```

Stacks vertically on narrow screens.

---

## State model (in memory only)

```ts
type RoomState = {
  users: Record<ConnectionId, { name: string; color: string; joinedAt: number }>;
  order: ConnectionId[] | null;
  currentIndex: number | null;
  board: Board; // derived from today's date; see src/shared/daily.ts
  stamps: Record<ConnectionId, { x: number; y: number }>; // emoji lives on the user
  // cursors are broadcast only, never stored
};
```

On disconnect, the server deletes that connection's entries from `users`, `order`, and `stamps` and broadcasts the change.

### Messages

Client → server: `join`, `start`, `next`, `placeStamp`, `removeStamp`, `setEmoji`, `cursor`
Server → client: `presence`, `order`, `board`, `stamps`, `joined`, `error` — sent on connect as a snapshot, then on every change; plus `cursor` (relayed live, not part of the snapshot)

See `src/shared/messages.ts` for the exact shapes; the server validates every incoming message.

---

## Rooms

- **Landing page (`/`):** two fields — **Your name** and **Room**. As you type the room it shows the link you'll get; **Join room** takes you into `/r/<name>`, already joined. Creating and joining are the same action: a room exists as soon as someone opens it.
- **Rooms (`/r/<name>`):** each room is its own Durable Object with its own presence, order, stamps, and cursors. The full room URL is shown under the centered title with a small **copy link** button; clicking the title goes back to the landing page.
- **Names are normalized:** lowercase letters, numbers, and dashes, up to 40 characters (`Design Team!` → `design-team`), so "Design Team" and "design-team" are the same room. A URL with an unusable name redirects to `/`. The server rejects WebSocket connections to non-normalized names.
- **Teams should bookmark their room link** — the app remembers nothing, including which room you were in.
- Every room sees the same daily theme. (Could include the room name in the daily seed later if teams want different boards.)
- Trade-off: with no login wall, anyone who guesses a room name can join it. If that ever matters, add a random suffix (`design-team-k3x9`) or Cloudflare Access.

---

## Open questions

1. **Emoji wheel:** are these the right 9 quick picks? (Everything else is one tap away under +.)

Decided: themes are handmade by the team (a brainstorm list is in progress); the team timezone is Mountain.

---

## Build plan

1. Scaffold Vite + React + TS with PartyServer on Cloudflare; deploy a "hello room" to confirm WebSockets work end to end.
2. Join flow + live presence list.
3. Start / shuffle (with confirm) / Next.
4. Daily board: date-seeded theme pick with emoji stickers (later redesigned into the Stamp Board: Markdown themes, one image, click-to-stamp, emoji wheel).
5. Live cursors.
6. Polish: (dark mode was later removed; the app is light-only), reconnect restores emoji/stamp, copy-link button, per-room page title, favicon, keyboard-accessible board, README.

All six steps are done. Since then: Mountain time + header clock, and a full emoji picker behind + on the wheel. Remaining: handmade themes, iterate on the emoji wheel, deploy.
