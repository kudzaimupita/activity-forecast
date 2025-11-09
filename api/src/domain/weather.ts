export type ResolvedLocation = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type DailyWeatherSummary = {
  date: string;
  temperatureMinC: number;
  temperatureMaxC: number;
  precipitationMm: number;
  snowfallCm: number;
  snowDepthCm: number | null;
  windspeedMaxKph: number;
  cloudCoverMean: number;
  sunshineHours: number;
  rainMm: number;
  windDirectionDegrees: number | null;
  waveHeightM: number | null;
};

export type WeatherForecast = {
  location: ResolvedLocation;
  daily: DailyWeatherSummary[];
  generatedAt: string;
};

