"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGlowTexture } from "@/lib/glowTexture";
import { TIER_RING_RADII } from "@/lib/types";

const DOTS_PER_RING = 96;
const TILT = -0.42;

function ringPositions(radius: number): Float32Array {
  const array = new Float32Array(DOTS_PER_RING * 3);
  for (let i = 0; i < DOTS_PER_RING; i++) {
    const theta = (i / DOTS_PER_RING) * Math.PI * 2;
    array[i * 3] = Math.cos(theta) * radius;
    array[i * 3 + 1] = 0;
    array[i * 3 + 2] = Math.sin(theta) * radius;
  }
  return array;
}

function Ring({ radius, direction }: { radius: number; direction: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => ringPositions(radius), [radius]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.025 * direction;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getGlowTexture()}
        size={0.16}
        color="#7dd3a8"
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Faint dotted orbit-guide rings at each tier's radius, tilted like Saturn's
 * rings around the hub — purely decorative structure, no raycasting/selection
 * behavior, matching how ParticleField coexists with clickable graph nodes.
 */
export default function OrbitRings() {
  return (
    <group rotation={[TILT, 0, 0]}>
      {TIER_RING_RADII.map((radius, i) => (
        <Ring key={radius} radius={radius} direction={i % 2 === 0 ? 1 : -1} />
      ))}
    </group>
  );
}
