# standomizer

A stand(up) randomizer. Join a room, hit **Start** to shuffle the speaking order, and stamp an emoji on today's picture while you wait.

- Rooms at `/r/<name>`. The landing page (`/`) asks for your name and a room.
- Live presence list, shuffle + Next, a daily question-and-picture board you stamp emoji on (with a FigJam-style emoji wheel: hold **E**), and live cursors.
- Remembers nothing: when you leave, your name, stamp, and place in the order are gone.

See [SPEC.md](SPEC.md) for the full behavior.

## How to contribute a theme

Every day, standomizer shows one **theme**: a question and a picture, like "What are you doing at the park?" over a drawing of a park seen from above. Everyone stamps an emoji on the spot that matches their answer. You can add your own theme, right from your web browser. No coding, no software to install.

A theme is just **two files**:

1. **Your picture** (for example `office.png`)
2. **A short text file** that holds the question and points to the picture (for example `office.md`)

You'll add both through the GitHub website, then ask for them to be added to the app. This takes about 15 minutes the first time.

### Before you start

- **A GitHub account.** Sign up for free at [github.com](https://github.com) if you don't have one.
- **Access to this project.** Ask the project owner to add you as a collaborator, then accept the invite from your email or at [github.com/notifications](https://github.com/notifications). (No access? You can still contribute. See "If GitHub asks you to fork" below.)
- **Your picture**, saved on your computer. Before you use it, check that:
  - **You're allowed to use it.** Use something you made, or an image whose license allows reuse. Unsplash and Pexels images are fine if you credit the photographer. Don't use a random image from a web search.
  - **It's work-appropriate.**
  - **It has lots of distinct spots** where people could "be". Pictures seen from above work best: a park, a beach, a floor plan, a map, a busy kitchen, a campsite.
  - **It's the right size:** wide rather than tall, about **1600 × 1000 pixels**, and under about **500 KB**. See "Picture size and dimensions" just below for details and how to resize.
  - **Any words in it are easy to read**: dark text on a light background, or the other way around.
  - **Its file type is** `.png`, `.jpg`, `.webp`, or `.svg`.
- **Your question**, for example: *"Where are you in the office today?"*
- **Optional: up to 11 emoji** that go with your picture. They replace the usual emoji choices for the day. People can still pick any emoji with the **+** button.

### Picture size and dimensions

**The short version:** a **wide** picture about **1600 pixels wide by 1000 tall**, saved under about **500 KB**.

| | Recommended | Acceptable | Avoid |
|---|---|---|---|
| **Width** | 1600 px | 1200–2400 px | under 1000 px (looks blurry) or over 3000 px (bigger file, no sharper) |
| **Shape** | wide: 8:5 or 3:2 (like 1600 × 1000 or 1500 × 1000) | 16:9, 4:3, square | tall/portrait (shows up small) |
| **File size** | under 500 KB | up to about 1 MB | over 2 MB (slow to load). Files over 25 MB can't be uploaded at all. |
| **File type** | `.jpg` for photos, `.png` for drawings with flat colors, `.svg` for vector art | `.webp` | `.heic` (iPhone default), `.gif`, `.tiff`, `.bmp` |

**Why these numbers?**

- **How big it shows:** on a laptop or desktop, the picture is shown at most about **670 pixels wide**. It's about **620** on a smaller laptop and about **310** on a phone.
- **Why twice that:** most screens today are "high-resolution" and use 2 image pixels for every screen pixel. A picture about twice the display width (around 1340 px) looks crisp, so 1600 px leaves a little headroom.
- **Why not bigger:** anything past about 2400 px wide just makes the file bigger without looking sharper.
- **Why wide:** the picture fills the width of its panel, but it's never taller than about 70% of the window. Wide pictures use the space best. A tall or square picture gets shrunk to fit the height, so it ends up smaller, with empty space on the sides.
- **Why small files:** everyone in the room downloads the picture when the day's theme loads, often on wifi at the same time. A 300 KB file loads instantly; a 5 MB one makes people wait.
- **Exact size doesn't matter:** the app reads your picture's shape when it loads and fits itself to it. Stamps are saved as a spot on the picture, not a pixel position, so they stay in the right place on every screen size.

**Leave room at the edges.** People stamp where they "are", and a stamp is centered on the spot they click. Keep important spots at least a little way in from the edges, about 5% of the width. A stamp right at the border gets cut off. If your theme has a `credit:` line, the credit appears in the bottom-right corner, so don't put anything important there.

**Checking your picture's size**

- **Mac:** select the file in Finder and press **Command + I** (Get Info). Look under **More Info** for dimensions, and next to **Size** for file size.
- **Windows:** right-click the file → **Properties** → **Details** tab, then look at **Dimensions** and **Size**.

**Making it smaller**

- **Easiest, any computer:** open [squoosh.app](https://squoosh.app) in your browser (it's free, from Google, and your picture never leaves your computer).
  1. Drag your picture onto the page.
  2. In the right-hand panel, turn on **Resize** and set the width to **1600**.
  3. Under **Compress**, choose **MozJPEG** for photos, or **OxiPNG** for drawings with flat colors.
  4. Check the file size shown at the bottom right, and lower the **Quality** slider if it's over 500 KB. Around 75–80 usually looks the same as the original.
  5. Click the **download** button.
- **Mac Preview:** open the picture, choose **Tools → Adjust Size…**, set **Width** to 1600 pixels (keep "Scale proportionally" checked), then **File → Export…** and pick JPEG with the Quality slider about two-thirds of the way.
- **Windows Photos:** open the picture, click **…** (See more) → **Resize image**, set the width to 1600, and save a copy.
- **iPhone photos (`.heic`):** most browsers can't show these, so convert to JPG first. On a Mac, open the photo in **Preview** and choose **File → Export…** → **JPEG**. On Windows, open it in **Photos** and use **Save as** → `.jpg`. (To have your iPhone take JPGs from now on: **Settings → Camera → Formats → Most Compatible**.)

**Drawings and SVGs:** SVG files can be any size, because they stay sharp at every size. Just make sure the file has a `viewBox` (Figma, Illustrator and most drawing tools add one when you export). If an SVG is over about 500 KB, export it as a 1600 px wide PNG instead.

### Step 1: Give your picture a simple name

On your computer, rename the picture file so it uses **only lowercase letters, numbers, and dashes**, with no spaces. For example: `office-floor-plan.png`.

You'll type this exact name again in Step 3, so write it down.

### Step 2: Upload your picture

1. Go to the project's picture folder: [github.com/savannahmillion/standomizer/tree/main/public/themes](https://github.com/savannahmillion/standomizer/tree/main/public/themes)
2. Near the top right, click **Add file**, then **Upload files**.
3. Drag your picture into the box, or click **choose your files** to find it.
4. Scroll down to the box labeled **Commit changes**. In the first line, type a short note, like `Add office picture`.
5. Below that, select **Create a new branch for this commit and start a pull request**. GitHub fills in a branch name like `yourname-patch-1`. **Write that branch name down.** You'll need it in Step 3.
   - (A *branch* is your own private draft of the project. Nothing you do there affects the live app until it's reviewed.)
6. Click **Propose changes**.
7. GitHub shows a page titled **Open a pull request**. Click **Create pull request**.
   - (A *pull request* is a request to add your changes to the app. You'll finish it in Step 4.)

### Step 3: Add your theme file

Now add the text file to **the same branch** as your picture.

1. Go to the project's themes folder: [github.com/savannahmillion/standomizer/tree/main/themes](https://github.com/savannahmillion/standomizer/tree/main/themes)
2. **Switch to your branch.** Near the top left, click the button that says **main**, then click the branch name you wrote down in Step 2. The button should now show your branch name. Make sure it does before going on.
3. Click **Add file**, then **Create new file**.
4. In the **Name your file…** box, type a name ending in `.md`, like `office.md`. Use only lowercase letters, numbers, and dashes.
5. In the big text box, copy and paste this template:

   ```md
   ---
   question: Where are you in the office today?
   image: /themes/office-floor-plan.png
   alt: Illustrated floor plan of an office with desks, a kitchen, a meeting room, and a couch
   contributor: Your Name
   emojis: 💻 ☕ 🍕 📞 🛋️ 🪴 🖨️ 🎧 😴
   credit: Photographer or Artist Name
   creditUrl: https://link-to-where-the-picture-came-from
   ---
   ```

6. Change each line to fit your theme. Keep each word before a colon (`question:`, `image:` and so on) exactly as it is, and change only what comes after it:

   | Line | What to write | Required? |
   |---|---|---|
   | `question:` | The question everyone sees above the picture. | Yes |
   | `image:` | `/themes/` followed by your picture's exact file name from Step 1, including `.png` or `.jpg`. Capital letters and spelling must match. | Yes |
   | `alt:` | A one-sentence description of the picture for people using screen readers. Mention the main spots in it. | Yes |
   | `contributor:` | Your name. It shows under the room as "theme contributed by Your Name". | No |
   | `emojis:` | Up to 11 emoji for the day's emoji wheel, separated by spaces. | No |
   | `credit:` | Who made the picture, if it isn't you. It shows in a corner of the picture. | Only if someone else made it |
   | `creditUrl:` | A link to the original picture or the creator's page. | No |

   - **To leave out an optional line,** delete the whole line.
   - **Keep the two `---` lines** at the very top and bottom exactly as they are. They mark where the theme info starts and stops.
   - **Typing emoji:** on a Mac, press **Control + Command + Space**. On Windows, press **Windows key + .** (period). You can also copy and paste them from a site like [emojipedia.org](https://emojipedia.org).
   - **Don't use `#` followed by a space** in your question or name. That makes the rest of the line disappear. If you must, wrap the whole value in double quotes, like `question: "Is today a # 1 day?"`.
7. Click the **Preview** tab above the text box to check your work. GitHub shows your lines as a small table.
   - **Shows one long line of text instead?** Check that the `---` lines are still there.
   - **Shows a red error box?** A line probably has a colon followed by a space inside the value, like `question: Quick one: where are you?`. Wrap the value in double quotes: `question: "Quick one: where are you?"`.
8. Click **Commit changes…**. In the pop-up, make sure **Commit directly to the `yourname-patch-1` branch** (your branch) is selected, then click **Commit changes**.

### Step 4: Finish your pull request

1. Go to [github.com/savannahmillion/standomizer/pulls](https://github.com/savannahmillion/standomizer/pulls) and click your pull request.
2. Click the **Files changed** tab. You should see **two** files: your picture in `public/themes/` and your `.md` file in `themes/`. If one is missing, it was probably added to the wrong branch. Redo that step, and make sure your branch is selected first.
3. Click the **Conversation** tab. Edit the title so it's clear, like `New theme: office`. Add a comment saying where the picture came from, for example "I drew it" or "Unsplash photo by …".
4. That's it! The project owner will review it, may suggest changes in comments, and will add it to the app.

### After it's added

- Your theme joins the daily rotation. The app shows every theme once before repeating any, in a shuffled order, so you can't pick the day. It'll show up within the next round.
- A new day's theme starts at midnight Mountain time.
- To change your theme later, open your `.md` file on GitHub, click the **pencil icon** to edit, and follow the same "Create a new branch… / pull request" steps.

### If GitHub asks you to fork

If you aren't a collaborator, GitHub may say **"You need to fork this repository"** when you upload or edit. That's fine. Click **Fork this repository**. GitHub makes your own copy and continues the same steps there. The only difference is in Step 3: go to your copy (`github.com/your-username/standomizer`), switch to the branch from Step 2 (often called `patch-1`), and add the file there. Your pull request updates on its own.

### Common problems

| What you see | What to check |
|---|---|
| The picture doesn't show up | The `image:` line must match the picture's file name **exactly**, start with `/themes/`, and include the extension (`.png`, `.jpg`…). Capital letters matter. |
| The theme never appears | The `question:`, `image:`, and `alt:` lines are required, and the `---` lines must be at the very top and bottom. |
| Some emoji are missing from the wheel | Only real emoji are used; letters and symbols like `:)` are ignored. The wheel holds 11 at most. |
| The pull request shows only one file | One file went to the wrong branch. Add it again with your branch selected in the branch button. |

Questions? Ask the project owner, or leave a comment on your pull request.

## Stack

- **Cloudflare Workers + Durable Objects** via [PartyServer](https://github.com/cloudflare/partykit/tree/main/packages/partyserver): one Durable Object per room holds state in memory and broadcasts over WebSockets.
- **Vite + React + TypeScript** for the client, served as Worker static assets.
- `@cloudflare/vite-plugin` runs the Worker and Durable Object locally during `npm run dev`.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
```

npm may ask you to approve install scripts for `esbuild` and `workerd` (Cloudflare's local runtime). Both are needed; the approvals are recorded under `allowScripts` in `package.json`. It may also list `fsevents` (an optional macOS file-watching add-on); it isn't needed and can stay unapproved.

Other scripts:

```bash
npm run typecheck  # tsc for client, server, and config
npm run build      # typecheck + production build into dist/
npm run cf-typegen # regenerate worker-configuration.d.ts after editing wrangler.jsonc
```

### Demo shortcut (not a team feature)

In a room, press **⌘⇧D** (Mac) or **Ctrl+Shift+D** (Windows/Linux) to show or hide a small refresh button in the bottom-right corner. Each click switches **that room** to the next theme, for everyone in it, so you can show themes off without waiting a day. Stamps clear on each switch. The room goes back to the real daily theme at midnight Mountain time, or as soon as everyone has left. Nothing on the page mentions it. Code: `src/client/DemoThemeButton.tsx`, and `demoNextTheme` in `src/server/index.ts`.

## Deploying

```bash
npx wrangler login   # once
npm run deploy       # build + wrangler deploy
```

That deploys the Worker, the Durable Object, and the static site together. There's no login wall: anyone with a room link can join, so share links with your team only.

## Project layout

```
src/
  server/index.ts     Room Durable Object + Worker entry (validates room names)
  client/
    main.tsx          Landing page vs. room, history handling
    Landing.tsx       Name + room form
    App.tsx           A room: socket, state, layout
    JoinScreen.tsx    Name form for direct room links
    PresentList.tsx   Who's here
    Randomizer.tsx    Start / Reshuffle / Next
    StampBoard.tsx    Today's question + image, stamps, dock
    EmojiWheel.tsx    FigJam-style emoji wheel (hold E), with + for more
    FullEmojiPicker.tsx  Every emoji (emoji-picker-element), loaded on demand
    TeamClock.tsx     Mountain time + your local time in the header
    Cursors.tsx       Other people's cursors
    cursorStore.ts    Cursor store + throttled sender
    CopyLink.tsx      Copy the room link
  shared/
    messages.ts       Client <-> server message types and validation
    themes.ts         Loads themes/*.md
    frontmatter.ts    Tiny front-matter parser for theme files
    daily.ts          Date-seeded daily pick
    team.ts           TEAM_TIMEZONE (Mountain)
    stamps.ts         Quick-pick emoji on the wheel; any-emoji validation
    names.ts, room.ts Name and room-name normalization
themes/*.md           One file per daily theme  <-- add themes here
public/themes/        Theme images (placeholder SVG illustrations for now)
```

## Adding a theme

Add a Markdown file to `themes/`, e.g. `themes/office.md`:

```md
---
question: Where are you in the office today?
image: /themes/office.svg   # a file in public/, or an https:// URL
alt: Illustrated floor plan of an office with desks, a kitchen, and a meeting room
credit: Artist Name         # optional
creditUrl: https://...      # optional
contributor: Your Name      # optional; shown as "theme contributed by …"
emojis: 🪑 💻 ☕ 🍕 📞      # optional; this theme's emoji wheel
---
```

- Put the image in `public/themes/` (preferred), or use an `https://` URL that allows hotlinking and is licensed for reuse.
- Pictures with lots of distinct spots work best (bird's-eye scenes, floor plans, maps), since people stamp where they "are".
- Any size works; landscape (e.g. 8:5 or 3:2) shows biggest. For PNG/JPG aim for about 1600 × 1000 and under ~500 KB; SVGs just need a `viewBox`. Leave a little room at the edges. Details in [Picture size and dimensions](#picture-size-and-dimensions).
- Keep it work-appropriate. Aim for 10 or more themes so a theme repeats roughly every two weeks.
- The three current themes (park, beach, house) are placeholder illustrations; replace them whenever.

See [themes/README.md](themes/README.md) for details. "Today" is Mountain time (`TEAM_TIMEZONE` in `src/shared/team.ts`), so the theme changes at midnight MT.
