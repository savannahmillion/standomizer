import type { PublicUser } from "../shared/messages";

type Props = { users: PublicUser[]; myId: string | null };

export function PresentList({ users, myId }: Props) {
  return (
    <div>
      <h2>Present ({users.length})</h2>
      <ul className="present" data-testid="present">
        {users.map((u) => (
          <li key={u.id}>
            <span className="dot" style={{ background: u.color }} aria-hidden />
            {u.name}
            {u.id === myId && <span className="you"> (you)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
