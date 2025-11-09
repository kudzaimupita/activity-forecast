import { gql } from "@apollo/client";

export const ACTIVITY_FORECAST = gql`
  query ActivityForecast($location: String!) {
    activityForecast(location: $location) {
      location {
        name
        country
        timezone
      }
      generatedAt
      activities {
        activity
        score
        summary
        bestDay {
          date
          description
        }
        daily {
          date
          score
          reasons
        }
      }
    }
  }
`;

