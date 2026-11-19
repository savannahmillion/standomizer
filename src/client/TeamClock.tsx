import { useEffect, useState } from "react";
import { TEAM_TIMEZONE, TEAM_TIMEZONE_NAME } from "../shared/team";

// "9:41 AM MT · 11:41 AM your time" — the team's time, plus yours if it differs.
export function TeamClock() {
  const now = useMinuteClock();
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const team = formatTime(now, TEAM_TIMEZONE);
  const local = formatTime(now, localZone);
  const sameAsTeam = localZone === TEAM_TIMEZONE || (team.time === local.time && team.zone === local.zone);

  return (
    <span className="team-clock" data-testid="team-clock" title={`${TEAM_TIMEZONE_NAME} time (${TEAM_TIMEZONE})`}>
      <span>
        {team.time} <abbr title={`${TEAM_TIMEZONE_NAME} time`}>{team.zone}</abbr>
      </span>
      {!sameAsTeam && (
        <span className="team-clock-local" title={`Your time (${localZone})`}>
          {local.time} your time
        </span>
      )}
    </span>
  );
}

function formatTime(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).formatToParts(date);
  const zone = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  const time = parts
    .filter((p) => p.type !== "timeZoneName")
    .map((p) => p.value)
    .join("")
    .trim();
  return { time, zone };
}

// Re-renders at the start of every minute.
function useMinuteClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = setTimeout(tick, 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50);
    };
    timer = setTimeout(tick, 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return now;
}
