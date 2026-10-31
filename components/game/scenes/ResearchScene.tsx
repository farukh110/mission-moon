"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { Rocket } from "../objects/Rocket";
import { groundTexture, labelTexture, mapTexture, screenTexture } from "@/lib/canvasTextures";
import type { SceneProps } from "./types";

const DESK_X = [-5, 0, 5];
const DESK_Z = [-6, -2];

export default function ResearchScene({ motion }: SceneProps) {
  const map = mapTexture();
  const checklist = labelTexture("checklist", ["CHECKLIST", "Fuel: OK    Crew: OK", "Radio: OK   Weather: OK"], {
    bg: "#10301f",
    border: "#5be584",
  });
  const sat = useRef<THREE.Group>(null);
  const display = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);
  const lights = useRef<(THREE.Mesh | null)[]>([]);
  const floor = groundTexture("hall-floor", "#2b3350", { variance: 14, grid: { color: "rgba(8,12,30,0.7)", step: 64, width: 3 }, repeat: [11, 8.5] });

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (motion && sat.current) sat.current.rotation.y += delta * 0.4;
    if (motion && display.current) display.current.rotation.y += delta * 0.5;
    if (scan.current) scan.current.position.x = Math.sin(t * 0.8) * 6.6;
    lights.current.forEach((m, i) => {
      if (m) (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + 1.4 * (0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.3));
    });
  });

  return (
    <>
      <color attach="background" args={["#0a1020"]} />
      <hemisphereLight args={["#bcd4ff", "#2a3566", 1.6]} />
      <directionalLight position={[6, 14, 10]} intensity={1.6} />
      <pointLight position={[0, 8, -4]} intensity={90} color="#8fd4ff" distance={30} />

      {/* hall */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[44, 34]} />
        <meshStandardMaterial map={floor} metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0, 6, -14.5]}>
        <boxGeometry args={[44, 12, 0.5]} />
        <meshStandardMaterial color="#262f5c" />
      </mesh>
      <mesh position={[-22, 6, 0]}>
        <boxGeometry args={[0.5, 12, 34]} />
        <meshStandardMaterial color="#222a52" />
      </mesh>
      <mesh position={[22, 6, 0]}>
        <boxGeometry args={[0.5, 12, 34]} />
        <meshStandardMaterial color="#222a52" />
      </mesh>

      {/* big map screen */}
      <mesh position={[0, 5.2, -14.1]}>
        <boxGeometry args={[14.6, 6.9, 0.2]} />
        <meshStandardMaterial color="#0b0f1d" />
      </mesh>
      <mesh position={[0, 5.2, -13.98]}>
        <planeGeometry args={[14, 6.5]} />
        <meshBasicMaterial map={map} />
      </mesh>

      {/* scan line sweeping across the map, and blinking status lights on the wall */}
      <mesh ref={scan} position={[0, 5.2, -13.9]}>
        <planeGeometry args={[0.12, 6.5]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.45} />
      </mesh>
      {[-9, -6, -3, 3, 6, 9].map((x, i) => (
        <mesh key={x} ref={(el) => { lights.current[i] = el; }} position={[x, 9.4, -13.9]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#2a6" emissive={i % 2 ? "#ffb703" : "#37d67a"} emissiveIntensity={1} />
        </mesh>
      ))}

      {/* mission control desks */}
      {DESK_Z.flatMap((z, row) =>
        DESK_X.map((x, col) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[3.4, 0.9, 1.5]} />
              <meshStandardMaterial color="#2a3558" />
            </mesh>
            <mesh position={[0, 1.4, -0.3]} rotation={[-0.15, 0, 0]}>
              <planeGeometry args={[2.2, 1.3]} />
              <meshBasicMaterial map={screenTexture(row * 3 + col)} />
            </mesh>
          </group>
        )),
      )}

      {/* rocket display */}
      <mesh position={[-12, 0.3, -6]}>
        <cylinderGeometry args={[2, 2.2, 0.6, 32]} />
        <meshStandardMaterial color="#2a3558" metalness={0.5} />
      </mesh>
      <group ref={display} position={[-12, 0.6, -6]} scale={0.42}>
        <Rocket />
      </group>

      {/* satellite exhibit */}
      <mesh position={[12, 0.3, -6]}>
        <cylinderGeometry args={[2, 2.2, 0.6, 32]} />
        <meshStandardMaterial color="#2a3558" metalness={0.5} />
      </mesh>
      <group ref={sat} position={[12, 2.2, -6]}>
        <mesh>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#c9b37a" metalness={0.7} roughness={0.35} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.9, 0, 0]}>
            <boxGeometry args={[2.2, 0.05, 1]} />
            <meshStandardMaterial color="#17327a" metalness={0.8} emissive="#0b1c4d" emissiveIntensity={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 0.95, 0]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.5, 0.3, 20, 1, true]} />
          <meshStandardMaterial color="#e8e8e8" side={2} />
        </mesh>
      </group>

      {/* checklist board */}
      <mesh position={[-9, 3, 6.5]}>
        <planeGeometry args={[4.4, 2.2]} />
        <meshBasicMaterial map={checklist} />
      </mesh>
      <mesh position={[-9, 1.2, 6.45]}>
        <boxGeometry args={[0.15, 2.4, 0.15]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </>
  );
}
