"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { facadeTexture, groundTexture, scorchTexture } from "@/lib/canvasTextures";
import { noise3 } from "@/lib/noise";
import { seededRandom } from "@/lib/random";

const PAD_TOP = 0.3;
const PAINT = { color: "#d9472b", metalness: 0.35, roughness: 0.5 } as const;
const STEEL = { color: "#aeb4be", metalness: 0.75, roughness: 0.35 } as const;

/** Builds the matrices for a steel lattice tower made of thin bars (one instanced mesh = one draw call). */
function useLatticeMatrices(height: number, width: number, step: number) {
  return useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    const unitX = new THREE.Vector3(1, 0, 0);
    const bar = (a: THREE.Vector3, b: THREE.Vector3, thickness: number) => {
      const dir = b.clone().sub(a);
      dummy.position.copy(a).add(b).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(unitX, dir.clone().normalize());
      dummy.scale.set(dir.length(), thickness, thickness);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    };
    const h = width / 2;
    const corners = [[-h, -h], [h, -h], [h, h], [-h, h]];
    corners.forEach(([x, z]) => bar(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, height, z), 0.16));
    for (let y = 0; y < height - 0.01; y += step) {
      for (let c = 0; c < 4; c++) {
        const [x1, z1] = corners[c];
        const [x2, z2] = corners[(c + 1) % 4];
        // ring bar at the bottom of each bay, and a diagonal brace across it
        bar(new THREE.Vector3(x1, y, z1), new THREE.Vector3(x2, y, z2), 0.08);
        const flip = (Math.floor(y / step) + c) % 2 === 0;
        bar(new THREE.Vector3(flip ? x1 : x2, y, flip ? z1 : z2), new THREE.Vector3(flip ? x2 : x1, y + step, flip ? z2 : z1), 0.06);
      }
    }
    return matrices;
  }, [height, width, step]);
}

