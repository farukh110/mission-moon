"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";

interface Look {
  girl: boolean;
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  accent: string;
  bag: string;
  /** Peaked cap (security guard). */
  cap?: string;
}

// A small, varied class: boys in shirt and trousers, girls in kameez, shalwar and dupatta.
const LOOKS: Look[] = [
  { girl: false, skin: "#c68a5a", hair: "#1d1410", top: "#f4f6fa", bottom: "#2a3d66", accent: "#2a6fdb", bag: "#d6453d" },
  { girl: true, skin: "#e0ac82", hair: "#2a1a12", top: "#f4f6fa", bottom: "#1f6b55", accent: "#1f6b55", bag: "#8a5bd6" },
  { girl: false, skin: "#8d5524", hair: "#0f0b08", top: "#f4f6fa", bottom: "#3a3a42", accent: "#2f9e6b", bag: "#2f9e6b" },
  { girl: true, skin: "#c68a5a", hair: "#1a1210", top: "#f4f6fa", bottom: "#2a3d66", accent: "#2a3d66", bag: "#f0a202" },
  { girl: false, skin: "#e0ac82", hair: "#4a2f1a", top: "#f4f6fa", bottom: "#2a3d66", accent: "#d6453d", bag: "#2a6fdb" },
  // index 5: a security guard in a green-khaki uniform and cap
  { girl: false, skin: "#b9835a", hair: "#15100c", top: "#5b7556", bottom: "#3a4a38", accent: "#c9a84a", bag: "#111111", cap: "#3f5a3b" },
];

const lookFor = (index: number) => LOOKS[((index % LOOKS.length) + LOOKS.length) % LOOKS.length];

/** A child's head centred on the origin, face toward +z. Also used inside astronaut helmets. */
export function StudentHead({ index = 0 }: { index?: number }) {
  const look = lookFor(index);
  const skin = <meshStandardMaterial color={look.skin} roughness={0.75} />;
  return (
    <group>
      <mesh scale={[1, 1.06, 1]} castShadow>
        <sphereGeometry args={[0.165, 28, 22]} />
        {skin}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.16, -0.01, 0]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          {skin}
        </mesh>
      ))}
      <mesh position={[0, 0.06, -0.015]} scale={[1.02, 0.8, 1.06]} castShadow>
        <sphereGeometry args={[0.175, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color={look.hair} roughness={0.9} />
      </mesh>
      {look.girl && (
        <mesh position={[0, -0.11, -0.14]} rotation={[0.25, 0, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.34, 4, 10]} />
          <meshStandardMaterial color={look.hair} roughness={0.9} />
        </mesh>
      )}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.062, 0.02, 0.145]}>
          <mesh>
            <sphereGeometry args={[0.026, 10, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <sphereGeometry args={[0.015, 8, 6]} />
            <meshStandardMaterial color="#15110f" roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.02, 0.163]}>
        <sphereGeometry args={[0.02, 8, 6]} />
        {skin}
      </mesh>
      <mesh position={[0, -0.045, 0.153]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.038, 0.007, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#8a3b3b" roughness={0.6} />
      </mesh>
    </group>
  );
}

interface StudentProps {
  /** Picks one of five different looks. */
  index?: number;
  scale?: number;
  /** 0 = standing, 1 = walking. Read every frame, so it can be a ref. */
  motion?: RefObject<number>;
  wave?: boolean | RefObject<boolean>;
  /** Offsets the animation so a group of students does not move in step. */
  phase?: number;
  /** Leave off the school bag (e.g. when seated). */
  bag?: boolean;
}

