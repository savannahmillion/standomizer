import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { pathForRoom, roomFromPath } from "../shared/room";
import { App } from "./App";
import { forgetEmojiPickerData } from "./FullEmojiPicker";
import { Landing } from "./Landing";
// Fonts, self-hosted: Darumadrop One for the title and buttons (Latin letters
// only; that text is ASCII), Quicksand for everything else.
import "@fontsource/darumadrop-one/latin-400.css";
import "@fontsource-variable/quicksand/wght.css";
import "./styles.css";

// Nothing is stored: clear anything the emoji picker may have left behind.
forgetEmojiPickerData();

// Tidy the URL to the canonical form
// (e.g. /r/Design%20Team -> /r/design-team, or anything unusable -> /).
function readRoom(): string | null {
  const room = roomFromPath(window.location.pathname);
  const canonical = room ? pathForRoom(room) : "/";
  if (window.location.pathname !== canonical) window.history.replaceState(null, "", canonical);
  return room;
}

// Landing page at "/", a room at "/r/<name>". Going from the landing page to a
// room happens in place, so the name you typed is handed over in memory (never
// in the URL or browser storage). Opening a room link directly asks for a name.
function Root() {
  const [room, setRoom] = useState(readRoom);
  const [initialName, setInitialName] = useState<string | undefined>();

  useEffect(() => {
    const onPopState = () => {
      setInitialName(undefined);
      setRoom(readRoom());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function enter(nextRoom: string, name: string) {
    window.history.pushState(null, "", pathForRoom(nextRoom));
    setInitialName(name);
    setRoom(nextRoom);
  }

  return room ? <App key={room} room={room} initialName={initialName} /> : <Landing onEnter={enter} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
