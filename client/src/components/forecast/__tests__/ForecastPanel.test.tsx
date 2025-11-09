import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ForecastPanel } from "../../ForecastPanel";
import type { ActivityForecast } from "../../../types/activity";

const sampleForecast: ActivityForecast = {
  location: {
    name: "Zermatt",
    country: "Switzerland",
    timezone: "Europe/Zurich",
  },
  generatedAt: "2025-11-09T20:55:42.000Z",
  activities: [
    {
      activity: "OUTDOOR_SIGHTSEEING",
      score: 0.6,
      summary: "Good for outdoor sightseeing.",
      bestDay: {
        date: "2025-11-12",
        description: "High 9°C, cloud cover 25%.",
      },
      daily: [
        {
          date: "2025-11-09",
          score: 0.7,
          reasons: ["Dry", "Sunny"],
        },
      ],
    },
    {
      activity: "SURFING",
      score: 0.5,
      summary: "Mixed surf window.",
      bestDay: {
        date: "2025-11-10",
        description: "Wave data unavailable.",
      },
      daily: [
        {
          date: "2025-11-10",
          score: 0.5,
          reasons: ["Wind 4 km/h"],
        },
      ],
    },
  ],
};

describe("ForecastPanel", () => {
  it("renders location header details", () => {
    render(<ForecastPanel forecast={sampleForecast} />);

    expect(screen.getByText("Zermatt")).toBeInTheDocument();
    expect(screen.getByText(/Switzerland/)).toBeInTheDocument();
  });

  it("defaults to the first activity tab", () => {
    render(<ForecastPanel forecast={sampleForecast} />);

    expect(screen.getByRole("tab", { name: /OUTDOOR SIGHTSEEING/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/Good for outdoor sightseeing/i)).toBeInTheDocument();
  });

  it("switches activities when another tab is selected", async () => {
    const user = userEvent.setup();
    render(<ForecastPanel forecast={sampleForecast} />);

    await user.click(screen.getByRole("tab", { name: /SURFING/i }));

    expect(screen.getByRole("tab", { name: /SURFING/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/Mixed surf window/i)).toBeInTheDocument();
  });
});

