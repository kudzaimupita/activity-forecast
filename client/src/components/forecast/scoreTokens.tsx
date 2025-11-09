import { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Gauge,
} from "lucide-react";

type ScoreTokens = {
  arrow: ReactNode;
  icon?: ReactNode;
  badgeClass: string;
  description: string;
};

const HIGH_THRESHOLD = 0.7;
const MEDIUM_THRESHOLD = 0.4;

export const getScoreTokens = (score: number): ScoreTokens => {
  if (score >= HIGH_THRESHOLD) {
    return {
      arrow: <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />,
      icon: <Gauge className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.8} />,
      badgeClass: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
      description: "Strong conditions",
    };
  }

  if (score >= MEDIUM_THRESHOLD) {
    return {
      arrow: <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />,
      icon: <Gauge className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.8} />,
      badgeClass: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
      description: "Moderate conditions",
    };
  }

  return {
    arrow: <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={1.8} />,
    icon: <Gauge className="h-3.5 w-3.5 text-rose-600" strokeWidth={1.8} />,
    badgeClass: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    description: "Challenging conditions",
  };
};

