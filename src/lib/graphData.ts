import type { Project } from "./types";
import { getRingRadius } from "./types";

export type LinkKind = "hub" | "category" | "tech" | "related";

export interface GraphLink {
  source: string;
  target: string;
  kind: LinkKind;
}

// Shared across almost every project regardless of real relatedness —
// doesn't count toward a "shared technology" connection on its own.
const GENERIC_TECH = new Set(["Next.js", "Next.js 16", "TypeScript", "Tailwind CSS", "Tailwind CSS v4", "React"]);

function hasMeaningfulOverlap(a: string[], b: string[]): boolean {
  const bSet = new Set(b);
  return a.some((tech) => bSet.has(tech) && !GENERIC_TECH.has(tech));
}

/**
 * Builds every connection automatically from project metadata — category,
 * meaningful shared technology, and explicit `related` hints — plus a
 * always-present link from every project to the central hub. Nothing here
 * is hand-wired per project, so adding a project to projects.json is enough
 * for it to join the graph correctly.
 */
export function buildLinks(projects: Project[], hubId: string): GraphLink[] {
  const links: GraphLink[] = [];
  const seen = new Set<string>();
  const ids = new Set(projects.map((p) => p.id));

  const addLink = (a: string, b: string, kind: LinkKind) => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ source: a, target: b, kind });
  };

  for (const project of projects) {
    addLink(hubId, project.id, "hub");
  }

  const byCategory = new Map<string, Project[]>();
  for (const project of projects) {
    const list = byCategory.get(project.category) ?? [];
    list.push(project);
    byCategory.set(project.category, list);
  }
  for (const group of byCategory.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        addLink(group[i].id, group[j].id, "category");
      }
    }
  }

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const a = projects[i];
      const b = projects[j];
      if (hasMeaningfulOverlap(a.techStack ?? [], b.techStack ?? [])) {
        addLink(a.id, b.id, "tech");
      }
    }
  }

  for (const project of projects) {
    for (const relatedId of project.related ?? []) {
      if (ids.has(relatedId)) addLink(project.id, relatedId, "related");
    }
  }

  return links;
}

function spherePoint(index: number, count: number, radius: number): [number, number, number] {
  if (count <= 1) return [radius, 0, 0];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (count - 1)) * 2;
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * index;
  return [Math.cos(theta) * radiusAtY * radius, y * radius, Math.sin(theta) * radiusAtY * radius];
}

/**
 * Places every project on the sphere shell of its tier's ring around the
 * origin (the hub). Within a ring, projects are ordered by category first so
 * same-category nodes land angularly near each other — no position is ever
 * hand-picked, so the layout scales to any number of future projects.
 */
export function ringPositions(projects: Project[]): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  const byTier = new Map<string, Project[]>();

  for (const project of projects) {
    const list = byTier.get(project.tier) ?? [];
    list.push(project);
    byTier.set(project.tier, list);
  }

  for (const [tier, group] of byTier) {
    const sorted = [...group].sort((a, b) => a.category.localeCompare(b.category));
    const radius = getRingRadius(tier);
    sorted.forEach((project, i) => {
      positions.set(project.id, spherePoint(i, sorted.length, radius));
    });
  }

  return positions;
}
