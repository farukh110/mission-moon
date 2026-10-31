"use client";

import { useRef, type Ref } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMoonTexture } from "@/lib/textures";

// Earth radius 2 -> Moon radius ~0.55 keeps the real size ratio (about 0.27).
export const MOON_RADIUS = 0.55;

interface MoonProps {
  position: [number, number, number];
  scale?: number;
  meshRef?: Ref<THREE.Mesh>;
  spin?: boolean;
}

export function Moon({ position, scale = 1, meshRef, spin = true }: MoonProps) {
  const texture = getMoonTexture();
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spin && group.current) group.current.rotation.y += delta * 0.03;
  });

  return (
    <group position={position} scale={scale}>
      <group ref={group}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[MOON_RADIUS, 48, 32]} />
          <meshStandardMaterial map={texture} bumpMap={texture} bumpScale={1.5} roughness={1} />
        </mesh>
      </group>
    </group>
  );
}
