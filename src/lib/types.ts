// Status/category/tier accept any string so new values in projects.json never
// require a code change — the literals below are just autocomplete hints.
export type ProjectStatus = "Live" | "Development" | "Testing" | "Archived" | (string & {});
export type ProjectCategory =
  | "Business"
  | "AI"
  | "Agriculture"
  | "Laboratory"
  | "Portfolio"
  | "Internal Tools"
  | "Testing"
  | "Archived"
  | (string & {});
export type ProjectTier = "main" | "supporting" | "personal" | "experimental" | "archived" | (string & {});

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  tier: ProjectTier;
  purpose?: string;
  company?: string;
  website?: string;
  localhost?: string;
  github?: string;
  vercel?: string;
  icon?: string;
  techStack?: string[];
  framework?: string;
  database?: string;
  hosting?: string;
  aiFeatures?: string[];
  tags?: string[];
  /** Explicit relationship hints — other projects' `id` values this one connects to. */
  related?: string[];
  version?: string;
  createdDate?: string;
  lastUpdated?: string;
  notes?: string;
  screenshots?: string[];
}

const STATUS_COLOR_MAP: Record<string, string> = {
  Live: "#22c55e",
  Development: "#f59e0b",
  Testing: "#3b82f6",
  Archived: "#9ca3af",
};
const DEFAULT_STATUS_COLOR = "#a1a1aa";

export function getStatusColor(status: string): string {
  return STATUS_COLOR_MAP[status] ?? DEFAULT_STATUS_COLOR;
}

// Distance from the central "Dhanu Brain" hub — the concentric rings.
const RING_RADIUS: Record<string, number> = {
  main: 8,
  supporting: 13.5,
  personal: 18.5,
  experimental: 23.5,
  archived: 29,
};
const DEFAULT_RING_RADIUS = 32;

export function getRingRadius(tier: string): number {
  return RING_RADIUS[tier] ?? DEFAULT_RING_RADIUS;
}

// Every distinct ring distance in use — drives the orbit guide rings in the scene.
export const TIER_RING_RADII = Array.from(new Set(Object.values(RING_RADIUS))).sort((a, b) => a - b);

// Node mesh size — separate from ring distance.
const NODE_SIZE_MAP: Record<string, number> = {
  main: 1.15,
  supporting: 0.85,
  personal: 0.72,
  experimental: 0.62,
  archived: 0.5,
};
const DEFAULT_NODE_SIZE = 0.65;

export function getNodeSize(tier: string): number {
  return NODE_SIZE_MAP[tier] ?? DEFAULT_NODE_SIZE;
}

export const HUB_ID = "developer-brain";
