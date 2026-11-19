import { useCallback, useEffect, useRef, useState } from "react";
import usePartySocket from "partysocket/react";
import type { ClientMessage, CursorPosition, PublicUser, ServerMessage, SpeakingOrder } from "../shared/messages";
import type { Board } from "../shared/daily";
import { pathForRoom } from "../shared/room";
import { DEFAULT_EMOJI, type Stamp, type StampEmoji } from "../shared/stamps";
import { CopyLink } from "./CopyLink";
import { DemoThemeButton } from "./DemoThemeButton";
import { Cursors } from "./Cursors";
import { cursorStore, useCursorSender } from "./cursorStore";
import { JoinScreen } from "./JoinScreen";
import { PresentList } from "./PresentList";
import { PrivacyNote } from "./PrivacyNote";
import { Randomizer } from "./Randomizer";
import { StampBoard } from "./StampBoard";
import { TeamClock } from "./TeamClock";

type Props = {
  room: string;
  // Set when arriving from the landing page, which already asked for a name.
  initialName?: string;
};

export function App({ room, initialName }: Props) {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [order, setOrder] = useState<SpeakingOrder | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(Boolean(initialName));
  // The name we joined with. Kept in a ref so we can re-join after a reconnect
  // (a reconnect is a new connection, so the server sees us as new).
  const joinedName = useRef<string | null>(initialName ?? null);
  // My emoji and stamp, so they can be restored after a reconnect.
  const myEmoji = useRef<StampEmoji>(DEFAULT_EMOJI);
  const myStamp = useRef<{ x: number; y: number } | null>(null);

  const send = (msg: ClientMessage) => socket.send(JSON.stringify(msg));

  const socket = usePartySocket({
    party: "room",
    room,
    onOpen() {
      setConnected(true);
      if (joinedName.current) send({ type: "join", name: joinedName.current });
    },
    onClose() {
      setConnected(false);
      setMyId(null);
      cursorStore.clear();
    },
    onMessage(event) {
      const msg = JSON.parse(event.data as string) as ServerMessage;
      switch (msg.type) {
        case "presence":
          setUsers(msg.users);
          break;
        case "order":
          setOrder(msg.order);
          break;
        case "board":
          // A new board (new day, or a demo theme switch) starts without stamps.
          setBoard((prev) => {
            if (prev && (prev.date !== msg.board.date || prev.themeId !== msg.board.themeId)) myStamp.current = null;
            return msg.board;
          });
          break;
        case "stamps":
          setStamps(msg.stamps);
          break;
        case "cursor":
          cursorStore.set(msg.userId, msg.cursor);
          break;
        case "joined":
          setMyId(msg.id);
          setError(null);
          // After a reconnect the server sees a new person; put my things back.
          if (myEmoji.current !== DEFAULT_EMOJI) send({ type: "setEmoji", emoji: myEmoji.current });
          if (myStamp.current) send({ type: "placeStamp", ...myStamp.current });
          break;
        case "error":
          joinedName.current = null;
          setHasJoined(false);
          setError(msg.message);
          break;
      }
    },
  });

  useEffect(() => {
    document.title = `${room} · standomizer`;
    return () => {
      document.title = "standomizer";
    };
  }, [room]);

  const sendCursor = useCallback(
    (cursor: CursorPosition | null) => socket.send(JSON.stringify({ type: "cursor", cursor } satisfies ClientMessage)),
    [socket],
  );
  useCursorSender(sendCursor, myId !== null);

  function join(name: string) {
    joinedName.current = name;
    setHasJoined(true);
    setError(null);
    // If we're not connected yet, onOpen will send it.
    if (socket.readyState === WebSocket.OPEN) send({ type: "join", name });
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">
          <a href="/" className="home-link" title="Switch rooms">
            standomizer
          </a>
        </h1>
        <div className="room-bar">
          <div className="room-bar-start">
            <span className="room-url" data-testid="room">
              {window.location.host + pathForRoom(room)}
            </span>
            <CopyLink />
            {!connected && <span className="status">{hasJoined ? "Reconnecting…" : "Connecting…"}</span>}
          </div>
          <TeamClock />
        </div>
      </header>

      {!hasJoined ? (
        <JoinScreen users={users} error={error} onJoin={join} />
      ) : (
        <main className="room" data-cursor-anchor="room">
          <section className="panel">
            <PresentList users={users} myId={myId} />
            <Randomizer
              users={users}
              order={order}
              myId={myId}
              onStart={() => send({ type: "start" })}
              onNext={() => send({ type: "next" })}
            />
          </section>
          <section className="panel">
            {board && (
              <StampBoard
                board={board}
                stamps={stamps}
                users={users}
                myId={myId}
                onStamp={(x, y) => {
                  myStamp.current = { x, y };
                  send({ type: "placeStamp", x, y });
                }}
                onRemove={() => {
                  myStamp.current = null;
                  send({ type: "removeStamp" });
                }}
                onSetEmoji={(emoji) => {
                  myEmoji.current = emoji;
                  send({ type: "setEmoji", emoji });
                }}
              />
            )}
          </section>
          <Cursors users={users} myId={myId} />
        </main>
      )}

      {hasJoined && <DemoThemeButton onNextTheme={() => send({ type: "demoNextTheme" })} />}

      <footer className="page-footer">
        {hasJoined && board?.contributor && (
          <p className="theme-credit" data-testid="theme-credit">
            theme contributed by {board.contributor}
          </p>
        )}
        <PrivacyNote />
      </footer>
    </div>
  );
}
