"use client";

import { RoundedBox } from "@react-three/drei";

const BLACK = { color: "#17181b", roughness: 0.7 } as const;

function Tyre({ position, r = 0.32, w = 0.2 }: { position: [number, number, number]; r?: number; w?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, w, 14]} />
        <meshStandardMaterial color="#141518" roughness={0.95} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.55, r * 0.55, w + 0.02, 10]} />
        <meshStandardMaterial color="#aeb2b9" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** An auto-rickshaw: green body, black canopy, one front wheel. Nose toward +x, about 2.7 m long. */
export function Rickshaw({ body = "#2f9a4f" }: { body?: string }) {
  return (
    <group>
      <RoundedBox args={[1.5, 0.6, 1.2]} radius={0.1} smoothness={2} position={[-0.35, 0.65, 0]} castShadow>
        <meshStandardMaterial color={body} metalness={0.3} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.9, 0.55, 0.8]} radius={0.12} smoothness={2} position={[0.9, 0.6, 0]} castShadow>
        <meshStandardMaterial color={body} metalness={0.3} roughness={0.5} />
      </RoundedBox>
      {/* windscreen */}
      <mesh position={[0.78, 1.2, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.04, 0.6, 0.78]} />
        <meshStandardMaterial color="#16222c" metalness={0.8} roughness={0.1} transparent opacity={0.6} />
      </mesh>
      {/* canopy and pillars */}
      <RoundedBox args={[1.9, 0.08, 1.3]} radius={0.04} smoothness={1} position={[-0.2, 1.62, 0]} castShadow>
        <meshStandardMaterial color="#1c1d20" roughness={0.6} />
      </RoundedBox>
      {[[0.6, 0.6], [0.6, -0.6], [-1.05, 0.6], [-1.05, -0.6]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.2, z]}>
          <boxGeometry args={[0.05, 0.85, 0.05]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      {/* seat, yellow canopy stripe and headlight */}
      <mesh position={[-0.5, 0.98, 0]}>
        <boxGeometry args={[0.7, 0.2, 1.0]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.2, 1.67, 0]}>
        <boxGeometry args={[1.95, 0.03, 0.2]} />
        <meshStandardMaterial color="#f2c20f" />
      </mesh>
      <mesh position={[1.4, 0.75, 0]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#fff6c2" emissive="#fff6c2" emissiveIntensity={1} />
      </mesh>
      <Tyre position={[1.15, 0.28, 0]} r={0.28} />
      <Tyre position={[-0.8, 0.3, 0.7]} />
      <Tyre position={[-0.8, 0.3, -0.7]} />
    </group>
  );
}

