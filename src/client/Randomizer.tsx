import { useEffect, useState } from "react";
import type { PublicUser, SpeakingOrder } from "../shared/messages";

const CONFIRM_MS = 3000;

type Props = {
  users: PublicUser[];
  order: SpeakingOrder | null;
  myId: string | null;
  onStart: () => void;
  onNext: () => void;
};

export function Randomizer({ users, order, myId, onStart, onNext }: Props) {
  // Reshuffling an existing order takes a second click within a few seconds.
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  function handleStart() {
    if (order && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onStart();
  }

  const byId = new Map(users.map((u) => [u.id, u]));
  const people = order?.ids.map((id) => byId.get(id)).filter((u) => u !== undefined) ?? [];
  const done = order !== null && order.current >= people.length;

  return (
    <div className="randomizer">
      <button
        type="button"
        className={confirming ? "start confirming" : "start"}
        onClick={handleStart}
        data-testid="start"
      >
        {confirming ? "Reshuffle? Click again" : order ? "Reshuffle" : "Start"}
      </button>

      {order && (
        <>
          <h2>Order</h2>
          <ol className="order" data-testid="order">
            {people.map((u, i) => {
              const state = i < order.current ? "done" : i === order.current ? "current" : "upcoming";
              return (
                <li key={u.id} className={state} aria-current={state === "current" ? "true" : undefined}>
                  <span className="dot" style={{ background: u.color }} aria-hidden />
                  <span className="order-name">
                    {u.name}
                    {u.id === myId && <span className="you"> (you)</span>}
                  </span>
                </li>
              );
            })}
          </ol>

          {done ? (
            <p className="all-done" data-testid="all-done">
              That's everyone! 🎉
            </p>
          ) : null}

          {!done && (
            <div className="order-controls">
              <button type="button" onClick={onNext} data-testid="next">
                {order.current === people.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
