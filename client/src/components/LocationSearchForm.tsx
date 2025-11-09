import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, MapPin } from "lucide-react";

type LocationSearchFormProps = {
  initialLocation?: string;
  isLoading?: boolean;
  onSubmit: (location: string) => void;
};

export function LocationSearchForm({
  initialLocation = "",
  isLoading = false,
  onSubmit,
}: LocationSearchFormProps): JSX.Element {
  const [input, setInput] = useState(initialLocation);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="location"
          className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
        >
          Location
        </label>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <MapPin className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <input
            id="location"
            type="text"
            name="location"
            placeholder="City or town"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full rounded-sm border border-slate-300 bg-white px-9 py-2 text-sm text-slate-900 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching…
            </>
          ) : (
            <>
              Load forecast
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

