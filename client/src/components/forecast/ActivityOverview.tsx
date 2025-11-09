import { memo } from "react";
import { CalendarDays } from "lucide-react";
import type { ActivityInsight } from "../../types/activity";
import { getActivityIcon } from "./activityIcons";
import { getScoreTokens } from "./scoreTokens";

type ActivityOverviewProps = {
  activity: ActivityInsight;
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export const ActivityOverview = memo(function ActivityOverview({
  activity,
}: ActivityOverviewProps): JSX.Element {
  const scoreTokens = getScoreTokens(activity.score);

  return (
    <section className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {getActivityIcon(activity.activity)}
          {activity.activity.replace(/_/g, " ")}
        </div>
        <div className="text-sm text-slate-500">{activity.summary}</div>
      </header>

      <section className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Best Day
          </h4>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <CalendarDays size={16} strokeWidth={1.75} />
            <span className="font-medium">
              {formatDate(activity.bestDay.date)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {activity.bestDay.description}
          </p>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scorecard
          </h4>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            {scoreTokens.icon}
            <span
              className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold shadow-sm ${scoreTokens.badgeClass}`}
              title={`${scoreTokens.description} • Score ${activity.score.toFixed(
                1,
              )}`}
            >
              {scoreTokens.arrow}
              {activity.score.toFixed(1)}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Overall
            </span>
          </div>
        </div>
      </section>
    </section>
  );
});

