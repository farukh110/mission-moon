"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { Earth } from "../objects/Earth";
import { Moon } from "../objects/Moon";
import { Rocket } from "../objects/Rocket";
import { Starfield } from "../objects/Starfield";
import { ShootingStars, SpeedLines } from "../objects/Sky";
import { getJourneyProgress } from "@/lib/journeyState";
import type { SceneProps } from "./types";

/** The spacecraft stays at the origin; Earth recedes behind it and the Moon grows ahead. */
export default function JourneyScene({ motion, reducedEffects }: SceneProps) {
  const earth = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const craft = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const p = getJourneyProgress();
    earth.current?.position.set(-3.5, -1.5, 9 + p * 70);
    moon.current?.position.set(3, 0.8, -(110 - p * 98));
    if (motion && craft.current) craft.current.rotation.y += delta * 0.25; // slow roll
    if (flame.current) {
      flame.current.visible = true;
      flame.current.scale.set(1, 1 + Math.sin(clock.elapsedTime * 40) * 0.12, 1);
    }
  });

  return (
    <>
      <color attach="background" args={["#01020a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 3, 0]} intensity={2.6} />
      <ShootingStars />
      <SpeedLines />
      <Starfield count={reducedEffects ? 600 : 1600} radius={150} />
      <group ref={earth}>
        <Earth position={[0, 0, 0]} spin={motion} showAtmosphere={!reducedEffects} />
      </group>
      <group ref={moon}>
        <Moon position={[0, 0, 0]} scale={3} spin={motion} />
      </group>
      {/* nose points toward the Moon (-z) */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <Rocket groupRef={craft} flameRef={flame} scale={0.5} />
      </group>
    </>
  );
}
