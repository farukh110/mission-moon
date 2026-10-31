"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { Astronaut } from "../objects/Astronaut";
import { Crew } from "../objects/Crew";
import { labelTexture } from "@/lib/canvasTextures";
import type { SceneProps } from "./types";

export default function TrainingScene({ crewDressed }: SceneProps) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const k = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.06;
    ring.current.scale.set(k, k, 1);
  });
  const banner = labelTexture("training-banner", ["ASTRONAUT TRAINING", "Suit up. Stay safe."], { bg: "#14264f" });

  return (
    <>
      <color attach="background" args={["#0b1226"]} />
      <hemisphereLight args={["#c8dcff", "#1a2240", 0.8]} />
      <directionalLight position={[4, 10, 8]} intensity={2.2} />
      <pointLight position={[0, 8, 3]} intensity={60} distance={25} color="#ffffff" />

      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[18, 48]} />
        <meshStandardMaterial color="#1a2342" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[18, 18, 10, 48, 1, true]} />
        <meshStandardMaterial color="#16213f" side={1} />
      </mesh>
      <mesh position={[0, 6, -17.6]}>
        <planeGeometry args={[10, 5]} />
        <meshBasicMaterial map={banner} />
      </mesh>

      {/* podium and astronaut on display */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.6, 1.8, 0.3, 32]} />
        <meshStandardMaterial color="#2a3558" metalness={0.5} />
      </mesh>
      <mesh ref={ring} position={[0, 0.32, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.35, 1.5, 48]} />
        <meshBasicMaterial color="#4cc9f0" />
      </mesh>
      <group position={[0, 0.3, 0]}>
        <Astronaut scale={1.5} face={3} />
      </group>

      {/* the student crew: in school clothes until they get dressed */}
      <Crew points={[[3.6, 0, 1.5], [5.1, 0, 1], [6.6, 0, 1.5]]} suited={crewDressed} wave scale={1.1} facing={-0.3} />

      {/* equipment table */}
      <group position={[-7, 0, 3]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[3.2, 0.15, 1.5]} />
          <meshStandardMaterial color="#8a93a8" />
        </mesh>
        {[-1.4, 1.4].map((x) => (
          <mesh key={x} position={[x, 0.4, 0]}>
            <boxGeometry args={[0.15, 0.8, 1.3]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        ))}
        <mesh position={[-0.9, 1.2, 0]}>
          <sphereGeometry args={[0.35, 20, 16]} />
          <meshStandardMaterial color="#f4f6fa" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.6, 0.7, 0.3]} />
          <meshStandardMaterial color="#dfe3ea" />
        </mesh>
        <mesh position={[0.9, 1.0, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.25]} />
          <meshStandardMaterial color="#2b6cb0" />
        </mesh>
      </group>
    </>
  );
}
