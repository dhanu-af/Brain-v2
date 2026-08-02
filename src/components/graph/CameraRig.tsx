"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const ARRIVE_EPSILON = 0.2;
const FOCUS_OFFSET = new THREE.Vector3(0, 1.3, 6);
const HOME_POSITION = new THREE.Vector3(0, 6, 24);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

export default function CameraRig({
  focusKey,
  focusPosition,
  enabled,
  autoRotate = false,
  resetSignal = 0,
}: {
  focusKey: string | null;
  focusPosition: THREE.Vector3 | null;
  enabled: boolean;
  autoRotate?: boolean;
  /** Bump this (e.g. ++counter) to fly the camera back to the default full-graph view. */
  resetSignal?: number;
}) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const arrived = useRef(true);
  const lastFocusKey = useRef<string | null>(null);
  const lastResetSignal = useRef(resetSignal);
  const flyMode = useRef<"focus" | "home">("focus");
  const desiredTarget = useRef(new THREE.Vector3());
  const desiredCameraPos = useRef(new THREE.Vector3());

  useEffect(() => {
    if (focusKey !== lastFocusKey.current) {
      lastFocusKey.current = focusKey;
      flyMode.current = "focus";
      arrived.current = focusKey === null;
    }
  }, [focusKey]);

  useEffect(() => {
    if (resetSignal !== lastResetSignal.current) {
      lastResetSignal.current = resetSignal;
      flyMode.current = "home";
      arrived.current = false;
    }
  }, [resetSignal]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const flyingHome = flyMode.current === "home";

    if (!arrived.current && (flyingHome || focusPosition)) {
      if (flyingHome) {
        desiredTarget.current.copy(HOME_TARGET);
        desiredCameraPos.current.copy(HOME_POSITION);
      } else if (focusPosition) {
        desiredTarget.current.copy(focusPosition);
        desiredCameraPos.current.copy(focusPosition).add(FOCUS_OFFSET);
      }

      controls.target.lerp(desiredTarget.current, 0.05);
      camera.position.lerp(desiredCameraPos.current, 0.05);

      const settled =
        controls.target.distanceTo(desiredTarget.current) < ARRIVE_EPSILON &&
        camera.position.distanceTo(desiredCameraPos.current) < ARRIVE_EPSILON;
      if (settled) arrived.current = true;
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={enabled}
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={45}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
    />
  );
}
