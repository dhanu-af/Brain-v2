import type { Project, ProjectCategory } from "./types";

export interface GraphLink {
  source: string;
  target: string;
}

export function buildLinks(projects: Project[]): GraphLink[] {
  const links: GraphLink[] = [];
  const byCategory = new Map<ProjectCategory, Project[]>();

  for (const project of projects) {
    const list = byCategory.get(project.category) ?? [];
    list.push(project);
    byCategory.set(project.category, list);
  }

  for (const group of byCategory.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        links.push({ source: group[i].id, target: group[j].id });
      }
    }
  }

  return links;
}

export function categoryAnchors(categories: ProjectCategory[]): Map<ProjectCategory, [number, number, number]> {
  const unique = Array.from(new Set(categories));
  const anchors = new Map<ProjectCategory, [number, number, number]>();
  const radius = 6.5;
  const count = unique.length;

  unique.forEach((category, i) => {
    if (count === 1) {
      anchors.set(category, [0, 0, 0]);
      return;
    }
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    anchors.set(category, [
      Math.cos(theta) * radiusAtY * radius,
      y * radius,
      Math.sin(theta) * radiusAtY * radius,
    ]);
  });

  return anchors;
}
