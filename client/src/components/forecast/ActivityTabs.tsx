import { memo } from "react";
import type { ActivityInsight } from "../../types/activity";
import { getActivityIcon } from "./activityIcons";
import { getScoreTokens } from "./scoreTokens";

type ActivityTabsProps = {
  activities: ActivityInsight[];
  activeKey: string;
  onSelect: (activity: ActivityInsight) => void;
};

export const ActivityTabs = memo(function ActivityTabs({
  activities,
  activeKey,
  onSelect,
}: ActivityTabsProps): JSX.Element {
  return (
    <nav
      role="tablist"
      aria-label="Activities"
      className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-2 shadow-sm"
    >
      {activities.map((activity) => {
        const isActive = activity.activity === activeKey;
        const tabId = `tab-${activity.activity}`;
        const panelId = `panel-${activity.activity}`;
        const scoreTokens = getScoreTokens(activity.score);
        return (
          <button
            id={tabId}
            key={activity.activity}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={panelId}
            className={`inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-medium transition ${
              isActive
                ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            onClick={() => onSelect(activity)}
          >
            <span className="inline-flex items-center gap-1">
              {getActivityIcon(activity.activity)}
              {activity.activity.replace(/_/g, " ")}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold shadow-sm ${scoreTokens.badgeClass}`}
              title={`${scoreTokens.description} • Score ${activity.score.toFixed(
                1,
              )}`}
            >
              {scoreTokens.arrow}
              {activity.score.toFixed(1)}
            </span>
          </button>
        );
      })}
    </nav>
  );
});

