"use client";

import { useRef, type ReactNode, type Ref, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { StudentHead } from "./Student";

interface AstronautProps {
  groupRef?: Ref<THREE.Group>;
  scale?: number;
  /** 0 = standing still, 1 = walking at full stride. Read every frame, so it can be a ref. */
  motion?: RefObject<number>;
  /** Wave with the right arm and sway gently. */
  wave?: boolean | RefObject<boolean>;
  /** Offsets the animation so a group of astronauts does not move in step. */
  phase?: number;
  /** Which student's face shows through the helmet glass. */
  face?: number;
  /** Extra children, e.g. a hotspot attached to the astronaut. */
  children?: ReactNode;
}

const SUIT = { color: "#f4f6fa", roughness: 0.55, metalness: 0.05 } as const;
const GREY = { color: "#9aa0aa", roughness: 0.4, metalness: 0.6 } as const;
const GLOVE = { color: "#e08b1a", roughness: 0.6 } as const;

/** Joint ring (elbow, knee, wrist). */
function Ring({ y, r }: { y: number; r: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r, 0.03, 10, 24]} />
      <meshStandardMaterial {...GREY} />
    </mesh>
  );
}

/**
 * Astronaut about 2.3 units tall, standing on y = 0 and facing +z. Limbs swing when moving.
 * The helmet is clear glass, so the student's face can be seen inside.
 */
