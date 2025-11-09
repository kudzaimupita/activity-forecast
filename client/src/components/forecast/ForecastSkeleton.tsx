export function ForecastSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-md bg-slate-200/70" />
      <div className="h-12 animate-pulse rounded-md bg-slate-200/70" />
      <div className="h-56 animate-pulse rounded-md bg-slate-200/70" />
    </div>
  );
}

