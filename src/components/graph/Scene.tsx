"use client";

import { useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { Project } from "@/lib/types";
import { HUB_ID } from "@/lib/types";
import { useForceGraph } from "@/hooks/useForceGraph";
import type { ForceSimulation } from "@/lib/forceSim";
import GraphNode from "./GraphNode";
import GraphEdges from "./GraphEdges";
import ParticleField from "./ParticleField";
import OrbitRings from "./OrbitRings";
import CameraRig from "./CameraRig";
import HubNode from "./HubNode";

function SimulationDriver({ simulation }: { simulation: ForceSimulation }) {
  useFrame((_, delta) => {
    simulation.step(Math.min(delta, 0.05));
  });
  return null;
}

function matchesQuery(project: Project, query: string): boolean {
  if (!query) return false;
  const haystack = [
    project.name,
    project.category,
    project.status,
    project.company,
    project.framework,
    project.database,
    project.description,
    ...(project.techStack ?? []),
    ...(project.tags ?? []),
    ...(project.aiFeatures ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function Scene({
  projects,
  searchQuery,
  focusedProjectId,
  onSelectProject,
  onOpenInsights,
}: {
  projects: Project[];
  searchQuery: string;
  focusedProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onOpenInsights: () => void;
}) {
  const { simulation, nodes, links, nodeById } = useForceGraph(projects);
  const [dragging, setDragging] = useState(false);

  const query = searchQuery.trim().toLowerCase();
  const hasQuery = query.length > 0;

  const focusNode = focusedProjectId ? nodeById.get(focusedProjectId) ?? null : null;

  const projectNodes = useMemo(
    () => projects.map((project) => ({ project, node: nodeById.get(project.id) })),
    [projects, nodeById]
  );

  return (
    <Canvas camera={{ position: [0, 6, 24], fov: 50 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 26, 62]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[14, 14, 14]} intensity={80} />
      <pointLight position={[-16, -10, -14]} intensity={40} color="#60a5fa" />

      <ParticleField />
      <OrbitRings />
      <SimulationDriver simulation={simulation} />
      <GraphEdges nodes={nodes} links={links} />

      <HubNode onOpen={onOpenInsights} />

      {projectNodes.map(({ project, node }) => {
        if (!node) return null;
        const matched = hasQuery ? matchesQuery(project, query) : false;
        return (
          <GraphNode
            key={project.id}
            project={project}
            node={node}
            highlighted={matched || focusedProjectId === project.id}
            dimmed={hasQuery && !matched}
            onSelect={onSelectProject}
            onDragStateChange={setDragging}
          />
        );
      })}

      <CameraRig
        focusKey={focusedProjectId}
        focusPosition={focusNode && focusNode.id !== HUB_ID ? focusNode.position : null}
        enabled={!dragging}
      />

      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={0.9}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.25}
          radius={0.8}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
