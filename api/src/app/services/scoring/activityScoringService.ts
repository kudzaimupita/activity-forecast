import { Activity, ActivityScoreResult, DailyActivityScore } from "../../../domain/activities";
import { DailyWeatherSummary, WeatherForecast } from "../../../domain/weather";

type ScoringContext = {
  timezone: string;
};

type ActivityScorer = (day: DailyWeatherSummary, context: ScoringContext) => DailyActivityScore;

const ACTIVITY_ORDER: Activity[] = [
  Activity.Skiing,
  Activity.Surfing,
  Activity.OutdoorSightseeing,
  Activity.IndoorSightseeing,
];

export class ActivityScoringService {
  scoreForecast(forecast: WeatherForecast): ActivityScoreResult[] {
    const context: ScoringContext = {
      timezone: forecast.location.timezone,
    };

    const scores = ACTIVITY_ORDER.map((activity) => {
      const scorer = ACTIVITY_SCORERS[activity];
      const dailyScores = forecast.daily.map((day) => scorer(day, context));
      const bestDay = dailyScores.reduce((best, current) => (current.score > best.score ? current : best));
      const averageScore = average(dailyScores.map((entry) => entry.score));
      const bestDayLabel = formatDate(bestDay.date, context.timezone);
      const summary = buildSummary(activity, averageScore, bestDay, bestDayLabel);

      return {
        activity,
        score: round(averageScore, 2),
        summary,
        bestDay: {
          date: bestDay.date,
          description: bestDay.reasons[0] ?? "Favorable conditions",
        },
        daily: dailyScores.map((entry) => ({
          ...entry,
          score: round(entry.score, 2),
        })),
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }
}

const ACTIVITY_SCORERS: Record<Activity, ActivityScorer> = {
  [Activity.Skiing]: scoreSkiing,
  [Activity.Surfing]: scoreSurfing,
  [Activity.OutdoorSightseeing]: scoreOutdoorSightseeing,
  [Activity.IndoorSightseeing]: scoreIndoorSightseeing,
};

function scoreSkiing(day: DailyWeatherSummary): DailyActivityScore {
  const temperatureScore = idealBelow(day.temperatureMaxC, -2, 5);
  const snowpackScore = idealAbove(day.snowDepthCm ?? 0, 40, 10);
  const freshSnowScore = saturatingScore(day.snowfallCm, 5, 25);
  const windScore = idealBelow(day.windspeedMaxKph, 30, 20);

  const composite = weightedAverage([
    { weight: 0.35, value: temperatureScore },
    { weight: 0.35, value: snowpackScore },
    { weight: 0.2, value: windScore },
    { weight: 0.1, value: freshSnowScore },
  ]);

  const reasons: string[] = [];
  reasons.push(
    `Max temp ${day.temperatureMaxC.toFixed(0)}°C, snowfall ${day.snowfallCm.toFixed(1)} cm, snow depth ${
      day.snowDepthCm !== null ? `${day.snowDepthCm.toFixed(0)} cm` : "n/a"
    }, wind ${day.windspeedMaxKph.toFixed(0)} km/h`
  );

  if (day.snowfallCm >= 3) {
    reasons.push("Fresh snow expected");
  } else if (day.snowDepthCm && day.snowDepthCm >= 40) {
    reasons.push("Solid base depth");
  }

  return {
    date: day.date,
    score: composite,
    reasons,
  };
}

function scoreSurfing(day: DailyWeatherSummary): DailyActivityScore {
  const waveScore =
    day.waveHeightM !== null ? idealBand(day.waveHeightM, { min: 0.5, idealMin: 1.0, idealMax: 2.5, max: 4 }) : 0.4;
  const windScore = idealBand(day.windspeedMaxKph, { min: 5, idealMin: 12, idealMax: 28, max: 45 }, "inverse");
  const tempScore = idealBand(day.temperatureMaxC, { min: 16, idealMin: 20, idealMax: 30, max: 35 });
  const rainPenalty = 1 - saturatingScore(day.precipitationMm, 2, 15);

  const composite = weightedAverage([
    { weight: 0.45, value: waveScore },
    { weight: 0.25, value: windScore },
    { weight: 0.2, value: tempScore },
    { weight: 0.1, value: rainPenalty },
  ]);

  const reasons: string[] = [];
  if (day.waveHeightM !== null) {
    reasons.push(`Wave height ${day.waveHeightM.toFixed(1)} m`);
  } else {
    reasons.push("Wave data unavailable (estimated from wind/precipitation)");
  }
  reasons.push(`Wind ${day.windspeedMaxKph.toFixed(0)} km/h`);
  reasons.push(`Air ${day.temperatureMaxC.toFixed(0)}°C`);

  if (day.precipitationMm > 5) {
    reasons.push("Heavy rain likely");
  }

  return {
    date: day.date,
    score: composite,
    reasons,
  };
}

function scoreOutdoorSightseeing(day: DailyWeatherSummary): DailyActivityScore {
  const tempScore = idealBand(day.temperatureMaxC, { min: 8, idealMin: 18, idealMax: 26, max: 32 });
  const rainScore = 1 - saturatingScore(day.precipitationMm, 1, 8);
  const cloudScore = 1 - saturatingScore(day.cloudCoverMean, 30, 90);
  const windScore = idealBelow(day.windspeedMaxKph, 28, 20);

  const composite = weightedAverage([
    { weight: 0.35, value: tempScore },
    { weight: 0.3, value: rainScore },
    { weight: 0.2, value: cloudScore },
    { weight: 0.15, value: windScore },
  ]);

  const reasons = [
    `High ${day.temperatureMaxC.toFixed(0)}°C, rain ${day.precipitationMm.toFixed(1)} mm, cloud cover ${day.cloudCoverMean.toFixed(
      0
    )}%, wind ${day.windspeedMaxKph.toFixed(0)} km/h`,
  ];

  if (day.precipitationMm <= 1) {
    reasons.push("Dry conditions expected");
  }
  if (day.cloudCoverMean < 40) {
    reasons.push("Plenty of sunshine");
  }

  return {
    date: day.date,
    score: composite,
    reasons,
  };
}

function scoreIndoorSightseeing(day: DailyWeatherSummary): DailyActivityScore {
  const rainScore = saturatingScore(day.precipitationMm, 2, 12);
  const cloudScore = saturatingScore(day.cloudCoverMean, 50, 100);
  const tempDiscomfort = Math.max(
    saturatingScore(Math.abs(day.temperatureMaxC - 22), 4, 18),
    saturatingScore(Math.abs(day.temperatureMinC - 18), 4, 18)
  );
  const windScore = saturatingScore(day.windspeedMaxKph, 25, 60);

  const composite = weightedAverage([
    { weight: 0.35, value: rainScore },
    { weight: 0.25, value: cloudScore },
    { weight: 0.2, value: tempDiscomfort },
    { weight: 0.2, value: windScore },
  ]);

  const reasons = [
    `Rain ${day.precipitationMm.toFixed(1)} mm, clouds ${day.cloudCoverMean.toFixed(0)}%, wind ${day.windspeedMaxKph.toFixed(
      0
    )} km/h`,
  ];

  if (day.precipitationMm >= 5) {
    reasons.push("Rainy day suits indoor plans");
  }
  if (day.temperatureMaxC >= 30 || day.temperatureMaxC <= 5) {
    reasons.push("Temperature extremes favor indoor activities");
  }

  return {
    date: day.date,
    score: composite,
    reasons,
  };
}

function idealBelow(value: number, ideal: number, tolerance: number): number {
  if (value <= ideal) {
    return 1;
  }
  if (value >= ideal + tolerance) {
    return 0;
  }
  return clamp(1 - (value - ideal) / tolerance, 0, 1);
}

function idealAbove(value: number, ideal: number, tolerance: number): number {
  if (value >= ideal) {
    return 1;
  }
  if (value <= ideal - tolerance) {
    return 0;
  }
  return clamp((value - (ideal - tolerance)) / tolerance, 0, 1);
}

type BandConfig = {
  min: number;
  idealMin: number;
  idealMax: number;
  max: number;
};

function idealBand(
  value: number,
  { min, idealMin, idealMax, max }: BandConfig,
  mode: "normal" | "inverse" = "normal"
): number {
  if (value >= idealMin && value <= idealMax) {
    return 1;
  }

  if (value <= min || value >= max) {
    return mode === "inverse" ? 1 : 0;
  }

  if (value < idealMin) {
    const ratio = (value - min) / (idealMin - min);
    return mode === "inverse" ? 1 - ratio : ratio;
  }

  const ratio = (max - value) / (max - idealMax);
  return mode === "inverse" ? 1 - ratio : ratio;
}

function saturatingScore(value: number, start: number, saturation: number): number {
  if (value <= start) {
    return 0;
  }
  if (value >= saturation) {
    return 1;
  }
  return clamp((value - start) / (saturation - start), 0, 1);
}

type WeightedValue = {
  weight: number;
  value: number;
};

function weightedAverage(entries: WeightedValue[]): number {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }
  return entries.reduce((sum, entry) => sum + entry.weight * entry.value, 0) / totalWeight;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildSummary(
  activity: Activity,
  score: number,
  bestDay: DailyActivityScore,
  bestDayLabel: string
): string {
  const adjective = scoreDescriptor(score);
  const headlineReason = bestDay.reasons[0] ?? "Favorable conditions";

  switch (activity) {
    case Activity.Skiing:
      return `${adjective} ski conditions overall. Best on ${bestDayLabel}: ${headlineReason}.`;
    case Activity.Surfing:
      return `${adjective} surf window with best conditions on ${bestDayLabel}: ${headlineReason}.`;
    case Activity.OutdoorSightseeing:
      return `${adjective} for outdoor sightseeing. ${bestDayLabel} looks strongest: ${headlineReason}.`;
    case Activity.IndoorSightseeing:
      return `${adjective} week for indoor plans. ${bestDayLabel} is ideal: ${headlineReason}.`;
    default:
      return `${adjective} outlook with best day ${bestDayLabel}.`;
  }
}

function scoreDescriptor(score: number): string {
  if (score >= 0.75) {
    return "Great";
  }
  if (score >= 0.55) {
    return "Good";
  }
  if (score >= 0.35) {
    return "Mixed";
  }
  return "Challenging";
}

function formatDate(date: string, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: timezone,
    });
    return formatter.format(new Date(`${date}T12:00:00Z`));
  } catch {
    return date;
  }
}

