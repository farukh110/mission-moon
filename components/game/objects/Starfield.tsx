"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/lib/random";
import { starSprite } from "@/lib/canvasTextures";

interface StarfieldProps {
  count?: number;
  radius?: number;
  /** When given, the stars fade with this value (0 = invisible, 1 = fully visible). */
  fade?: RefObject<number>;
}

/** One Points object = one draw call, however many stars. */
export function Starfield({ count = 1600, radius = 90, fade }: StarfieldProps) {
  const material = useRef<THREE.PointsMaterial>(null);
  const bigMaterial = useRef<THREE.PointsMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const sprite = starSprite();
  const makeGeometry = (n: number, seed: number) => {
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const color = new THREE.Color();
    const random = seededRandom(seed);
    for (let i = 0; i < n; i++) {
      // Uniform direction on a sphere.
      const u = random() * 2 - 1;
      const theta = random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = radius * (0.85 + random() * 0.15);
      positions.set([r * s * Math.cos(theta), r * u, r * s * Math.sin(theta)], i * 3);
      color.setHSL(random() < 0.3 ? 0.08 : 0.6, 0.4, 0.75 + random() * 0.25);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  };
  const geometry = useMemo(() => makeGeometry(count, 42), [count, radius]); // eslint-disable-line react-hooks/exhaustive-deps
  const bigGeometry = useMemo(() => makeGeometry(Math.max(10, Math.round(count / 9)), 77), [count, radius]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => bigGeometry.dispose(), [bigGeometry]);
  useFrame((_, delta) => {
    const o = fade ? (fade.current ?? 1) : 1;
    if (fade && material.current) material.current.opacity = o;
    if (fade && bigMaterial.current) bigMaterial.current.opacity = o;
    if (group.current) group.current.rotation.y += Math.min(delta, 0.1) * 0.004;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial ref={material} map={sprite} size={2.6} sizeAttenuation={false} vertexColors depthWrite={false} transparent alphaTest={0.02} fog={false} />
      </points>
      <points geometry={bigGeometry} frustumCulled={false}>
        <pointsMaterial ref={bigMaterial} map={sprite} size={5.5} sizeAttenuation={false} vertexColors depthWrite={false} transparent alphaTest={0.02} fog={false} />
      </points>
    </group>
  );
}
