export type ActivityDay = {
  date: string;
  score: number;
  reasons: string[];
};

export type ActivityInsight = {
  activity: string;
  score: number;
  summary: string;
  bestDay: {
    date: string;
    description: string;
  };
  daily: ActivityDay[];
};

export type ActivityForecast = {
  location: {
    name: string;
    country: string;
    timezone: string;
  };
  generatedAt: string;
  activities: ActivityInsight[];
};

