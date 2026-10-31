"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { facadeTexture, flagTexture, groundTexture, labelTexture } from "@/lib/canvasTextures";
import { grassTexture, suparcoSignTexture } from "@/lib/townTextures";
import { Car } from "./Taxi";
import { Lamps, Trees } from "./Town";

/** Everything is built around the gate at local x = 0; +x goes into the centre, the road runs along z = 0. */
const GREY = { color: "#9aa0a8", roughness: 0.85 } as const;
const WHITE = { color: "#eef1f2", roughness: 0.8 } as const;
const TEAL = { color: "#1f7a8c", metalness: 0.3, roughness: 0.5 } as const;
export const BUILDING_X = 62;

/** The red-and-white barrier arm over the eastbound lane. `open` goes from 0 (closed) to 1 (raised). */
export function Barrier({ open, z = -0.9 }: { open: RefObject<number>; z?: number }) {
  const arm = useRef<THREE.Group>(null);
  useFrame(() => {
    if (arm.current) arm.current.rotation.x = open.current * 1.45;
  });
  return (
    <group position={[-1.2, 0, z]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 1.2, 0.5]} />
        <meshStandardMaterial color="#d9a521" roughness={0.6} />
      </mesh>
      <group ref={arm} position={[0, 1.15, 0]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0, 0, -0.35 - i * 0.7]} castShadow>
            <boxGeometry args={[0.14, 0.14, 0.7]} />
            <meshStandardMaterial color={i % 2 ? "#f4f4f4" : "#d62828"} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A small glass guard booth. */
function Booth({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.3, 2.6]} />
        <meshStandardMaterial {...GREY} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial color="#cfe4ea" metalness={0.6} roughness={0.12} transparent opacity={0.55} />
      </mesh>
      {[-1.1, 1.1].flatMap((x) => [-1.1, 1.1].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 1.5, z]}>
          <boxGeometry args={[0.14, 2.3, 0.14]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
      )))}
      <mesh position={[0, 2.7, 0]} castShadow>
        <boxGeometry args={[2.8, 0.2, 2.8]} />
        <meshStandardMaterial {...TEAL} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.9]} />
        <meshStandardMaterial color="#5a4630" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** The gate: grey pillars, the teal SUPARCO beam, the faceted ball on its pole, walls, booths and barriers. */
function Gate({ open, low }: { open: RefObject<number>; low: boolean }) {
  const sign = suparcoSignTexture();
  const plaque = labelTexture("gate-plaque", ["Space Research Centre", "A model inspired by SUPARCO"], { bg: "#12384a", size: [768, 160], font: [48, 32] });
  const ball = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ball.current) ball.current.rotation.y += dt * 0.3;
  });
  return (
    <group>
      {[-8.4, 8.4].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 3.6, 0]} castShadow>
            <boxGeometry args={[1.4, 7.2, 1.4]} />
            <meshStandardMaterial {...GREY} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.8, 0.4, 1.8]} />
            <meshStandardMaterial color="#7d838b" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 6.4, 0]} castShadow>
        <boxGeometry args={[1.1, 2.4, 18.4]} />
        <meshStandardMaterial {...TEAL} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.56, 6.4, 0]} rotation={[0, -s * (Math.PI / 2), 0]}>
          <planeGeometry args={[14.4, 2.4]} />
          <meshStandardMaterial map={sign} roughness={0.6} />
        </mesh>
      ))}
      {/* the faceted ball on a pole, to the right of the gate as seen from the road */}
      <group position={[0, 0, -12.5]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.28, 2.4, 10]} />
          <meshStandardMaterial {...GREY} />
        </mesh>
        <mesh ref={ball} position={[0, 3.2, 0]} castShadow>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#b9c4cf" flatShading metalness={0.3} roughness={0.5} emissive="#4a5560" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <mesh position={[-0.8, 1.6, 12]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.6, 0.96]} />
        <meshBasicMaterial map={plaque} />
      </mesh>
      <mesh position={[-0.55, 0.8, 12]}>
        <boxGeometry args={[0.3, 1.6, 4.8]} />
        <meshStandardMaterial {...GREY} />
      </mesh>

      {/* walls either side */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0, 1.4, s * 31]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 2.8, 44]} />
            <meshStandardMaterial {...GREY} />
          </mesh>
          <mesh position={[0, 2.7, s * 31]}>
            <boxGeometry args={[0.8, 0.2, 44]} />
            <meshStandardMaterial {...TEAL} />
          </mesh>
        </group>
      ))}

      {/* centre island, booths and barriers */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[22, 0.24, 1.8]} />
        <meshStandardMaterial {...GREY} />
      </mesh>
      <Booth position={[2, 0.24, 0]} />
      <Booth position={[1, 0, 7.4]} rotation={Math.PI / 2} />
      <Barrier open={open} z={-0.9} />
      <Barrier open={{ current: 1 }} z={0.9} />
      {!low && (
        <mesh position={[-0.9, 3.1, 0]}>
          <boxGeometry args={[0.05, 0.4, 2]} />
          <meshStandardMaterial color="#d62828" emissive="#d62828" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

/** The research dish that slowly turns. */
function Dish() {
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (head.current) head.current.rotation.y = clock.elapsedTime * 0.25;
  });
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.7, 4, 10]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <group ref={head} position={[0, 4.2, 0]}>
        <mesh rotation={[-0.8, 0, 0]} position={[0, 0.8, 0.5]} castShadow>
          <sphereGeometry args={[3, 24, 12, 0, Math.PI * 2, 0, 0.9]} />
          <meshStandardMaterial {...WHITE} side={2} metalness={0.3} />
        </mesh>
        <mesh position={[0, 2.5, 2.3]} rotation={[-0.8, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
          <meshStandardMaterial {...GREY} />
        </mesh>
      </group>
    </group>
  );
}

