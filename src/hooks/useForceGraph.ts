"use client";

import { useState } from "react";
import * as THREE from "three";
import type { Project } from "@/lib/types";
import { HUB_ID, getRingRadius } from "@/lib/types";
import { buildLinks, ringPositions, type GraphLink } from "@/lib/graphData";
import { ForceSimulation, type SimLink, type SimNode } from "@/lib/forceSim";

const TIER_MASS: Record<string, number> = {
  main: 1.6,
  supporting: 1.1,
  personal: 1,
  experimental: 0.9,
  archived: 0.75,
};
const DEFAULT_MASS = 1;

function buildSimulation(projects: Project[]) {
  const positions = ringPositions(projects);
  const allIds = [HUB_ID, ...projects.map((p) => p.id)];
  const idToIndex = new Map(allIds.map((id, i) => [id, i]));

  const simNodes: SimNode[] = [
    {
      id: HUB_ID,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(),
      pinned: true,
      mass: 10,
      ringRadius: 0,
      driftPhase: new THREE.Vector3(),
    },
  ];

  for (const project of projects) {
    const [x, y, z] = positions.get(project.id) ?? [0, 0, 0];
    const jitter = () => (Math.random() - 0.5) * 1.2;
    simNodes.push({
      id: project.id,
      position: new THREE.Vector3(x + jitter(), y + jitter(), z + jitter()),
      velocity: new THREE.Vector3(),
      pinned: false,
      mass: TIER_MASS[project.tier] ?? DEFAULT_MASS,
      ringRadius: getRingRadius(project.tier),
      driftPhase: new THREE.Vector3(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ),
    });
  }

  const rawLinks: GraphLink[] = buildLinks(projects, HUB_ID);
  const simLinks: SimLink[] = rawLinks
    .map((link) => ({
      sourceIndex: idToIndex.get(link.source) ?? -1,
      targetIndex: idToIndex.get(link.target) ?? -1,
      kind: link.kind,
    }))
    .filter((link) => link.sourceIndex >= 0 && link.targetIndex >= 0);

  const nodeById = new Map(simNodes.map((node) => [node.id, node]));
  const simulation = new ForceSimulation(simNodes, simLinks);
  return { simNodes, simLinks, simulation, nodeById };
}

export function useForceGraph(projects: Project[]) {
  const [state] = useState(() => buildSimulation(projects));

  return {
    simulation: state.simulation,
    nodes: state.simNodes,
    links: state.simLinks,
    nodeById: state.nodeById,
  };
}