/** A Karachi minibus: blue and white with bright stripes, big windows, and luggage on the roof. Nose toward +x, about 7 m long. */
export function Bus() {
  return (
    <group>
      <RoundedBox args={[7, 1.5, 2.2]} radius={0.12} smoothness={2} position={[0, 1.1, 0]} castShadow>
        <meshStandardMaterial color="#f1f3f4" metalness={0.2} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[7, 0.9, 2.2]} radius={0.1} smoothness={2} position={[0, 2.2, 0]} castShadow>
        <meshStandardMaterial color="#2a6fb8" metalness={0.2} roughness={0.5} />
      </RoundedBox>
      {[1, -1].map((s) => (
        <group key={s} position={[0, 0, s * 1.11]}>
          <mesh position={[-0.2, 2.25, 0]}>
            <planeGeometry args={[5.6, 0.62]} />
            <meshStandardMaterial color="#16222c" metalness={0.9} roughness={0.1} side={2} />
          </mesh>
          <mesh position={[0, 1.4, 0.004]}>
            <planeGeometry args={[7, 0.18]} />
            <meshStandardMaterial color="#e8731a" side={2} />
          </mesh>
          <mesh position={[0, 1.1, 0.004]}>
            <planeGeometry args={[7, 0.1]} />
            <meshStandardMaterial color="#d62828" side={2} />
          </mesh>
        </group>
      ))}
      <mesh position={[3.52, 2.1, 0]}>
        <planeGeometry args={[0.02, 0.7]} />
        <meshStandardMaterial color="#16222c" side={2} />
      </mesh>
      {[0.8, -0.8].map((z) => (
        <mesh key={z} position={[3.52, 0.95, z]}>
          <boxGeometry args={[0.04, 0.22, 0.4]} />
          <meshStandardMaterial color="#fffbe0" emissive="#fff3b0" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* roof luggage under a rope net */}
      <mesh position={[-0.4, 2.85, 0]} castShadow>
        <boxGeometry args={[3.2, 0.5, 1.7]} />
        <meshStandardMaterial color="#8a6a3f" roughness={0.9} />
      </mesh>
      <mesh position={[1.8, 2.78, 0]} castShadow>
        <boxGeometry args={[1, 0.35, 1.4]} />
        <meshStandardMaterial color="#3b5f3a" roughness={0.9} />
      </mesh>
      {[2.2, -2.2].map((x) =>
        [1.0, -1.0].map((z) => <Tyre key={`${x}${z}`} position={[x, 0.45, z]} r={0.45} w={0.3} />),
      )}
    </group>
  );
}

/** A speed breaker: a yellow-and-black striped hump across a lane. */
export function SpeedBreaker({ x, z, width = 6 }: { x: number; z: number; width?: number }) {
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 0.06, -width / 2 + (i + 0.5) * (width / 6)]} scale={[1, 0.5, 1]}>
          <cylinderGeometry args={[0.7, 0.9, width / 6, 12, 1, false, 0, Math.PI * 2]} />
          <meshStandardMaterial color={i % 2 ? "#e8b60c" : "#1b1c1f"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** A roadside rubbish bin overflowing with bags, with a few scraps around it. */
export function RubbishBin({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.2, 1, 0.8]} />
        <meshStandardMaterial color="#2f6b3a" roughness={0.7} />
      </mesh>
      {[[-0.3, 0], [0.25, 0.1], [0, -0.15]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 1.15 + i * 0.08, bz]} castShadow>
          <sphereGeometry args={[0.34, 8, 6]} />
          <meshStandardMaterial color={["#e8e8e8", "#2a2a2a", "#c9b27a"][i]} roughness={0.9} />
        </mesh>
      ))}
      {[[0.9, 0.4], [-0.8, 0.6], [1.3, -0.2]].map(([sx, sz], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i]} position={[sx, 0.215, sz]}>
          <planeGeometry args={[0.3, 0.2]} />
          <meshStandardMaterial color={["#d9d9d9", "#cf5b3a", "#e8d18a"][i]} />
        </mesh>
      ))}
    </group>
  );
}

/** A hand cart (thela) with fruit under a striped umbrella. */
export function FruitCart({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.0, 0.2, 1.1]} />
        <meshStandardMaterial color="#7a5330" roughness={0.9} />
      </mesh>
      {[[-0.9, 0.45], [0.9, 0.45], [-0.9, -0.45], [0.9, -0.45]].map(([lx, lz]) => (
        <mesh key={`${lx}${lz}`} position={[lx, 0.42, lz]}>
          <boxGeometry args={[0.07, 0.85, 0.07]} />
          <meshStandardMaterial color="#5d3f22" />
        </mesh>
      ))}
      {[0.35, -0.35].map((fx, i) => (
        <mesh key={fx} position={[fx * 1.3, 1.08, 0]} castShadow>
          <boxGeometry args={[0.8, 0.28, 0.9]} />
          <meshStandardMaterial color={i ? "#d8a31a" : "#c2402c"} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <coneGeometry args={[1.5, 0.45, 12]} />
        <meshStandardMaterial color="#d62f2f" side={2} roughness={0.8} />
      </mesh>
      {[0.5, 0.5].map((_, i) => (
        <mesh key={i} position={[(i ? 1 : -1) * 0.95, 0.28, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08, 12]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}

/** A motorbike with a rider, nose toward +x. */
export function Motorbike({ color = "#b3261e" }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[1.1, 0.3, 0.26]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, 0.86, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.3]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      <mesh position={[0.62, 1.0, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.7]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.8} roughness={0.4} />
      </mesh>
      <Tyre position={[0.7, 0.33, 0]} r={0.33} w={0.12} />
      <Tyre position={[-0.7, 0.33, 0]} r={0.33} w={0.14} />
      <group position={[-0.15, 0.82, 0]} scale={0.62}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.9, 0.5]} />
          <meshStandardMaterial color="#d8d4c8" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, 1.15, 0]}>
          <sphereGeometry args={[0.24, 12, 10]} />
          <meshStandardMaterial color="#e0a878" roughness={0.8} />
        </mesh>
        <mesh position={[0.1, 1.28, 0]}>
          <sphereGeometry args={[0.26, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
    </group>
  );
}
