"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { groundTexture, labelTexture } from "@/lib/canvasTextures";
import { houseFrontTexture, plasterTexture, roadTexture } from "@/lib/townTextures";
import { seededRandom } from "@/lib/random";

/** Road width in metres: two lanes with a 1.6 m island in the middle. */
export const ROAD_WIDTH = 12;
export const LANE_Z = 3.2; // centre of a lane (eastbound is at -LANE_Z, westbound at +LANE_Z)
const SIDEWALK = 3;

/** A long straight road with sidewalks, curbs, zebra crossings and manholes. */
export function Road({ x0, x1, crossings = [] }: { x0: number; x1: number; crossings?: number[] }) {
  const length = x1 - x0;
  const cx = (x0 + x1) / 2;
  const asphalt = roadTexture();
  const walk = groundTexture("sidewalk", "#b7b3aa", { variance: 18, grid: { color: "rgba(80,80,80,0.5)", step: 64, width: 3 }, repeat: [length / 6, 0.5] });
  useMemo(() => {
    asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping;
    asphalt.repeat.set(length / 24, 1);
  }, [asphalt, length]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.02, 0]} receiveShadow>
        <planeGeometry args={[length, ROAD_WIDTH]} />
        <meshStandardMaterial map={asphalt} roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[cx, 0.09, side * (ROAD_WIDTH / 2 + SIDEWALK / 2)]} receiveShadow>
            <boxGeometry args={[length, 0.18, SIDEWALK]} />
            <meshStandardMaterial map={walk} roughness={0.9} />
          </mesh>
          <mesh position={[cx, 0.1, side * (ROAD_WIDTH / 2 + 0.06)]}>
            <boxGeometry args={[length, 0.2, 0.14]} />
            <meshStandardMaterial color="#d8d4c8" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {crossings.map((x) => (
        <group key={x} position={[x, 0.035, 0]}>
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0, -4.8 + i * 1.07]}>
              <planeGeometry args={[3, 0.55]} />
              <meshStandardMaterial color="#efece2" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

const PASTELS = ["#e8d9b8", "#d9c4a0", "#e4b9a0", "#c9d6b8", "#e9e2d0", "#c8cfd9", "#e0c8cf", "#d8e0c0"];

export interface HouseSpec {
  x: number;
  width: number;
  height: number;
  depth: number;
  floors: number;
  color: string;
  shop?: string;
  tank: boolean;
}

/** Random-but-repeatable row of houses and shops between x0 and x1. */
export function makeHouseRow(x0: number, x1: number, seed: number, shops: string[] = []): HouseSpec[] {
  const random = seededRandom(seed);
  const out: HouseSpec[] = [];
  let x = x0;
  while (x < x1) {
    const width = 6 + Math.floor(random() * 6);
    const floors = 2 + Math.floor(random() * 3);
    out.push({
      x: x + width / 2,
      width,
      height: floors * 3.2 + 0.6,
      depth: 9 + random() * 4,
      floors,
      color: PASTELS[Math.floor(random() * PASTELS.length)],
      shop: shops.length && random() < 0.4 ? shops[Math.floor(random() * shops.length)] : undefined,
      tank: random() < 0.7,
    });
    x += width + random() * 1.2;
  }
  return out;
}

/** One house or shop. `front` is the direction the front faces: +1 toward +z, -1 toward -z. Origin: centre of the front wall at the ground. */
function House({ spec, front, low }: { spec: HouseSpec; front: 1 | -1; low: boolean }) {
  const face = houseFrontTexture(spec.color.slice(1), spec.color, spec.width, spec.height, spec.floors, spec.shop);
  const wall = plasterTexture(spec.color.slice(1), spec.color);
  return (
    <group position={[spec.x, 0, 0]} rotation={[0, front === 1 ? 0 : Math.PI, 0]}>
      <mesh position={[0, spec.height / 2, -spec.depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[spec.width, spec.height, spec.depth]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, spec.height / 2, 0.01]}>
        <planeGeometry args={[spec.width, spec.height]} />
        <meshStandardMaterial map={face} roughness={0.85} />
      </mesh>
      <mesh position={[0, spec.height + 0.18, -spec.depth / 2]}>
        <boxGeometry args={[spec.width + 0.3, 0.36, spec.depth + 0.3]} />
        <meshStandardMaterial color="#cfcabb" roughness={0.9} />
      </mesh>
      {spec.tank && (
        <mesh position={[spec.width * 0.25, spec.height + 0.9, -spec.depth * 0.6]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 1.1, low ? 8 : 14]} />
          <meshStandardMaterial color="#2b2f36" roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

/** A row of houses along the road. `z` is where their front wall stands. */
export function HouseRow({ specs, z, front, low }: { specs: HouseSpec[]; z: number; front: 1 | -1; low: boolean }) {
  return (
    <group position={[0, 0, z]}>
      {specs.map((s, i) => (
        <House key={i} spec={s} front={front} low={low} />
      ))}
    </group>
  );
}

/** Neem-style street trees: all trunks are one draw call, all leaf clusters another. */
export function Trees({ points, low, scale = 1 }: { points: [number, number][]; low: boolean; scale?: number }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const blobs = low ? 2 : 4;
  useEffect(() => {
    const t = trunks.current, l = leaves.current;
    if (!t || !l) return;
    const random = seededRandom(points.length * 31 + 7);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    points.forEach(([x, z], i) => {
      const s = (0.85 + random() * 0.6) * scale;
      dummy.position.set(x, 1.6 * s, z);
      dummy.rotation.set(0, random() * 3, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      t.setMatrixAt(i, dummy.matrix);
      for (let b = 0; b < blobs; b++) {
        const a = (b / blobs) * Math.PI * 2 + random();
        dummy.position.set(x + Math.cos(a) * 1.3 * s * (b ? 1 : 0), (4.1 + (b ? random() * 1.2 : 1.1)) * s, z + Math.sin(a) * 1.3 * s * (b ? 1 : 0));
        const bs = (2.1 + random() * 0.9) * s * (b ? 0.8 : 1);
        dummy.scale.set(bs, bs * 0.8, bs);
        dummy.updateMatrix();
        l.setMatrixAt(i * blobs + b, dummy.matrix);
        l.setColorAt(i * blobs + b, color.setRGB(0.18 + random() * 0.1, 0.38 + random() * 0.15, 0.14 + random() * 0.08));
      }
    });
    t.instanceMatrix.needsUpdate = true;
    l.instanceMatrix.needsUpdate = true;
    if (l.instanceColor) l.instanceColor.needsUpdate = true;
  }, [points, blobs, scale]);
  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, points.length]} castShadow>
        <cylinderGeometry args={[0.22, 0.34, 3.2, 8]} />
        <meshStandardMaterial color="#5d4630" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined, undefined, points.length * blobs]} castShadow>
        <icosahedronGeometry args={[1, low ? 0 : 1]} />
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
    </>
  );
}

