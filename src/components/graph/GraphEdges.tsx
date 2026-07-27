"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SimLink, SimNode } from "@/lib/forceSim";

export default function GraphEdges({ nodes, links }: { nodes: SimNode[]; links: SimLink[] }) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const positions = useMemo(() => new Float32Array(links.length * 2 * 3), [links.length]);

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
    <lineSegments>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#9a9aa5" transparent opacity={0.2} />
    </lineSegments>
  );
}