export function Astronaut({ groupRef, scale = 1, motion, wave = false, phase = 0, face = 0, children }: AstronautProps) {
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const cycle = useRef(0);

  useFrame(({ clock }, delta) => {
    const m = motion?.current ?? 0;
    cycle.current += Math.min(delta, 0.05) * 9 * m;
    const waving = typeof wave === "boolean" ? wave : wave.current;
    const swing = Math.sin(cycle.current + phase) * 0.65 * m;
    const t = clock.elapsedTime + phase;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8 + Math.sin(t * 1.5) * 0.04 * (1 - m);
    if (armR.current) armR.current.rotation.x = waving ? -2.5 + Math.sin(t * 7) * 0.35 : swing * 0.8 + Math.sin(t * 1.5 + 1) * 0.04 * (1 - m);
    if (body.current) body.current.position.y = waving ? Math.abs(Math.sin(t * 3.5)) * 0.04 : Math.abs(Math.sin(cycle.current + phase)) * 0.05 * m;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <group ref={body}>
        {/* legs: thigh, knee ring, shin, boot (pivot at the hip) */}
        {[
          { x: -0.19, ref: legL },
          { x: 0.19, ref: legR },
        ].map(({ x, ref }) => (
          <group key={x} ref={ref} position={[x, 0.98, 0]}>
            <mesh position={[0, -0.24, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.145, 0.48, 18]} />
              <meshStandardMaterial {...SUIT} />
            </mesh>
            <Ring y={-0.5} r={0.15} />
            <mesh position={[0, -0.72, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.13, 0.42, 18]} />
              <meshStandardMaterial {...SUIT} />
            </mesh>
            <mesh position={[0, -0.9, 0.07]} castShadow>
              <boxGeometry args={[0.27, 0.2, 0.46]} />
              <meshStandardMaterial color="#4a505c" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.97, 0.08]}>
              <boxGeometry args={[0.29, 0.05, 0.5]} />
              <meshStandardMaterial color="#25282e" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* waist ring and oval torso */}
        <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1]}>
          <torusGeometry args={[0.35, 0.04, 10, 28]} />
          <meshStandardMaterial {...GREY} />
        </mesh>
        <mesh position={[0, 1.4, 0]} scale={[1, 1, 0.72]} castShadow>
          <cylinderGeometry args={[0.4, 0.35, 0.8, 28]} />
          <meshStandardMaterial {...SUIT} />
        </mesh>
        <mesh position={[0, 1.66, 0]} scale={[1, 1, 0.72]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 0.14, 28]} />
          <meshStandardMaterial {...SUIT} />
        </mesh>

        {/* chest control panel, hoses, flag patch */}
        <mesh position={[0, 1.45, 0.275]}>
          <boxGeometry args={[0.36, 0.26, 0.05]} />
          <meshStandardMaterial color="#3a3f48" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[-0.07, 1.48, 0.302]}>
          <boxGeometry args={[0.15, 0.1, 0.01]} />
          <meshStandardMaterial color="#4cc9f0" emissive="#1f9ec5" emissiveIntensity={0.8} />
        </mesh>
        {[0.04, 0.1, 0.16].map((x, i) => (
          <mesh key={x} position={[x, 1.39, 0.3]}>
            <cylinderGeometry args={[0.018, 0.018, 0.02, 10]} />
            <meshStandardMaterial color={["#d6453d", "#ffb703", "#5be584"][i]} emissive={["#d6453d", "#ffb703", "#5be584"][i]} emissiveIntensity={0.7} />
          </mesh>
        ))}
        {[-0.15, 0.15].map((x) => (
          <mesh key={x} position={[x, 1.2, 0.27]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.12, 10]} />
            <meshStandardMaterial color="#f0a202" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0.27, 1.6, 0.235]}>
          <boxGeometry args={[0.15, 0.1, 0.012]} />
          <meshStandardMaterial color="#01411c" />
        </mesh>
        <mesh position={[0.225, 1.6, 0.242]}>
          <boxGeometry args={[0.04, 0.1, 0.006]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* oxygen backpack with vents and hoses */}
        <mesh position={[0, 1.42, -0.42]} castShadow>
          <boxGeometry args={[0.66, 0.88, 0.3]} />
          <meshStandardMaterial color="#dfe3ea" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.9, -0.42]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
          <meshStandardMaterial {...GREY} />
        </mesh>
        {[1.25, 1.35, 1.45].map((y) => (
          <mesh key={y} position={[0, y, -0.575]}>
            <boxGeometry args={[0.44, 0.03, 0.01]} />
            <meshStandardMaterial color="#6b727e" />
          </mesh>
        ))}
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 1.46, -0.22]} rotation={[0.85, 0, x < 0 ? 0.3 : -0.3]}>
            <cylinderGeometry args={[0.022, 0.022, 0.5, 8]} />
            <meshStandardMaterial {...GREY} />
          </mesh>
        ))}

        {/* arms: shoulder, upper arm, elbow, forearm, glove (pivot at the shoulder) */}
        {[
          { side: -1, ref: armL },
          { side: 1, ref: armR },
        ].map(({ side, ref }) => (
          <group key={side} ref={ref} position={[side * 0.47, 1.68, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.17, 18, 14]} />
              <meshStandardMaterial {...SUIT} />
            </mesh>
            <mesh position={[0, -0.24, 0]} castShadow>
              <cylinderGeometry args={[0.125, 0.115, 0.4, 16]} />
              <meshStandardMaterial {...SUIT} />
            </mesh>
            <Ring y={-0.46} r={0.115} />
            <mesh position={[0, -0.68, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.1, 0.4, 16]} />
              <meshStandardMaterial {...SUIT} />
            </mesh>
            <Ring y={-0.89} r={0.105} />
            <mesh position={[0, -1.0, 0.02]} castShadow>
              <sphereGeometry args={[0.13, 16, 12]} />
              <meshStandardMaterial {...GLOVE} />
            </mesh>
          </group>
        ))}

        {/* neck ring and helmet: back shell, glass bubble and the student's face */}
        <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.05, 12, 28]} />
          <meshStandardMaterial {...GREY} />
        </mesh>
        <group position={[0, 2.08, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.43, 36, 28, Math.PI, Math.PI]} />
            <meshStandardMaterial {...SUIT} side={2} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.43, 0.035, 10, 36]} />
            <meshStandardMaterial {...SUIT} />
          </mesh>
          <group position={[0, -0.02, 0]} scale={1.1}>
            <StudentHead index={face} />
          </group>
          <mesh>
            <sphereGeometry args={[0.44, 36, 28]} />
            <meshStandardMaterial color="#d9a441" transparent opacity={0.2} roughness={0.04} metalness={0.4} depthWrite={false} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.4, 0.05, 0.12]}>
              <boxGeometry args={[0.06, 0.07, 0.08]} />
              <meshStandardMaterial color="#fff6c2" emissive="#fff6c2" emissiveIntensity={0.9} />
            </mesh>
          ))}
          <mesh position={[0.3, 0.38, -0.1]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
            <meshStandardMaterial {...GREY} />
          </mesh>
        </group>
      </group>
      {children}
    </group>
  );
}
