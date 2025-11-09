import { useCallback, useEffect, useMemo, useState } from "react";
import { ApolloError, useLazyQuery } from "@apollo/client";
import { Compass, Info, Loader2 } from "lucide-react";
import { LocationSearchForm } from "./components/LocationSearchForm";
import { ForecastPanel } from "./components/ForecastPanel";
import { ACTIVITY_FORECAST } from "./graphql/queries";
import { ActivityForecast } from "./types/activity";
import { SearchHistory } from "./components/SearchHistory";
import { ForecastSkeleton } from "./components/forecast/ForecastSkeleton";
import {
  selectLastLocation,
  selectRecentLocations,
  setLastLocation,
} from "./store/slices/forecastSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

type ActivityForecastQueryResult = {
  activityForecast: ActivityForecast;
};

type ActivityForecastQueryVariables = {
  location: string;
};

function ErrorBanner({ error }: { error: ApolloError }): JSX.Element {
  const normalizedMessage = error.message.trim();
  const message =
    normalizedMessage.length > 0
      ? normalizedMessage
      : "Something went wrong. Please try again.";
  return (
    <div className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <div>
        <p className="font-semibold">Unable to load the forecast.</p>
        <p className="mt-1 text-rose-500">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ hasSearched }: { hasSearched: boolean }): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-slate-300 bg-white px-8 py-10 text-center text-slate-600">
      <Compass className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
      {hasSearched ? (
        <div className="space-y-2">
          <p className="text-lg font-medium text-slate-900">
            No forecast data yet.
          </p>
          <p>Try a different city or check that the backend is running.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-lg font-medium text-slate-900">
            Where should we plan the week?
          </p>
          <p>
            Enter a city or town to rank activities like skiing, surfing, and
            sightseeing for the next 7 days.
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingState(): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        Fetching the latest forecast…
      </div>
      <ForecastSkeleton />
    </div>
  );
}

function Header(): JSX.Element {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
        Activity Forecast
      </h1>
      <p className="max-w-2xl text-sm text-slate-500">
        Compare ski, surf, and sightseeing conditions for the week ahead. Enter
        a location to fetch a ranked outlook.
      </p>
    </header>
  );
}

export default function App(): JSX.Element {
  const dispatch = useAppDispatch();
  const lastLocation = useAppSelector(selectLastLocation);
  const recentLocations = useAppSelector(selectRecentLocations);
  const [hasSearched, setHasSearched] = useState(false);

  const [loadForecast, { data, error, loading, called }] = useLazyQuery<
    ActivityForecastQueryResult,
    ActivityForecastQueryVariables
  >(ACTIVITY_FORECAST, {
    fetchPolicy: "network-only",
  });

  const forecast = useMemo(
    () => data?.activityForecast ?? null,
    [data?.activityForecast],
  );

  const handleSearch = useCallback(
    (location: string): void => {
      dispatch(setLastLocation(location));
      setHasSearched(true);
      void loadForecast({ variables: { location } });
    },
    [dispatch, loadForecast],
  );

  const handleSelectHistory = useCallback(
    (location: string): void => {
      handleSearch(location);
    },
    [handleSearch],
  );

  useEffect(() => {
    if (!called && lastLocation) {
      setHasSearched(true);
      void loadForecast({ variables: { location: lastLocation } });
    }
  }, [called, lastLocation, loadForecast]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
        <Header />

        <main className="flex flex-1 flex-col gap-4 pb-10">
          <LocationSearchForm
            initialLocation={lastLocation}
            isLoading={loading}
            onSubmit={handleSearch}
          />
          <SearchHistory
            locations={recentLocations}
            onSelect={handleSelectHistory}
          />

          {error && <ErrorBanner error={error} />}
          {loading && <LoadingState />}

          {!loading && forecast && <ForecastPanel forecast={forecast} />}

          {!loading && !forecast && (
            <EmptyState hasSearched={hasSearched || called} />
          )}
        </main>

        <footer className="flex items-center justify-between border-t border-slate-200 pt-5 text-[11px] text-slate-500 sm:text-xs">
          Powered by Open-Meteo · GraphQL endpoint:{" "}
          <code className="rounded bg-slate-100 px-2 py-1 text-slate-600">
            http://localhost:8000/graphql
          </code>
        </footer>
      </div>
    </div>
  );
}

