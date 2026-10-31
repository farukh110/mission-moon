"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/lib/random";
import type { Vec3 } from "@/data/types";

interface PuffsProps {
  count: number;
  color: string;
  origin: Vec3;
  /** Seconds since the effect started. Negative or large values hide the puffs. */
  getTime: () => number;
  /** Seconds over which new puffs are released. */
  emitSpan: number;
  life: number;
  spread: number;
  rise: number;
  size: number;
}

/**
 * Smoke or dust made from one instanced mesh (one draw call). Each puff grows then
 * shrinks instead of fading, so no transparency is needed.
 */
export function Puffs({ count, color, origin, getTime, emitSpan, life, spread, rise, size }: PuffsProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const angles = useMemo(() => {
    const random = seededRandom(11);
    return Array.from({ length: count }, () => random() * Math.PI * 2);
  }, [count]);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const t = getTime();
    for (let i = 0; i < count; i++) {
      const age = t - (i / count) * emitSpan;
      const k = age / life;
      if (age < 0 || k > 1) {
        dummy.scale.setScalar(0);
      } else {
        const s = size * Math.sin(Math.PI * k);
        dummy.position.set(
          origin[0] + Math.cos(angles[i]) * age * spread,
          origin[1] + age * rise + s * 0.4,
          origin[2] + Math.sin(angles[i]) * age * spread,
        );
        dummy.scale.setScalar(s);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

interface CloudsProps {
  count?: number;
  minY: number;
  maxY: number;
  spread: number;
  seed?: number;
}

/** A field of soft white clouds as a single instanced mesh. */
export function Clouds({ count = 48, minY, maxY, spread, seed = 5 }: CloudsProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const random = seededRandom(seed);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const s = 2.5 + random() * 4;
      dummy.position.set((random() - 0.5) * spread, minY + random() * (maxY - minY), -(12 + random() * spread * 0.5));
      dummy.scale.set(s * 1.6, s * 0.55, s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, minY, maxY, spread, seed]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#ffffff" emissive="#dfeeff" emissiveIntensity={0.5} flatShading />
    </instancedMesh>
  );
}
