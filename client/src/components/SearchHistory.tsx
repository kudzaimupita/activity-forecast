type SearchHistoryProps = {
  locations: string[];
  onSelect: (location: string) => void;
};

import { History } from "lucide-react";

export function SearchHistory({
  locations,
  onSelect,
}: SearchHistoryProps): JSX.Element | null {
  if (locations.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <History className="h-3.5 w-3.5" />
        Recent
      </div>
      <div className="flex flex-wrap gap-2">
        {locations.map((location) => (
          <button
            key={location}
            type="button"
            onClick={() => onSelect(location)}
            className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            {location}
          </button>
        ))}
      </div>
    </div>
  );
}

