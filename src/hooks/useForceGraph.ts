"use client";

import { useState } from "react";
import * as THREE from "three";
import type { Project } from "@/lib/types";
import { buildLinks, categoryAnchors } from "@/lib/graphData";
import { ForceSimulation, type SimLink, type SimNode } from "@/lib/forceSim";

const TIER_MASS: Record<Project["tier"], number> = {
  main: 1.6,
  supporting: 1.1,
  archived: 0.75,
};

function buildSimulation(projects: Project[]) {
  const anchors = categoryAnchors(projects.map((p) => p.category));
  const idToIndex = new Map(projects.map((p, i) => [p.id, i]));

  const simNodes: SimNode[] = projects.map((project) => {
    const anchor = anchors.get(project.category) ?? [0, 0, 0];
    const jitter = () => (Math.random() - 0.5) * 2.6;
    return {
      id: project.id,
      position: new THREE.Vector3(anchor[0] + jitter(), anchor[1] + jitter(), anchor[2] + jitter()),
      velocity: new THREE.Vector3(),
      pinned: false,
      mass: TIER_MASS[project.tier],
      driftPhase: new THREE.Vector3(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ),
    };
  });

  const rawLinks = buildLinks(projects);
  const simLinks: SimLink[] = rawLinks
    .map((link) => ({
      sourceIndex: idToIndex.get(link.source) ?? -1,
      targetIndex: idToIndex.get(link.target) ?? -1,
    }))
    .filter((link) => link.sourceIndex >= 0 && link.targetIndex >= 0);

  const simulation = new ForceSimulation(simNodes, simLinks);
  return { simNodes, simLinks, simulation };
}

export function useForceGraph(projects: Project[]) {
  const [state] = useState(() => buildSimulation(projects));

  return {
    simulation: state.simulation,
    nodes: state.simNodes,
    links: state.simLinks,
  };
}
