"use client";

import { useRef } from "react";
import type * as THREE from "three";
import { Earth } from "../objects/Earth";
import { Moon } from "../objects/Moon";
import { Starfield } from "../objects/Starfield";
import { ShootingStars } from "../objects/Sky";
import type { SceneProps } from "./types";

const EARTH_POS: [number, number, number] = [-3, 0, 0];
const MOON_POS: [number, number, number] = [6, 0.8, -2];

export default function EarthMoonScene({ motion, reducedEffects }: SceneProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-8, 4, 10]} intensity={2.6} />
      <ShootingStars />
      <Starfield count={reducedEffects ? 600 : 1600} />
      <Earth position={EARTH_POS} meshRef={earthRef} spin={motion} showAtmosphere={!reducedEffects} />
      <Moon position={MOON_POS} meshRef={moonRef} spin={motion} />
    </>
  );
}
