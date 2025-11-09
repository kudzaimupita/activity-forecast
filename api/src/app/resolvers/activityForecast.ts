import { UserInputError, ApolloError } from "apollo-server-errors";
import { ActivityScoringService } from "../services/scoring/activityScoringService";
import { OpenMeteoClient, OpenMeteoClientError } from "../weather/openMeteoClient";
import { ActivityScoreResult } from "../../domain/activities";
import { WeatherForecast } from "../../domain/weather";

type ActivityForecastArgs = {
  location: string;
};

type ActivityForecastGraphQLResult = {
  location: WeatherForecast["location"];
  generatedAt: string;
  activities: ActivityScoreResult[];
};

export type ActivityForecastResolverDependencies = {
  scoringService?: ActivityScoringService;
  weatherClient?: OpenMeteoClient;
};

export const createActivityForecastResolver = (
  dependencies: ActivityForecastResolverDependencies = {}
) => {
  const scoringService = dependencies.scoringService ?? new ActivityScoringService();
  const weatherClient = dependencies.weatherClient ?? new OpenMeteoClient();

  return {
    Query: {
      activityForecast: async (
        _: unknown,
        args: ActivityForecastArgs
      ): Promise<ActivityForecastGraphQLResult> => {
        const locationQuery = args.location?.trim();

        if (!locationQuery) {
          throw new UserInputError("Location is required");
        }

        try {
          const forecast = await weatherClient.getForecast(locationQuery);
          const activities = scoringService.scoreForecast(forecast);

          return {
            location: forecast.location,
            generatedAt: forecast.generatedAt,
            activities,
          };
        } catch (error) {
          if (error instanceof OpenMeteoClientError) {
            if (error.message.includes("No results")) {
              throw new UserInputError(error.message);
            }
            throw new ApolloError("Failed to retrieve weather data", "WEATHER_UPSTREAM_ERROR", {
              reason: error.message,
            });
          }

          throw error;
        }
      },
    },
  };
};

export const activityForecastResolver = createActivityForecastResolver();

