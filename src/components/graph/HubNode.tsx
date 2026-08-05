"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { getGlowTexture } from "@/lib/glowTexture";

const CORE_RADIUS = 1.4;
const HUB_COLOR = "244, 244, 245";
const ACCENT_COLOR = "#22c55e";
const CLICK_DRAG_THRESHOLD = 0.12;

export default function HubNode({ onOpen }: { onOpen: () => void }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const ringARef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pointerDownPoint = useRef<THREE.Vector3 | null>(null);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    pointerDownPoint.current = event.point.clone();
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    const down = pointerDownPoint.current;
    pointerDownPoint.current = null;
    if (down && down.distanceTo(event.point) < CLICK_DRAG_THRESHOLD) {
      onOpen();
    }
  };

  useFrame((state, delta) => {
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.12;
      wireRef.current.rotation.x += delta * 0.05;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
      coreRef.current.scale.setScalar(pulse * (hovered ? 1.08 : 1));
    }
    if (haloRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.06;
      haloRef.current.scale.setScalar(CORE_RADIUS * (hovered ? 9 : 7) * pulse);
    }
    if (ringARef.current) {
      ringARef.current.rotation.x += delta * 0.25;
      ringARef.current.rotation.z += delta * 0.1;
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.y += delta * 0.18;
      ringBRef.current.rotation.z -= delta * 0.14;
    }
  });

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <sprite ref={haloRef}>
        <spriteMaterial
          map={getGlowTexture()}
          color={ACCENT_COLOR}
          transparent
          opacity={hovered ? 0.22 : 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[CORE_RADIUS, 2]} />
        <meshStandardMaterial
          color={`rgb(${HUB_COLOR})`}
          emissive={ACCENT_COLOR}
          emissiveIntensity={hovered ? 0.95 : 0.55}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      <mesh ref={wireRef}>
        <icosahedronGeometry args={[CORE_RADIUS * 1.35, 1]} />
        <meshBasicMaterial color={ACCENT_COLOR} wireframe transparent opacity={0.35} />
      </mesh>

      <mesh ref={ringARef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[CORE_RADIUS * 1.9, 0.015, 8, 96]} />
        <meshBasicMaterial color={ACCENT_COLOR} transparent opacity={0.5} />
      </mesh>
      <mesh ref={ringBRef} rotation={[0, 0, Math.PI / 3.2]}>
        <torusGeometry args={[CORE_RADIUS * 2.35, 0.012, 8, 96]} />
        <meshBasicMaterial color={ACCENT_COLOR} transparent opacity={0.35} />
      </mesh>

      <Html distanceFactor={9} position={[0, CORE_RADIUS + 0.6, 0]} center style={{ pointerEvents: "none" }}>
        <div
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: "rgba(9,9,11,0.75)",
            border: "1px solid rgba(34,197,94,0.35)",
            whiteSpace: "nowrap",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.3,
            color: "#f4f4f5",
            fontFamily: "var(--font-geist-sans), sans-serif",
          }}
        >
          DKNS Labs
        </div>
      </Html>
    </group>
  );
}
