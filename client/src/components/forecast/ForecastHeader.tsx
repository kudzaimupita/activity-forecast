import { Clock, MapPin } from "lucide-react";

type ForecastHeaderProps = {
  location: {
    name: string;
    country: string;
    timezone: string;
  };
  generatedAt: string;
};

const formatDateTime = (value: string): { date: string; time: string } => {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date),
    time: date.toLocaleTimeString(),
  };
};

export function ForecastHeader({
  location,
  generatedAt,
}: ForecastHeaderProps): JSX.Element {
  const { date, time } = formatDateTime(generatedAt);

  return (
    <header className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-content-center rounded-md bg-sky-50 text-sky-700">
            <MapPin size={18} strokeWidth={1.7} />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {location.country} · {location.timezone}
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              {location.name}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          <Clock size={15} strokeWidth={1.7} />
          <span>
            {date} · {time}
          </span>
        </div>
      </div>
    </header>
  );
}