/** A schoolchild about 1.55 units tall, standing on y = 0 and facing +z. */
export function Student({ index = 0, scale = 1, motion, wave = false, phase = 0, bag = true }: StudentProps) {
  const look = lookFor(index);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const cycle = useRef(0);

  useFrame(({ clock }, delta) => {
    const m = motion?.current ?? 0;
    cycle.current += Math.min(delta, 0.05) * 9 * m;
    const swing = Math.sin(cycle.current + phase) * 0.6 * m;
    const t = clock.elapsedTime + phase;
    const waving = typeof wave === "boolean" ? wave : wave.current;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.9 + Math.sin(t * 1.4) * 0.03 * (1 - m);
    if (armR.current) armR.current.rotation.x = waving ? -2.6 + Math.sin(t * 7) * 0.4 : swing * 0.9 + Math.sin(t * 1.4 + 1) * 0.03 * (1 - m);
    if (body.current) {
      body.current.position.y = waving ? Math.abs(Math.sin(t * 3.5)) * 0.03 : Math.abs(Math.sin(cycle.current + phase)) * 0.04 * m;
      body.current.rotation.z = waving ? Math.sin(t * 3.5) * 0.04 : 0;
    }
  });

  const skin = <meshStandardMaterial color={look.skin} roughness={0.75} />;
  const tunic = look.girl;

  return (
    <group scale={scale}>
      <group ref={body}>
        {/* legs with shoes */}
        {[-0.1, 0.1].map((x) => (
          <group key={x} ref={x < 0 ? legL : legR} position={[x, 0.72, 0]}>
            <mesh position={[0, -0.34, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.065, 0.66, 12]} />
              <meshStandardMaterial color={look.bottom} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.68, 0.035]} castShadow>
              <boxGeometry args={[0.13, 0.08, 0.25]} />
              <meshStandardMaterial color="#1b1b1f" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* torso: shirt, or a long kameez for girls */}
        <mesh position={[0, tunic ? 0.97 : 0.98, 0]} castShadow>
          <cylinderGeometry args={[0.19, tunic ? 0.27 : 0.21, tunic ? 0.78 : 0.52, 20]} />
          <meshStandardMaterial color={look.top} roughness={0.85} />
        </mesh>
        {!tunic && (
          <>
            <mesh position={[0, 1.04, 0.2]}>
              <boxGeometry args={[0.06, 0.24, 0.02]} />
              <meshStandardMaterial color={look.accent} />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.215, 0.215, 0.05, 20]} />
              <meshStandardMaterial color="#2b2b30" roughness={0.6} />
            </mesh>
          </>
        )}
        {tunic && (
          <>
            {/* dupatta over the shoulders, hanging at the back */}
            <mesh position={[0, 1.22, 0.02]} castShadow>
              <boxGeometry args={[0.52, 0.05, 0.3]} />
              <meshStandardMaterial color={look.accent} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.92, -0.17]} castShadow>
              <boxGeometry args={[0.4, 0.62, 0.025]} />
              <meshStandardMaterial color={look.accent} roughness={0.9} />
            </mesh>
          </>
        )}

        {/* school bag */}
        {bag && (
          <mesh position={[0, 1.0, -0.21]} castShadow>
            <boxGeometry args={[0.3, 0.36, 0.11]} />
            <meshStandardMaterial color={look.bag} roughness={0.7} />
          </mesh>
        )}

        {/* arms with sleeves and hands */}
        {[-1, 1].map((side) => (
          <group key={side} ref={side < 0 ? armL : armR} position={[side * 0.26, 1.2, 0]}>
            <mesh position={[0, -0.24, 0]} rotation={[0, 0, side * 0.05]} castShadow>
              <cylinderGeometry args={[0.055, 0.05, 0.46, 10]} />
              <meshStandardMaterial color={look.top} roughness={0.85} />
            </mesh>
            <mesh position={[side * 0.012, -0.5, 0.01]} castShadow>
              <sphereGeometry args={[0.055, 12, 10]} />
              {skin}
            </mesh>
          </group>
        ))}

        {/* neck and head */}
        <mesh position={[0, 1.29, 0]}>
          <cylinderGeometry args={[0.055, 0.06, 0.09, 10]} />
          {skin}
        </mesh>
        <group position={[0, 1.44, 0]}>
          <StudentHead index={index} />
          {look.cap && (
            <>
              <mesh position={[0, 0.1, 0]} castShadow>
                <sphereGeometry args={[0.185, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial color={look.cap} roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.1, 0.17]} rotation={[0.15, 0, 0]}>
                <boxGeometry args={[0.3, 0.02, 0.16]} />
                <meshStandardMaterial color={look.cap} roughness={0.8} />
              </mesh>
            </>
          )}
        </group>
      </group>
    </group>
  );
}
