import { useState, type FormEvent } from "react";
import { MAX_NAME_LENGTH, cleanName } from "../shared/names";
import { PrivacyNote } from "./PrivacyNote";
import { MAX_ROOM_NAME_LENGTH, normalizeRoomName, pathForRoom } from "../shared/room";

type Props = { onEnter: (room: string, name: string) => void };

// "/" — your name and a room, on one screen. Creating and joining a room are
// the same thing: a room exists as soon as someone opens it.
export function Landing({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const cleanedName = cleanName(name);
  const room = normalizeRoomName(roomInput);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (cleanedName && room) onEnter(room, cleanedName);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">standomizer</h1>
      </header>
      <main className="join">
        <form className="join-card landing" onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <p id="name-description" className="field-description">
              This is how your name will appear in the list and by your cursor.
            </p>
            <input
              id="name"
              aria-describedby="name-description"
              autoFocus
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="field">
            <label htmlFor="room">Room</label>
            <p id="room-description" className="field-description">
              This will be in the url to share with your team so they can join.
            </p>
            <input
              id="room"
              aria-describedby="room-description"
              autoComplete="off"
              maxLength={MAX_ROOM_NAME_LENGTH + 20}
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="e.g. team-name"
            />
            {room && (
              <p className="join-help" data-testid="room-preview">
                Room link: <code>{window.location.host + pathForRoom(room)}</code>
              </p>
            )}
          </div>

          <button type="submit" disabled={!cleanedName || !room}>
            Join room
          </button>
        </form>
        <PrivacyNote />
      </main>
    </div>
  );
}