/** Street lamps with glowing heads, as instanced meshes. `side` +1 means the lamp arm points toward +z. */
export function Lamps({ xs, z, side }: { xs: number[]; z: number; side: 1 | -1 }) {
  const poles = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const p = poles.current, h = heads.current;
    if (!p || !h) return;
    const dummy = new THREE.Object3D();
    xs.forEach((x, i) => {
      dummy.position.set(x, 3.6, z);
      dummy.updateMatrix();
      p.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 7.3, z + side * 0.9);
      dummy.updateMatrix();
      h.setMatrixAt(i, dummy.matrix);
    });
    p.instanceMatrix.needsUpdate = true;
    h.instanceMatrix.needsUpdate = true;
  }, [xs, z, side]);
  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, xs.length]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 7.2, 8]} />
        <meshStandardMaterial color="#4b5058" metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, xs.length]}>
        <boxGeometry args={[0.5, 0.14, 1.6]} />
        <meshStandardMaterial color="#fff4c8" emissive="#ffe9a0" emissiveIntensity={0.7} />
      </instancedMesh>
    </>
  );
}

/** Electricity poles along the road. In full quality the wires sag between them. */
export function UtilityPoles({ xs, z, low }: { xs: number[]; z: number; low: boolean }) {
  const poles = useRef<THREE.InstancedMesh>(null);
  const wires = useMemo(() => {
    if (low) return [];
    const out: THREE.TubeGeometry[] = [];
    for (let i = 0; i < xs.length - 1; i++) {
      for (const dz of [-0.6, 0, 0.6]) {
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(xs[i], 8.3, z + dz), new THREE.Vector3((xs[i] + xs[i + 1]) / 2, 7.2, z + dz), new THREE.Vector3(xs[i + 1], 8.3, z + dz));
        out.push(new THREE.TubeGeometry(curve, 8, 0.025, 4, false));
      }
    }
    return out;
  }, [xs, z, low]);
  useEffect(() => () => wires.forEach((w) => w.dispose()), [wires]);
  useEffect(() => {
    const p = poles.current;
    if (!p) return;
    const dummy = new THREE.Object3D();
    xs.forEach((x, i) => {
      dummy.position.set(x, 4.6, z);
      dummy.updateMatrix();
      p.setMatrixAt(i, dummy.matrix);
    });
    p.instanceMatrix.needsUpdate = true;
  }, [xs, z]);
  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, xs.length]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 9.2, 8]} />
        <meshStandardMaterial color="#8c8a84" roughness={0.9} />
      </instancedMesh>
      {xs.map((x) => (
        <mesh key={x} position={[x, 8.3, z]}>
          <boxGeometry args={[0.12, 0.12, 1.6]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      {wires.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </>
  );
}

/** A small neighbourhood mosque with a dome and two minarets. */
export function Mosque({ x, z, front, low }: { x: number; z: number; front: 1 | -1; low: boolean }) {
  const wall = plasterTexture("mosque", "#e9e4d4");
  return (
    <group position={[x, 0, z]} rotation={[0, front === 1 ? 0 : Math.PI, 0]}>
      <mesh position={[0, 3, -6]} castShadow receiveShadow>
        <boxGeometry args={[14, 6, 12]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 6.5, -6]} castShadow>
        <sphereGeometry args={[3.6, low ? 14 : 28, low ? 8 : 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1f7a5a" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 10.5, -6]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
        <meshStandardMaterial color="#d8b84a" metalness={0.8} roughness={0.3} />
      </mesh>
      {[-6.6, 6.6].map((mx) => (
        <group key={mx} position={[mx, 0, -1]}>
          <mesh position={[0, 5, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.7, 10, 12]} />
            <meshStandardMaterial map={wall} roughness={0.9} />
          </mesh>
          <mesh position={[0, 10.5, 0]}>
            <coneGeometry args={[0.8, 1.3, 12]} />
            <meshStandardMaterial color="#1f7a5a" roughness={0.5} />
          </mesh>
          <mesh position={[0, 9.3, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.18, 12]} />
            <meshStandardMaterial color="#d8d2c0" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {[-4, 0, 4].map((ax) => (
        <mesh key={ax} position={[ax, 1.9, 0.02]}>
          <planeGeometry args={[2.4, 3.6]} />
          <meshStandardMaterial color="#2c6f55" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** A roadside advertising board on two posts. */
export function BillboardSign({ x, z, lines, color = "#17407a" }: { x: number; z: number; lines: string[]; color?: string }) {
  const texture = labelTexture(`board-${lines.join("-")}`, lines, { bg: color, size: [768, 320], font: [74, 44] });
  return (
    <group position={[x, 0, z]}>
      {[-3, 3].map((px) => (
        <mesh key={px} position={[px, 3, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 6, 8]} />
          <meshStandardMaterial color="#6b7078" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[8, 3.4, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 6.2, 0.11]}>
        <planeGeometry args={[7.6, 3]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

/** A facing-camera label for a place (used for distant landmarks). */
export function PlaceLabel({ position, lines }: { position: [number, number, number]; lines: [string, string] }) {
  const texture = labelTexture(`place-${lines.join("-")}`, lines, { bg: "#14264f", size: [768, 200], font: [60, 38] });
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[7, 1.8]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </Billboard>
  );
}
