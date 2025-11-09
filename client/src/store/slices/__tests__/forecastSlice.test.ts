import { describe, expect, it } from "vitest";
import {
  clearRecentLocations,
  forecastReducer,
  selectLastLocation,
  selectRecentLocations,
  setLastLocation,
} from "../forecastSlice";

describe("forecastSlice", () => {
  it("returns initial state", () => {
    const state = forecastReducer(undefined, { type: "init" });

    expect(state.lastLocation).toBe("Zermatt");
    expect(state.recentLocations).toEqual(["Zermatt"]);
  });

  it("updates last location and prepends to history", () => {
    const state = forecastReducer(undefined, setLastLocation("Tokyo"));

    expect(state.lastLocation).toBe("Tokyo");
    expect(state.recentLocations[0]).toBe("Tokyo");
  });

  it("deduplicates history and maintains order", () => {
    const initial = forecastReducer(undefined, setLastLocation("Tokyo"));
    const next = forecastReducer(initial, setLastLocation("zermatt"));

    expect(next.recentLocations).toEqual(["zermatt", "Tokyo"]);
  });

  it("limits history to five entries", () => {
    let state = forecastReducer(undefined, setLastLocation("Paris"));
    state = forecastReducer(state, setLastLocation("Tokyo"));
    state = forecastReducer(state, setLastLocation("Berlin"));
    state = forecastReducer(state, setLastLocation("Sydney"));
    state = forecastReducer(state, setLastLocation("Denver"));

    expect(state.recentLocations).toHaveLength(5);
  });

  it("clears history while retaining last known location", () => {
    let state = forecastReducer(undefined, setLastLocation("Tokyo"));
    state = forecastReducer(state, clearRecentLocations());

    expect(state.recentLocations).toEqual(["Tokyo"]);
  });

  it("selects projected values from root state shape", () => {
    const rootState = {
      forecast: {
        lastLocation: "Tokyo",
        recentLocations: ["Tokyo", "Denver"],
      },
    };

    expect(selectLastLocation(rootState)).toBe("Tokyo");
    expect(selectRecentLocations(rootState)).toEqual(["Tokyo", "Denver"]);
  });
});

