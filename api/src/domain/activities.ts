export enum Activity {
  Skiing = "SKIING",
  Surfing = "SURFING",
  OutdoorSightseeing = "OUTDOOR_SIGHTSEEING",
  IndoorSightseeing = "INDOOR_SIGHTSEEING",
}

export type DailyActivityScore = {
  date: string;
  score: number;
  reasons: string[];
};

export type DailyActivityInsight = {
  date: string;
  description: string;
};

export type ActivityScoreResult = {
  activity: Activity;
  score: number;
  summary: string;
  bestDay: DailyActivityInsight;
  daily: DailyActivityScore[];
};