/** The main building (faces -x), observatory dome and rooftop dish. */
function MainBuilding({ low }: { low: boolean }) {
  const face = facadeTexture("suparco-facade", "#dfe6ea", 16, 3);
  const label = labelTexture("suparco-main-label", ["SPACE RESEARCH CENTRE", "inspired by SUPARCO (model)"], { bg: "#14384a", size: [1024, 170], font: [64, 44] });
  return (
    <group position={[BUILDING_X, 0, 0]}>
      <mesh position={[0, 7, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 14, 52]} />
        <meshStandardMaterial color="#dfe6ea" roughness={0.85} />
      </mesh>
      <mesh position={[-8.02, 7, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[52, 14]} />
        <meshStandardMaterial map={face} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* glass entrance with a canopy */}
      <mesh position={[-8.4, 3, 0]}>
        <boxGeometry args={[0.4, 6, 11]} />
        <meshStandardMaterial color="#8fc4d6" metalness={0.7} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-11, 6.3, 0]} castShadow>
        <boxGeometry args={[6, 0.4, 14]} />
        <meshStandardMaterial {...TEAL} />
      </mesh>
      {[-6, 6].map((z) => (
        <mesh key={z} position={[-13.6, 3.1, z]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 6.2, 10]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
      ))}
      <mesh position={[-8.5, 8.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 2]} />
        <meshBasicMaterial map={label} />
      </mesh>
      {/* observatory dome */}
      <group position={[0, 14, -17]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[4.2, 4.4, 1, low ? 14 : 28]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[4, low ? 14 : 28, low ? 8 : 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...WHITE} metalness={0.3} roughness={0.35} />
        </mesh>
        <mesh position={[-3.2, 3.4, 0]} rotation={[0, 0, 0.45]}>
          <boxGeometry args={[0.2, 3.6, 1.2]} />
          <meshStandardMaterial color="#10212b" />
        </mesh>
      </group>
      <group position={[0, 14, 16]}>
        <Dish />
      </group>
      {/* roof details */}
      {[-6, 5, 12].map((z) => (
        <mesh key={z} position={[2, 14.6, z]} castShadow>
          <boxGeometry args={[3, 1.2, 3]} />
          <meshStandardMaterial color="#b8bec6" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** A flagpole with a waving flag. */
function Flag({ position }: { position: [number, number, number] }) {
  const flag = flagTexture();
  const cloth = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.14;
  });
  return (
    <group position={position}>
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 10, 8]} />
        <meshStandardMaterial color="#d6dae0" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh ref={cloth} position={[1.5, 8.8, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial map={flag} side={2} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Hedges: one instanced box per run. */
function Hedges({ runs }: { runs: { x: number; z: number; len: number }[] }) {
  return (
    <>
      {runs.map((r, i) => (
        <mesh key={i} position={[r.x + r.len / 2, 0.55, r.z]} castShadow>
          <boxGeometry args={[r.len, 1.1, 1.2]} />
          <meshStandardMaterial color="#2f7a3a" roughness={1} />
        </mesh>
      ))}
    </>
  );
}

function Parking({ x, z, low }: { x: number; z: number; low: boolean }) {
  const colors = ["#e8ecf2", "#b43b3b", "#31507e", "#2e2f33", "#c9ccd2"];
  const n = low ? 3 : 5;
  return (
    <group position={[x, 0, z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[22, 9]} />
        <meshStandardMaterial color="#3d4046" roughness={0.95} />
      </mesh>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[-8 + i * 4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Car color={colors[i % colors.length]} />
        </group>
      ))}
      {Array.from({ length: n + 1 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-10 + i * 4, 0.05, 0]}>
          <planeGeometry args={[0.12, 6]} />
          <meshBasicMaterial color="#e8e8e8" />
        </mesh>
      ))}
    </group>
  );
}

/** The whole SUPARCO-inspired site. Place it with its gate at the origin of the group. */
export function SuparcoCompound({ open, low }: { open: RefObject<number>; low: boolean }) {
  const lawn = grassTexture([30, 20]);
  const ground = groundTexture("suparco-plaza", "#cfcabc", { variance: 14, repeat: [12, 6] });
  const treePoints: [number, number][] = [
    [12, -10], [24, -11], [36, -10], [12, 10], [24, 11], [36, 10],
    [20, -26], [44, -30], [70, -34], [20, 28], [46, 30], [72, 34], [66, -24], [66, 24],
  ];
  return (
    <group>
      <Gate open={open} low={low} />
      <mesh rotation-x={-Math.PI / 2} position={[BUILDING_X / 2 + 5, 0.01, 0]} receiveShadow>
        <planeGeometry args={[BUILDING_X + 20, 90]} />
        <meshStandardMaterial map={lawn} roughness={1} />
      </mesh>
      {/* plaza and roundabout in front of the building */}
      <mesh rotation-x={-Math.PI / 2} position={[BUILDING_X - 20, 0.03, 0]} receiveShadow>
        <planeGeometry args={[26, 44]} />
        <meshStandardMaterial map={ground} roughness={0.9} />
      </mesh>
      <group position={[50, 0, 0]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
          <ringGeometry args={[4, 6.5, 40]} />
          <meshStandardMaterial color="#40434a" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[3.8, 4, 0.4, 28]} />
          <meshStandardMaterial map={lawn} roughness={1} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.18, 0.25, 2.6, 8]} />
          <meshStandardMaterial {...GREY} />
        </mesh>
        <mesh position={[0, 3.6, 0]} castShadow>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshStandardMaterial color="#b9c4cf" flatShading metalness={0.3} roughness={0.5} emissive="#4a5560" emissiveIntensity={0.5} />
        </mesh>
      </group>

      <MainBuilding low={low} />
      <Flag position={[BUILDING_X - 18, 0, -9]} />
      <Flag position={[BUILDING_X - 18, 0, 9]} />
      <Hedges runs={[{ x: 3, z: -6.6, len: 16 }, { x: 3, z: 6.6, len: 16 }, { x: 24, z: -6.6, len: 14 }, { x: 24, z: 6.6, len: 14 }]} />
      <Parking x={30} z={-20} low={low} />
      <Parking x={30} z={20} low={low} />
      <Trees points={treePoints} low={low} scale={1.1} />
      {!low && <Lamps xs={[8, 18, 28, 38]} z={-7.5} side={-1} />}
      {!low && <Lamps xs={[8, 18, 28, 38]} z={7.5} side={1} />}
    </group>
  );
}
