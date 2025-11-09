import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

const DEFAULT_LOCATION = "Zermatt";
const MAX_HISTORY = 5;

type ForecastState = {
  lastLocation: string;
  recentLocations: string[];
};

const initialState: ForecastState = {
  lastLocation: DEFAULT_LOCATION,
  recentLocations: [DEFAULT_LOCATION],
};

const insertUniqueLocation = (locations: string[], value: string) => {
  const existing = locations.filter(
    (location) => location.toLowerCase() !== value.toLowerCase(),
  );
  return [value, ...existing].slice(0, MAX_HISTORY);
};

const forecastSlice = createSlice({
  name: "forecast",
  initialState,
  reducers: {
    setLastLocation(state, action: PayloadAction<string>) {
      const location = action.payload.trim();
      if (!location) return;

      state.lastLocation = location;
      state.recentLocations = insertUniqueLocation(
        state.recentLocations,
        location,
      );
    },
    clearRecentLocations(state) {
      state.recentLocations = state.lastLocation
        ? [state.lastLocation]
        : [DEFAULT_LOCATION];
    },
  },
});

export const { setLastLocation, clearRecentLocations } = forecastSlice.actions;
export const forecastReducer = forecastSlice.reducer;
export const selectLastLocation = (state: RootState) =>
  state.forecast.lastLocation;
export const selectRecentLocations = (state: RootState) =>
  state.forecast.recentLocations;

