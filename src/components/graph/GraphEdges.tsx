"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SimLink, SimNode } from "@/lib/forceSim";
import { getGlowTexture } from "@/lib/glowTexture";

const KIND_COLOR: Record<string, [number, number, number]> = {
  hub: [0.4, 0.95, 0.55],
  category: [0.62, 0.66, 0.78],
  tech: [0.5, 0.68, 0.98],
  related: [0.98, 0.68, 0.35],
};
const DEFAULT_COLOR: [number, number, number] = [0.62, 0.66, 0.78];
const TRAVEL_SPEED = 0.18;

/**
 * Small glowing "energy" points traveling from the hub out to each project
 * along its hub link — only hub links (not the denser category/tech/related
 * mesh) get travelers, to keep the effect readable rather than cluttered.
 */
function EdgeEnergy({ nodes, links }: { nodes: SimNode[]; links: SimLink[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const hubLinks = useMemo(() => links.filter((link) => link.kind === "hub"), [links]);
  const phases = useMemo(() => hubLinks.map(() => Math.random()), [hubLinks]);
  const positions = useMemo(() => new Float32Array(hubLinks.length * 3), [hubLinks.length]);

  useFrame((state) => {
    const geometry = pointsRef.current?.geometry;
    if (!geometry) return;
    for (let i = 0; i < hubLinks.length; i++) {
      const { sourceIndex, targetIndex } = hubLinks[i];
      const a = nodes[sourceIndex].position;
      const b = nodes[targetIndex].position;
      const t = (phases[i] + state.clock.elapsedTime * TRAVEL_SPEED) % 1;
      const offset = i * 3;
      positions[offset] = THREE.MathUtils.lerp(a.x, b.x, t);
      positions[offset + 1] = THREE.MathUtils.lerp(a.y, b.y, t);
      positions[offset + 2] = THREE.MathUtils.lerp(a.z, b.z, t);
    }
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    attribute.needsUpdate = true;
  });

  if (hubLinks.length === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getGlowTexture()}
        size={0.32}
        color="#6bf5a0"
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function GraphEdges({
  nodes,
  links,
  highlightId,
}: {
  nodes: SimNode[];
  links: SimLink[];
  highlightId?: string | null;
}) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const positions = useMemo(() => new Float32Array(links.length * 2 * 3), [links.length]);

  const colors = useMemo(() => {
    const array = new Float32Array(links.length * 2 * 3);
    links.forEach((link, i) => {
      const [r, g, b] = KIND_COLOR[link.kind ?? ""] ?? DEFAULT_COLOR;
      const touchesHighlight =
        highlightId != null &&
        (nodes[link.sourceIndex]?.id === highlightId || nodes[link.targetIndex]?.id === highlightId);
      const dim = highlightId != null && !touchesHighlight;
      const factor = dim ? 0.1 : touchesHighlight ? 1.7 : 1;
      const offset = i * 6;
      array[offset] = r * factor;
      array[offset + 1] = g * factor;
      array[offset + 2] = b * factor;
      array[offset + 3] = r * factor;
      array[offset + 4] = g * factor;
      array[offset + 5] = b * factor;
    });
    return array;
  }, [links, nodes, highlightId]);

  useFrame(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;
    for (let i = 0; i < links.length; i++) {
      const { sourceIndex, targetIndex } = links[i];
      const a = nodes[sourceIndex].position;
      const b = nodes[targetIndex].position;
      const offset = i * 6;
      positions[offset] = a.x;
      positions[offset + 1] = a.y;
      positions[offset + 2] = a.z;
      positions[offset + 3] = b.x;
      positions[offset + 4] = b.y;
      positions[offset + 5] = b.z;
    }
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    attribute.needsUpdate = true;
  });

  if (links.length === 0) return null;

  return (
    <>
      <lineSegments>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <EdgeEnergy nodes={nodes} links={links} />
    </>
  );
}
