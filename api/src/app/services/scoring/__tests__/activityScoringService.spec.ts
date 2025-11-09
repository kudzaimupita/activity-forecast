import { Activity } from "../../../../domain/activities";
import { WeatherForecast } from "../../../../domain/weather";
import { ActivityScoringService } from "../activityScoringService";

const service = new ActivityScoringService();

describe("ActivityScoringService", () => {
  it("ranks activities and surfaces best day insights", () => {
    const forecast: WeatherForecast = {
      generatedAt: "2025-11-08T00:00:00.000Z",
      location: {
        name: "Testville",
        country: "Wonderland",
        latitude: 40,
        longitude: -105,
        timezone: "UTC",
      },
      daily: [
        {
          date: "2025-11-09",
          temperatureMinC: -12,
          temperatureMaxC: -4,
          precipitationMm: 3,
          snowfallCm: 8,
          snowDepthCm: 90,
          windspeedMaxKph: 18,
          windDirectionDegrees: 180,
          cloudCoverMean: 70,
          sunshineHours: 4,
          rainMm: 0,
          waveHeightM: 0.5,
        },
        {
          date: "2025-11-10",
          temperatureMinC: 19,
          temperatureMaxC: 27,
          precipitationMm: 0.5,
          snowfallCm: 0,
          snowDepthCm: null,
          windspeedMaxKph: 22,
          windDirectionDegrees: 140,
          cloudCoverMean: 35,
          sunshineHours: 9,
          rainMm: 0.5,
          waveHeightM: 2.1,
        },
        {
          date: "2025-11-11",
          temperatureMinC: 5,
          temperatureMaxC: 9,
          precipitationMm: 15,
          snowfallCm: 0,
          snowDepthCm: null,
          windspeedMaxKph: 38,
          windDirectionDegrees: 200,
          cloudCoverMean: 95,
          sunshineHours: 1,
          rainMm: 15,
          waveHeightM: 1.2,
        },
      ],
    };

    const scores = service.scoreForecast(forecast);

    expect(scores).toHaveLength(4);
    scores.forEach((entry) => {
      expect(entry.score).toBeGreaterThanOrEqual(0);
      expect(entry.score).toBeLessThanOrEqual(1);
      expect(entry.bestDay.date).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(entry.daily.length).toBe(forecast.daily.length);
    });

    const skiing = scores.find((entry) => entry.activity === Activity.Skiing);
    expect(skiing?.bestDay.date).toBe("2025-11-09");
    expect(skiing?.bestDay.description).toContain("temp");

    const surfing = scores.find((entry) => entry.activity === Activity.Surfing);
    expect(surfing?.bestDay.date).toBe("2025-11-10");
    expect(surfing?.summary).toContain("best conditions");

    const indoor = scores.find((entry) => entry.activity === Activity.IndoorSightseeing);
    expect(indoor?.bestDay.date).toBe("2025-11-11");
    expect(indoor?.summary.toLowerCase()).toContain("indoor");

    // Ensure ordering favors the strongest-scoring activity.
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    expect(scores.map((item) => item.activity)).toEqual(sortedScores.map((item) => item.activity));
  });
});

