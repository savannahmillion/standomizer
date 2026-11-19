import { Server, routePartykitRequest, type Connection, type WSMessage } from "partyserver";
import { boardFor, boardForTheme, dateKey, nextThemeAfter, type Board } from "../shared/daily";
import {
  isClientMessage,
  type ClientMessage,
  type PublicUser,
  type ServerMessage,
  type SpeakingOrder,
} from "../shared/messages";
import { cleanName, colorForName, disambiguate } from "../shared/names";
import { normalizeRoomName } from "../shared/room";
import { DEFAULT_EMOJI, type Stamp } from "../shared/stamps";

type User = PublicUser & { joinedAt: number };

// One instance per room name. The client connects to /parties/room/<name>
// ("main" by default; see src/shared/room.ts). Rooms are fully isolated.
//
// State is held in memory only. A connection is a "watcher" until it sends
// `join`; only joined users appear in the Present list, the speaking order,
// or on the board.
export class Room extends Server<Env> {
  private users = new Map<string, User>();
  private order: SpeakingOrder | null = null;
  private board: Board | null = null;
  private stamps = new Map<string, Omit<Stamp, "userId">>();

  onConnect(connection: Connection) {
    this.refreshBoard();
    this.send(connection, { type: "presence", users: this.publicUsers() });
    this.send(connection, { type: "order", order: this.order });
    this.send(connection, { type: "board", board: this.board! });
    this.send(connection, { type: "stamps", stamps: this.placedStamps() });
  }

  onMessage(connection: Connection, raw: WSMessage) {
    let msg: unknown;
    try {
      msg = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw));
    } catch {
      return;
    }
    if (!isClientMessage(msg)) return;

    // A room left open overnight gets a fresh board on the first activity of the day.
    if (this.refreshBoard()) {
      this.broadcastMessage({ type: "board", board: this.board! });
      this.broadcastStamps();
    }

    if (msg.type === "join") {
      this.handleJoin(connection, msg.name);
      return;
    }

    // Everything else is only allowed for people who have joined.
    const user = this.users.get(connection.id);
    if (!user) return;
    this.handleAction(user, msg);
  }

  onClose(connection: Connection) {
    if (!this.users.delete(connection.id)) return;

    this.removeFromOrder(connection.id);
    const hadStamp = this.stamps.delete(connection.id);
    // Remember nothing: once the room is empty, the order goes too, and any
    // demo theme switch is undone (the next visitor gets today's real theme).
    if (this.users.size === 0) {
      this.order = null;
      this.board = null;
    }

    this.broadcastPresence();
    this.broadcastOrder();
    if (hadStamp) this.broadcastStamps();
  }

  private handleAction(user: User, msg: Exclude<ClientMessage, { type: "join" }>) {
    switch (msg.type) {
      case "start":
        this.shuffle();
        break;
      case "next":
        this.next();
        break;
      case "demoNextTheme":
        this.demoNextTheme();
        break;
      case "placeStamp":
        this.stamps.set(user.id, { x: msg.x, y: msg.y });
        this.broadcastStamps();
        break;
      case "removeStamp":
        if (this.stamps.delete(user.id)) this.broadcastStamps();
        break;
      case "setEmoji":
        user.emoji = msg.emoji;
        this.broadcastPresence();
        break;
      case "cursor":
        // Relayed, never stored. Not sent back to the person moving it.
        this.broadcast(
          JSON.stringify({ type: "cursor", userId: user.id, cursor: msg.cursor } satisfies ServerMessage),
          [user.id],
        );
        break;
    }
  }

  private handleJoin(connection: Connection, rawName: string) {
    if (this.users.has(connection.id)) return;

    const base = cleanName(rawName);
    if (!base) {
      this.send(connection, { type: "error", message: "Please enter a name." });
      return;
    }

    const name = disambiguate(base, [...this.users.values()].map((u) => u.name));
    this.users.set(connection.id, {
      id: connection.id,
      name,
      color: colorForName(name),
      emoji: DEFAULT_EMOJI,
      joinedAt: Date.now(),
    });

    this.send(connection, { type: "joined", id: connection.id });
    this.broadcastPresence();

    // Late arrivals go to the end of an existing order.
    if (this.order) {
      this.order.ids.push(connection.id);
      this.broadcastOrder();
    }
  }

  // Returns true if the day changed and the board was replaced.
  private refreshBoard(): boolean {
    const today = dateKey(new Date());
    if (this.board?.date === today) return false;
    this.board = boardFor(today);
    this.stamps.clear(); // stamps belong to that day's board
    return true;
  }

  // Demo only: switch this room to the next theme until midnight or until
  // everyone leaves. Stamps belong to the picture, so they're cleared.
  private demoNextTheme() {
    if (!this.board) return;
    this.board = boardForTheme(this.board.date, nextThemeAfter(this.board.themeId));
    this.stamps.clear();
    this.broadcastMessage({ type: "board", board: this.board });
    this.broadcastStamps();
  }

  private shuffle() {
    const ids = this.publicUsers().map((u) => u.id);
    // Fisher–Yates
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    this.order = { ids, current: 0 };
    this.broadcastOrder();
  }

  private next() {
    if (!this.order || this.order.current >= this.order.ids.length) return;
    this.order.current++;
    this.broadcastOrder();
  }

  private removeFromOrder(id: string) {
    if (!this.order) return;
    const index = this.order.ids.indexOf(id);
    if (index === -1) return;
    this.order.ids.splice(index, 1);
    // Keep the highlight on the same person. If the current speaker left,
    // the highlight moves to whoever was next.
    if (index < this.order.current) this.order.current--;
  }

  private publicUsers(): PublicUser[] {
    return [...this.users.values()]
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map(({ id, name, color, emoji }) => ({ id, name, color, emoji }));
  }

  private placedStamps(): Stamp[] {
    return [...this.stamps].map(([userId, s]) => ({ userId, ...s }));
  }

  private broadcastPresence() {
    this.broadcastMessage({ type: "presence", users: this.publicUsers() });
  }

  private broadcastOrder() {
    this.broadcastMessage({ type: "order", order: this.order });
  }

  private broadcastStamps() {
    this.broadcastMessage({ type: "stamps", stamps: this.placedStamps() });
  }

  private broadcastMessage(msg: ServerMessage) {
    this.broadcast(JSON.stringify(msg));
  }

  private send(connection: Connection, msg: ServerMessage) {
    connection.send(JSON.stringify(msg));
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept canonical room names (the client always normalizes them).
    const match = new URL(request.url).pathname.match(/^\/parties\/room\/([^/]+)/);
    if (match && normalizeRoomName(match[1]) !== match[1]) {
      return new Response("Invalid room name", { status: 400 });
    }
    return (
      (await routePartykitRequest(request, env)) ??
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
