export type ProjectStatus = "Live" | "Development" | "Testing" | "Archived";

export type ProjectCategory =
  | "Business"
  | "AI"
  | "Agriculture"
  | "Laboratory"
  | "Portfolio"
  | "Internal Tools"
  | "Testing"
  | "Archived";

export type ProjectTier = "main" | "supporting" | "archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  tier: ProjectTier;
  website?: string;
  localhost?: string;
  github?: string;
  vercel?: string;
  icon?: string;
  techStack?: string[];
  database?: string;
  hosting?: string;
  aiFeatures?: string[];
  notes?: string;
  lastUpdated?: string;
}

export const CATEGORIES: ProjectCategory[] = [
  "Business",
  "AI",
  "Agriculture",
  "Laboratory",
  "Portfolio",
  "Internal Tools",
  "Testing",
  "Archived",
];

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  Live: "#22c55e",
  Development: "#f59e0b",
  Testing: "#3b82f6",
  Archived: "#9ca3af",
};

export const TIER_RADIUS: Record<ProjectTier, number> = {
  main: 1.15,
  supporting: 0.82,
  archived: 0.55,
};
