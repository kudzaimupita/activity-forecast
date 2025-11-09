import { fetch as undiciFetch, RequestInit } from "undici";
import { DailyWeatherSummary, ResolvedLocation, WeatherForecast } from "../../domain/weather";

type FetchResponse = {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
};

type FetchFn = (input: string, init?: RequestInit) => Promise<FetchResponse>;

type GeocodingResult = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type ForecastResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    snowfall_sum: number[];
    snow_depth?: Array<number | null>;
    windspeed_10m_max: number[];
    winddirection_10m_dominant: Array<number | null>;
    cloudcover_mean: number[];
    sunshine_duration: number[];
  };
  timezone: string;
};

type MarineResponse = {
  daily: {
    time: string[];
    wave_height_max: number[];
  };
};

export class OpenMeteoClientError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type OpenMeteoClientOptions = {
  geocodingBaseUrl?: string;
  forecastBaseUrl?: string;
  marineBaseUrl?: string;
  fetchImpl?: FetchFn;
};

const DEFAULT_GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const DEFAULT_FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_MARINE_BASE_URL = "https://marine-api.open-meteo.com/v1/marine";

export class OpenMeteoClient {
  private readonly geocodingBaseUrl: string;
  private readonly forecastBaseUrl: string;
  private readonly marineBaseUrl: string;
  private readonly fetchImpl: FetchFn;

  constructor(options: OpenMeteoClientOptions = {}) {
    this.geocodingBaseUrl = options.geocodingBaseUrl ?? DEFAULT_GEOCODING_BASE_URL;
    this.forecastBaseUrl = options.forecastBaseUrl ?? DEFAULT_FORECAST_BASE_URL;
    this.marineBaseUrl = options.marineBaseUrl ?? DEFAULT_MARINE_BASE_URL;
    this.fetchImpl = options.fetchImpl ?? ((input, init) => undiciFetch(input, init));
  }

  async getForecast(locationQuery: string): Promise<WeatherForecast> {
    const location = await this.lookupLocation(locationQuery);

    const [forecast, marine] = await Promise.all([
      this.fetchForecast(location),
      this.fetchMarineForecast(location).catch((error) => {
        // Marine data might be unavailable for inland locations. Treat absence as non-fatal.
        if (process.env.NODE_ENV !== "test") {
          console.warn("[OpenMeteoClient] Marine data unavailable:", error);
        }
        return undefined;
      }),
    ]);

    const waveByDate = new Map<string, number>();
    if (marine?.daily?.time) {
      marine.daily.time.forEach((date, index) => {
        const value = marine.daily.wave_height_max[index];
        if (isFiniteNumber(value)) {
          waveByDate.set(date, value);
        }
      });
    }

    const dailySummaries = forecast.daily.time.map<DailyWeatherSummary>((date, index) => {
      const waveHeight = waveByDate.get(date) ?? null;

      return {
        date,
        temperatureMinC: forecast.daily.temperature_2m_min[index],
        temperatureMaxC: forecast.daily.temperature_2m_max[index],
        precipitationMm: forecast.daily.precipitation_sum[index],
        rainMm: forecast.daily.rain_sum[index],
        snowfallCm: forecast.daily.snowfall_sum[index],
    snowDepthCm: toNullableNumber(forecast.daily.snow_depth?.[index]),
        windspeedMaxKph: forecast.daily.windspeed_10m_max[index],
        windDirectionDegrees: toNullableNumber(forecast.daily.winddirection_10m_dominant[index]),
        cloudCoverMean: forecast.daily.cloudcover_mean[index],
        sunshineHours: toHours(forecast.daily.sunshine_duration[index]),
        waveHeightM: waveHeight,
      };
    });

    return {
      location,
      daily: dailySummaries,
      generatedAt: new Date().toISOString(),
    };
  }

  private async lookupLocation(locationQuery: string): Promise<ResolvedLocation> {
    const url = new URL(this.geocodingBaseUrl);
    url.searchParams.set("name", locationQuery);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await this.safeJsonFetch<GeocodingResponse>(url);
    if (!response.results || response.results.length === 0) {
      throw new OpenMeteoClientError(`No results found for location "${locationQuery}".`);
    }

    const [match] = response.results;

    return {
      name: match.name,
      country: match.country,
      latitude: match.latitude,
      longitude: match.longitude,
      timezone: match.timezone,
    };
  }

  private async fetchForecast(location: ResolvedLocation): Promise<ForecastResponse> {
    const url = new URL(this.forecastBaseUrl);
    url.searchParams.set("latitude", location.latitude.toString());
    url.searchParams.set("longitude", location.longitude.toString());
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "rain_sum",
      "snowfall_sum",
      "windspeed_10m_max",
      "winddirection_10m_dominant",
      "cloudcover_mean",
      "sunshine_duration",
    ].forEach((param) => url.searchParams.append("daily", param));
    url.searchParams.set("timezone", location.timezone);

    return this.safeJsonFetch<ForecastResponse>(url);
  }

  private async fetchMarineForecast(location: ResolvedLocation): Promise<MarineResponse | undefined> {
    const url = new URL(this.marineBaseUrl);
    url.searchParams.set("latitude", location.latitude.toString());
    url.searchParams.set("longitude", location.longitude.toString());
    url.searchParams.set("daily", "wave_height_max");
    url.searchParams.set("timezone", location.timezone);

    try {
      return await this.safeJsonFetch<MarineResponse>(url);
    } catch (error) {
      return undefined;
    }
  }

  private async safeJsonFetch<T>(url: URL): Promise<T> {
    let response: FetchResponse;

    try {
      response = await this.fetchImpl(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "CollinsonAssessment/1.0 (+https://open-meteo.com)",
        },
      });
    } catch (error) {
      throw new OpenMeteoClientError(`Failed to fetch ${url.toString()}`, error);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new OpenMeteoClientError(
        `Request to ${url.toString()} failed with status ${response.status}: ${body}`
      );
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new OpenMeteoClientError(`Failed to parse response from ${url.toString()}`, error);
    }
  }
}

function toHours(seconds: number): number {
  return roundToDecimals(seconds / 3600, 2);
}

function toNullableNumber(value: number | null | undefined): number | null {
  return isFiniteNumber(value) ? value : null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

