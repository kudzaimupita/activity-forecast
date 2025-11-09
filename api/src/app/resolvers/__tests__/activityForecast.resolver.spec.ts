import { createActivityForecastResolver } from "../activityForecast";
import { ActivityScoringService } from "../../services/scoring/activityScoringService";
import { OpenMeteoClient, OpenMeteoClientError } from "../../weather/openMeteoClient";
import { WeatherForecast } from "../../../domain/weather";
import { Activity } from "../../../domain/activities";

const sampleForecast: WeatherForecast = {
  generatedAt: "2025-11-08T00:00:00.000Z",
  location: {
    name: "Sample City",
    country: "UK",
    latitude: 51.5,
    longitude: -0.1,
    timezone: "Europe/London",
  },
  daily: Array.from({ length: 3 }).map((_, index) => {
    const date = new Date(Date.UTC(2025, 10, 9 + index)).toISOString().slice(0, 10);
    return {
      date,
      temperatureMinC: index === 0 ? -8 : 16 + index,
      temperatureMaxC: index === 0 ? -1 : 21 + index,
      precipitationMm: index === 2 ? 12 : 0.5 * index,
      snowfallCm: index === 0 ? 6 : 0,
      snowDepthCm: index === 0 ? 70 : null,
      windspeedMaxKph: 18 + index * 4,
      windDirectionDegrees: 180,
      cloudCoverMean: 40 + index * 20,
      sunshineHours: 6 - index,
      rainMm: index === 2 ? 12 : 0.5 * index,
      waveHeightM: index === 1 ? 1.8 : 0.6,
    };
  }),
};

const scoringService = new ActivityScoringService();

describe("activityForecast resolver", () => {
  it("returns activity scores for a valid location", async () => {
    const weatherClient = {
      getForecast: jest.fn().mockResolvedValue(sampleForecast),
    } as unknown as OpenMeteoClient;

    const resolver = createActivityForecastResolver({ weatherClient, scoringService });

    const result = await resolver.Query.activityForecast({}, { location: "  Sample City  " });

    expect(weatherClient.getForecast).toHaveBeenCalledWith("Sample City");
    expect(result.location.name).toBe("Sample City");
    expect(result.generatedAt).toBe(sampleForecast.generatedAt);
    expect(result.activities).toHaveLength(4);
    expect(result.activities.map((entry) => entry.activity)).toEqual(
      expect.arrayContaining([
        Activity.Skiing,
        Activity.Surfing,
        Activity.OutdoorSightseeing,
        Activity.IndoorSightseeing,
      ])
    );
    result.activities.forEach((activity) => {
      expect(activity.daily).toHaveLength(sampleForecast.daily.length);
    });
  });

  it("throws UserInputError for empty location", async () => {
    const resolver = createActivityForecastResolver({
      weatherClient: { getForecast: jest.fn() } as unknown as OpenMeteoClient,
      scoringService,
    });

    await expect(resolver.Query.activityForecast({}, { location: "   " })).rejects.toThrow(
      "Location is required"
    );
  });

  it("maps upstream no results to UserInputError", async () => {
    const weatherClient = {
      getForecast: jest.fn().mockRejectedValue(new OpenMeteoClientError("No results found for location")),
    } as unknown as OpenMeteoClient;

    const resolver = createActivityForecastResolver({ weatherClient, scoringService });

    await expect(resolver.Query.activityForecast({}, { location: "Atlantis" })).rejects.toThrow(
      "No results found"
    );
  });

  it("wraps other upstream errors in ApolloError", async () => {
    const weatherClient = {
      getForecast: jest.fn().mockRejectedValue(new OpenMeteoClientError("Timeout")),
    } as unknown as OpenMeteoClient;

    const resolver = createActivityForecastResolver({ weatherClient, scoringService });

    await expect(resolver.Query.activityForecast({}, { location: "Somewhere" })).rejects.toMatchObject({
      extensions: { code: "WEATHER_UPSTREAM_ERROR" },
    });
  });
});

