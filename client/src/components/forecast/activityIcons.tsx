import { JSX } from "react";
import {
  Building2,
  MountainSnow,
  Sparkles,
  SunMedium,
  Waves,
} from "lucide-react";
import type { ActivityInsight } from "../../types/activity";

type ActivityKey = ActivityInsight["activity"];

const iconMap: Partial<Record<ActivityKey, (size: number) => JSX.Element>> = {
  SKIING: (size) => <MountainSnow size={size} strokeWidth={1.75} />,
  SURFING: (size) => <Waves size={size} strokeWidth={1.75} />,
  OUTDOOR_SIGHTSEEING: (size) => <SunMedium size={size} strokeWidth={1.75} />,
  INDOOR_SIGHTSEEING: (size) => <Building2 size={size} strokeWidth={1.75} />,
};

export const getActivityIcon = (
  activity: string,
  size = 16,
): JSX.Element => {
  const accessor = iconMap[activity as ActivityKey];
  return accessor
    ? accessor(size)
    : <Sparkles size={size} strokeWidth={1.75} />;
};