/** Launch tower: lattice frame, service arms reaching the rocket, lightning mast and a blinking beacon. */
function Tower() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const matrices = useLatticeMatrices(15, 1.4, 1.5);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  useFrame(({ clock }) => {
    if (beacon.current) (beacon.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + 2.2 * Math.max(0, Math.sin(clock.elapsedTime * 3));
  });

  return (
    <group position={[4.3, PAD_TOP, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, matrices.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial {...PAINT} />
      </instancedMesh>
      {/* service arms with a safety rail, reaching to the rocket */}
      {[6.5, 9.6].map((y) => (
        <group key={y} position={[-1.7, y, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.9, 0.16, 0.5]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          <mesh position={[0, 0.3, 0.25]}>
            <boxGeometry args={[2.9, 0.04, 0.04]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          <mesh position={[0.2, 0.18, 0]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="#555b66" />
          </mesh>
        </group>
      ))}
      {/* fuel and power lines running down the tower */}
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} position={[-0.72, 7, z]}>
          <cylinderGeometry args={[0.07, 0.07, 14, 10]} />
          <meshStandardMaterial color="#cfd3da" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 16.4, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 2.6, 8]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh ref={beacon} position={[0, 17.8, 0]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

/** Concrete pad with a dark flame trench and a burn mark, on a larger concrete apron. */
function PadSurface() {
  const concrete = groundTexture("concrete", "#a9a7a1", { variance: 22, grid: { color: "rgba(60,60,60,0.55)", step: 64, width: 3 }, repeat: [3, 3] });
  const apron = groundTexture("apron", "#8f8d88", { variance: 26, grid: { color: "rgba(50,50,50,0.5)", step: 64, width: 3 }, repeat: [6, 6] });
  const scorch = scorchTexture();
  return (
    <>
      <mesh position={[0, PAD_TOP * 0.25, 0]} receiveShadow>
        <boxGeometry args={[30, PAD_TOP * 0.5, 30]} />
        <meshStandardMaterial map={apron} bumpMap={apron} bumpScale={0.4} roughness={0.95} />
      </mesh>
      <mesh position={[0, PAD_TOP / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, PAD_TOP, 12]} />
        <meshStandardMaterial map={concrete} bumpMap={concrete} bumpScale={0.5} roughness={0.9} />
      </mesh>
      {/* flame trench under the engines */}
      <mesh position={[0, PAD_TOP + 0.01, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[3.6, 11]} />
        <meshStandardMaterial color="#14120f" roughness={1} />
      </mesh>
      <mesh position={[0, PAD_TOP + 0.02, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[11, 11]} />
        <meshBasicMaterial map={scorch} transparent depthWrite={false} />
      </mesh>
      {/* painted safety ring */}
      <mesh position={[0, PAD_TOP + 0.03, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[4.4, 4.62, 64]} />
        <meshStandardMaterial color="#f3c63d" roughness={0.7} />
      </mesh>
    </>
  );
}

/** Two big white spherical fuel tanks with pipes running to the pad. */
function FuelTanks() {
  return (
    <group position={[17, 0, -7]}>
      {[0, -7].map((z, i) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
            <sphereGeometry args={[i ? 2.2 : 2.7, 36, 28]} />
            <meshStandardMaterial color="#eef1f5" metalness={0.45} roughness={0.28} />
          </mesh>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[Math.cos((k * Math.PI) / 2 + 0.78) * 1.6, 0.9, Math.sin((k * Math.PI) / 2 + 0.78) * 1.6]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 1.9, 8]} />
              <meshStandardMaterial {...STEEL} />
            </mesh>
          ))}
          <mesh position={[0, 6.3, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.7, 8]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        </group>
      ))}
      {/* insulated pipes toward the pad */}
      {[0, -7].map((z, i) => (
        <mesh key={z} position={[-8.8, 0.5 + i * 0.3, z - (i ? 0 : 0)]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 15, 12]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
    </group>
  );
}

/** Control building with a textured front, roof, antenna mast and an air-conditioning unit. */
function ControlBuilding() {
  const front = facadeTexture("control", "#d9d2c0", 6, 2);
  return (
    <group position={[-17, 0, -13]}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[11, 4, 6]} />
        <meshStandardMaterial color="#d9d2c0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.1, 3.02]}>
        <planeGeometry args={[10.4, 2.6]} />
        <meshStandardMaterial map={front} roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.12, 0]} castShadow>
        <boxGeometry args={[11.5, 0.24, 6.5]} />
        <meshStandardMaterial color="#6b6f78" roughness={0.8} />
      </mesh>
      <mesh position={[-4.2, 4.55, -1]} castShadow>
        <boxGeometry args={[1.6, 0.7, 1.2]} />
        <meshStandardMaterial color="#b9bcc2" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[3.8, 6.2, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 4.2, 8]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[3.8, 8.3, 0]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-2.6, 0.9, 3.08]}>
        <boxGeometry args={[1.3, 1.8, 0.1]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Scattered dry shrubs: one instanced mesh. */
function Shrubs({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const random = seededRandom(9);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2;
      const d = 22 + random() * 130;
      const s = 0.5 + random() * 1.1;
      dummy.position.set(Math.cos(a) * d, s * 0.3, Math.sin(a) * d);
      dummy.scale.set(s, s * 0.6, s);
      dummy.rotation.y = random() * 3;
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, color.setRGB(0.32 + random() * 0.15, 0.3 + random() * 0.1, 0.16));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial roughness={1} flatShading />
    </instancedMesh>
  );
}

/** A ring of low dry hills far away; the haze (fog) blends them into the sky. */
function Hills() {
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(430, 430, 80, 128, 4, true);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const a = Math.atan2(pos.getZ(i), pos.getX(i));
      const top = pos.getY(i) > 0;
      pos.setY(i, top ? 10 + noise3(Math.cos(a) * 2.5, 4, Math.sin(a) * 2.5) * 40 + noise3(Math.cos(a) * 9, 1, Math.sin(a) * 9) * 8 : -5);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#a38f68" roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Status lights stand: green means every system is GO. */
function StatusLights() {
  return (
    <group position={[8, PAD_TOP, 6]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.15, 1.4, 0.15]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[1.8, 0.9, 0.25]} />
        <meshStandardMaterial color="#20242c" roughness={0.6} />
      </mesh>
      {[[-0.55, "#37d67a"], [0, "#37d67a"], [0.55, "#ffb703"]].map(([x, c]) => (
        <mesh key={String(x)} position={[x as number, 1.8, 0.15]}>
          <sphereGeometry args={[0.18, 14, 12]} />
          <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

/** The whole launch site except the rocket itself. */
export function LaunchSite({ shrubs = 70 }: { shrubs?: number }) {
  const sand = groundTexture("sand", "#c9b58a", { variance: 34, repeat: [180, 180] });
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial map={sand} bumpMap={sand} bumpScale={0.8} roughness={1} />
      </mesh>
      <PadSurface />
      <Tower />
      <FuelTanks />
      <ControlBuilding />
      <StatusLights />
      <Shrubs count={shrubs} />
      <Hills />
    </>
  );
}
