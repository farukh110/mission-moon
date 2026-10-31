"use client";

import { useRef, type Ref } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCloudTexture, getEarthTexture } from "@/lib/textures";

export const EARTH_RADIUS = 2;

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ATMOSPHERE_FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float glow = pow(max(0.0, 0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    gl_FragColor = vec4(0.35, 0.65, 1.0, 1.0) * glow;
  }
`;

interface EarthProps {
  position: [number, number, number];
  scale?: number;
  meshRef?: Ref<THREE.Mesh>;
  spin?: boolean;
  showAtmosphere?: boolean;
}

export function Earth({ position, scale = 1, meshRef, spin = true, showAtmosphere = true }: EarthProps) {
  const texture = getEarthTexture();
  const group = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const cloudTexture = getCloudTexture();

  useFrame((_, delta) => {
    if (spin && group.current) group.current.rotation.y += delta * 0.06;
    if (spin && clouds.current) clouds.current.rotation.y += delta * 0.085;
  });

  return (
    <group position={position} scale={scale}>
      <group ref={group} rotation={[-0.3, 0, 0]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
          <meshStandardMaterial map={texture} roughness={0.6} metalness={0.05} />
        </mesh>
        <mesh ref={clouds} scale={1.018}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
          <meshStandardMaterial map={cloudTexture} transparent depthWrite={false} roughness={1} />
        </mesh>
      </group>
      {showAtmosphere && (
        <mesh scale={1.12}>
          <sphereGeometry args={[EARTH_RADIUS, 48, 32]} />
          <shaderMaterial
            vertexShader={ATMOSPHERE_VERTEX}
            fragmentShader={ATMOSPHERE_FRAGMENT}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
