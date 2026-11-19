import { useState, type FormEvent } from "react";
import type { PublicUser } from "../shared/messages";
import { MAX_NAME_LENGTH, cleanName } from "../shared/names";

type Props = {
  users: PublicUser[];
  error: string | null;
  onJoin: (name: string) => void;
};

export function JoinScreen({ users, error, onJoin }: Props) {
  const [name, setName] = useState("");
  const cleaned = cleanName(name);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (cleaned) onJoin(cleaned);
  }

  return (
    <main className="join">
      <form className="join-card" onSubmit={submit}>
        <label htmlFor="name">What's your name?</label>
        <div className="join-row">
          <input
            id="name"
            autoFocus
            autoComplete="off"
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <button type="submit" disabled={!cleaned}>
            Join
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <p className="join-here" data-testid="join-here">
          {users.length === 0
            ? "Nobody's here yet. Be the first!"
            : `Already here: ${users.map((u) => u.name).join(", ")}`}
        </p>
      </form>
    </main>
  );
}
