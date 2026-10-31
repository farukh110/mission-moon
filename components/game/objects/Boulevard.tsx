"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { facadeTexture, groundTexture } from "@/lib/canvasTextures";
import { plasterTexture } from "@/lib/townTextures";
import { seededRandom } from "@/lib/random";
import { Trees } from "./Town";

/**
 * The look of a big Karachi boulevard: a green median with hedges and trees, tall double-arm street lamps,
 * painted kerbs, grey concrete apartment towers and half-built frames.
 */

/** Green strip down the middle of the road: dusty soil, a clipped hedge, and small trees. Runs along x at z = 0. */
export function MedianGarden({ x0, x1, low }: { x0: number; x1: number; low: boolean }) {
  const len = x1 - x0;
  const soil = groundTexture("median-soil", "#8a7a55", { variance: 30, repeat: [len / 4, 1] });
  const treePoints = useMemo<[number, number][]>(() => {
    const out: [number, number][] = [];
    for (let x = x0 + 6; x < x1; x += low ? 24 : 12) out.push([x, 0]);
    return out;
  }, [x0, x1, low]);
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, 0.11, 0]} receiveShadow>
        <boxGeometry args={[len, 0.22, 1.7]} />
        <meshStandardMaterial map={soil} roughness={1} />
      </mesh>
      <mesh position={[(x0 + x1) / 2, 0.5, 0]} castShadow>
        <boxGeometry args={[len, 0.55, 0.9]} />
        <meshStandardMaterial color="#3d7a3a" roughness={1} />
      </mesh>
      <Trees points={treePoints} low={low} scale={0.8} />
    </group>
  );
}

/** Tall double-arm street lamps standing in the median, both arms reaching over the carriageways. */
export function MedianLamps({ xs }: { xs: number[] }) {
  const poles = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const arms = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const p = poles.current, h = heads.current, a = arms.current;
    if (!p || !h || !a) return;
    const d = new THREE.Object3D();
    xs.forEach((x, i) => {
      d.position.set(x, 5, 0);
      d.updateMatrix();
      p.setMatrixAt(i, d.matrix);
      d.position.set(x, 10.1, 0);
      d.updateMatrix();
      a.setMatrixAt(i, d.matrix);
      [-1, 1].forEach((s, k) => {
        d.position.set(x, 10.35, s * 3.1);
        d.updateMatrix();
        h.setMatrixAt(i * 2 + k, d.matrix);
      });
    });
    p.instanceMatrix.needsUpdate = a.instanceMatrix.needsUpdate = h.instanceMatrix.needsUpdate = true;
  }, [xs]);
  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, xs.length]} castShadow>
        <cylinderGeometry args={[0.1, 0.17, 10, 8]} />
        <meshStandardMaterial color="#9ea3aa" metalness={0.6} roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={arms} args={[undefined, undefined, xs.length]}>
        <boxGeometry args={[0.1, 0.1, 6.4]} />
        <meshStandardMaterial color="#9ea3aa" metalness={0.6} roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, xs.length * 2]}>
        <boxGeometry args={[1.4, 0.16, 0.5]} />
        <meshStandardMaterial color="#fff4c8" emissive="#ffe9a0" emissiveIntensity={0.5} />
      </instancedMesh>
    </>
  );
}

/** Black-and-white painted kerb blocks along both road edges (one instanced mesh per colour). */
export function KerbPaint({ x0, x1, z }: { x0: number; x1: number; z: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = Math.floor((x1 - x0) / 4);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      d.position.set(x0 + i * 4 + 1, 0.11, z);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [x0, z, count]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[2, 0.2, 0.16]} />
      <meshStandardMaterial color="#1a1b1e" roughness={0.9} />
    </instancedMesh>
  );
}

/** A tall concrete apartment tower: grey grid facade, some balconies and a water tank on the roof. */
export function Tower({ x, z, width = 16, depth = 14, floors = 10, front = 1, tone = "#bdbab2" }: { x: number; z: number; width?: number; depth?: number; floors?: number; front?: 1 | -1; tone?: string }) {
  const height = floors * 3.3;
  const wall = plasterTexture(`tower-${tone}`, tone);
  const face = facadeTexture(`tower-face-${tone}-${floors}`, tone, Math.round(width / 2.4), floors);
  return (
    <group position={[x, 0, z]} rotation={[0, front === 1 ? 0 : Math.PI, 0]}>
      <mesh position={[0, height / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, height / 2, 0.02]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={face} roughness={0.7} />
      </mesh>
      <mesh position={[0, height + 0.3, -depth / 2]}>
        <boxGeometry args={[width + 0.4, 0.6, depth + 0.4]} />
        <meshStandardMaterial color="#a6a39b" roughness={0.9} />
      </mesh>
      <mesh position={[width * 0.25, height + 1.6, -depth * 0.6]} castShadow>
        <cylinderGeometry args={[1, 1, 1.8, 12]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** A building that is still being built: bare concrete floors and columns, open at the sides. */
export function ConstructionFrame({ x, z, floors = 6, front = 1 }: { x: number; z: number; floors?: number; front?: 1 | -1 }) {
  const cols = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 5; i++) for (let k = 0; k < 3; k++) out.push([-10 + i * 5, -k * 6]);
    return out;
  }, []);
  const random = seededRandom(9);
  const slabs = Array.from({ length: floors }, (_, i) => ({ y: 3.2 * (i + 1), done: random() < 0.85 }));
  return (
    <group position={[x, 0, z]} rotation={[0, front === 1 ? 0 : Math.PI, 0]}>
      {cols.map(([cx, cz]) => (
        <mesh key={`${cx}${cz}`} position={[cx, (floors * 3.2) / 2, cz - 1]} castShadow>
          <boxGeometry args={[0.5, floors * 3.2, 0.5]} />
          <meshStandardMaterial color="#a9a69e" roughness={1} />
        </mesh>
      ))}
      {slabs.map((s) =>
        s.done ? (
          <mesh key={s.y} position={[0, s.y, -7]} castShadow receiveShadow>
            <boxGeometry args={[21, 0.35, 14]} />
            <meshStandardMaterial color="#b4b1a8" roughness={1} />
          </mesh>
        ) : null,
      )}
      <mesh position={[0, floors * 3.2 + 1.2, -2]}>
        <boxGeometry args={[0.1, 2.4, 0.1]} />
        <meshStandardMaterial color="#c9552b" />
      </mesh>
    </group>
  );
}

/** A zebra crossing across the whole road at x. */
export function Zebra({ x }: { x: number }) {
  return (
    <group position={[x, 0.035, 0]}>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0, -4.8 + i * 1.07]}>
          <planeGeometry args={[3, 0.55]} />
          <meshStandardMaterial color="#d9d5c6" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
