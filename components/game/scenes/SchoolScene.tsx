"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { Student } from "../objects/Student";
import { DriftingClouds, SkyDome } from "../objects/Sky";
import { Car } from "../objects/Taxi";
import { SchoolCompound } from "../objects/SchoolBuilding";
import { HouseRow, Lamps, Road, Trees, makeHouseRow } from "../objects/Town";
import { groundTexture, labelTexture } from "@/lib/canvasTextures";
import type { SceneProps } from "./types";

const SKY = "#a9cde6";
const ROAD_Z = 23.5;
/** Each student strolls back and forth along a short path; some wave. */
const STUDENTS: { x: number; z: number; dx: number; dz: number; speed: number; wave: boolean }[] = [
  { x: -1, z: 4, dx: 2.5, dz: 0, speed: 0.5, wave: false },
  { x: 1.8, z: 5.2, dx: 0, dz: 0, speed: 0, wave: true },
  { x: 3, z: 3.2, dx: 0, dz: 1.8, speed: 0.6, wave: false },
  { x: -3, z: 6, dx: 1.6, dz: 1.2, speed: 0.45, wave: false },
  { x: 2.4, z: 7, dx: 0, dz: 0, speed: 0, wave: false },
  { x: -5, z: 3, dx: 0, dz: 2.2, speed: 0.4, wave: false },
];

/** A student who walks along a path with a swinging stride. */
function WalkingStudent({ index, x, z, dx, dz, speed, wave, motion }: (typeof STUDENTS)[number] & { index: number; motion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const stride = useRef(0);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const walking = motion && speed > 0;
    const s = walking ? Math.sin(t * speed + index) : 0;
    g.position.set(x + dx * s, 0.03, z + dz * s);
    g.rotation.y = walking ? Math.atan2(dx * Math.cos(t * speed + index), dz * Math.cos(t * speed + index)) : 0.3 + index * 0.4;
    stride.current = walking ? 1 : 0;
  });
  return (
    <group ref={group}>
      <Student index={index} scale={1.3} motion={stride} wave={wave} phase={index * 1.7} />
    </group>
  );
}

export default function SchoolScene({ motion, reducedEffects }: SceneProps) {
  const low = reducedEffects;
  const board = labelTexture("school-board", ["MISSION BRIEFING", "Mission Moon", "A learning simulation"], { bg: "#0f3d2e" });
  const grass = groundTexture("grass-school", "#6fa05a", { variance: 38, repeat: [90, 70] });
  const left = useMemo(() => makeHouseRow(-64, -17, 61, ["GENERAL STORE", "BAKERY", "MEDICAL"]), []);
  const right = useMemo(() => makeHouseRow(18, 66, 62, ["TAILOR", "TEA HOTEL"]), []);
  const across = useMemo(() => makeHouseRow(-64, 66, 63, ["FRUIT SHOP", "MOBILE SHOP", "BAKERY"]), []);
  const treePoints = useMemo<[number, number][]>(() => [[-22, 15.2], [22, 15.2], [-40, 15.2], [40, 15.2], [-30, 31.7], [0, 31.7], [30, 31.7], [52, 31.7]], []);

  return (
    <>
      <color attach="background" args={[SKY]} />
      <SkyDome />
      <DriftingClouds span={130} y={[34, 54]} z={[-130, -50]} count={low ? 5 : 9} size={9} speed={0.7} />
      <fog attach="fog" args={[SKY, low ? 50 : 70, low ? 130 : 200]} />
      <hemisphereLight args={["#d6ecff", "#7a8f5a", 1.1]} />
      <directionalLight
        position={[18, 30, 22]}
        intensity={2.3}
        castShadow={!low}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-bias={-0.0005}
      />

      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.01, 10]}>
        <planeGeometry args={[400, 260]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>

      <SchoolCompound low={low} />

      {/* the street in front of the school */}
      <group position={[0, 0, ROAD_Z]}>
        <Road x0={-70} x1={70} crossings={[-6]} />
      </group>
      <HouseRow specs={left} z={ROAD_Z - 10} front={1} low={low} />
      <HouseRow specs={right} z={ROAD_Z - 10} front={1} low={low} />
      <HouseRow specs={across} z={ROAD_Z + 10} front={-1} low={low} />
      <Trees points={treePoints} low={low} />
      <Lamps xs={[-48, -30, -12, 12, 30, 48]} z={ROAD_Z - 7.4} side={1} />
      <group position={[16, 0, ROAD_Z + LANE_PARK]}>
        <Car color="#31507e" />
      </group>

      {/* briefing board */}
      <group position={[-3.5, 0, 9.5]} rotation={[0, 0.25, 0]}>
        {[-2, 2].map((x) => (
          <mesh key={x} position={[x, 1.2, 0]}>
            <boxGeometry args={[0.15, 2.4, 0.15]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        ))}
        <mesh castShadow position={[0, 2.5, 0]}>
          <boxGeometry args={[4.4, 2.4, 0.16]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        <mesh position={[0, 2.5, 0.09]}>
          <planeGeometry args={[4.2, 2.1]} />
          <meshBasicMaterial map={board} />
        </mesh>
      </group>

      {/* telescope */}
      <group position={[-7, 0, 10]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i * 2 * Math.PI) / 3) * 0.45, 0.85, Math.sin((i * 2 * Math.PI) / 3) * 0.45]}
            rotation={[Math.sin((i * 2 * Math.PI) / 3) * 0.25, 0, -Math.cos((i * 2 * Math.PI) / 3) * 0.25]}
          >
            <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
            <meshStandardMaterial color="#333a44" />
          </mesh>
        ))}
        <mesh castShadow position={[0, 1.9, 0]} rotation={[-0.9, 0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 1.7, 16]} />
          <meshStandardMaterial color="#f2f2f2" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 1.9, 0]} rotation={[-0.9, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.9, 12]} />
          <meshStandardMaterial color="#1b4f8a" />
        </mesh>
      </group>

      {/* students in the courtyard */}
      {STUDENTS.map((st, i) => (
        <WalkingStudent key={i} index={i % 5} motion={motion} {...st} />
      ))}
    </>
  );
}

const LANE_PARK = 5.3;
