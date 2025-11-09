import { configureStore } from "@reduxjs/toolkit";
import { forecastReducer } from "./slices/forecastSlice";

export const store = configureStore({
  reducer: {
    forecast: forecastReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

