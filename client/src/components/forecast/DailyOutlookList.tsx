import { memo } from "react";
import { Navigation, Sparkles } from "lucide-react";
import type { ActivityDay, ActivityInsight } from "../../types/activity";
import { getScoreTokens } from "./scoreTokens";

type DailyOutlookListProps = {
  activity: ActivityInsight;
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const Reasons = memo(function Reasons({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-400">
        <Sparkles size={12} strokeWidth={1.8} />
        No detailed notes
      </span>
    );
  }

  return (
    <>
      {reasons.map((reason, index) => (
        <span key={index} className="inline-flex items-center gap-1">
          <Sparkles size={12} strokeWidth={1.8} />
          {reason}
        </span>
      ))}
    </>
  );
});

const DailyRow = memo(function DailyRow({
  activity,
  day,
}: {
  activity: string;
  day: ActivityDay;
}): JSX.Element {
  const scoreTokens = getScoreTokens(day.score);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="flex items-center gap-2 font-medium text-slate-800">
        <Navigation size={14} strokeWidth={1.8} />
        {formatDate(day.date)}
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold shadow-sm ${scoreTokens.badgeClass}`}
        title={`${scoreTokens.description} • Score ${day.score.toFixed(1)}`}
      >
        {scoreTokens.arrow}
        {day.score.toFixed(1)}
      </span>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <Reasons reasons={day.reasons} />
      </div>
    </div>
  );
});

export const DailyOutlookList = memo(function DailyOutlookList({
  activity,
}: DailyOutlookListProps): JSX.Element {
  return (
    <section className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        7-day outlook
      </div>
      <div className="space-y-1.5">
        {activity.daily.map((day) => (
          <DailyRow key={`${activity.activity}-${day.date}`} activity={activity.activity} day={day} />
        ))}
      </div>
    </section>
  );
});

