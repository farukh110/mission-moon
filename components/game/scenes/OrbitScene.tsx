"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { Earth } from "../objects/Earth";
import { Rocket } from "../objects/Rocket";
import { Starfield } from "../objects/Starfield";
import { ShootingStars } from "../objects/Sky";
import type { SceneProps } from "./types";

const CENTER: [number, number, number] = [0, -12, -6];
const ORBIT_RADIUS = 9.4;

export default function OrbitScene({ motion, reducedEffects }: SceneProps) {
  const craft = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (motion && craft.current) craft.current.rotation.y += delta * 0.1;
  });

  return (
    <>
      <color attach="background" args={["#01020a"]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[-10, 6, 10]} intensity={2.8} />
      <ShootingStars />
      <Starfield count={reducedEffects ? 600 : 1600} />
      <Earth position={CENTER} scale={4} spin={motion} showAtmosphere={!reducedEffects} />

      {/* orbit path (a ring) with the spacecraft travelling along it */}
      <group position={CENTER} rotation={[1.15, 0, 0]}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[ORBIT_RADIUS, 0.04, 8, 128]} />
          <meshBasicMaterial color="#4cc9f0" />
        </mesh>
        <group ref={craft}>
          <group position={[ORBIT_RADIUS, 0, 0]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <Rocket scale={0.16} />
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
