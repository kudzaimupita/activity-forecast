import { useEffect, useMemo, useState } from "react";
import type { ActivityInsight } from "../types/activity";
import { ActivityForecast } from "../types/activity";
import { ActivityOverview } from "./forecast/ActivityOverview";
import { ActivityTabs } from "./forecast/ActivityTabs";
import { DailyOutlookList } from "./forecast/DailyOutlookList";
import { ForecastHeader } from "./forecast/ForecastHeader";

type ForecastPanelProps = {
  forecast: ActivityForecast;
};

function EmptyActivityState(): JSX.Element {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
      Forecast data is unavailable for the selected location. Try another city
      or refresh once the backend is ready.
    </div>
  );
}

export function ForecastPanel({ forecast }: ForecastPanelProps): JSX.Element {
  const { location, generatedAt, activities } = forecast;

  const [activeKey, setActiveKey] = useState<string>(
    activities[0]?.activity ?? "",
  );

  useEffect(() => {
    if (!activities.some((item) => item.activity === activeKey)) {
      setActiveKey(activities[0]?.activity ?? "");
    }
  }, [activities, activeKey]);

  const hasActivities = activities.length > 0;

  const activeActivity = useMemo<ActivityInsight | null>(() => {
    if (!hasActivities) return null;
    return (
      activities.find((item) => item.activity === activeKey) ?? activities[0]
    );
  }, [activities, activeKey, hasActivities]);

  if (!hasActivities || !activeActivity) {
    return (
      <section className="flex flex-col gap-4">
        <ForecastHeader location={location} generatedAt={generatedAt} />
        <EmptyActivityState />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <ForecastHeader location={location} generatedAt={generatedAt} />

      <ActivityTabs
        activities={activities}
        activeKey={activeActivity.activity}
        onSelect={(activity) => setActiveKey(activity.activity)}
      />

      <article
        role="tabpanel"
        id={`panel-${activeActivity.activity}`}
        aria-labelledby={`tab-${activeActivity.activity}`}
        className="flex flex-col gap-4"
      >
        <ActivityOverview activity={activeActivity} />
        <DailyOutlookList activity={activeActivity} />
      </article>
    </section>
  );
}

