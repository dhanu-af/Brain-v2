"use client";

import { useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Project } from "@/lib/types";
import { useForceGraph } from "@/hooks/useForceGraph";
import type { ForceSimulation } from "@/lib/forceSim";
import GraphNode from "./GraphNode";
import GraphEdges from "./GraphEdges";
import ParticleField from "./ParticleField";
import CameraRig from "./CameraRig";

function SimulationDriver({ simulation }: { simulation: ForceSimulation }) {
  useFrame((_, delta) => {
    simulation.step(Math.min(delta, 0.05));
  });
  return null;
}

function matchesQuery(project: Project, query: string): boolean {
  if (!query) return false;
  const haystack = [project.name, project.category, project.status, ...(project.techStack ?? [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function Scene({
  projects,
  searchQuery,
  focusedProjectId,
  onSelectProject,
}: {
  projects: Project[];
  searchQuery: string;
  focusedProjectId: string | null;
  onSelectProject: (project: Project) => void;
}) {
  const { simulation, nodes, links } = useForceGraph(projects);
  const [dragging, setDragging] = useState(false);

  const query = searchQuery.trim().toLowerCase();
  const hasQuery = query.length > 0;

  const focusIndex = useMemo(
    () => (focusedProjectId ? projects.findIndex((p) => p.id === focusedProjectId) : -1),
    [projects, focusedProjectId]
  );
  const focusNode = focusIndex >= 0 ? nodes[focusIndex] : null;

  return (
    <Canvas camera={{ position: [0, 2, 15], fov: 50 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={["#09090b"]} />
      <fog attach="fog" args={["#09090b", 15, 36]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[10, 10, 10]} intensity={60} />
      <pointLight position={[-12, -8, -10]} intensity={30} color="#60a5fa" />

      <ParticleField />
      <SimulationDriver simulation={simulation} />
      <GraphEdges nodes={nodes} links={links} />

      {projects.map((project, i) => {
        const matched = hasQuery ? matchesQuery(project, query) : false;
        return (
          <GraphNode
            key={project.id}
            project={project}
            node={nodes[i]}
            highlighted={matched || focusedProjectId === project.id}
            dimmed={hasQuery && !matched}
            onSelect={onSelectProject}
            onDragStateChange={setDragging}
          />
        );
      })}

      <CameraRig
        focusKey={focusedProjectId}
        focusPosition={focusNode ? focusNode.position : null}
        enabled={!dragging}
      />
    </Canvas>
  );
}
