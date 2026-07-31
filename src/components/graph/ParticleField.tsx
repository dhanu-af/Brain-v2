"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGlowTexture } from "@/lib/glowTexture";

interface StarLayerConfig {
  count: number;
  radius: number;
  size: number;
  color: string;
  opacity: number;
  rotationSpeed: number;
}

// Three depth layers: a dense field of tiny distant stars, a mid layer, and a
// sparse handful of larger near stars — gives the starfield actual depth
// instead of one flat shell of identical dots.
const LAYERS: StarLayerConfig[] = [
  { count: 1400, radius: 60, size: 0.09, color: "#6b7280", opacity: 0.4, rotationSpeed: 0.0015 },
  { count: 600, radius: 42, size: 0.14, color: "#9ca3af", opacity: 0.5, rotationSpeed: 0.003 },
  { count: 120, radius: 30, size: 0.26, color: "#e4e4e7", opacity: 0.7, rotationSpeed: 0.006 },
];

function StarLayer({ count, radius, size, color, opacity, rotationSpeed }: StarLayerConfig) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.35 + Math.random() * 0.65);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      array[i * 3 + 2] = r * Math.cos(phi);
    }
    return array;
  });

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * rotationSpeed;
      pointsRef.current.rotation.x += delta * rotationSpeed * 0.3;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getGlowTexture()}
        size={size}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function ParticleField() {
  return (
    <>
      {LAYERS.map((layer, i) => (
        <StarLayer key={i} {...layer} />
      ))}
    </>
  );
}
